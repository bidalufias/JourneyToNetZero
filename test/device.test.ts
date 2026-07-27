/**
 * Who is offered the big screen.
 *
 * The rule decides whether the dashboard button appears at all, so the cases
 * that matter are the two ends of the gap it straddles: the largest phone must
 * stay out, and the smallest tablet must get in.
 */
import { describe, expect, it } from 'vitest'
import { canHostSession } from '../src/ui/device'

describe('canHostSession', () => {
  it('offers the big screen to anything with a mouse or trackpad', () => {
    // A laptop is a laptop however narrow the window has been dragged.
    expect(canHostSession(true, 1440)).toBe(true)
    expect(canHostSession(true, 400)).toBe(true)
  })

  it('keeps phones out, in either orientation', () => {
    // The shorter side is the same number held upright or sideways, which is
    // what stops a turned phone talking its way in.
    expect(canHostSession(false, 320)).toBe(false) // iPhone SE
    expect(canHostSession(false, 390)).toBe(false) // iPhone 15
    expect(canHostSession(false, 430)).toBe(false) // iPhone Pro Max, the widest
  })

  it('lets tablets in', () => {
    expect(canHostSession(false, 744)).toBe(true) // iPad mini, the smallest
    expect(canHostSession(false, 768)).toBe(true) // iPad
    expect(canHostSession(false, 1024)).toBe(true) // iPad Pro
  })

  it('puts the boundary between the two, not on a real device', () => {
    expect(canHostSession(false, 599)).toBe(false)
    expect(canHostSession(false, 600)).toBe(true)
  })
})
