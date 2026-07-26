/**
 * Session-level tests: the room around the engine.
 *
 * These cover the promises the design makes about a live workshop — the
 * session never stalls, a phone can never see the numbers, promises are
 * recorded but never enforced, and Hollow Victory stays sharp.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { loadContent } from '../src/engine/content'
import { ROLES, type Role } from '../src/engine/types'
import {
  apply,
  createRoom,
  dashboardView,
  endgame,
  phoneView,
  tick,
  type Command,
} from '../src/game/room'
import { PHASE_MS, type Room } from '../src/game/session'

const content = loadContent(
  JSON.parse(readFileSync(fileURLToPath(new URL('../content/jtnz-content-pack-v2.json', import.meta.url)), 'utf8')),
)

let clock = 1_700_000_000_000
const run = (room: Room, cmd: Command) => apply(room, cmd, content, clock)

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
    run(room, { t: 'start' })
    expire(room) // briefing -> crisis
    expire(room) // crisis -> table
    expire(room) // table -> choice

    expect(room.phase).toBe('choice')
    run(room, { t: 'choose', role: 'government', optionId: phoneView(room, content, 'government').options[0].id })
    expect(room.players.business.choiceId).toBeNull()

    expire(room) // choice deadline passes

    expect(room.phase).toBe('reckoning')
    expect(room.players.business.choiceId).not.toBeNull()
    expect(room.players.business.autoLocked).toBe(true)
    expect(room.players.government.autoLocked).toBe(false)
  })

  it('resolves the round early once all four lock', () => {
    const room = seated()
    run(room, { t: 'start' })
    expire(room)
    expire(room)
    expire(room)
    expect(room.phase).toBe('choice')

    for (const role of ROLES) {
      const view = phoneView(room, content, role)
      run(room, { t: 'choose', role, optionId: view.options.find((o) => o.available)!.id })
    }
    expect(room.phase).toBe('reckoning')
    expect(room.lastRound).not.toBeNull()
  })
})

describe('the phone can never see the numbers', () => {
  it('sends no effect values with an option card', () => {
    const room = seated()
    run(room, { t: 'start' })
    expire(room)
    expire(room)

    const view = phoneView(room, content, 'government')
    expect(view.options.length).toBeGreaterThan(0)

    // Serialise the entire view and look for the raw effects of every option
    // this role could be shown. If any leaked, a player could read them.
    const wire = JSON.stringify(view)
    const parsed = JSON.parse(wire)
    for (const card of parsed.options) {
      expect(Object.keys(card).sort()).toEqual(
        ['available', 'cost', 'desc', 'disabled', 'disabledNote', 'hint', 'id', 'title'].sort(),
      )
    }

    const scenario = content.scenarios[room.game.path[0]]
    for (const o of scenario.options.government) {
      expect(wire).not.toContain(`"e":${o.e}`)
      expect(wire).not.toContain(`"gr":${o.gr}`)
    }
  })

  it('never sends another player a tip that is not theirs', () => {
    const room = seated()
    run(room, { t: 'start' })
    expire(room) // deals the round's single tip

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
    run(room, { t: 'start' })
    expire(room)

    const view = dashboardView(room, content)
    expect(view.tipDealtThisRound).toBe(true)
    const wire = JSON.stringify(view)
    expect(wire).not.toContain(room.tips[0].text)
  })
})

describe('negotiation', () => {
  it('records a promise and marks it broken without enforcing it', () => {
    const room = seated()
    run(room, { t: 'start' })
    expire(room)
    expire(room)
    expect(room.phase).toBe('table')

    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    const pledged = opts[0]
    const actual = opts[1] ?? opts[0]
    run(room, { t: 'promise', role: 'government', optionId: pledged.id })

    const board = dashboardView(room, content).promises
    expect(board).toHaveLength(1)
    expect(board[0].text).toMatch(/^The Government will /)

    expire(room) // -> choice
    // The player is free to break it. Nothing stops them.
    run(room, { t: 'choose', role: 'government', optionId: actual.id })
    for (const role of ROLES.filter((r) => r !== 'government')) {
      const v = phoneView(room, content, role)
      run(room, { t: 'choose', role, optionId: v.options.find((o) => o.available)!.id })
    }

    const resolved = room.promises[0]
    expect(resolved.outcome).toBe(pledged.id === actual.id ? 'kept' : 'broken')

    // The engine advances the round counter the moment it resolves, so the
    // views must narrate the round just *played* — otherwise the Reckoning
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
    run(room, { t: 'start' })
    expire(room)
    expire(room)
    const opts = phoneView(room, content, 'government').options.filter((o) => o.available)
    run(room, { t: 'promise', role: 'government', optionId: opts[0].id })
    expire(room) // table -> choice
    expire(room) // choice -> reckoning
    expire(room) // reckoning -> summary

    expect(room.phase).toBe('summary')
    const view = dashboardView(room, content)
    expect(view.round).toBe(1)
    expect(view.promises).toHaveLength(1)
  })

  it('executes an accepted offer immediately and permanently', () => {
    const room = seated()
    run(room, { t: 'start' })
    expire(room)
    expire(room)

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
    run(room, { t: 'start' })
    expire(room)
    expire(room)

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
    run(room, { t: 'start' })
    expire(room)
    expire(room)
    run(room, { t: 'veto', role: 'community', target: 'government' })
    // A second veto in the same round is refused.
    run(room, { t: 'veto', role: 'community', target: 'business' })
    expect(phoneView(room, content, 'community').vetoesRemaining).toBe(1)
    expect(room.vetoTarget).toBe('government')

    // Resolve the round: the engine now actually spends it.
    expire(room)
    for (const role of ROLES) {
      const v = phoneView(room, content, role)
      const opt = v.options.find((o) => o.available)
      if (opt) run(room, { t: 'choose', role, optionId: opt.id })
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
})

describe('phase timings match the 30-minute session', () => {
  it('spends 24 minutes on six rounds of play', () => {
    const perRound = PHASE_MS.crisis + PHASE_MS.table + PHASE_MS.choice + PHASE_MS.reckoning
    expect(perRound).toBe(4 * 60 * 1000)
    expect(perRound * 6).toBe(24 * 60 * 1000)
  })
})
