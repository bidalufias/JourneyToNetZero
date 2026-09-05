/**
 * The Reckoning's clock.
 *
 * These four cards are the payoff of the whole round, and until this was fixed
 * they were drawn entirely from `phaseEndsAt - Date.now()`, a deadline stamped
 * by the edge function, minus whatever the machine driving the projector
 * believed the time to be. Those are two clocks, and nothing makes them agree.
 * A screen a minute slow put every card a minute further away than it was and
 * the phase came and went with nothing on it.
 *
 * So the arithmetic is pinned here: what is due when, which readings of the
 * deadline are believable, and, in the case that broke, that a wrong clock costs
 * the room nothing, because the sequence falls back to a stopwatch that cannot
 * be wrong about how long the screen has been up.
 */
import { describe, expect, it } from 'vitest'
import {
  RECKONING_TOTAL_MS,
  STING_START_MS,
  coalitionStartMs,
  deadlineElapsed,
  revealElapsed,
  revealedCount,
} from '../src/dashboard/reckoning-clock'
import { PROMISE_STING_MS, RECKONING_CARD_GAP_MS as GAP, RECKONING_FIRST_CARD_MS as FIRST } from '../src/game/session'

describe('which cards are due', () => {
  it('holds every card back through the LOOK UP countdown', () => {
    // Four seconds of ALL FOUR LOCKED · LOOK UP before the first card, on
    // the projector and on every phone, because the fourth lock used to turn
    // the first card before the player who locked it had looked up.
    expect(FIRST).toBeGreaterThanOrEqual(3_000)
    expect(revealedCount(0)).toBe(0)
    expect(revealedCount(FIRST - 1)).toBe(0)
  })

  it('turns them one at a time, three seconds apart', () => {
    expect(revealedCount(FIRST)).toBe(1)
    expect(revealedCount(FIRST + GAP - 100)).toBe(1)
    expect(revealedCount(FIRST + GAP)).toBe(2)
    expect(revealedCount(FIRST + 2 * GAP)).toBe(3)
    expect(revealedCount(FIRST + 3 * GAP)).toBe(4)
  })

  it('never turns a fifth card', () => {
    expect(revealedCount(60_000)).toBe(4)
    expect(revealedCount(RECKONING_TOTAL_MS * 10)).toBe(4)
  })

  it('shows the round rather than an empty screen when the time makes no sense', () => {
    expect(revealedCount(Number.NaN)).toBe(4)
    expect(revealedCount(-5_000)).toBe(0) // still early, just early
  })
})

describe('reading the deadline', () => {
  const now = 1_000_000

  it('measures the phase from the deadline when both clocks agree', () => {
    // A third of the phase left: two thirds of the way in. Written against
    // RECKONING_TOTAL_MS rather than the number it happens to be, because the
    // phase was retuned once already and this test failed for saying 75.
    const third = RECKONING_TOTAL_MS / 3
    expect(deadlineElapsed(now + third, now)).toBe(RECKONING_TOTAL_MS - third)
  })

  it('treats a missing deadline as a finished sequence', () => {
    expect(deadlineElapsed(null, now)).toBe(RECKONING_TOTAL_MS)
  })

  it('tolerates the small negative a round trip can produce', () => {
    expect(deadlineElapsed(now + RECKONING_TOTAL_MS + 500, now)).toBe(0)
  })

  it('refuses a reading that can only be two clocks disagreeing', () => {
    // The machine's clock is a minute behind the server's: the deadline looks
    // a minute further away than it is.
    expect(deadlineElapsed(now + RECKONING_TOTAL_MS + 60_000, now)).toBeNull()
    // And a minute ahead: the phase looks long finished before it started.
    expect(deadlineElapsed(now - 60_000, now)).toBeNull()
  })
})

describe('the elapsed time the sequence runs on', () => {
  it('uses the local stopwatch when the deadline cannot be believed', () => {
    expect(revealElapsed(4_200, null)).toBe(4_200)
  })

  it('a wrong clock no longer costs the room the cards', () => {
    // The whole bug in one line: a slow projector clock makes the deadline
    // unreadable, and the sequence has to carry on regardless.
    const skewed = deadlineElapsed(1_000_000 + RECKONING_TOTAL_MS + 120_000, 1_000_000)
    expect(skewed).toBeNull()
    expect(revealedCount(revealElapsed(FIRST + 3 * GAP, skewed))).toBe(4)
  })

  it('catches a late dashboard up instead of replaying the round', () => {
    // Opened 40s in: its own stopwatch says 200ms, the deadline knows better.
    expect(revealElapsed(200, 40_000)).toBe(40_000)
  })

  it('lets the stopwatch lead when it is ahead of the deadline', () => {
    expect(revealElapsed(9_600, 9_000)).toBe(9_600)
  })

  it('never runs backwards', () => {
    expect(revealElapsed(-500, null)).toBe(0)
  })
})

describe('the beats after the cards', () => {
  it('holds the sting until the fourth card has landed', () => {
    expect(STING_START_MS).toBeGreaterThan(FIRST + 3 * GAP)
    expect(revealedCount(STING_START_MS)).toBe(4)
  })

  it('waits out the sting before the coalition interrupts', () => {
    expect(coalitionStartMs(true)).toBe(STING_START_MS + PROMISE_STING_MS + 1_000)
    expect(coalitionStartMs(false)).toBe(STING_START_MS + 1_000)
  })

  it('leaves the whole sequence room inside the phase', () => {
    expect(coalitionStartMs(true)).toBeLessThan(RECKONING_TOTAL_MS)
  })
})
