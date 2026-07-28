/**
 * Session-level tests: the room around the engine.
 *
 * These cover the promises the design makes about a live workshop: the
 * session never stalls, a phone can never see the numbers, promises are
 * recorded but never enforced, and Hollow Victory stays sharp.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { loadContent } from '../src/engine/content'
import { DIRTY, ROLES, type Role } from '../src/engine/types'
import { optionCondition } from '../src/game/impact'
import {
  apply,
  authorise,
  createRoom,
  dashboardView,
  endgame,
  phoneView,
  tick,
  type Command,
} from '../src/game/room'
import { PHASE_MS, phaseMs, type Room } from '../src/game/session'

const content = loadContent(
  JSON.parse(readFileSync(fileURLToPath(new URL('../content/jtnz-content-pack-v2.json', import.meta.url)), 'utf8')),
)

let clock = 1_700_000_000_000
const run = (room: Room, cmd: Command) => apply(room, cmd, content, clock)

/**
 * Choosing and committing are two acts now, and almost every test wants both.
 * Anything testing the gap between them does it by hand.
 */
const lockIn = (room: Room, role: Role, optionId: string) => {
  run(room, { t: 'choose', role, optionId })
  run(room, { t: 'lock', role })
}

/** The first option this role may actually take. */
const firstAvailable = (room: Room, role: Role) =>
  phoneView(room, content, role).options.find((o) => o.available)!.id

function seated(seed = 12345): Room {
  clock = 1_700_000_000_000
  const room = createRoom(content, seed, clock)
  const names: Record<Role, string> = {
    government: 'Priya',
    business: 'Marcus',
    community: 'Yusuf',
    activist: 'Aisyah',
  }
  for (const role of ROLES) {
    run(room, { t: 'join', role, name: names[role] })
    run(room, { t: 'pickGoal', role, goalId: content.privateGoals[role][0].id })
  }
  return room
}

/**
 * Advances past the current phase. Timed phases expire on the clock; the
 * results sequence has no deadline by design and waits for the facilitator.
 */
function expire(room: Room): Room {
  if (room.phaseEndsAt === null) {
    clock += 1000
    return apply(room, { t: 'advance' }, content, clock)
  }
  clock = room.phaseEndsAt + 1
  return tick(room, content, clock)
}

/**
 * Runs the clock until the room reaches `phase`.
 *
 * Tests used to count `expire()` calls, which encoded the phase list into forty
 * places at once: adding the onboarding between the briefing and the first
 * crisis broke twenty of them without a single one of them being about
 * onboarding. Naming the destination says what the test actually wants.
 */
function advanceTo(room: Room, phase: Room['phase'], guard = 40): Room {
  let n = 0
  while (room.phase !== phase && n++ < guard) expire(room)
  if (room.phase !== phase) throw new Error(`never reached ${phase}, stuck in ${room.phase}`)
  return room
}

/** Start the session and play through the onboarding to the first real crisis. */
function startPlaying(room: Room): Room {
  run(room, { t: 'start' })
  return advanceTo(room, 'crisis')
}

describe('room lifecycle', () => {
  it('creates a readable 4-letter code and a six-round path', () => {
    const room = seated()
    expect(room.code).toMatch(/^[A-Z]{4}$/)
    expect(room.code).not.toMatch(/[IO01]/)
    expect(room.game.path).toHaveLength(6)
    room.game.path.forEach((id, i) => expect(content.scenarios[id].round).toBe(i + 1))
  })

  it('plays a full session to the endgame without stalling', () => {
    const room = seated()
    run(room, { t: 'start' })

    let guard = 0
    while (room.phase !== 'ended' && guard++ < 200) {
      // Nobody ever chooses. The clock has to carry the whole session.
      expire(room)
    }

    expect(guard).toBeLessThan(200)
    expect(room.phase).toBe('ended')
    expect(room.game.round).toBe(6)
    expect(room.history).toHaveLength(6)
    // Every unanswered choice was auto-locked rather than left hanging.
    expect(room.game.picks).toHaveLength(6)
  })

  it('auto-locks a default when a player stops playing mid-round', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'choice')

    expect(room.phase).toBe('choice')
    lockIn(room, 'government', firstAvailable(room, 'government'))
    expect(room.players.business.choiceId).toBeNull()

    expire(room) // choice deadline passes

    expect(room.phase).toBe('reckoning')
    expect(room.players.business.choiceId).not.toBeNull()
    expect(room.players.business.autoLocked).toBe(true)
    expect(room.players.government.autoLocked).toBe(false)
  })

  it('resolves the round early once all four lock', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'choice')
    expect(room.phase).toBe('choice')

    for (const role of ROLES) lockIn(room, role, firstAvailable(room, role))
    expect(room.phase).toBe('reckoning')
    expect(room.lastRound).not.toBeNull()
  })

  it('does not wait on a chair nobody is sitting in', () => {
    const room = seated()
    run(room, { t: 'leave', role: 'activist' })
    startPlaying(room)
    advanceTo(room, 'choice')
    expect(room.phase).toBe('choice')

    for (const role of ROLES.filter((r) => r !== 'activist')) {
      lockIn(room, role, firstAvailable(room, role))
    }
    // Three players are the whole table, so the round resolves rather than
    // burning the deadline waiting for somebody who is not in the room.
    expect(room.phase).toBe('reckoning')
  })
})

