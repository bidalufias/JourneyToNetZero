/**
 * The URLs the three surfaces point at each other with.
 *
 * Built from `window.location.origin` rather than configured, because the same
 * build is opened from a laptop on a projector, a Netlify domain, and a Vite
 * dev server on a hotel LAN, and the QR code on the wall has to be whichever
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

/** The written player guide: a static page, not part of the app. */
export const HOW_TO_PLAY_URL = '/how-to-play.html'

/**
 * The guide, carrying the room it was opened from.
 *
 * A player who scanned a code and chose to read first has to be able to get
 * back to their seat afterwards, and the guide is a static page with no idea
 * which session is running. The code rides along in the query string, and the
 * page uses it to show a way back in.
 */
export function howToPlayUrl(code: string): string {
  return code ? `${HOW_TO_PLAY_URL}?room=${code}` : HOW_TO_PLAY_URL
}

/**
 * Back to the join page from the guide, past the read-first choice.
 *
 * `ready` is what stops the choice being asked twice: somebody who has just
 * read the guide has already answered it.
 */
export function joinAfterReadingUrl(code: string): string {
  return `/play?room=${code}&ready=1`
}
