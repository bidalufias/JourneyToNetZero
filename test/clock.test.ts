/**
 * The server-clock estimate.
 *
 * Nothing here is trying to be NTP. It only has to answer one question well
 * enough to run a countdown and a card sequence: how far is this machine's
 * clock from the one that stamped the deadlines? A second of error is
 * invisible; a minute is the difference between a Reckoning and a blank screen.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clockOffset, noteServerTime, resetClock, serverNow } from '../src/net/clock'

describe('the server clock', () => {
  beforeEach(() => {
    resetClock()
    vi.useRealTimers()
  })

  it('is this machine’s clock until told otherwise', () => {
    expect(clockOffset()).toBe(0)
    expect(Math.abs(serverNow() - Date.now())).toBeLessThan(50)
  })

  it('measures a machine running a minute slow', () => {
    // Client says 1_000_000, server says a minute later, 20ms round trip.
    noteServerTime(1_060_010, 1_000_000, 1_000_020)
    expect(clockOffset()).toBeCloseTo(60_000, -1)
  })

  it('splits the round trip rather than blaming either end for it', () => {
    // A 400ms trip: the stamp is taken somewhere inside it, so the midpoint is
    // the guess, and the offset here is zero rather than 200ms either way.
    noteServerTime(1_000_200, 1_000_000, 1_000_400)
    expect(clockOffset()).toBe(0)
  })

  it('prefers the tightest measurement it has', () => {
    noteServerTime(1_003_000, 1_000_000, 1_006_000) // slow: offset reads 0
    noteServerTime(2_000_050, 2_000_000, 2_000_020) // tight: offset reads 40
    expect(clockOffset()).toBe(40)
  })

  it('ignores a round trip too slow to say anything', () => {
    noteServerTime(1_000_000, 1_000_000, 1_030_000)
    expect(clockOffset()).toBe(0)
  })

  it('ignores a stamp that is not a time', () => {
    noteServerTime(Number.NaN, 1_000_000, 1_000_020)
    noteServerTime(0, 1_000_000, 1_000_020)
    expect(clockOffset()).toBe(0)
  })

  it('forgets old samples so a moved clock is followed, not averaged', () => {
    noteServerTime(1_000_010, 1_000_000, 1_000_020) // tight, offset 0
    for (let i = 1; i <= 8; i++) {
      // Later, equally tight, from a clock that has been put right.
      noteServerTime(2_000_000 + i * 1_000 + 5_010, 2_000_000 + i * 1_000, 2_000_000 + i * 1_000 + 20)
    }
    expect(clockOffset()).toBeCloseTo(5_000, -1)
  })
})