describe('the onboarding', () => {
  it('teaches one verb at a time, then starts the game', () => {
    const room = seated()
    run(room, { t: 'start' })
    const seen: string[] = [room.phase]
    for (let i = 0; i < 6 && room.phase !== 'crisis'; i++) {
      expire(room)
      seen.push(room.phase)
    }
    expect(seen).toEqual([
      'briefing',
      'practiceTalk',
      'practiceChoice',
      'power',
      'goal',
      'crisis',
    ])
    // The talk comes before the choice, because that is the order a real round
    // runs in. Teaching the sequence backwards to save a step is a poor trade.
    expect(seen.indexOf('practiceTalk')).toBeLessThan(seen.indexOf('practiceChoice'))
  })

  it('deals practice cards that cannot cost anything', () => {
    const room = seated()
    run(room, { t: 'start' })
    advanceTo(room, 'practiceChoice')

    for (const role of ROLES) {
      const view = phoneView(room, content, role)
      expect(view.options).toHaveLength(2)
      // No affordability, no veto, no trust gate. A practice round a player can
      // be locked out of teaches the wrong lesson on the wrong screen.
      expect(view.options.every((o) => o.available)).toBe(true)
      expect(view.options.every((o) => o.disabled === null)).toBe(true)
      expect(view.options.every((o) => o.impact.length === 4)).toBe(true)
    }
  })

  it('actually accepts what it asks the table to do', () => {
    // Every negotiation command used to test for the live phase by name, so
    // during practice all four buttons were visible, tappable, and silent. The
    // step that exists to make somebody press one did not let them.
    const room = seated()
    run(room, { t: 'start' })
    advanceTo(room, 'practiceTalk')

    const card = phoneView(room, content, 'government').options[0]
    run(room, { t: 'say', role: 'government', shape: 'promise', optionId: card.id })
    expect(phoneView(room, content, 'government').promises).toHaveLength(1)
    expect(dashboardView(room, content).promises[0].text).toContain(card.title)

    run(room, { t: 'say', role: 'activist', shape: 'demand', target: 'business', phraseId: 'pay-first' })
    expect(dashboardView(room, content).promises).toHaveLength(2)

    advanceTo(room, 'practiceChoice')
    const pick = phoneView(room, content, 'business').options[1]
    lockIn(room, 'business', pick.id)
    const after = phoneView(room, content, 'business')
    expect(after.choiceId).toBe(pick.id)
    expect(after.locked).toBe(true)
  })

  it('throws the practice away rather than carrying it into Round 1', () => {
    const room = seated()
    run(room, { t: 'start' })
    advanceTo(room, 'practiceTalk')
    run(room, {
      t: 'say',
      role: 'government',
      shape: 'promise',
      optionId: phoneView(room, content, 'government').options[0].id,
    })
    // Spend real money in practice, to prove it is handed back. Accepting an
    // offer is a permanent transfer wherever it happens.
    run(room, { t: 'offer', from: 'government', to: 'business', resource: 'fiscal', amount: 2 })
    const offer = dashboardView(room, content).offersInFlight[0]
    run(room, { t: 'respondOffer', role: 'business', offerId: offer.id, accept: true })
    expect(room.game.fiscal).toBe(content.config.start.fiscal - 2)

    advanceTo(room, 'practiceChoice')
    for (const role of ROLES) lockIn(room, role, phoneView(room, content, role).options[0].id)

    // It has to have happened before it can be thrown away, or this asserts
    // nothing at all. That is how the inert practice round passed this test.
    expect(ROLES.every((r) => phoneView(room, content, r).locked)).toBe(true)
    expect(dashboardView(room, content).promises).toHaveLength(1)
    // Four locks must not resolve anything. The practice deck is not in any
    // scenario, so handing it to the engine throws and ends the session.
    expect(room.phase).toBe('practiceChoice')
    expect(room.game.round).toBe(0)

    advanceTo(room, 'crisis')
    for (const role of ROLES) {
      const view = phoneView(room, content, role)
      expect(view.choiceId).toBeNull()
      expect(view.locked).toBe(false)
    }
    // Nothing said in practice is on the record when the game starts.
    expect(dashboardView(room, content).promises).toHaveLength(0)
    // And no practice card reached the engine.
    expect(room.game.picks).toHaveLength(0)
    // Money moved in practice is money the design did not mean them to have.
    expect(room.game.fiscal).toBe(content.config.start.fiscal)
    expect(room.game.capital).toBe(content.config.start.capital)
  })

  it('asks for the secret win after the practice, not before it', () => {
    const room = createRoom(content, 999, clock)
    for (const role of ROLES) run(room, { t: 'join', role, name: 'P' })

    // Nothing is offered while a player is still learning what the units mean.
    for (const phase of ['lobby', 'briefing', 'practiceTalk', 'practiceChoice', 'power'] as const) {
      if (room.phase !== phase) advanceTo(room, phase)
      expect(phoneView(room, content, 'government').goalChoices, phase).toBeNull()
      if (phase === 'lobby') run(room, { t: 'start' })
    }

    advanceTo(room, 'goal')
    const choices = phoneView(room, content, 'government').goalChoices
    expect(choices).not.toBeNull()
    expect(choices).toHaveLength(3)
  })
})

