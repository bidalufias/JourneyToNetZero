/**
 * The URLs the three surfaces point at each other with.
 *
 * Built from `window.location.origin` rather than configured, because the same
 * build is opened from a laptop on a projector, a Netlify domain, and a Vite
 * dev server on a hotel LAN — and the QR code on the wall has to be whichever
 * of those the facilitator actually typed.
 */

/** Where a scanned QR code lands: the join page, code already filled in. */
export function joinUrl(code: string): string {
  return `${window.location.origin}/play?room=${code}`
}

/** The facilitator's script, as its own window. */
export function facilitatorUrl(code: string): string {
  return `${window.location.origin}/facilitator${code ? `?room=${code}` : ''}`
}

/** The written player guide — a static page, not part of the app. */
export const HOW_TO_PLAY_URL = '/how-to-play.html'
