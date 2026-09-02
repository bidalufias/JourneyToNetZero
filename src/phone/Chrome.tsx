/**
 * The phone's chrome: the header, the back affordance, and the menu.
 *
 * Two things live here that the phone had no room for before, and both are
 * answers to the same complaint: the app knew things about you and would not
 * say them.
 *
 * The header carries the one number this seat spends, and under it the three
 * numbers the whole country is judged on. Both used to be shown once and then
 * hidden: card prices were unreadable and the score existed only on a projector
 * some players could not see from where they sat.
 *
 * BACK steps through the round you are already in, read-only. It is not browser
 * history: it cannot change anything, it cannot reach another round, and it can
 * never show you a card you have not been dealt. It exists because the crisis
 * brief scrolled past in twenty-five seconds and there was no way to read it
 * again, and because "LOCKED" would not tell you what you had locked.
 */
import type { PhoneView } from '../game/session'
import { ROLE_CHARACTER, ROLE_LABEL } from '../game/session'
import { STEP_LABEL } from '../game/vocab'
import { RoleGlyph, formatClock } from '../ui/primitives'

/** The screens of one round, in the order they happen. */
export type Screen = 'crisis' | 'table' | 'choice'

export const SCREEN_ORDER: Screen[] = ['crisis', 'table', 'choice']

export const SCREEN_LABEL: Record<Screen, string> = {
  crisis: STEP_LABEL.crisis,
  table: STEP_LABEL.table,
  choice: STEP_LABEL.choice,
}

/**
 * How far back this player may look right now.
 *
 * Only within the live round: from the Reveal onward the phone is handed the
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
  // A stopped clock never nags. The pause banner above the header is already
  // saying what is happening; a flashing red countdown under it would say the
  // opposite.
  const urgent = !view.paused && (remaining ?? 1e9) < 10_000
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
      <Nation view={view} />
    </>
  )
}

/** Short enough for a header, and it names the unit the cost chips use. */
const RESOURCE_CHIP: Record<PhoneView['resource']['kind'], string> = {
  fiscal: 'BUDGET',
  capital: 'MONEY',
  vetoes: 'VETOES',
  spotlights: 'SPOTLIGHTS',
}

function Resource({ view }: { view: PhoneView }) {
  return (
    <span className="phead__res" title={view.resource.label}>
      <span className="phead__res-unit">{RESOURCE_CHIP[view.resource.kind]}</span>
      <span className="phead__res-value">{view.resource.value}</span>
    </span>
  )
}

/**
 * Where the country stands, on the phone, on every screen.
 *
 * These three numbers used to exist only on the projector, so a player sitting
 * where they could not read it had no access to the score they were playing
 * for. Carbon is the one that has to reach zero; the other two are the ones
 * tables actually miss.
 */
function Nation({ view }: { view: PhoneView }) {
  const n = view.nation
  const cells = [
    { label: 'CARBON', value: n.carbon.toFixed(0), met: n.carbon <= n.targets.carbon },
    { label: 'ECONOMY', value: `${n.economy.toFixed(1)}%`, met: n.economy >= n.targets.economy },
    { label: 'QUALITY OF LIFE', value: n.life.toFixed(1), met: n.life >= n.targets.life },
  ]
  return (
    <div className="nation">
      {cells.map((c) => (
        <div key={c.label} className="nation__cell">
          <span className="nation__label">{c.label}</span>
          <span className={`nation__value${c.met ? ' nation__value--met' : ''}`}>{c.value}</span>
        </div>
      ))}
    </div>
  )
}

/** The banner that makes it obvious you are reading history, not playing. */
export function ReviewBar({ screen, onNow }: { screen: Screen; onNow: () => void }) {
  return (
    <div className="review">
      <span className="review__label">EARLIER THIS ROUND · {SCREEN_LABEL[screen]}</span>
      <button className="review__now" onClick={onNow}>
        BACK TO THE GAME
      </button>
    </div>
  )
}