describe('choosing is not committing', () => {
  const atChoice = () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'choice')
    return room
  }

  it('lets a player change their mind until they lock', () => {
    const room = atChoice()
    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    expect(opts.length).toBeGreaterThan(1)

    run(room, { t: 'choose', role: 'government', optionId: opts[0].id })
    expect(phoneView(room, content, 'government').locked).toBe(false)
    run(room, { t: 'choose', role: 'government', optionId: opts[1].id })
    expect(phoneView(room, content, 'government').choiceId).toBe(opts[1].id)

    run(room, { t: 'lock', role: 'government' })
    expect(phoneView(room, content, 'government').locked).toBe(true)

    // And not after.
    run(room, { t: 'choose', role: 'government', optionId: opts[0].id })
    expect(phoneView(room, content, 'government').choiceId).toBe(opts[1].id)
  })

  it('refuses to lock nothing', () => {
    const room = atChoice()
    run(room, { t: 'lock', role: 'government' })
    expect(room.players.government.locked).toBe(false)
    expect(room.phase).toBe('choice')
  })

  it('keeps the card you selected when the clock runs out', () => {
    const room = atChoice()
    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    const wanted = opts[1] ?? opts[0]
    run(room, { t: 'choose', role: 'government', optionId: wanted.id })

    expire(room) // the deadline commits it for them

    const gov = room.players.government
    expect(gov.choiceId).toBe(wanted.id)
    expect(gov.autoLocked).toBe(true)
    // The clock locked it, but it did not pick it, and the summary must not
    // claim the player chose something they never selected.
    expect(gov.defaulted).toBe(false)
    expect(room.players.business.defaulted).toBe(true)

    expire(room) // reckoning, where the round summary is written
    expect(phoneView(room, content, 'government').roundResult?.didWhat).toContain('clock locked it in')
    expect(phoneView(room, content, 'business').roundResult?.didWhat).toContain('ran out of time')
  })
})

describe('a seat can be given up', () => {
  it('empties the chair so somebody else can take it', () => {
    const room = seated()
    expect(room.players.business.name).toBe('Marcus')

    run(room, { t: 'leave', role: 'business' })
    expect(room.players.business.name).toBe('')
    expect(room.players.business.goalId).toBeNull()
    expect(dashboardView(room, content).seats.find((s) => s.role === 'business')!.name).toBeNull()

    // The chair is genuinely free, not merely dimmed.
    run(room, { t: 'join', role: 'business', name: 'Nadia' })
    expect(room.players.business.name).toBe('Nadia')
  })

  it('offers a goal to whoever takes a vacated seat mid-session', () => {
    const room = seated()
    startPlaying(room)

    run(room, { t: 'leave', role: 'business' })
    run(room, { t: 'join', role: 'business', name: 'Nadia' })

    // Sealing a goal is gated on having none, never on the lobby: a latecomer
    // with no goal would otherwise play the whole game with nothing to win.
    const view = phoneView(room, content, 'business')
    expect(view.goalId).toBeNull()
    expect(view.goalChoices).not.toBeNull()
    run(room, { t: 'pickGoal', role: 'business', goalId: view.goalChoices![0].id })
    expect(phoneView(room, content, 'business').goalTitle).toBe(view.goalChoices![0].title)
  })
})

