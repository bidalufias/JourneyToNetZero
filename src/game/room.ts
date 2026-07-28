/**
 * The authoritative room.
 *
 * Everything the game decides happens in this module, and it is deliberately
 * transport-agnostic: a pure reducer over `Room`, with no imports from React,
 * the DOM, Supabase or a socket. The same code runs in a Supabase Edge
 * Function and in the local dev host, which is what keeps "all game logic
 * server-side" true rather than aspirational.
 *
 * Two rules this file exists to enforce:
 *   1. A player can never inspect the numbers behind an option. `phoneView`
 *      builds option cards from title, description, cost chip and a derived
 *      set of direction-only chips. The effect values never cross the boundary.
 *   2. The session never stalls. Every timed phase has a deadline and `tick`
 *      resolves it, auto-locking a default choice if somebody stopped playing.
 */
import {
  availableOptions,
  applyVeto,
  createGame,
  playRound,
  publicState,
  result,
  goalMet,
} from '../engine/engine'
import { DIRTY, ROLES, type Content, type Option, type Role, type Scenario } from '../engine/types'
import { costLabel, optionCondition, optionImpact } from './impact'
import { BOARD_NAME, DEAL_CONDITIONS, DEMAND_PHRASES, privateLine } from './copy'
import { pick, roomCode, shuffle } from './rng'
import {
  ROLE_LABEL,
  ROLE_RESOURCE,
  phaseMs,
  type DashboardView,
  type InsiderTip,
  type Phase,
  type PhoneOption,
  type PhoneView,
  type Player,
  type Promise_,
  type Room,
  type SayShape,
} from './session'

// ── Creation ───────────────────────────────────────────────────────────────

