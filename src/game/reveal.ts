/**
 * What a Reveal card says under its title, on every surface.
 *
 * A card used to carry one line: the promise verdict if there was one, and
 * otherwise whatever the engine did to the card. So a Community card that
 * had broken a promise and also been helped by the Government showed only
 * the broken promise, on the projector, to the whole room, while the phone
 * in that player's hand said the card had made the biggest cut of the round.
 * Two facts, two lines, the same two lines wherever the card is drawn.
 */
import type { RoundReveal } from '../engine/types'
import type { Promise_, RevealBadge } from './session'

/** The verdict on the one sentence this seat put on the board, if any. */
export function promiseBadge(promise: Promise_ | undefined): RevealBadge | null {
  if (!promise || promise.outcome === 'unresolved') return null
  if (promise.outcome === 'void') return { text: 'THE DEAL WAS NOT TAKEN', tone: 'void' }
  if (promise.outcome === 'kept') {
    return { text: promise.kind === 'deal' ? 'BOTH KEPT THE DEAL ✓' : 'KEPT THE PROMISE ✓', tone: 'kept' }
  }
  return { text: promise.kind === 'deal' ? 'BROKE THE DEAL ✕' : 'BROKE THE PROMISE ✕', tone: 'broken' }
}

/** What another seat did to this card: caught it, helped it, or left it unpaid. */
export function effectBadge(reveal: RoundReveal): RevealBadge | null {
  if (reveal.spotlit) return { text: 'THE SPOTLIGHT CAUGHT THEM ✕', tone: 'broken' }
  if (reveal.selfOrganiseSupported) return { text: 'HELPED · WORKED TWICE AS WELL', tone: 'kept' }
  if (reveal.partnerUnfunded) return { text: 'NOBODY PAID HALF', tone: 'broken' }
  return null
}

/** Both lines, promise first, never more than two. */
export function revealBadges(reveal: RoundReveal, promise: Promise_ | undefined): RevealBadge[] {
  return [promiseBadge(promise), effectBadge(reveal)].filter((b): b is RevealBadge => b !== null)
}