describe('the phone can never see the numbers', () => {
  it('never tells a card it is constructive when the engine disagrees', () => {
    // The coalition note on a card and the `aligned` test in playRound are two
    // statements of one rule. The Community's veto trigger was duplicated the
    // same way and the copies drifted, so this asserts they agree for all 216
    // options rather than trusting that they were written to match.
    const breaks = 'The table will not count this as moving together.'
    for (const scenario of Object.values(content.scenarios)) {
      for (const options of Object.values(scenario.options)) {
        for (const o of options) {
          const aligned = !DIRTY.has(o.arch) && o.arch !== 'DEMAND_RELIEF'
          expect(optionCondition(o) === breaks).toBe(!aligned)
        }
      }
    }
  })

  it('sends no effect values with an option card', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')

    const view = phoneView(room, content, 'government')
    expect(view.options.length).toBeGreaterThan(0)

    // Serialise the entire view and look for the raw effects of every option
    // this role could be shown. If any leaked, a player could read them.
    const wire = JSON.stringify(view)
    const parsed = JSON.parse(wire)
    for (const card of parsed.options) {
      expect(Object.keys(card).sort()).toEqual(
        ['available', 'condition', 'cost', 'desc', 'disabled', 'disabledNote', 'id', 'impact', 'title'].sort(),
      )
      // The chips carry a direction and never a value. -3 to 3 is the whole
      // range they may take, so no effect can be read back off one.
      for (const chip of card.impact) {
        expect(Object.keys(chip).sort()).toEqual(['dir', 'good', 'label', 'meter'].sort())
        expect(Number.isInteger(chip.dir)).toBe(true)
        expect(Math.abs(chip.dir)).toBeLessThanOrEqual(3)
      }
    }

    const scenario = content.scenarios[room.game.path[0]]
    for (const o of scenario.options.government) {
      expect(wire).not.toContain(`"e":${o.e}`)
      expect(wire).not.toContain(`"gr":${o.gr}`)
    }
  })

  it('never sends another player a tip that is not theirs', () => {
    const room = seated()
    startPlaying(room) // the crisis deals the round's single tip

    const dealt = room.tips.find((t) => t.round === 1)
    expect(dealt).toBeDefined()

    for (const role of ROLES) {
      const view = phoneView(room, content, role)
      if (role === dealt!.to) expect(view.tip?.id).toBe(dealt!.id)
      else expect(view.tip).toBeNull()
    }
  })

  it('announces that a tip was dealt but never to whom', () => {
    const room = seated()
    startPlaying(room)

    const view = dashboardView(room, content)
    expect(view.tipDealtThisRound).toBe(true)
    const wire = JSON.stringify(view)
    expect(wire).not.toContain(room.tips[0].text)
  })
})

describe('negotiation', () => {
  it('records a promise and marks it broken without enforcing it', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')
    expect(room.phase).toBe('table')

    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    const pledged = opts[0]
    const actual = opts[1] ?? opts[0]
    run(room, { t: 'say', role: 'government', shape: 'promise', optionId: pledged.id })

    const board = dashboardView(room, content).promises
    expect(board).toHaveLength(1)
    // The pledge quotes the option title rather than folding it into the
    // sentence: titles are a mix of imperatives ("Bail Out the Big Exporters")
    // and noun phrases ("Green Stimulus Package"), and only a quotation is
    // grammatical for both.
    expect(board[0].text).toBe(`The Government will choose “${pledged.title}”.`)

    expire(room) // -> choice
    // The player is free to break it. Nothing stops them.
    lockIn(room, 'government', actual.id)
    for (const role of ROLES.filter((r) => r !== 'government')) {
      lockIn(room, role, firstAvailable(room, role))
    }

    const resolved = room.promises[0]
    expect(resolved.outcome).toBe(pledged.id === actual.id ? 'kept' : 'broken')

    // The engine advances the round counter the moment it resolves, so the
    // views must narrate the round just *played*, because otherwise the Reckoning
    // filters out the very pledge it exists to judge.
    expect(room.phase).toBe('reckoning')
    const reckoning = dashboardView(room, content)
    expect(reckoning.round).toBe(1)
    expect(reckoning.promises).toHaveLength(1)
    expect(reckoning.promises[0].outcome).not.toBe('unresolved')
    expect(reckoning.lastRound?.round).toBe(1)
  })

  it('keeps the promise board on screen through the round summary', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')
    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    run(room, { t: 'say', role: 'government', shape: 'promise', optionId: opts[0].id })
    advanceTo(room, 'summary')

    const view = dashboardView(room, content)
    expect(view.round).toBe(1)
    expect(view.promises).toHaveLength(1)
  })

  it('executes an accepted offer immediately and permanently', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')

    const fiscalBefore = room.game.fiscal
    const capitalBefore = room.game.capital
    run(room, { t: 'offer', from: 'government', to: 'business', resource: 'fiscal', amount: 1 })
    const offer = room.offers[0]
    expect(offer.status).toBe('pending')

    run(room, { t: 'respondOffer', role: 'business', offerId: offer.id, accept: true })
    expect(room.offers[0].status).toBe('accepted')
    expect(room.game.fiscal).toBe(fiscalBefore - 1)
    expect(room.game.capital).toBe(capitalBefore + 1)
  })

  it('removes the dirty options a Public Mandate names, for that round only', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')

    const before = phoneView(room, content, 'government').options.filter((o) => o.available).length
    run(room, { t: 'veto', role: 'community', target: 'government' })

    const after = phoneView(room, content, 'government')
    // The engine spends the veto at resolution; the views report it as gone
    // the moment it lands, which is what the room sees.
    expect(phoneView(room, content, 'community').vetoesRemaining).toBe(1)
    expect(after.options.filter((o) => o.available).length).toBeLessThanOrEqual(before)
    const vetoed = after.options.filter((o) => o.disabled === 'veto')
    expect(vetoed.length).toBeGreaterThan(0)
    expect(vetoed[0].disabledNote).toContain('will simply not accept')
  })

  it('spends only two vetoes across a whole game', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')
    run(room, { t: 'veto', role: 'community', target: 'government' })
    // A second veto in the same round is refused.
    run(room, { t: 'veto', role: 'community', target: 'business' })
    expect(phoneView(room, content, 'community').vetoesRemaining).toBe(1)
    expect(room.vetoTarget).toBe('government')

    // Resolve the round: the engine now actually spends it.
    expire(room)
    for (const role of ROLES) {
      const opt = phoneView(room, content, role).options.find((o) => o.available)
      if (opt) lockIn(room, role, opt.id)
    }
    expect(room.game.vetoes).toBe(1)
    expect(room.game.vetoesUsed).toBe(1)
  })
})

