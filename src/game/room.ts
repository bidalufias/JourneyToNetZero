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
 *      hint — the effect values never cross the boundary.
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
import { costLabel, optionHint } from './hints'
import { asPledgeObject, BOARD_NAME, DEMAND_PHRASES, privateLine } from './copy'
import { draw, pick, roomCode, shuffle } from './rng'
import {
  PHASE_MS,
  ROLE_RESOURCE,
  type DashboardView,
  type InsiderTip,
  type Phase,
  type PhoneOption,
  type PhoneView,
  type Player,
  type Room,
  type TipKind,
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
      { role, name: '', connected: false, goalId: null, choiceId: null, autoLocked: false, lockedAt: null },
    ]),
  ) as Record<Role, Player>

  return {
    code: roomCode(seed),
    createdAt: now,
    phase: 'lobby',
    phaseEndsAt: null,
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

/** The round now being played — used for choices, tips and new pledges. */
function roundNumber(room: Room): number {
  return Math.min(room.game.round + 1, 6)
}

/**
 * The round the surfaces are currently *showing*.
 *
 * The engine advances `game.round` the instant a round resolves, so from the
 * Reckoning onward `roundNumber` already names the next one. Everything the
 * room is still narrating — the promise board, the kept/broken badges, the
 * published tip — belongs to the round just played, so the views use this.
 */
function displayRound(room: Room): number {
  if ((room.phase === 'reckoning' || room.phase === 'summary') && room.lastRound) {
    return room.lastRound.round
  }
  return roundNumber(room)
}

function setPhase(room: Room, phase: Phase, now: number): void {
  room.phase = phase
  const ms = PHASE_MS[phase]
  room.phaseEndsAt = ms > 0 ? now + ms : null
}

function everyoneLocked(room: Room): boolean {
  return ROLES.every((r) => room.players[r].choiceId !== null)
}

/**
 * Vetoes the Community can still spend, as both surfaces should show it.
 *
 * The engine decrements the reserve when it resolves the round, which keeps
 * parity with the reference implementation. But a veto declared during THE
 * TABLE is already gone as far as the room is concerned, and the dashboard
 * says so the moment it lands — so the views subtract the pending one.
 */
function vetoesRemaining(room: Room): number {
  return Math.max(0, room.game.vetoes - (room.vetoTarget ? 1 : 0))
}

/**
 * Options a role may choose right now, with the veto applied.
 * Shared by the phone view and the lock validator so they cannot disagree.
 */
function choosableOptions(room: Room, content: Content, role: Role): Option[] {
  const scenario = currentScenario(room, content)
  if (!scenario) return []
  const opts = availableOptions(room.game, scenario, role, content)
  return role === room.vetoTarget ? applyVeto(opts) : opts
}

// ── Commands ───────────────────────────────────────────────────────────────

export type Command =
  | { t: 'join'; role: Role; name: string }
  | { t: 'leave'; role: Role }
  | { t: 'reconnect'; role: Role }
  | { t: 'pickGoal'; role: Role; goalId: string }
  | { t: 'start' }
  | { t: 'advance' }
  | { t: 'promise'; role: Role; optionId: string }
  | { t: 'demand'; role: Role; target: Role; phraseId: string }
  | { t: 'offer'; from: Role; to: Role; resource: 'fiscal' | 'capital'; amount: number }
  | { t: 'respondOffer'; role: Role; offerId: string; accept: boolean }
  | { t: 'spotlight'; role: Role }
  | { t: 'veto'; role: Role; target: Role }
  | { t: 'coFund'; role: Role; agree: boolean }
  | { t: 'publishTip'; role: Role }
  | { t: 'choose'; role: Role; optionId: string }
  | { t: 'lock'; role: Role }

export function apply(room: Room, cmd: Command, content: Content, now: number): Room {
  switch (cmd.t) {
    case 'join': {
      const p = room.players[cmd.role]
      if (p.connected && p.name && p.name !== cmd.name) return room // seat taken
      p.name = cmd.name
      p.connected = true
      return room
    }

    case 'reconnect':
      room.players[cmd.role].connected = true
      return room

    case 'leave':
      room.players[cmd.role].connected = false
      return room

    case 'pickGoal': {
      // Sealed. Chosen once, revealed only in the endgame.
      if (room.players[cmd.role].goalId) return room
      room.players[cmd.role].goalId = cmd.goalId
      return room
    }

    case 'start': {
      if (room.phase !== 'lobby') return room
      setPhase(room, 'briefing', now)
      return room
    }

    case 'advance':
      return advance(room, content, now)

    case 'promise': {
      if (room.phase !== 'table') return room
      const scenario = currentScenario(room, content)
      const option = scenario?.options[cmd.role].find((o) => o.id === cmd.optionId)
      if (!option) return room
      // One live pledge per player per round — a second replaces the first.
      room.promises = room.promises.filter(
        (p) => !(p.round === roundNumber(room) && p.from === cmd.role && p.kind === 'promise'),
      )
      room.promises.push({
        id: `${cmd.role}-${roundNumber(room)}-p`,
        round: roundNumber(room),
        from: cmd.role,
        kind: 'promise',
        text: `${BOARD_NAME[cmd.role]} will ${asPledgeObject(option.title)}.`,
        optionId: option.id,
        outcome: 'unresolved',
      })
      return room
    }

    case 'demand': {
      if (room.phase !== 'table') return room
      const phrase = DEMAND_PHRASES.find((p) => p.id === cmd.phraseId)
      if (!phrase) return room
      room.promises = room.promises.filter(
        (p) => !(p.round === roundNumber(room) && p.from === cmd.role && p.kind === 'demand'),
      )
      room.promises.push({
        id: `${cmd.role}-${roundNumber(room)}-d`,
        round: roundNumber(room),
        from: cmd.role,
        kind: 'demand',
        text: `${BOARD_NAME[cmd.role]} demands ${phrase.text(cmd.target)}.`,
        optionId: null,
        outcome: 'unresolved',
      })
      return room
    }

    case 'offer': {
      if (room.phase !== 'table') return room
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
      if (room.phase !== 'table' || cmd.role !== 'activist') return room
      if (room.game.spotlights <= 0) return room
      room.spotlightCalled = true
      return room
    }

    case 'veto': {
      if (room.phase !== 'table' || cmd.role !== 'community') return room
      if (room.game.vetoes <= 0 || room.vetoTarget) return room
      room.vetoTarget = cmd.target
      // Anyone whose locked choice the veto just removed has to choose again.
      const removed = choosableOptions(room, content, cmd.target).map((o) => o.id)
      const p = room.players[cmd.target]
      if (p.choiceId && !removed.includes(p.choiceId)) {
        p.choiceId = null
        p.lockedAt = null
      }
      return room
    }

    case 'coFund': {
      if (cmd.role !== 'government') return room
      room.coFund = cmd.agree
      return room
    }

    case 'publishTip': {
      const tip = room.tips.find((t) => t.round === roundNumber(room) && t.to === cmd.role)
      if (!tip || tip.published) return room
      tip.published = true
      return room
    }

    case 'choose': {
      if (room.phase !== 'choice' && room.phase !== 'table') return room
      const allowed = choosableOptions(room, content, cmd.role)
      if (!allowed.some((o) => o.id === cmd.optionId)) return room
      room.players[cmd.role].choiceId = cmd.optionId
      room.players[cmd.role].autoLocked = false
      room.players[cmd.role].lockedAt = now
      if (room.phase === 'choice' && everyoneLocked(room)) {
        return resolveRound(room, content, now)
      }
      return room
    }

    case 'lock':
      return room

    default:
      return room
  }
}

// ── Phase machine ──────────────────────────────────────────────────────────

/** Drives the clock. Call on every server tick; safe to call repeatedly. */
export function tick(room: Room, content: Content, now: number): Room {
  if (room.phaseEndsAt === null || now < room.phaseEndsAt) return room
  return advance(room, content, now)
}

function advance(room: Room, content: Content, now: number): Room {
  switch (room.phase) {
    case 'lobby':
      setPhase(room, 'briefing', now)
      return room

    case 'briefing':
      return openRound(room, content, now)

    case 'crisis':
      setPhase(room, 'table', now)
      return room

    case 'table':
      setPhase(room, 'choice', now)
      return room

    case 'choice':
      // The session must never stall: anyone who did not choose gets a default.
      for (const role of ROLES) {
        if (room.players[role].choiceId === null) {
          const opts = choosableOptions(room, content, role)
          if (opts.length) {
            room.players[role].choiceId = opts[0].id
            room.players[role].autoLocked = true
            room.players[role].lockedAt = now
          }
        }
      }
      return resolveRound(room, content, now)

    case 'reckoning':
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

/** Reveals the crisis, deals the round's single Insider Tip, opens the round. */
function openRound(room: Room, content: Content, now: number): Room {
  room.vetoTarget = null
  room.coFund = false
  room.spotlightCalled = false
  for (const role of ROLES) {
    room.players[role].choiceId = null
    room.players[role].autoLocked = false
    room.players[role].lockedAt = null
  }
  dealTip(room, content)
  setPhase(room, 'crisis', now)
  return room
}

function resolveRound(room: Room, content: Content, now: number): Room {
  const choices = Object.fromEntries(
    ROLES.map((r) => [r, room.players[r].choiceId as string]),
  ) as Record<Role, string>

  // The Activist's Spotlight is a Table action, but the engine derives its
  // target from the choices — it only lands on a role that actually went
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
    if (p.round !== log.round || p.kind !== 'promise' || !p.optionId) continue
    p.outcome = choices[p.from] === p.optionId ? 'kept' : 'broken'
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
 * Publishing stakes one Trust — or, for the Community, one veto. A CONFIRMED
 * tip is always safe; an UNVERIFIED one is a gamble.
 */
function applyTipStake(room: Room, tip: InsiderTip): void {
  if (tip.to === 'community') {
    room.game.vetoes = tip.isTrue
      ? Math.min(3, room.game.vetoes + 1)
      : Math.max(0, room.game.vetoes - 1)
    return
  }
  const role = tip.to as 'government' | 'business' | 'activist'
  room.game.trust[role] = tip.isTrue
    ? room.game.trust[role] + 1
    : Math.max(0, room.game.trust[role] - 1)
}

// ── Insider Tips ───────────────────────────────────────────────────────────

/**
 * Exactly one tip per round to exactly one player, dealt the moment the crisis
 * is revealed. Nobody is told a tip was dealt to whom — the dashboard only
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

  // Roughly a quarter of cards are UNVERIFIED rumours; the rest are CONFIRMED.
  const roll = draw(room.seed, cursor)
  cursor = roll.cursor
  const wantRumour = roll.value < 0.25 && round >= 2

  const kinds: TipKind[] = []
  if (!wantRumour) {
    if (nextScenarioId) kinds.push('forecast')
    kinds.push('intel' as TipKind)
    if (round >= 2) kinds.push('dossier')
  }
  if (wantRumour || !kinds.length) kinds.push('rumour')

  const kindPick = pick(kinds, room.seed, cursor)
  cursor = kindPick.cursor
  const kind = kindPick.value

  if (kind === 'rumour') {
    const whisperIds = Object.keys(tips.whispers)
    const w = pick(whisperIds, room.seed, cursor)
    cursor = w.cursor
    // The UNVERIFIED truth roll happens here, server-side, at deal time —
    // and the answer never leaves the server until the holder publishes.
    const truth = draw(room.seed, cursor)
    cursor = truth.cursor
    return {
      tip: {
        id: `tip-${round}`,
        round,
        to,
        kind: 'rumour',
        reliability: 'UNVERIFIED',
        source: 'A rumour going round',
        text: tips.whispers[w.value],
        isTrue: truth.value < tips.whisperAccuracy,
        published: false,
        revealed: false,
      },
      cursor,
    }
  }

  if (kind === 'forecast' && nextScenarioId) {
    const nextType = content.scenarios[nextScenarioId].type
    const lines = tips.forecasts[nextType] ?? []
    const line = lines.length ? pick(lines, room.seed, cursor) : { value: '', cursor }
    cursor = line.cursor
    return {
      tip: {
        id: `tip-${round}`,
        round,
        to,
        kind: 'forecast',
        reliability: 'CONFIRMED',
        source: 'Cabinet Situation Room',
        text: line.value || 'Something is coming. Nobody will say what.',
        isTrue: true,
        published: false,
        revealed: false,
      },
      cursor,
    }
  }

  if (kind === 'dossier') {
    const others = ROLES.filter((r) => r !== to && room.players[r].goalId)
    if (others.length) {
      const target = pick(others, room.seed, cursor)
      cursor = target.cursor
      const goalId = room.players[target.value].goalId as string
      return {
        tip: {
          id: `tip-${round}`,
          round,
          to,
          kind: 'dossier',
          reliability: 'CONFIRMED',
          source: 'A friend in the ministry',
          text: tips.whispers[goalId] ?? 'They want something they have not said out loud.',
          isTrue: true,
          published: false,
          revealed: false,
        },
        cursor,
      }
    }
  }

  // Intel: a true fact about the crisis on the table right now.
  return {
    tip: {
      id: `tip-${round}`,
      round,
      to,
      kind: 'memo',
      reliability: 'CONFIRMED',
      source: 'A sealed brief',
      text: tips.intel[scenarioId] ?? 'The official figures are not the real ones.',
      isTrue: true,
      published: false,
      revealed: false,
    },
    cursor,
  }
}

// ── Views ──────────────────────────────────────────────────────────────────

export function dashboardView(room: Room, content: Content): DashboardView {
  const scenario = currentScenario(room, content)
  const lockOrder = ROLES.map((r) => room.players[r].lockedAt).filter((t): t is number => t !== null)
  const lastLock = lockOrder.length === 3 ? ROLES.find((r) => room.players[r].choiceId === null) : null

  const tip = room.tips.find((t) => t.round === displayRound(room))
  const published =
    tip?.published && tip
      ? {
          from: tip.to,
          text: tip.text,
          source: tip.source,
          verdict: tip.revealed ? ((tip.isTrue ? 'true' : 'false') as 'true' | 'false') : null,
        }
      : null

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
    round: displayRound(room),
    scenario: scenario
      ? { id: scenario.id, title: scenario.title, type: scenario.type, situation: scenario.situation }
      : null,
    state: publicState(room.game, content),
    seats: ROLES.map((role) => ({
      role,
      name: room.players[role].name || null,
      connected: room.players[role].connected,
      locked: room.players[role].choiceId !== null,
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
          remaining: room.game.spotlights,
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
  }
}

export function phoneView(room: Room, content: Content, role: Role): PhoneView {
  const scenario = currentScenario(room, content)
  const player = room.players[role]
  const showOptions = room.phase === 'table' || room.phase === 'choice'

  let options: PhoneOption[] = []
  if (scenario && showOptions) {
    const affordableAndOpen = availableOptions(room.game, scenario, role, content)
    const afterVeto = role === room.vetoTarget ? applyVeto(affordableAndOpen) : affordableAndOpen

    options = scenario.options[role].map((o): PhoneOption => {
      const open = affordableAndOpen.some((a) => a.id === o.id)
      const choosable = afterVeto.some((a) => a.id === o.id)

      let disabled: PhoneOption['disabled'] = null
      let note: string | null = null

      if (!open) {
        // Three disabled states, three different edges — because "I can't",
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
        note = '"The public will simply not accept this." — the Community, this round only'
      }

      return {
        id: o.id,
        title: o.title,
        desc: o.desc,
        cost: costLabel(o),
        hint: optionHint(o),
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

  const goalChoices =
    player.goalId === null
      ? content.privateGoals[role].map((g) => ({ id: g.id, title: g.title, desc: g.desc }))
      : null

  return {
    code: room.code,
    role,
    name: player.name,
    phase: room.phase,
    phaseEndsAt: room.phaseEndsAt,
    round: displayRound(room),
    scenario: scenario
      ? { id: scenario.id, title: scenario.title, situation: scenario.situation, type: scenario.type }
      : null,
    privateLine: scenario ? privateLine(scenario.type, role) : null,
    options,
    choiceId: player.choiceId,
    locked: player.choiceId !== null,
    resource: { kind: resourceKind, value: resourceValue, label: ROLE_RESOURCE[role].label },
    trust: { ...room.game.trust },
    vetoesRemaining: vetoesRemaining(room),
    spotlightsRemaining: room.game.spotlights,
    goalId: player.goalId,
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
      locked: room.players[r].choiceId !== null,
    })),
    roundResult: roundResultCopy(room, role),
    waitingOn: ROLES.filter((r) => room.players[r].choiceId === null).length,
  }
}

/**
 * The phone's round result, in three sentences and no numbers. This is the
 * only place the app interprets consequence for a player.
 */
function roundResultCopy(room: Room, role: Role): PhoneView['roundResult'] {
  const log = room.lastRound
  if (!log || (room.phase !== 'reckoning' && room.phase !== 'summary')) return null

  const mine = log.reveals.find((r) => r.role === role)
  if (!mine) return null

  // Quoted rather than folded into the sentence: option titles are imperative
  // ("Demand a Fresh Election"), so "you chose demand a fresh election" reads
  // as a typo. The quotation is always grammatical whatever the pack says.
  const didWhat = `You chose “${mine.title}”.`

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
        ? 'All four of you moved together — the coalition held.'
        : 'Three of you moved together — the coalition held.',
    )
  } else {
    others.push('The table did not move together this round.')
  }
  const broken = room.promises.filter((p) => p.round === log.round && p.outcome === 'broken')
  if (broken.length) others.push(`${broken.map((b) => b.from).join(' and ')} broke a promise.`)

  return { didWhat, cost: costBits.join(' '), others: others.join(' ') }
}

// ── Endgame ────────────────────────────────────────────────────────────────

export interface Endgame {
  win: boolean
  targets: { key: 'emissions' | 'growth' | 'happiness'; value: number; target: number; met: boolean }[]
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
 */
export function endgame(room: Room, content: Content): Endgame {
  const res = result(room.game, content)
  const c = content.config

  return {
    win: res.win,
    targets: [
      { key: 'emissions', value: res.e, target: c.tgt_e, met: res.pe },
      { key: 'growth', value: res.g, target: c.tgt_g, met: res.pg },
      { key: 'happiness', value: res.h, target: c.tgt_h, met: res.ph },
    ],
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
