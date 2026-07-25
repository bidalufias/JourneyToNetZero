/**
 * Supabase connection details.
 *
 * The publishable key is designed to ship inside a browser bundle — it ends up
 * in the compiled JavaScript either way, so committing it here changes nothing
 * about the security posture. Row Level Security on the `rooms` table is what
 * actually protects the data, and the four-letter room code is the credential
 * for a given table. No personal data is stored beyond the display names
 * players type in, and rooms delete themselves after seven days.
 *
 * Both values can be overridden with environment variables at build time.
 */
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://dsibzzchpokqwscjrbif.supabase.co'

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_nukjC98Gm70UgnWj-FaDYA_RGsZHeRs'

/**
 * Phase speed. `?fast=1` on any URL compresses every timer by 10x, which makes
 * a full eight-round game run in about three minutes — useful for walking
 * someone through the whole arc, and it is how the end-to-end test runs.
 */
const speed =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).get('fast') === '1'
    ? 10
    : 1

const secs = (n: number) => Math.max(2, Math.round(n / speed))

/** Seconds each phase runs for. Any player can extend the discussion. */
export const PHASE_SECONDS = {
  situation: secs(20),
  discussion: secs(90),
  locking: secs(50),
  reveal: secs(20),
  resolution: secs(30),
} as const

export const DISCUSSION_EXTENSION = secs(45)