describe('the endgame', () => {
  it('gives Hollow Victory to a player who hit their goal in a lost country', () => {
    const room = seated()
    run(room, { t: 'start' })
    let guard = 0
    while (room.phase !== 'ended' && guard++ < 200) expire(room)

    const end = endgame(room, content)
    expect(end.targets).toHaveLength(3)

    for (const p of end.players) {
      if (end.win) expect(p.title).toBe('NATION BUILDER')
      else expect(p.title).toBe(p.goalMet ? 'HOLLOW VICTORY' : 'NO TITLE')
    }
    // No partial credit: a missed country is a missed country.
    if (!end.win) expect(end.players.every((p) => p.title !== 'NATION BUILDER')).toBe(true)
  })

  it('grades the country in three, and names every gap', () => {
    const room = seated()
    run(room, { t: 'start' })
    let guard = 0
    while (room.phase !== 'ended' && guard++ < 200) expire(room)

    const end = endgame(room, content)
    expect(['REACHED', 'CLOSE', 'MISSED']).toContain(end.grade)
    expect(end.grade === 'REACHED').toBe(end.win)

    for (const t of end.targets) {
      // A met target has no gap, and a missed one always says how far.
      if (t.met) expect(t.gap).toBe(0)
      else expect(t.gap).toBeGreaterThan(0)
      expect(t.verdict.length).toBeGreaterThan(0)
      expect(t.verdict.endsWith('.')).toBe(true)
    }

    // CLOSE is every gap being small, not one of them being small. A table
    // that hit two and missed the third by forty Mt did not nearly make it,
    // and telling them otherwise is what empties a debrief.
    if (end.grade === 'CLOSE') {
      expect(end.targets.every((t) => t.met || t.gap <= 10)).toBe(true)
      expect(end.targets.some((t) => !t.met)).toBe(true)
    }
  })

  it('does not soften the grade for a table that hit two targets badly', () => {
    const room = seated()
    run(room, { t: 'start' })
    let guard = 0
    while (room.phase !== 'ended' && guard++ < 200) expire(room)

    // Force the shape the grade has to get right: two met, one missed wide.
    room.game.emissions = 60
    const end = endgame(room, content)
    expect(end.grade).toBe('MISSED')
    expect(end.targets.find((t) => t.key === 'emissions')!.verdict).toContain('reach zero')
  })
})

