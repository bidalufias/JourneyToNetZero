/**
 * The server's clock, as seen from this machine.
 *
 * Every deadline in the game — the countdown, the Reckoning's card flips, the
 * held clock — is a timestamp the server stamped with *its* `Date.now()`. The
 * browser then subtracts *its own* `Date.now()` from it. Those are two
 * different clocks, and nothing in the room forces them to agree: a projector
 * laptop whose clock is a minute slow makes every deadline look a minute
 * further away than it is, which is enough to keep the Reckoning's cards from
 * ever being due.
 *
 * So the transport tells this module what time the server said it was, and
 * everything that compares against a deadline reads `serverNow()` instead of
 * `Date.now()`. With no measurement the offset is zero and behaviour is
 * exactly what it was.
 */

/** Round trips slower than this measure the network, not the clock. */
const MAX_USEFUL_RTT_MS = 10_000

/** Enough history to ride out one slow request without forgetting the good ones. */
const KEEP = 8

interface Sample {
  /** serverNow − clientNow, in milliseconds. */
  offset: number
  /** How wide the window was, and so how wrong this sample can be. */
  rtt: number
}

let samples: Sample[] = []
let offset = 0

/** Now, on the server's clock, to the best of this machine's knowledge. */
export function serverNow(): number {
  return Date.now() + offset
}

/** How far this machine's clock is behind (negative: ahead of) the server's. */
export function clockOffset(): number {
  return offset
}

/**
 * Record what the server said the time was, and when we asked.
 *
 * The stamp happened somewhere inside the round trip, so the midpoint of the
 * request is the best guess at when it was taken — and the tightest round trip
 * is the one whose midpoint is least wrong, which is why the estimate is the
 * fastest recent sample rather than an average of all of them.
 */
export function noteServerTime(serverMs: number, sentAt: number, receivedAt: number): void {
  const rtt = receivedAt - sentAt
  if (!Number.isFinite(serverMs) || serverMs <= 0) return
  if (rtt < 0 || rtt > MAX_USEFUL_RTT_MS) return

  samples.push({ offset: serverMs - (sentAt + rtt / 2), rtt })
  if (samples.length > KEEP) samples.shift()
  offset = samples.reduce((best, s) => (s.rtt < best.rtt ? s : best)).offset
}

/** Testing seam. Nothing in the app has any business forgetting the clock. */
export function resetClock(): void {
  samples = []
  offset = 0
}
