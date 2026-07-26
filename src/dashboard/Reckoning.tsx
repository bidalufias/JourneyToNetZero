/**
 * THE RECKONING — the drama.
 *
 * Cards flip one at a time, three seconds apart, meters travelling between
 * them. Never all four at once: the gap is where the drama lives, and a room
 * that sees four cards land together has nothing to react to.
 *
 * Card 1 at 0s, card 2 at 3s, card 3 at 6s, card 4 at 9s. Each flip is a
 * 400ms rotateY from 88°. The promise-broken sting fires *after* the fourth
 * card, never interrupting the sequence, and holds 2.5 seconds before cutting.
 */
import { useEffect, useState } from 'react'
import type { Role } from '../engine/types'
import type { DashboardView } from '../game/session'
import { ROLE_LABEL } from '../game/session'
import { COALITION_HOLD_MS, PHASE_MS, PROMISE_STING_MS, RECKONING_CARD_GAP_MS, RECKONING_FIRST_CARD_MS } from '../game/session'
import { RoleGlyph } from '../ui/primitives'
import { CoalitionBonus } from './screens'

/** Milliseconds since the Reckoning began, from the server's own deadline. */
function useElapsed(endsAt: number | null, total: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])
  if (endsAt === null) return total
  return Math.max(0, total - (endsAt - now))
}

export function Reckoning({ view }: { view: DashboardView }) {
  const log = view.lastRound!
  const elapsed = useElapsed(view.phaseEndsAt, PHASE_MS.reckoning)

  const revealedCount = Math.max(
    0,
    Math.min(4, Math.floor((elapsed - RECKONING_FIRST_CARD_MS) / RECKONING_CARD_GAP_MS) + 1),
  )
  const allRevealed = revealedCount >= 4
  // The four flips, then the sting if a promise broke, then the coalition —
  // each beat waits for the one before it to clear.
  const stingStart = RECKONING_FIRST_CARD_MS + 4 * RECKONING_CARD_GAP_MS
  const broken = view.promises.filter((p) => p.round === log.round && p.outcome === 'broken')
  const showSting =
    broken.length > 0 && elapsed >= stingStart && elapsed < stingStart + PROMISE_STING_MS

  // Fires only once the meters have finished travelling, so the room reads it
  // as consequence rather than decoration.
  const coalitionStart =
    stingStart + (broken.length ? PROMISE_STING_MS : 0) + 1000
  const showCoalition =
    Boolean(log.coalitionBonus) &&
    log.alignedCount >= 3 &&
    elapsed >= coalitionStart &&
    elapsed < coalitionStart + COALITION_HOLD_MS

  const promiseFor = (role: Role) =>
    view.promises.find((p) => p.from === role && p.round === log.round && p.kind === 'promise')

  return (
    <div className="reckoning">
      <header className="reckoning__bar">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">THE RECKONING · ROUND {log.round}</span>
        <span className="reckoning__emissions">
          <span className="reckoning__emissions-label">EMISSIONS</span>
          <span className="reckoning__emissions-value">{log.state.emissions.toFixed(0)}</span>
          <span
            className="reckoning__arrow"
            data-dir={log.deltas.e + log.drift < 0 ? 'down' : 'up'}
          >
            {log.deltas.e + log.drift < 0 ? '▼' : '▲'}
          </span>
        </span>
      </header>

      <div className="reckoning__cards">
        {log.reveals.map((reveal, i) => {
          const shown = i < revealedCount
          const promise = promiseFor(reveal.role)
          return (
            <article
              key={reveal.role}
              className={`rcard${shown ? ' rcard--in' : ''}`}
              data-role={reveal.role}
              style={{ animationDelay: '0ms' }}
              aria-hidden={!shown}
            >
              {shown ? (
                <>
                  <div className="rcard__role">
                    <RoleGlyph role={reveal.role} size={18} />
                    <span>{ROLE_LABEL[reveal.role].toUpperCase()}</span>
                  </div>
                  <h2 className="rcard__title">{reveal.title}</h2>
                  <p className="rcard__desc">{reveal.desc}</p>

                  <div className="rcard__foot">
                    {promise ? (
                      <div
                        className={`rcard__promise rcard__promise--${promise.outcome}`}
                      >
                        {promise.outcome === 'kept' ? 'KEPT THE PROMISE ✓' : 'BROKE THE PROMISE ✕'}
                      </div>
                    ) : reveal.spotlit ? (
                      <div className="rcard__promise rcard__promise--broken">SPOTLIT ✕</div>
                    ) : reveal.selfOrganiseSupported ? (
                      <div className="rcard__promise rcard__promise--kept">BACKED · DOUBLED</div>
                    ) : reveal.partnerUnfunded ? (
                      <div className="rcard__promise rcard__promise--broken">NOBODY CO-FUNDED IT</div>
                    ) : (
                      <div className="rcard__promise rcard__promise--none">ON THE RECORD</div>
                    )}
                    <p className="rcard__headline">“{reveal.headline}”</p>
                  </div>
                </>
              ) : null}
            </article>
          )
        })}
      </div>

      {/* The meters travel in the gaps, staggered a second apart so three bars
          never move as one block. */}
      <div className="reckoning__meters" data-live={allRevealed}>
        <TravelBar
          label="EMISSIONS"
          ink="var(--jtnz-meter-emissions)"
          fill={Math.max(0, Math.min(1, (300 - log.state.emissions) / 100))}
          delay={0}
          active={revealedCount >= 1}
        />
        <TravelBar
          label="GREEN ECONOMY"
          ink="var(--jtnz-meter-green)"
          fill={log.state.greenShare / 100}
          delay={1000}
          active={revealedCount >= 2}
        />
        <TravelBar
          label="HAPPINESS"
          ink="var(--jtnz-meter-happiness)"
          fill={Math.max(0, Math.min(1, (log.state.happiness - 6) / 1))}
          delay={2000}
          active={revealedCount >= 3}
        />
      </div>

      {showSting ? (
        <div className="promise-sting" role="alert">
          <div className="promise-sting__text">PROMISE BROKEN</div>
          <div className="promise-sting__who">
            {broken.map((b) => ROLE_LABEL[b.from].toUpperCase()).join(' · ')}
          </div>
        </div>
      ) : null}

      {showCoalition ? <CoalitionBonus view={view} /> : null}
    </div>
  )
}

function TravelBar({
  label,
  ink,
  fill,
  delay,
  active,
}: {
  label: string
  ink: string
  fill: number
  delay: number
  active: boolean
}) {
  return (
    <div className="travel">
      <span className="travel__label">{label}</span>
      <div className="travel__track">
        <span
          className="travel__fill"
          style={{
            background: ink,
            width: active ? `${Math.max(0, Math.min(1, fill)) * 100}%` : '0%',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}