describe('SAY IT', () => {
  /** A room in THE TALK of round one, which is where every sentence is said. */
  const talking = () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')
    return room
  }

  it('puts one sentence per player on the board, replacing the last', () => {
    const room = talking()
    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)

    run(room, { t: 'say', role: 'government', shape: 'promise', optionId: opts[0].id })
    run(room, { t: 'say', role: 'government', shape: 'demand', target: 'business', phraseId: 'pay-first' })

    const board = dashboardView(room, content).promises
    expect(board).toHaveLength(1)
    expect(board[0].kind).toBe('demand')
    expect(board[0].text).toBe('The Government wants the Business pays its share before anyone else moves.')
  })

  it('says the co-funding out loud instead of hiding it in a switch', () => {
    const room = talking()
    run(room, { t: 'say', role: 'government', shape: 'cofund', on: true })

    expect(room.coFund).toBe(true)
    const board = dashboardView(room, content).promises
    expect(board).toHaveLength(1)
    expect(board[0].kind).toBe('cofund')
    expect(board[0].text).toContain('pay half')

    // And it survives a second sentence, because it is a standing commitment
    // rather than this round's one thing to say.
    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    run(room, { t: 'say', role: 'government', shape: 'promise', optionId: opts[0].id })
    expect(dashboardView(room, content).promises).toHaveLength(2)
    expect(room.coFund).toBe(true)

    run(room, { t: 'say', role: 'government', shape: 'cofund', on: false })
    expect(room.coFund).toBe(false)
    expect(dashboardView(room, content).promises.filter((p) => p.kind === 'cofund')).toHaveLength(0)
  })

  it('refuses a co-funding pledge from anybody but the Government', () => {
    const room = talking()
    run(room, { t: 'say', role: 'business', shape: 'cofund', on: true })
    expect(room.coFund).toBe(false)
    expect(dashboardView(room, content).promises).toHaveLength(0)
  })

  it('composes the sentence the game exists to provoke', () => {
    const room = talking()
    const mine = phoneView(room, content, 'government').options.filter((o) => o.available)[0]
    run(room, {
      t: 'say',
      role: 'government',
      shape: 'deal',
      optionId: mine.id,
      target: 'business',
      conditionId: 'moves-with-me',
    })

    const board = dashboardView(room, content).promises
    expect(board).toHaveLength(1)
    expect(board[0].kind).toBe('deal')
    // Third person throughout. A pledge is composed on a phone and read off a
    // projector, and "if the Business moves with me" is wrong on the projector.
    expect(board[0].text).toBe(
      `The Government will choose “${mine.title}” if the Business moves too.`,
    )
    // A deal names the other seat, which is what lets the reveal resolve it.
    expect(board[0].ifRole).toBe('business')
    expect(board[0].ifConditionId).toBe('moves-with-me')
  })

  it('refuses a deal against yourself, or on a condition that does not exist', () => {
    const room = talking()
    const mine = phoneView(room, content, 'government').options.filter((o) => o.available)[0]
    const deal = { t: 'say', role: 'government', shape: 'deal', optionId: mine.id } as const

    run(room, { ...deal, target: 'government', conditionId: 'moves-with-me' })
    run(room, { ...deal, target: 'business', conditionId: 'invented-by-a-client' })
    expect(dashboardView(room, content).promises).toHaveLength(0)
  })
})

describe('a deal is judged against both people', () => {
  /**
   * Round 1 with a deal on the board, resolved by hand.
   *
   * The three outcomes are the whole point of the shape, so each is driven to
   * directly rather than played toward and hoped for.
   */
  function dealt(theirArch: 'aligned' | 'dirty', keepMine: boolean) {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'table')

    const mine = phoneView(room, content, 'government').options.filter((o) => o.available)
    const pledged = mine[0]
    run(room, {
      t: 'say',
      role: 'government',
      shape: 'deal',
      optionId: pledged.id,
      target: 'business',
      conditionId: 'moves-with-me',
    })

    expire(room) // -> choice

    // The Business either moves with the table or takes a card that breaks it.
    const scenario = content.scenarios[room.game.path[0]]
    const theirs = scenario.options.business.find((o) =>
      theirArch === 'dirty' ? DIRTY.has(o.arch) : !DIRTY.has(o.arch) && o.arch !== 'DEMAND_RELIEF',
    )
    expect(theirs, `no ${theirArch} card for the Business in ${scenario.id}`).toBeDefined()

    lockIn(room, 'government', keepMine ? pledged.id : (mine[1] ?? mine[0]).id)
    lockIn(room, 'business', theirs!.id)
    for (const role of ['community', 'activist'] as const) lockIn(room, role, firstAvailable(room, role))

    return room.promises.find((p) => p.kind === 'deal')!
  }

  it('is kept when both of them did it', () => {
    expect(dealt('aligned', true).outcome).toBe('kept')
  })

  it('is broken when they came and you did not', () => {
    expect(dealt('aligned', false).outcome).toBe('broken')
  })

  it('is void, not broken, when the condition never happened', () => {
    // The risk of offering a deal has to be that nobody takes it, never that
    // you get named a liar for a promise that was not called in. Otherwise the
    // safe move is to say nothing, which is the opposite of the point.
    expect(dealt('dirty', false).outcome).toBe('void')
    expect(dealt('dirty', true).outcome).toBe('void')
  })
})