export function createRoom(content: Content, seed: number, now: number): Room {
  let cursor = 0

  // One scenario per round, drawn from that round's variants: 3^6 = 729
  // possible games, so the same room can play four times and never repeat.
  const path: string[] = []
  for (let r = 1; r <= 6; r++) {
    const p = pick(content.roundVariants[r], seed, cursor)
    cursor = p.cursor
    path.push(p.value)
  }

  const players = Object.fromEntries(
    ROLES.map((role): [Role, Player] => [
      role,
      {
        role,
        name: '',
        connected: false,
        goalId: null,
        choiceId: null,
        locked: false,
        autoLocked: false,
        defaulted: false,
        lockedAt: null,
      },
    ]),
  ) as Record<Role, Player>

  return {
    code: roomCode(seed),
    createdAt: now,
    phase: 'lobby',
    phaseEndsAt: null,
    pausedAt: null,
    players,
    game: createGame(path, content),
    promises: [],
    offers: [],
    tips: [],
    vetoTarget: null,
    coFund: false,
    spotlightCalled: false,
    lastRound: null,
    history: [],
    tipRotation: [],
    seed,
    rngCursor: cursor,
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function currentScenario(room: Room, content: Content): Scenario | null {
  const id = room.game.path[room.game.round]
  return id ? (content.scenarios[id] ?? null) : null
}

/** The round now being played, used for choices, tips and new pledges. */
function roundNumber(room: Room): number {
  return Math.min(room.game.round + 1, 6)
}

/**
 * The round the surfaces are currently *showing*.
 *
 * The engine advances `game.round` the instant a round resolves, so from the
 * Reckoning onward `roundNumber` already names the next one. Everything the
 * room is still narrating, meaning the promise board, the kept/broken badges
 * and the published tip, belongs to the round just played, so the views use this.
 */
const NARRATING: ReadonlySet<Phase> = new Set<Phase>(['reckoning', 'trust', 'summary'])

function displayRound(room: Room): number {
  if (NARRATING.has(room.phase) && room.lastRound) return room.lastRound.round
  return roundNumber(room)
}

function setPhase(room: Room, phase: Phase, now: number): void {
  room.phase = phase
  // Round 1 gets longer beats, so the length is asked for by round rather than
  // read off a flat table. `roundNumber` and not `displayRound`: a phase is
  // being opened, so the round it belongs to is the one about to be played.
  const ms = phaseMs(phase, roundNumber(room))
  room.phaseEndsAt = ms > 0 ? now + ms : null
}

/**
 * The clock is stopped.
 *
 * `!= null` rather than `!== null` on purpose: rooms written to storage or to
 * Postgres before pause existed come back with no field at all, and an
 * `undefined` read as "paused" would freeze a session that nobody stopped.
 */
function isPaused(room: Room): boolean {
  return room.pausedAt != null
}

/**
 * The room's own clock, which stops when the facilitator does.
 *
 * Everything that sets a deadline is timed from this rather than from the
 * wall, so a phase opened during a pause starts counting from the instant the
 * pause began, and therefore gets its full length when the room restarts,
 * instead of having however long the facilitator was talking already spent.
 */
function clockNow(room: Room, now: number): number {
  return room.pausedAt ?? now
}

/**
 * Every *occupied* seat has committed.
 *
 * Empty seats are not waited on: a seat nobody holds would otherwise stall the
 * round until the deadline, which is exactly what a facilitator running three
 * players does not need. The clock still defaults them at resolution.
 */
function everyoneLocked(room: Room): boolean {
  const held = ROLES.filter((r) => room.players[r].name)
  if (!held.length) return false
  return held.every((r) => room.players[r].locked)
}

/**
 * Vetoes the Community can still spend, as both surfaces should show it.
 *
 * The engine decrements the reserve when it resolves the round, which keeps
 * parity with the reference implementation. But a veto declared during THE
 * TABLE is already gone as far as the room is concerned, and the dashboard
 * says so the moment it lands, so the views subtract the pending one.
 */
function vetoesRemaining(room: Room): number {
  return Math.max(0, room.game.vetoes - (room.vetoTarget ? 1 : 0))
}

/**
 * The same courtesy for Spotlights, which the engine also only spends at
 * resolution. A counter that does not move when you spend it reads as a
 * broken button, and the Activist has no other confirmation that it landed.
 */
function spotlightsRemaining(room: Room): number {
  return Math.max(0, room.game.spotlights - (room.spotlightCalled ? 1 : 0))
}

/** Seats that can hold a transferable resource at all. */
function canReceive(role: Role): boolean {
  const kind = ROLE_RESOURCE[role].kind
  return kind === 'fiscal' || kind === 'capital'
}

/**
 * Options a role may choose right now, with the veto applied.
 * Shared by the phone view and the lock validator so they cannot disagree.
 */
/**
 * The cards this seat may act on right now.
 *
 * During the practice round that is the tutorial's own deck, unfiltered. It has
 * to be resolved here rather than only in the view, or every command carrying a
 * practice card id would be rejected as an option that does not exist, and the
 * practice round would look live and do nothing.
 */
function choosableOptions(room: Room, content: Content, role: Role): Option[] {
  if (room.phase === 'practiceTalk' || room.phase === 'practiceChoice') {
    return content.tutorial.options[role]
  }
  const scenario = currentScenario(room, content)
  if (!scenario) return []
  const opts = availableOptions(room.game, scenario, role, content)
  return role === room.vetoTarget ? applyVeto(opts) : opts
}

// ── Commands ───────────────────────────────────────────────────────────────

/**
 * SAY IT, in four sentence shapes.
 *
 * One command where there used to be three plus a private switch. The shapes
 * are all optional-field variants of the same message rather than four
 * commands, because the thing a player is doing is identical every time: they
 * are putting one sentence on the big screen, and it replaces whatever they
 * said last.
 */
export interface SayCommand {
  t: 'say'
  role: Role
  shape: SayShape
  /** promise and deal: the card being pledged. */
  optionId?: string
  /** demand and deal: whose behaviour the sentence is about. */
  target?: Role
  /** demand: which preset phrasing. */
  phraseId?: string
  /** deal: which condition the pledge hangs on. */
  conditionId?: string
  /** cofund: on or off. The Government's sentence is a standing commitment. */
  on?: boolean
}

export type Command =
  | { t: 'join'; role: Role; name: string }
  | { t: 'leave'; role: Role }
  | { t: 'reconnect'; role: Role }
  | { t: 'pickGoal'; role: Role; goalId: string }
  | { t: 'start' }
  | { t: 'advance' }
  | { t: 'pause' }
  | { t: 'resume' }
  | SayCommand
  | { t: 'offer'; from: Role; to: Role; resource: 'fiscal' | 'capital'; amount: number }
  | { t: 'respondOffer'; role: Role; offerId: string; accept: boolean }
  | { t: 'spotlight'; role: Role }
  | { t: 'veto'; role: Role; target: Role }
  | { t: 'publishTip'; role: Role }
  | { t: 'choose'; role: Role; optionId: string }
  | { t: 'lock'; role: Role }

/**
 * Commands a seat is allowed to issue, with the role rewritten to the one the
 * caller actually holds.
 *
 * Every command names a role and a client could name somebody else's, so the
 * seat is never read from the wire. This lives here rather than in a transport
 * because both the edge function and the local host have to enforce exactly the
 * same rule. Two copies would be two chances for them to drift apart.
 */
export function authorise(seat: Role | 'dashboard', cmd: Command): Command | null {
  if (seat === 'dashboard') {
    // The facilitator's screen may run the session: start it, step it on,
    // stop the clock and start it again. It may not choose, pledge or spend
    // anybody's resources.
    return cmd.t === 'start' || cmd.t === 'advance' || cmd.t === 'pause' || cmd.t === 'resume'
      ? cmd
      : null
  }
  switch (cmd.t) {
    case 'join':
    case 'reconnect':
    case 'leave':
    case 'pickGoal':
    case 'say':
    case 'respondOffer':
    case 'spotlight':
    case 'veto':
    case 'publishTip':
    case 'choose':
    case 'lock':
      return { ...cmd, role: seat } as Command
    case 'offer':
      return { ...cmd, from: seat } as Command
    default:
      return null
  }
}

/**
 * What a paused room refuses.
 *
 * Pausing stops the game, not the workshop. Taking a seat, sealing a goal and
 * reconnecting all still work, because a latecomer arriving is one of the two
 * reasons anybody presses pause, but nothing that moves the round does, because a
 * table that can still lock while the facilitator is mid-sentence would resolve
 * the round out from under them. The refusal has to live here rather than in a
 * surface: the phones are not the only thing that could send these.
 */
const FROZEN_WHILE_PAUSED: ReadonlySet<Command['t']> = new Set<Command['t']>([
  'say',
  'offer',
  'respondOffer',
  'spotlight',
  'veto',
  'publishTip',
  'choose',
  'lock',
])

export function apply(room: Room, cmd: Command, content: Content, now: number): Room {
  if (isPaused(room) && FROZEN_WHILE_PAUSED.has(cmd.t)) return room

  // Every deadline this command might set is timed from the room's clock, so a
  // phase stepped through during a pause is not silently spending its own
  // length while the facilitator talks over it.
  const at = clockNow(room, now)

  switch (cmd.t) {
    case 'join': {
      const p = room.players[cmd.role]
      if (p.name && p.name !== cmd.name) return room // seat taken
      p.name = cmd.name
      p.connected = true
      return room
    }

    case 'reconnect':
      room.players[cmd.role].connected = true
      return room

    /**
     * Leaving empties the chair rather than dimming it.
     *
     * A seat that stays named for the rest of the workshop is unrecoverable
     * without a new room, so the one thing `leave` must do is make the seat
     * takeable again, by somebody else or by the same person on a new phone.
     * A sealed goal belongs to the person, not the chair, so it goes with them.
     */
    case 'leave': {
      const p = room.players[cmd.role]
      p.name = ''
      p.connected = false
      p.goalId = null
      p.choiceId = null
      p.locked = false
      p.autoLocked = false
      p.defaulted = false
      p.lockedAt = null
      return room
    }

    case 'pickGoal': {
      // Sealed. Chosen once, revealed only in the endgame. Deliberately not
      // gated on the lobby: somebody who joins late, or takes a seat that was
      // vacated mid-session, still needs a goal to be playing the same game.
      if (room.players[cmd.role].goalId) return room
      room.players[cmd.role].goalId = cmd.goalId
      return room
    }

    case 'start': {
      if (room.phase !== 'lobby') return room
      setPhase(room, 'briefing', at)
      return room
    }

    case 'advance':
      return advance(room, content, at)

    /**
     * Stop the clock, wherever the room has got to.
     *
     * The one control a facilitator asks for by the second session: a fire
     * alarm, a latecomer, a question worth answering properly, or a table that
     * has just started arguing well and should not be cut off by a countdown.
     */
    case 'pause': {
      if (isPaused(room)) return room
      room.pausedAt = now
      return room
    }

    /**
     * Start it again, giving back exactly what was left.
     *
     * The deadline moves forward by the length of the pause rather than being
     * recomputed, so a table stopped with nine seconds of THE CHOICE remaining
     * restarts with nine seconds, not with a fresh forty-five, and not with
     * the phase already over.
     */
    case 'resume': {
      if (!isPaused(room)) return room
      if (room.phaseEndsAt !== null) room.phaseEndsAt += now - (room.pausedAt as number)
      room.pausedAt = null
      return room
    }

    /**
     * SAY IT: one verb, four sentences, one board.
     *
     * Every shape composes its line here rather than on a phone, for the same
     * reason players pick a sentence instead of typing one: the promise board
     * is read out loud by a room, so every line on it has to be grammatical,
     * short, and about somebody the room can name.
     */
    case 'say':
      return say(room, cmd, content)

    case 'offer': {
      if (!canNegotiate(room)) return room
      // Only two seats hold a transferable resource. An offer to either of the
      // others moves nothing on acceptance, so letting one be sent would put a
      // transfer on the big screen that never happens.
      if (!canReceive(cmd.from) || !canReceive(cmd.to) || cmd.from === cmd.to) return room
      const held = cmd.resource === 'fiscal' ? room.game.fiscal : room.game.capital
      if (cmd.amount < 1 || cmd.amount > held) return room
      room.offers.push({
        id: `o${room.offers.length}-${roundNumber(room)}`,
        round: roundNumber(room),
        from: cmd.from,
        to: cmd.to,
        resource: cmd.resource,
        amount: cmd.amount,
        status: 'pending',
      })
      return room
    }

    case 'respondOffer': {
      const offer = room.offers.find((o) => o.id === cmd.offerId && o.to === cmd.role)
      if (!offer || offer.status !== 'pending') return room
      if (!cmd.accept) {
        offer.status = 'declined'
        return room
      }
      // Transfers execute immediately and are permanent. Fiscal and Capital are
      // single pools in the engine, so a transfer between the two resources
      // moves the amount across; a same-resource transfer is a no-op on the
      // meters and exists as a social act.
      offer.status = 'accepted'
      const toResource = ROLE_RESOURCE[offer.to].kind
      const fromResource = ROLE_RESOURCE[offer.from].kind
      if (fromResource === 'fiscal' && toResource === 'capital') {
        const moved = Math.min(offer.amount, room.game.fiscal)
        room.game.fiscal -= moved
        room.game.capital += moved
      } else if (fromResource === 'capital' && toResource === 'fiscal') {
        const moved = Math.min(offer.amount, room.game.capital)
        room.game.capital -= moved
        room.game.fiscal += moved
      }
      return room
    }

    case 'spotlight': {
      if (!canNegotiate(room) || cmd.role !== 'activist') return room
      if (room.game.spotlights <= 0) return room
      room.spotlightCalled = true
      return room
    }

    case 'veto': {
      if (!canNegotiate(room) || cmd.role !== 'community') return room
      if (room.game.vetoes <= 0 || room.vetoTarget) return room
      room.vetoTarget = cmd.target
      // Anyone whose choice the veto just removed has to choose again, even if
      // they had already committed to it.
      const removed = choosableOptions(room, content, cmd.target).map((o) => o.id)
      const p = room.players[cmd.target]
      if (p.choiceId && !removed.includes(p.choiceId)) {
        p.choiceId = null
        p.locked = false
        p.lockedAt = null
      }
      return room
    }

    case 'publishTip': {
      const tip = room.tips.find((t) => t.round === roundNumber(room) && t.to === cmd.role)
      if (!tip || tip.published) return room
      tip.published = true
      return room
    }

    /**
     * Selecting a card. Not committing to it.
     *
     * Tapping to read a card more closely must never be the same act as
     * spending the round on it, so this only moves the selection. `lock` is
     * the irreversible half, and until it lands a player may change their mind
     * as often as they like.
     */
    case 'choose': {
      if (!canChoose(room)) return room
      const p = room.players[cmd.role]
      if (p.locked) return room
      const allowed = choosableOptions(room, content, cmd.role)
      if (!allowed.some((o) => o.id === cmd.optionId)) return room
      p.choiceId = cmd.optionId
      return room
    }

    /** Committing. From here the choice screen is a record, not a decision. */
    case 'lock': {
      if (room.phase !== 'choice' && room.phase !== 'practiceChoice') return room
      const p = room.players[cmd.role]
      if (p.locked || p.choiceId === null) return room
      const allowed = choosableOptions(room, content, cmd.role)
      if (!allowed.some((o) => o.id === p.choiceId)) return room
      p.locked = true
      p.autoLocked = false
      p.defaulted = false
      p.lockedAt = at
      // The practice round never reaches the engine. Four practice cards handed
      // to it are four ids from a deck the scenario has never heard of, and it
      // throws rather than resolve them, which would end the session on the
      // step that exists to teach somebody how to lock a card.
      if (room.phase === 'practiceChoice') return room
      if (everyoneLocked(room)) return resolveRound(room, content, at)
      return room
    }

    default:
      return room
  }
}

/**
 * Compose one public sentence and put it on the board.
 *
 * One live sentence per player per round, whatever its shape: a second SAY IT
 * replaces the first rather than stacking. That cap is what keeps the board
 * readable from the back of a room, and it is also the only pressure in the
 * game to say the *right* thing rather than everything.
 */
function say(room: Room, cmd: SayCommand, content: Content): Room {
  if (!canNegotiate(room)) return room
  const round = roundNumber(room)
  const me = BOARD_NAME[cmd.role]

  /**
   * Co-funding is a sentence, not a switch.
   *
   * It used to be a private toggle on the Government's phone that halved or
   * doubled the value of somebody else's card. The Business had no way to see
   * it, no way to ask for it on the record, and no way to hold anybody to it
   * afterwards, which made the single most co-operative act in the game
   * invisible to the person it was being done for.
   */
  if (cmd.shape === 'cofund') {
    if (cmd.role !== 'government') return room
    room.coFund = cmd.on ?? false
    room.promises = room.promises.filter((p) => !(p.round === round && p.id === `government-${round}-c`))
    if (room.coFund) {
      room.promises.push({
        id: `government-${round}-c`,
        round,
        from: 'government',
        kind: 'cofund',
        text: 'The Government will pay half of any partnership the Business signs.',
        optionId: null,
        ifRole: null,
        ifConditionId: null,
        outcome: 'unresolved',
      })
    }
    return room
  }

  // Everything else is one sentence, and it replaces the last one.
  const drop = (p: Promise_) => !(p.round === round && p.from === cmd.role && p.kind !== 'cofund')

  if (cmd.shape === 'promise') {
    const option = choosableOptions(room, content, cmd.role).find((o) => o.id === cmd.optionId)
    if (!option) return room
    room.promises = room.promises.filter(drop)
    room.promises.push({
      id: `${cmd.role}-${round}-s`,
      round,
      from: cmd.role,
      kind: 'promise',
      text: `${me} will choose “${option.title}”.`,
      optionId: option.id,
      ifRole: null,
      ifConditionId: null,
      outcome: 'unresolved',
    })
    return room
  }

  if (cmd.shape === 'demand') {
    const phrase = DEMAND_PHRASES.find((p) => p.id === cmd.phraseId)
    if (!phrase || !cmd.target || cmd.target === cmd.role) return room
    room.promises = room.promises.filter(drop)
    room.promises.push({
      id: `${cmd.role}-${round}-s`,
      round,
      from: cmd.role,
      kind: 'demand',
      text: `${me} wants ${phrase.text(ROLE_LABEL[cmd.target])}.`,
      optionId: null,
      ifRole: cmd.target,
      ifConditionId: null,
      outcome: 'unresolved',
    })
    return room
  }

  // The deal. "I will choose this, if you move with me."
  const option = choosableOptions(room, content, cmd.role).find((o) => o.id === cmd.optionId)
  const condition = DEAL_CONDITIONS.find((c) => c.id === cmd.conditionId)
  if (!option || !condition || !cmd.target || cmd.target === cmd.role) return room
  room.promises = room.promises.filter(drop)
  room.promises.push({
    id: `${cmd.role}-${round}-s`,
    round,
    from: cmd.role,
    kind: 'deal',
    text: `${me} will choose “${option.title}” if ${condition.text(ROLE_LABEL[cmd.target])}.`,
    optionId: option.id,
    ifRole: cmd.target,
    ifConditionId: condition.id,
    outcome: 'unresolved',
  })
  return room
}

// ── Phase machine ──────────────────────────────────────────────────────────

/** Drives the clock. Call on every server tick; safe to call repeatedly. */
export function tick(room: Room, content: Content, now: number): Room {
  // A paused room does not expire. This is the whole of the pause as far as the
  // phase machine is concerned: the deadline it was heading for is still there,
  // untouched, and `resume` pushes it forward by however long this lasted.
  if (isPaused(room)) return room
  if (room.phaseEndsAt === null || now < room.phaseEndsAt) return room
  return advance(room, content, now)
}

/**
 * Phases in which a player may talk: promise, demand, offer, spotlight, veto.
 *
 * The practice round is in here because its whole purpose is to make somebody
 * press one of those buttons once, before it costs anything. Without it the
 * step showed four live-looking buttons that silently did nothing.
 */
function canNegotiate(room: Room): boolean {
  return room.phase === 'table' || room.phase === 'practiceTalk'
}

/** Phases in which a player may select or lock a card. */
function canChoose(room: Room): boolean {
  return room.phase === 'choice' || room.phase === 'table' || room.phase === 'practiceChoice'
}

function advance(room: Room, content: Content, now: number): Room {
  switch (room.phase) {
    case 'lobby':
      setPhase(room, 'briefing', now)
      return room

    // The onboarding, one verb at a time. None of it touches the engine.
    case 'briefing':
      setPhase(room, 'practiceTalk', now)
      return room

    case 'practiceTalk':
      setPhase(room, 'practiceChoice', now)
      return room

    case 'practiceChoice':
      return endPractice(room, content, now)

    case 'power':
      setPhase(room, 'goal', now)
      return room

    case 'goal':
      return openRound(room, content, now)

    case 'crisis':
      setPhase(room, 'table', now)
      return room

    case 'table':
      setPhase(room, 'choice', now)
      return room

    case 'choice':
      return resolveRound(room, content, now)

    case 'reckoning':
      setPhase(room, 'trust', now)
      return room

    case 'trust':
      setPhase(room, 'summary', now)
      return room

    case 'summary':
      if (room.game.round >= 6) {
        setPhase(room, 'results', now)
        return room
      }
      return openRound(room, content, now)

    case 'results':
      setPhase(room, 'ended', now)
      return room

    default:
      return room
  }
}

/**
 * Wipes the practice round.
 *
 * Everything the table did here has to leave no trace, and "no trace" is wider
 * than it looks. A card left selected would arrive in Round 1 already ticked. A
 * promise would sit on the board as though it had been made about a real
 * crisis. And an offer that was accepted moved money for real, because that is
 * what accepting an offer does, so the Government could walk into the first
 * round two Budget short of where the design starts it.
 */
function endPractice(room: Room, content: Content, now: number): Room {
  for (const role of ROLES) {
    const p = room.players[role]
    p.choiceId = null
    p.locked = false
    p.autoLocked = false
    p.defaulted = false
    p.lockedAt = null
  }
  room.promises = []
  room.offers = []
  room.vetoTarget = null
  room.coFund = false
  room.spotlightCalled = false

  const start = content.config.start
  room.game.fiscal = start.fiscal
  room.game.capital = start.capital
  room.game.spotlights = start.spot
  room.game.vetoes = content.config.vetoes

  setPhase(room, 'power', now)
  return room
}

/** Reveals the crisis, deals the round's single Insider Tip, opens the round. */
function openRound(room: Room, content: Content, now: number): Room {
  room.vetoTarget = null
  room.coFund = false
  room.spotlightCalled = false
  for (const role of ROLES) {
    room.players[role].choiceId = null
    room.players[role].locked = false
    room.players[role].autoLocked = false
    room.players[role].defaulted = false
    room.players[role].lockedAt = null
  }
  dealTip(room, content)
  setPhase(room, 'crisis', now)
  return room
}

function resolveRound(room: Room, content: Content, now: number): Room {
  /**
   * Nobody reaches the engine without a choice.
   *
   * A round resolves either because everyone at the table committed or because
   * the deadline passed, and both paths can arrive here with an empty chair or
   * a player who never selected anything. Filling the gaps here rather than at
   * the deadline means there is exactly one place that can leave a role
   * unanswered, and it cannot.
   *
   * The three ways a choice can arrive are recorded separately, because the
   * round summary must never tell somebody they chose a card the clock picked.
   */
  for (const role of ROLES) {
    const p = room.players[role]
    if (p.locked) continue
    if (p.choiceId === null) {
      const opts = choosableOptions(room, content, role)
      if (!opts.length) continue
      p.choiceId = opts[0].id
      p.defaulted = true
    }
    p.locked = true
    p.autoLocked = true
    p.lockedAt = now
  }

  const choices = Object.fromEntries(
    ROLES.map((r) => [r, room.players[r].choiceId as string]),
  ) as Record<Role, string>

  // The Activist's Spotlight is a Table action, but the engine derives its
  // target from the choices, and it only lands on a role that actually went
  // dirty. Calling it without a dirty target simply spends nothing.
  if (!room.spotlightCalled) {
    // Suppress the engine's automatic spotlight when it was never called.
    const activistOption = content.scenarios[room.game.path[room.game.round]].options.activist.find(
      (o) => o.id === choices.activist,
    )
    if (activistOption?.arch === 'ESCALATE') {
      // Escalating without spending a Spotlight: temporarily hide the reserve
      // so the engine cannot target anyone, then restore it.
      const held = room.game.spotlights
      room.game.spotlights = 0
      const log = playRound(room.game, { choices, vetoTarget: room.vetoTarget, coFund: room.coFund }, content)
      room.game.spotlights = held
      return finishRound(room, log, choices, content, now)
    }
  }

  const log = playRound(room.game, { choices, vetoTarget: room.vetoTarget, coFund: room.coFund }, content)
  return finishRound(room, log, choices, content, now)
}

function finishRound(
  room: Room,
  log: ReturnType<typeof playRound>,
  choices: Record<Role, string>,
  content: Content,
  now: number,
): Room {
  // Promises are recorded and displayed but never enforced. Resolving one only
  // decides what the dashboard says about it.
  for (const p of room.promises) {
    if (p.round !== log.round) continue
    const didIt = p.optionId !== null && choices[p.from] === p.optionId

    if (p.kind === 'promise') {
      p.outcome = didIt ? 'kept' : 'broken'
      continue
    }

    /**
     * A deal is judged against both people, in this order.
     *
     * If the other seat never did their part, the pledge was never called in,
     * and the board says so rather than calling somebody a liar for a promise
     * that was never tested. If they did, the pledger is held to it exactly as
     * hard as an unconditional one.
     */
    if (p.kind === 'deal' && p.ifRole && p.ifConditionId) {
      const them = log.reveals.find((r) => r.role === p.ifRole)
      const condition = DEAL_CONDITIONS.find((c) => c.id === p.ifConditionId)
      const theyDid = Boolean(them && condition?.met(them))
      p.outcome = !theyDid ? 'void' : didIt ? 'kept' : 'broken'
    }
  }

  // A published tip resolves at round end, and only a published one.
  const tip = room.tips.find((t) => t.round === log.round)
  if (tip?.published) {
    tip.revealed = true
    applyTipStake(room, tip)
  }

  // Offers that nobody answered expire with the round.
  for (const o of room.offers) {
    if (o.round === log.round && o.status === 'pending') o.status = 'expired'
  }

  room.lastRound = log
  room.history.push(log)
  void content
  setPhase(room, 'reckoning', now)
  return room
}

/**
 * Telling the room pays, in the currency that seat actually spends.
 *
 * The price is not the token, it is the information: a warning about the next
 * crisis is worth more to you while nobody else has it, and the moment you
 * trade it for standing, everybody plans around it. That is a trade a player
 * can reason about in five seconds. The old version was a coin flip on an
 * UNVERIFIED rumour, which is a trade nobody can reason about at all.
 */
function applyTipStake(room: Room, tip: InsiderTip): void {
  if (tip.to === 'community') {
    room.game.vetoes = Math.min(3, room.game.vetoes + 1)
    return
  }
  const role = tip.to as 'government' | 'business' | 'activist'
  room.game.trust[role] = room.game.trust[role] + 1
}

// ── Insider Tips ───────────────────────────────────────────────────────────

/**
 * Exactly one tip per round to exactly one player, dealt the moment the crisis
 * is revealed. Nobody is told a tip was dealt to whom. The dashboard only
 * announces that one was. Rotation never repeats a role twice in a row and
 * gives everyone at least one across six rounds.
 */
function dealTip(room: Room, content: Content): void {
  const round = roundNumber(room)
  if (room.tips.some((t) => t.round === round)) return

  let cursor = room.rngCursor
  let candidates = ROLES.filter((r) => !room.tipRotation.includes(r))
  if (!candidates.length) {
    const last = room.tipRotation[room.tipRotation.length - 1]
    candidates = ROLES.filter((r) => r !== last)
  } else if (room.tipRotation.length) {
    const last = room.tipRotation[room.tipRotation.length - 1]
    const withoutLast = candidates.filter((r) => r !== last)
    if (withoutLast.length) candidates = withoutLast
  }

  const chosen = pick(candidates, room.seed, cursor)
  cursor = chosen.cursor
  const to = chosen.value

  const built = buildTip(room, content, to, round, cursor)
  cursor = built.cursor

  room.tips.push(built.tip)
  room.tipRotation.push(to)
  room.rngCursor = cursor
}

/**
 * One kind of tip: a true warning about what is coming.
 *
 * There were four. A forecast of the next crisis, a memo about this one, a
 * dossier naming somebody's secret goal, and an UNVERIFIED rumour that was a
 * straight coin flip. Four kinds is four things to explain, on a card that
 * opens over the whole phone in the twenty-five seconds a player has to read a
 * crisis, and the rumour was the worst of them: it asked somebody to gamble a
 * resource on a probability the game never showed them, and then told them at
 * the end of the round whether they had been unlucky.
 *
 * The forecast is the one worth keeping, because it is the only one that
 * changes what the table does next. In the last round there is no next crisis,
 * so the tip is a true fact about the one already on the table, which reads as
 * the same thing from the player's side: something true, that they know and
 * nobody else does.
 */

function buildTip(
  room: Room,
  content: Content,
  to: Role,
  round: number,
  cursorIn: number,
): { tip: InsiderTip; cursor: number } {
  let cursor = cursorIn
  const tips = content.insiderTips
  const scenarioId = room.game.path[room.game.round]
  const nextScenarioId = room.game.path[room.game.round + 1]

  if (nextScenarioId) {
    const nextType = content.scenarios[nextScenarioId].type
    const lines = tips.forecasts[nextType] ?? []
    const line = lines.length ? pick(lines, room.seed, cursor) : { value: '', cursor }
    cursor = line.cursor
    return {
      tip: {
        id: `tip-${round}`,
        round,
        to,
        source: 'Cabinet Situation Room',
        text: line.value || 'Something is coming. Nobody will say what.',
        published: false,
        revealed: false,
      },
      cursor,
    }
  }

  // Round 6. Nothing is coming after this, so the warning is about the crisis
  // already on the table.
  return {
    tip: {
      id: `tip-${round}`,
      round,
      to,
      source: 'A sealed brief',
      text: tips.intel[scenarioId] ?? 'The official figures are not the real ones.',
      published: false,
      revealed: false,
    },
    cursor,
  }
}

// ── Views ──────────────────────────────────────────────────────────────────

export function dashboardView(room: Room, content: Content): DashboardView {
  const scenario = currentScenario(room, content)
  const held = ROLES.filter((r) => room.players[r].name)
  const waiting = held.filter((r) => !room.players[r].locked)
  const lastLock = held.length > 1 && waiting.length === 1 ? waiting[0] : null

  const tip = room.tips.find((t) => t.round === displayRound(room))
  const published =
    tip?.published && tip ? { from: tip.to, text: tip.text, source: tip.source } : null

  const veto = room.vetoTarget
    ? {
        target: room.vetoTarget,
        removed: scenario
          ? availableOptions(room.game, scenario, room.vetoTarget, content)
              .filter((o) => DIRTY.has(o.arch))
              .map((o) => o.title)
          : [],
        remaining: vetoesRemaining(room),
      }
    : null

  return {
    code: room.code,
    phase: room.phase,
    phaseEndsAt: room.phaseEndsAt,
    paused: isPaused(room),
    pausedAt: room.pausedAt ?? null,
    round: displayRound(room),
    scenario: scenario
      ? { id: scenario.id, title: scenario.title, type: scenario.type, situation: scenario.situation }
      : null,
    state: publicState(room.game, content),
    seats: ROLES.map((role) => ({
      role,
      name: room.players[role].name || null,
      connected: room.players[role].connected,
      locked: room.players[role].locked,
      lastToLock: lastLock === role,
    })),
    promises: room.promises.filter((p) => p.round === displayRound(room)),
    offersInFlight: room.offers.filter((o) => o.round === displayRound(room) && o.status === 'pending'),
    tipDealtThisRound: Boolean(tip),
    publishedTip: published,
    spotlight: room.spotlightCalled
      ? {
          by: 'activist' as Role,
          // Whoever takes the dirtiest option this round wears it. Nobody
          // knows who that is until the choices lock, so do not pretend to.
          target: room.lastRound?.spotlightTarget ?? null,
          remaining: spotlightsRemaining(room),
        }
      : null,
    veto,
    lastRound: room.lastRound,
    history: room.history,
    headlines: room.history.flatMap((h) => h.reveals.map((r) => r.headline)).slice(-12),
    targets: {
      emissions: content.config.tgt_e,
      growth: content.config.tgt_g,
      happiness: content.config.tgt_h,
    },
    trustAward: NARRATING.has(room.phase) ? (room.lastRound?.trustAwarded ?? null) : null,
  }
}

export function phoneView(room: Room, content: Content, role: Role): PhoneView {
  const scenario = currentScenario(room, content)
  const player = room.players[role]
  const showOptions = room.phase === 'table' || room.phase === 'choice'
  const practising = room.phase === 'practiceTalk' || room.phase === 'practiceChoice'

  let options: PhoneOption[] = []
  if (practising) {
    // The practice cards, straight through. No affordability, no veto, no gate:
    // this round cannot be lost and the point is that a player finds out what a
    // card looks like before one matters.
    options = content.tutorial.options[role].map((o) => ({
      id: o.id,
      title: o.title,
      desc: o.desc,
      cost: costLabel(o),
      impact: optionImpact(o),
      condition: optionCondition(o),
      available: true,
      disabled: null,
      disabledNote: null,
    }))
  } else if (scenario && showOptions) {
    const affordableAndOpen = availableOptions(room.game, scenario, role, content)
    const afterVeto = role === room.vetoTarget ? applyVeto(affordableAndOpen) : affordableAndOpen

    options = scenario.options[role].map((o): PhoneOption => {
      const open = affordableAndOpen.some((a) => a.id === o.id)
      const choosable = afterVeto.some((a) => a.id === o.id)

      let disabled: PhoneOption['disabled'] = null
      let note: string | null = null

      if (!open) {
        // Three disabled states, three different edges, because "I can't",
        // "she stopped me" and "I did this to myself" are three feelings.
        if (o.gate_trust && room.game.trust.government < o.gate_trust) {
          disabled = 'gate'
          note = `Needs ${o.gate_trust} Trust. The country has not backed you.`
        } else if (o.block_flag && room.game.flags.has(String(o.block_flag))) {
          disabled = 'gate'
          note = 'A promise you made earlier closed this door.'
        } else {
          disabled = 'afford'
          const need = o.cost?.fiscal ?? o.cost?.capital ?? 0
          const have = o.cost?.fiscal ? room.game.fiscal : room.game.capital
          note = `You have ${have} of ${need}.`
        }
      } else if (!choosable) {
        disabled = 'veto'
        note = '“The public will simply not accept this.” Removed by the Community, this round only.'
      }

      return {
        id: o.id,
        title: o.title,
        desc: o.desc,
        cost: costLabel(o),
        impact: optionImpact(o),
        condition: optionCondition(o),
        available: choosable,
        disabled,
        disabledNote: note,
      }
    })
  }

  const resourceKind = ROLE_RESOURCE[role].kind
  const resourceValue =
    resourceKind === 'fiscal'
      ? room.game.fiscal
      : resourceKind === 'capital'
        ? room.game.capital
        : resourceKind === 'spotlights'
          ? room.game.spotlights
          : vetoesRemaining(room)

  // Offered in the goal phase, which is after the practice round rather than
  // before the game. The goals are written in Mt and Public Trust and clean
  // economy share, and asking somebody to commit to one before they have seen
  // any of those move is asking them to pick the nicest title.
  // Offered from the goal phase onward, which is after the practice round
  // rather than before the game. The goals are written in carbon, Public Trust
  // and clean economy share, and asking somebody to commit to one before they
  // have seen any of those move is asking them to pick the nicest title.
  //
  // "Onward" and not "during", because a player who takes a vacated seat in
  // Round 4 has still never chosen one, and a seat with nothing to win is a
  // player with nothing to argue for.
  const beforeGoals =
    room.phase === 'lobby' ||
    room.phase === 'briefing' ||
    room.phase === 'practiceTalk' ||
    room.phase === 'practiceChoice' ||
    room.phase === 'power'
  const goalChoices =
    player.goalId === null && !beforeGoals
      ? content.privateGoals[role].map((g) => ({ id: g.id, title: g.title, desc: g.desc }))
      : null

  // Your own sealed goal, so the phone can answer "what am I chasing again?"
  // without waiting until 2050. Still only ever yours. No other seat's goal is
  // built into any view.
  const ownGoal = player.goalId
    ? (content.privateGoals[role].find((g) => g.id === player.goalId) ?? null)
    : null

  // From the Reckoning onward `currentScenario` already names the *next*
  // round's crisis, so handing it to a phone would leak the coming round.
  const narrating = NARRATING.has(room.phase)

  // The three national numbers, on the phone, always. They used to live only on
  // the projector, so any player who could not read it from where they sat was
  // playing without a score.
  const nation = publicState(room.game, content)

  return {
    code: room.code,
    role,
    name: player.name,
    nation: {
      carbon: nation.emissions,
      economy: nation.averageGrowth,
      life: nation.happiness,
      clean: nation.greenShare,
      targets: {
        carbon: content.config.tgt_e,
        economy: content.config.tgt_g,
        life: content.config.tgt_h,
      },
    },
    phase: room.phase,
    phaseEndsAt: room.phaseEndsAt,
    paused: isPaused(room),
    pausedAt: room.pausedAt ?? null,
    round: displayRound(room),
    scenario:
      scenario && !narrating
        ? { id: scenario.id, title: scenario.title, situation: scenario.situation, type: scenario.type }
        : null,
    privateLine: scenario && !narrating ? privateLine(scenario.type, role) : null,
    options,
    choiceId: player.choiceId,
    locked: player.locked,
    resource: { kind: resourceKind, value: resourceValue, label: ROLE_RESOURCE[role].label },
    trust: { ...room.game.trust },
    vetoesRemaining: vetoesRemaining(room),
    spotlightsRemaining: spotlightsRemaining(room),
    spotlightCalled: room.spotlightCalled,
    coFund: room.coFund,
    goalId: player.goalId,
    goalTitle: ownGoal?.title ?? null,
    goalDesc: ownGoal?.desc ?? null,
    goalChoices,
    // Only ever your own tip, and only while it is yours to act on.
    tip: room.tips.find((t) => t.to === role && t.round === displayRound(room)) ?? null,
    promises: room.promises.filter((p) => p.round === displayRound(room)),
    incomingOffers: room.offers.filter((o) => o.to === role && o.status === 'pending'),
    sentOffers: room.offers.filter((o) => o.from === role && o.round === displayRound(room)),
    seats: ROLES.map((r) => ({
      role: r,
      name: room.players[r].name || null,
      connected: room.players[r].connected,
      locked: room.players[r].locked,
    })),
    roundResult: roundResultCopy(room, content, role),
    trustAward: narrating && room.lastRound ? room.lastRound.trustAwarded : null,
    waitingOn: ROLES.filter((r) => room.players[r].name && !room.players[r].locked).length,
  }
}

/**
 * The phone's round result: what you did, what it cost, what it actually did.
 *
 * The first three sentences are interpretation and carry no numbers. The rest
 * closes the loop the card opened: the same four chips the player read before
 * choosing, plus the carbon the choice really delivered after the multipliers,
 * the co-funding, the Spotlight and the abatement curve had all had their say.
 */
function roundResultCopy(room: Room, content: Content, role: Role): PhoneView['roundResult'] {
  const log = room.lastRound
  if (!log || !NARRATING.has(room.phase)) return null

  const mine = log.reveals.find((r) => r.role === role)
  if (!mine) return null

  // Quoted rather than folded into the sentence: option titles are imperative
  // ("Demand a Fresh Election"), so "you chose demand a fresh election" reads
  // as a typo. The quotation is always grammatical whatever the pack says.
  //
  // The room knows whether the player decided this or the clock did, and
  // telling somebody they "chose" a card the deadline picked for them is the
  // one sentence in the app that can be flatly untrue.
  const player = room.players[role]
  const didWhat = player.defaulted
    ? `You ran out of time. The clock picked “${mine.title}”.`
    : player.autoLocked
      ? `You had “${mine.title}” selected, and the clock locked it in.`
      : `You chose “${mine.title}”.`

  const costBits: string[] = []
  if (mine.partnerUnfunded) costBits.push('Nobody co-funded it, so it landed at half strength.')
  if (mine.spotlit) costBits.push('You were named publicly, and it cost you.')
  if (mine.selfOrganiseSupported) costBits.push('Real backing arrived, and it counted double.')
  if (log.govIsolated && role === 'government') {
    costBits.push('You moved alone, and the country only half-followed.')
  }
  if (!costBits.length) costBits.push('It landed as you intended.')

  const others: string[] = []
  if (log.alignedCount >= 3) {
    others.push(
      log.alignedCount === 4
        ? 'All four of you moved together, and the coalition held.'
        : 'Three of you moved together, and the coalition held.',
    )
  } else {
    others.push('The table did not move together this round.')
  }
  const broken = room.promises.filter((p) => p.round === log.round && p.outcome === 'broken')
  if (broken.length) others.push(`${broken.map((b) => BOARD_NAME[b.from]).join(' and ')} broke a promise.`)

  // The card as it was authored, so the chips after the reveal are the same
  // four the player weighed before it. `emissions` on the reveal is the
  // delivered figure and is not the same number: that gap is the lesson.
  const card = content.scenarios[log.scenarioId]?.options[role]?.find((o) => o.id === mine.optionId)

  return {
    didWhat,
    cost: costBits.join(' '),
    others: others.join(' '),
    title: mine.title,
    impact: card ? optionImpact(card) : [],
    costLabel: card ? costLabel(card) : 'Free',
    carbon: mine.emissions,
    note: comparison(log, role),
  }
}

/**
 * One line placing this card against the other three.
 *
 * Nothing here is praise or blame. It says what happened, in the terms the
 * table can check against the big screen, and stays silent when there is
 * nothing true and short to say.
 */
function comparison(log: NonNullable<Room['lastRound']>, role: Role): string | null {
  const mine = log.reveals.find((r) => r.role === role)
  if (!mine) return null
  const cuts = log.reveals.filter((r) => r.emissions < -0.05)

  if (mine.emissions < -0.05 && cuts.length && mine.emissions <= Math.min(...cuts.map((r) => r.emissions))) {
    return cuts.length === 1
      ? 'The only cut anyone made this round.'
      : 'The biggest cut anyone made this round.'
  }
  if (mine.emissions > 0.05) return 'This added carbon rather than cutting it.'
  if (mine.multiplier >= 1.5) return 'Something else at the table made this land harder than it should have.'
  if (mine.multiplier <= 0.75) return 'It landed at less than full strength.'
  return null
}

// ── Endgame ────────────────────────────────────────────────────────────────

/**
 * How the country did, in three grades rather than two.
 *
 * Mixed tables reach all three targets 22% of the time, and a workshop group
 * plays this once, not twenty times. Four in five rooms currently leave having
 * simply failed, which is both demoralising and, more to the point, untrue:
 * there is an enormous difference between missing growth by three tenths of a
 * percent and never getting near any of it, and the ending said the same thing
 * about both.
 */
export type Grade = 'REACHED' | 'CLOSE' | 'MISSED'

/** How near a missed target has to be for the country to count as close. */
const CLOSE_ENOUGH = { emissions: 10, growth: 0.5, happiness: 0.5 } as const

export interface Endgame {
  win: boolean
  grade: Grade
  targets: {
    key: 'emissions' | 'growth' | 'happiness'
    value: number
    target: number
    met: boolean
    /** How far short, in that target's own unit. Zero when it was met. */
    gap: number
    /** "Carbon reached net zero." / "Economy averaged 4.7%. You needed 5.0%." */
    verdict: string
  }[]
  players: {
    role: Role
    name: string
    goalId: string | null
    goalTitle: string | null
    goalMet: boolean
    /** NATION BUILDER, a personal title, or HOLLOW VICTORY. */
    title: string
  }[]
}

/**
 * Hollow Victory is not a bug. If the country misses even one target, everyone
 * who hit their private goal gets it, with no partial credit and no
 * consolation. That card does more teaching than an hour of slides.
 *
 * Grading the country changes none of that. The grade is about the country and
 * the title is about the player, and the whole point of Hollow Victory is that
 * those two are not the same thing.
 */
export function endgame(room: Room, content: Content): Endgame {
  const res = result(room.game, content)
  const c = content.config

  const targets: Endgame['targets'] = [
    {
      key: 'emissions',
      value: res.e,
      target: c.tgt_e,
      met: res.pe,
      gap: Math.max(0, res.e - c.tgt_e),
      verdict: res.pe
        ? res.e < -0.5
          ? `Carbon went past net zero, to −${Math.abs(res.e).toFixed(0)} Mt.`
          : 'Carbon reached net zero.'
        : `Carbon finished at ${res.e.toFixed(0)} Mt. It had to reach zero.`,
    },
    {
      key: 'growth',
      value: res.g,
      target: c.tgt_g,
      met: res.pg,
      gap: Math.max(0, c.tgt_g - res.g),
      verdict: res.pg
        ? `The economy averaged ${res.g.toFixed(1)}%.`
        : `The economy averaged ${res.g.toFixed(1)}%. You needed ${c.tgt_g.toFixed(1)}%.`,
    },
    {
      key: 'happiness',
      value: res.h,
      target: c.tgt_h,
      met: res.ph,
      gap: Math.max(0, c.tgt_h - res.h),
      verdict: res.ph
        ? `Quality of life reached ${res.h.toFixed(1)}.`
        : `Quality of life reached ${res.h.toFixed(1)}. You needed ${c.tgt_h.toFixed(1)}.`,
    },
  ]

  // Close means every gap is small, not that one of them happens to be. A
  // country that hit two targets and missed the third by forty Mt did not
  // nearly make it, and telling that room otherwise is the kind of flattery
  // that empties a debrief.
  const close = targets.every((t) => t.met || t.gap <= CLOSE_ENOUGH[t.key])
  const grade: Grade = res.win ? 'REACHED' : close ? 'CLOSE' : 'MISSED'

  return {
    win: res.win,
    grade,
    targets,
    players: ROLES.map((role) => {
      const player = room.players[role]
      const goal = content.privateGoals[role].find((g) => g.id === player.goalId) ?? null
      const met = player.goalId ? goalMet(player.goalId, res) : false
      return {
        role,
        name: player.name,
        goalId: player.goalId,
        goalTitle: goal?.title ?? null,
        goalMet: met,
        title: res.win ? 'NATION BUILDER' : met ? 'HOLLOW VICTORY' : 'NO TITLE',
      }
    }),
  }
}

/** Re-exported so a host can seed a room without importing the RNG directly. */
export { shuffle }
