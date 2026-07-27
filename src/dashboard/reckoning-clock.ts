/**
 * When each beat of the Reckoning is due.
 *
 * Pulled out of the component because the whole screen hangs off these
 * numbers: get them wrong and the dashboard shows the room four blank slots
 * for seventy-five seconds. They are pure functions so the arithmetic can be
 * tested against a clock that disagrees with the server's, which is the case
 * that actually broke.
 */
import {
  PHASE_MS,
  PROMISE_STING_MS,
  RECKONING_CARD_GAP_MS,
  RECKONING_FIRST_CARD_MS,
} from '../game/session'

export const RECKONING_TOTAL_MS = PHASE_MS.reckoning

/** The sting waits for the fourth card to land; the coalition waits for the sting. */
export const STING_START_MS = RECKONING_FIRST_CARD_MS + 4 * RECKONING_CARD_GAP_MS

/** The meters need a second to finish travelling before the bonus interrupts. */
export const COALITION_SETTLE_MS = 1000

export function coalitionStartMs(anyPromiseBroken: boolean): number {
  return STING_START_MS + (anyPromiseBroken ? PROMISE_STING_MS : 0) + COALITION_SETTLE_MS
}

/**
 * How many of the four cards are face-up at `elapsedMs`.
 *
 * A time we cannot make sense of shows all four rather than none: a room
 * looking at the whole round at once has lost the drama, but a room looking at
 * an empty screen thinks the game has crashed.
 */
export function revealedCount(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs)) return 4
  const due = Math.floor((elapsedMs - RECKONING_FIRST_CARD_MS) / RECKONING_CARD_GAP_MS) + 1
  return Math.max(0, Math.min(4, due))
}

/**
 * Two clocks disagreeing by more than this are not merely out of step over the
 * network. One of them is wrong, and it is not the server's.
 */
const SKEW_SLACK_MS = 2_000

/**
 * How far into the Reckoning the server's deadline says we are, or null when
 * that subtraction cannot be believed.
 *
 * `endsAt` is stamped on the server. `now` should be `serverNow()`, the same
 * clock, as best this machine can estimate it. When the two ends of the
 * subtraction genuinely come from the same clock the answer lands inside the
 * phase; when it lands outside, what is being measured is the gap between two
 * clocks rather than the progress of the sequence, and the caller is better
 * off with its own stopwatch.
 */
export function deadlineElapsed(
  endsAt: number | null,
  now: number,
  total: number = RECKONING_TOTAL_MS,
): number | null {
  // No deadline means nothing is going to advance; show the round.
  if (endsAt === null) return total
  const elapsed = total - (endsAt - now)
  if (!Number.isFinite(elapsed)) return null
  if (elapsed < -SKEW_SLACK_MS || elapsed > total + SKEW_SLACK_MS) return null
  return Math.max(0, Math.min(total, elapsed))
}

/**
 * The elapsed time the sequence actually runs on.
 *
 * `local` is this client's own stopwatch, started when it first saw the
 * Reckoning. Immune to a wrong clock, but it starts at zero, so a dashboard
 * that reloads halfway through would replay the whole round. The deadline
 * knows how far in we really are, when it can be trusted. Taking the later of
 * the two gets both: the stopwatch drives the sequence, and a client that
 * arrives late catches up instead of starting over.
 */
export function revealElapsed(local: number, fromDeadline: number | null): number {
  if (!Number.isFinite(local)) return fromDeadline ?? RECKONING_TOTAL_MS
  if (fromDeadline === null) return Math.max(0, local)
  return Math.max(0, local, fromDeadline)
}