describe('A Tip Off', () => {
  it('is one kind, always true, and worth something to publish', () => {
    const room = seated()
    startPlaying(room)

    const tip = room.tips[0]
    expect(tip).toBeDefined()
    // No reliability, no gamble, no coin flip left on the type at all.
    expect(Object.keys(tip)).toEqual([
      'id',
      'round',
      'to',
      'source',
      'text',
      'published',
      'revealed',
    ])

    const before =
      tip.to === 'community' ? room.game.vetoes : room.game.trust[tip.to as 'government']
    run(room, { t: 'publishTip', role: tip.to })
    advanceTo(room, 'reckoning')

    const after =
      tip.to === 'community' ? room.game.vetoes : room.game.trust[tip.to as 'government']
    expect(after).toBe(before + 1)
    expect(dashboardView(room, content).publishedTip?.text).toBe(tip.text)
  })

  it('deals a tip in every round including the last, where nothing comes next', () => {
    const room = seated()
    run(room, { t: 'start' })
    let guard = 0
    while (room.phase !== 'ended' && guard++ < 200) expire(room)

    expect(room.tips).toHaveLength(6)
    for (const t of room.tips) expect(t.text.length).toBeGreaterThan(0)
    // Everybody hears something across six rounds, and nobody twice running.
    expect(new Set(room.tipRotation).size).toBe(4)
  })
})

describe('after the reveal, the phone says what the card did', () => {
  it('shows the delivered carbon, not the number printed on the card', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'trust')

    for (const role of ROLES) {
      const r = phoneView(room, content, role).roundResult!
      expect(r).not.toBeNull()
      expect(r.title.length).toBeGreaterThan(0)
      // The same four chips the card carried, so the promise and the outcome
      // can be held in one glance.
      expect(r.impact).toHaveLength(4)
      expect(typeof r.carbon).toBe('number')

      const delivered = room.lastRound!.reveals.find((x) => x.role === role)!.emissions
      expect(r.carbon).toBe(delivered)
    }
  })

  it('says nothing about the card until the cards are face up', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'choice')
    expect(phoneView(room, content, 'government').roundResult).toBeNull()
    expect(phoneView(room, content, 'government').trustAward).toBeNull()
  })

  it('names where the two Public Trust tokens went', () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'trust')

    const award = dashboardView(room, content).trustAward!
    expect(award).not.toBeNull()
    expect(award).toEqual(room.lastRound!.trustAwarded)
    // Every phone gets it too: the Community's brief says to make them earn it
    // in front of you, which is empty if nobody can see where it landed.
    for (const role of ROLES) expect(phoneView(room, content, role).trustAward).toEqual(award)
  })
})

describe('the facilitator can stop the clock', () => {
  /** A room sitting in THE CHOICE, which is the tightest phase to be stopped in. */
  const atChoice = () => {
    const room = seated()
    startPlaying(room)
    advanceTo(room, 'choice')
    return room
  }

  it('holds the phase open however long the deadline has passed', () => {
    const room = atChoice()
    const deadline = room.phaseEndsAt!

    clock = deadline - 9_000
    run(room, { t: 'pause' })
    expect(dashboardView(room, content).paused).toBe(true)
    expect(phoneView(room, content, 'government').paused).toBe(true)

    // Ten minutes of real time go by. The round is exactly where it was.
    clock = deadline + 600_000
    tick(room, content, clock)
    expect(room.phase).toBe('choice')
    expect(room.lastRound).toBeNull()
  })

  it('gives back exactly the seconds that were left', () => {
    const room = atChoice()
    const deadline = room.phaseEndsAt!

    clock = deadline - 9_000
    run(room, { t: 'pause' })
    clock += 300_000
    run(room, { t: 'resume' })

    expect(room.pausedAt).toBeNull()
    expect(room.phaseEndsAt! - clock).toBe(9_000)

    // And it expires on its own once those nine seconds are actually spent.
    clock += 9_001
    tick(room, content, clock)
    expect(room.phase).toBe('reckoning')
  })

  it('freezes the countdown every surface is reading', () => {
    const room = atChoice()
    clock = room.phaseEndsAt! - 12_000
    run(room, { t: 'pause' })

    const dash = dashboardView(room, content)
    const phone = phoneView(room, content, 'government')
    // Both surfaces subtract from `pausedAt` rather than from their own clock,
    // so the number they show is identical and does not move.
    expect(dash.pausedAt).toBe(clock)
    expect(phone.pausedAt).toBe(clock)
    expect(dash.phaseEndsAt! - dash.pausedAt!).toBe(12_000)
  })

  it('stops the table from resolving the round behind the facilitator', () => {
    const room = atChoice()
    run(room, { t: 'pause' })

    for (const role of ROLES) {
      const opt = phoneView(room, content, role).options.find((o) => o.available)!
      run(room, { t: 'choose', role, optionId: opt.id })
      run(room, { t: 'lock', role })
    }

    // All four "locked" and nothing happened, which is the point: a pause that
    // could be played through would resolve the round mid-sentence.
    expect(room.phase).toBe('choice')
    expect(ROLES.every((r) => !room.players[r].locked)).toBe(true)
    expect(room.lastRound).toBeNull()

    run(room, { t: 'resume' })
    for (const role of ROLES) lockIn(room, role, firstAvailable(room, role))
    expect(room.phase).toBe('reckoning')
  })

  it('still seats a latecomer, which is half the reason to pause', () => {
    const room = atChoice()
    run(room, { t: 'leave', role: 'business' })
    run(room, { t: 'pause' })

    run(room, { t: 'join', role: 'business', name: 'Nadia' })
    expect(room.players.business.name).toBe('Nadia')
    const view = phoneView(room, content, 'business')
    run(room, { t: 'pickGoal', role: 'business', goalId: view.goalChoices![0].id })
    expect(room.players.business.goalId).toBe(view.goalChoices![0].id)
  })

  it('hands a phase stepped through while stopped its full length', () => {
    const room = atChoice()
    run(room, { t: 'pause' })
    // The facilitator talks for two minutes, then steps the room on by hand.
    clock += 120_000
    run(room, { t: 'advance' })
    expect(room.phase).toBe('reckoning')

    run(room, { t: 'resume' })
    expect(room.phaseEndsAt! - clock).toBe(PHASE_MS.reckoning)
  })

  it('is refused twice, and resumed only from a pause', () => {
    const room = atChoice()
    run(room, { t: 'pause' })
    const first = room.pausedAt
    clock += 5_000
    run(room, { t: 'pause' })
    expect(room.pausedAt).toBe(first)

    run(room, { t: 'resume' })
    const deadline = room.phaseEndsAt
    run(room, { t: 'resume' })
    expect(room.phaseEndsAt).toBe(deadline)
  })

  it('reads as running for a room saved before pause existed', () => {
    const room = atChoice()
    // Postgres and localStorage both hand back rooms written by an older build,
    // and an absent field must never be mistaken for a stopped clock.
    delete (room as Partial<Room>).pausedAt
    expect(dashboardView(room, content).paused).toBe(false)

    clock = room.phaseEndsAt! + 1
    tick(room, content, clock)
    expect(room.phase).toBe('reckoning')
  })

  it('belongs to the big screen and to nobody else', () => {
    expect(authorise('dashboard', { t: 'pause' })).toEqual({ t: 'pause' })
    expect(authorise('dashboard', { t: 'resume' })).toEqual({ t: 'resume' })
    // A phone naming the command gets nothing: the pause is the facilitator's.
    expect(authorise('government', { t: 'pause' })).toBeNull()
    expect(authorise('activist', { t: 'resume' })).toBeNull()
  })
})

