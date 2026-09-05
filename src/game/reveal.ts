/**
 * What a Reveal card says under its title, on every surface.
 *
 * A card used to carry one line: the promise verdict if there was one, and
 * otherwise whatever the engine did to the card. So a Community card that
 * had broken a promise and also been helped by the Government showed only
 * the broken promise, on the projector, to the whole room, while the phone
 * in that player's hand said the card had made the biggest cut of the round.
 * Two facts, two lines, the same two lines wherever the card is drawn.
 *
 * The help line names the helper. It used to say HELPED and nothing else,
 * and a family asked twice, out loud, who had helped, and decided somebody
 * must have sent money. Nobody had. A card had.
 */
import { SUPPORTIVE, type Role, type RoundLog, type RoundReveal } from '../engine/types'
import { BOARD_NAME } from './copy'
import type { OptionKind, Promise_, RevealBadge } from './session'

/**
 * Who doubled a community card: the Government's card, the Business's card,
 * or the standing Mutual Aid network from an earlier round. The engine tests
 * the Government first and so does this, so the name matches the multiplier.
 */
export function helperOf(log: Pick<RoundLog, 'reveals'>, reveal: RoundReveal): Role | 'network' | null {
  if (!reveal.selfOrganiseSupported) return null
  const gov = log.reveals.find((r) => r.role === 'government')
  const biz = log.reveals.find((r) => r.role === 'business')
  if (gov && SUPPORTIVE.has(gov.arch)) return 'government'
  if (biz && SUPPORTIVE.has(biz.arch)) return 'business'
  return 'network'
}

/** The card the helper played, so the phone can quote it. */
export function helperCard(log: Pick<RoundLog, 'reveals'>, reveal: RoundReveal): RoundReveal | null {
  const who = helperOf(log, reveal)
  if (!who || who === 'network') return null
  return log.reveals.find((r) => r.role === who) ?? null
}

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
export function effectBadge(reveal: RoundReveal, log: Pick<RoundLog, 'reveals'>): RevealBadge | null {
  if (reveal.spotlit) return { text: 'THE SPOTLIGHT CAUGHT THEM ✕', tone: 'broken' }
  const helper = helperOf(log, reveal)
  if (helper === 'network') return { text: 'MUTUAL AID HELPED · WORKED TWICE AS WELL', tone: 'kept' }
  if (helper) return { text: `${BOARD_NAME[helper].toUpperCase()}’S CARD HELPED · TWICE AS WELL`, tone: 'kept' }
  if (reveal.partnerUnfunded) return { text: 'NOBODY PAID HALF', tone: 'broken' }
  return null
}

/** Both lines, promise first, never more than two. */
export function revealBadges(
  reveal: RoundReveal,
  promise: Promise_ | undefined,
  log: Pick<RoundLog, 'reveals'>,
): RevealBadge[] {
  return [promiseBadge(promise), effectBadge(reveal, log)].filter((b): b is RevealBadge => b !== null)
}

/** The chip a Reveal card wears for its kind, or nothing for a plain card. */
export const KIND_CHIP: Record<OptionKind, string | null> = {
  good: null,
  dirty: 'DIRTY CARD',
  protest: 'PROTEST CARD',
  partnership: 'PARTNERSHIP',
}
