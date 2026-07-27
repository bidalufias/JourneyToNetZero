/**
 * Is this surface one a session could be run from?
 *
 * The big screen is a projector or a TV driven by a laptop, and occasionally an
 * iPad propped up in a small room. It is never somebody's phone: a dashboard on
 * a 390px screen is unreadable from the far side of a table, and offering it
 * there puts the one control that ends the session in the hand of a player.
 *
 * Two signals, because neither is enough alone.
 *
 * A fine pointer means a mouse or a trackpad, so a laptop says yes however
 * small its window has been dragged. That also, correctly, catches an iPad with
 * a keyboard case attached.
 *
 * Everything else is a touch screen, and there the *shorter* side of the screen
 * separates a phone from a tablet. It is the shorter side rather than the width
 * because it is the same number in both orientations, so turning a phone
 * sideways cannot talk the button into appearing. The largest phones are around
 * 430pt across; the smallest iPad is 744pt. 600 sits in the gap with room on
 * both sides.
 */

/** The shorter screen side, in CSS px, at or above which a touch device is a tablet. */
export const TABLET_MIN_SIDE = 600

/**
 * The decision, with the environment passed in so it is testable without a DOM.
 *
 * @param finePointer   the device has a mouse or trackpad
 * @param shortestSide  the shorter of the screen's two sides, in CSS px
 */
export function canHostSession(finePointer: boolean, shortestSide: number): boolean {
  return finePointer || shortestSide >= TABLET_MIN_SIDE
}

/** Reads the two signals off the live window. */
export function measureDevice(): { finePointer: boolean; shortestSide: number } {
  const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false
  // `screen` rather than `innerWidth`: a resized browser window is still a
  // laptop, and the screen's dimensions do not move when it is dragged.
  const w = window.screen?.width ?? window.innerWidth
  const h = window.screen?.height ?? window.innerHeight
  return { finePointer, shortestSide: Math.min(w, h) }
}