describe('phase timings match the published session', () => {
  const ROUND_PHASES = ['crisis', 'table', 'choice', 'reckoning', 'trust', 'summary'] as const
  const round = (n: number) => ROUND_PHASES.reduce((ms, p) => ms + phaseMs(p, n), 0)

  it('spends under 24 minutes on six rounds of play', () => {
    // Round 1 runs long and the other five do not, so this is not one number
    // times six. The budget is what matters: the Reveal gave back thirty
    // seconds a round, and the Talk, Round 1's extra room and the Public Trust
    // beat spent it. Forty seconds of headroom is deliberate; this test exists
    // to make the next beat that "only needs ten seconds" argue for itself.
    const play = round(1) + round(2) * 5
    expect(play).toBeLessThanOrEqual(24 * 60 * 1000)
  })

  it('gives Round 1 more room than the rest, and only Round 1', () => {
    expect(round(1)).toBeGreaterThan(round(2))
    expect(round(2)).toBe(round(6))
    // The one place the difference has to show up: a table meeting the lock
    // button for the first time gets half as long again to find it.
    expect(phaseMs('choice', 1)).toBe(60_000)
    expect(phaseMs('choice', 2)).toBe(PHASE_MS.choice)
  })

  it('leaves the flip sequence room inside the Reveal', () => {
    // The Reveal was cut from 75 seconds to 45, which is only safe while the
    // whole sequence, four flips plus the sting plus the coalition hold, still
    // finishes inside it. `test/reckoning.test.ts` owns the arithmetic; this
    // owns the fact that the phase is long enough to contain it.
    expect(PHASE_MS.reckoning).toBeGreaterThanOrEqual(25_000)
  })

  it('fits the whole session inside the 35 minutes on the box', () => {
    const onboarding =
      PHASE_MS.briefing +
      PHASE_MS.practiceTalk +
      PHASE_MS.practiceChoice +
      PHASE_MS.power +
      PHASE_MS.goal
    const total = onboarding + round(1) + round(2) * 5

    // Onboarding is the budget most at risk of creeping, because every step in
    // it is defensible on its own. Five minutes is the whole allowance.
    expect(onboarding).toBeLessThanOrEqual(5 * 60 * 1000)
    // Results and the debrief are facilitator-paced and sit outside the clock,
    // so the timed part has to leave room for them.
    expect(total).toBeLessThanOrEqual(28 * 60 * 1000)
  })
})
