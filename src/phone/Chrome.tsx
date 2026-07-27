/**
 * The phone's chrome: the header, the back affordance, and the menu.
 *
 * Two things live here that the phone had no room for before, and both are
 * answers to the same complaint — the app knew things about you and would not
 * say them.
 *
 * The header now carries the one number the onboarding screen tells you to
 * track. It said "it is the only number you have to track" and then showed it
 * exactly once, which made every card price unreadable and every transfer a
 * guess.
 *
 * BACK steps through the round you are already in, read-only. It is not browser
 * history: it cannot change anything, it cannot reach another round, and it can
 * never show you a card you have not been dealt. It exists because the crisis
 * brief scrolled past in twenty-five seconds and there was no way to read it
 * again, and because "LOCKED IN" would not tell you what you had locked in.
 */
import type { PhoneView } from '../game/session'
import { ROLE_CHARACTER, ROLE_LABEL } from '../game/session'
import { RoleGlyph, formatClock } from '../ui/primitives'

/** The screens of one round, in the order they happen. */
export type Screen = 'crisis' | 'table' | 'choice'

export const SCREEN_ORDER: Screen[] = ['crisis', 'table', 'choice']

export const SCREEN_LABEL: Record<Screen, string> = {
  crisis: 'THE CRISIS',
  table: 'THE TABLE',
  choice: 'THE CHOICE',
}

/**
 * How far back this player may look right now.
 *
 * Only within the live round: from the Reckoning onward the phone is handed the
 * *next* round's scenario, so letting the history reach that far would show
 * somebody a crisis that has not broken yet.
 */
export function reviewableUpTo(view: PhoneView): number {
  if (view.phase === 'crisis') return 0
  if (view.phase === 'table') return 1
  if (view.phase === 'choice') return 2
  return -1
}

export function PhoneHeader({
  view,
  remaining,
  onBack,
  onMenu,
}: {
  view: PhoneView
  remaining: number | null
  onBack: (() => void) | null
  onMenu: () => void
}) {
  const character = ROLE_CHARACTER[view.role]
  const clock = formatClock(remaining)
  const urgent = (remaining ?? 1e9) < 10_000
  const pct = view.phaseEndsAt && remaining !== null ? Math.max(0, Math.min(100, (remaining / 90_000) * 100)) : 0

  return (
    <>
      <header className="phead">
        {onBack ? (
          <button className="phead__btn" onClick={onBack} aria-label="Look back at this round">
            ‹
          </button>
        ) : (
          <RoleGlyph role={view.role} size={18} />
        )}
        <div className="phead__org">
          <div>{character.org.toUpperCase()}</div>
          <div className="phead__title">
            {ROLE_LABEL[view.role]} · Round {view.round}
          </div>
        </div>
        <Resource view={view} />
        {clock ? <span className={`phead__clock${urgent ? ' phead__clock--urgent' : ''}`}>{clock}</span> : null}
        <button className="phead__btn" onClick={onMenu} aria-label="How to play, and leave the game">
          ⋯
        </button>
      </header>
      <div className="phead__bar">
        <span className="phead__bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </>
  )
}

/** Short enough for a header, and it names the unit the cost chips use. */
const RESOURCE_CHIP: Record<PhoneView['resource']['kind'], string> = {
  fiscal: 'FP',
  capital: 'C',
  'trust-awards': 'MANDATE',
  spotlights: 'SPOTLIGHT',
}

function Resource({ view }: { view: PhoneView }) {
  return (
    <span className="phead__res" title={view.resource.label}>
      <span className="phead__res-unit">{RESOURCE_CHIP[view.resource.kind]}</span>
      <span className="phead__res-value">{view.resource.value}</span>
    </span>
  )
}

/** The banner that makes it obvious you are reading history, not playing. */
export function ReviewBar({ screen, onNow }: { screen: Screen; onNow: () => void }) {
  return (
    <div className="review">
      <span className="review__label">LOOKING BACK · {SCREEN_LABEL[screen]}</span>
      <button className="review__now" onClick={onNow}>
        BACK TO NOW
      </button>
    </div>
  )
}
