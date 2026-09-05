/**
 * THE REVEAL: the drama.
 *
 * Cards flip one at a time, three seconds apart, meters travelling between
 * them. Never all four at once: the gap is where the drama lives, and a room
 * that sees four cards land together has nothing to react to.
 *
 * Card 1 at 0s, card 2 at 3s, card 3 at 6s, card 4 at 9s. Each flip is a
 * 400ms rotateY from 88°. The promise-broken sting fires *after* the fourth
 * card, never interrupting the sequence, and holds 2.5 seconds before cutting.
 *
 * A card that has not flipped yet is still a card: face-down, its role on it,
 * holding its quarter of the screen. The gap between flips is meant to be a
 * pause, not a hole, and the four slots have to look like a hand waiting to be
 * turned over rather than a dashboard that has failed to draw.
 */
import { useEffect, useRef, useState } from 'react'
import type { Role } from '../engine/types'
import type { DashboardView } from '../game/session'
import { ROLE_LABEL } from '../game/session'
import { LABEL, STEP_LABEL } from '../game/vocab'
import { COALITION_HOLD_MS, PHASE_MS, PROMISE_STING_MS, RECKONING_FIRST_CARD_MS } from '../game/session'
import { revealBadges } from '../game/reveal'
import { serverNow } from '../net/clock'
import { RoleGlyph } from '../ui/primitives'
import { CoalitionBonus } from './screens'
import {
  STING_START_MS,
  coalitionStartMs,
  deadlineElapsed,
  revealElapsed,
  revealedCount as cardsDue,
} from './reckoning-clock'

/**
 * Milliseconds since the Reveal began.
 *
 * Two sources, because neither is enough on its own. The server's deadline
 * knows how far in the room really is, but reading it means subtracting this
 * machine's clock from the server's, and a projector laptop that is a minute
 * slow makes the first card look like it is a minute away from being due.
 * That is a blank screen for the whole phase. So the sequence runs on a local
 * stopwatch, which cannot be wrong about how long this screen has been up, and
 * defers to the deadline only when the deadline says we are further in than
 * that, which is exactly the case the stopwatch gets wrong, a dashboard
 * opened or reloaded halfway through the round.
 *
 * A pause holds the sequence where it is. Cards already flipped stay flipped,
 * the ones still to come wait. Freezing this is what lets a facilitator stop on
 * the third card and talk about it, which is the single most useful place in
 * the session to be able to stop.
 */
function useElapsed(endsAt: number | null, pausedAt: number | null, total: number): number {
  // `performance.now()` rather than `Date.now()`: it only ever moves forward,
  // at one second per second, whatever the machine believes the time is.
  const [start] = useState(() => performance.now())
  const heldSince = useRef<number | null>(null)
  const spentHeld = useRef(0)
  const [, setBeat] = useState(0)

  // Held time is taken off the stopwatch rather than the stopwatch being
  // stopped, which keeps the one source of truth monotonic. Both branches are
  // no-ops the second time through, so a double render costs nothing.
  const paused = pausedAt !== null
  if (paused && heldSince.current === null) heldSince.current = performance.now()
  if (!paused && heldSince.current !== null) {
    spentHeld.current += performance.now() - heldSince.current
    heldSince.current = null
  }

  useEffect(() => {
    if (paused) return
    setBeat((b) => b + 1)
    const id = setInterval(() => setBeat((b) => b + 1), 100)
    return () => clearInterval(id)
  }, [paused])

  const local = (heldSince.current ?? performance.now()) - start - spentHeld.current
  return revealElapsed(local, deadlineElapsed(endsAt, pausedAt ?? serverNow(), total))
}

export function Reckoning({ view }: { view: DashboardView }) {
  const log = view.lastRound!
  // Measured against this phase's own length. The practice Reveal is shorter
  // than a round's, and reading its deadline against the round's length said
  // the sequence was already twenty seconds in, so all four practice cards
  // turned at once the moment the screen appeared.
  const total = view.phase === 'practiceReveal' ? PHASE_MS.practiceReveal : PHASE_MS.reckoning
  const elapsed = useElapsed(view.phaseEndsAt, view.pausedAt, total)

  const revealedCount = cardsDue(elapsed)
  const allRevealed = revealedCount >= 4
  // The four flips, then the sting if a promise broke, then the coalition.
  // each beat waits for the one before it to clear.
  const broken = view.promises.filter((p) => p.round === log.round && p.outcome === 'broken')
  const showSting =
    broken.length > 0 && elapsed >= STING_START_MS && elapsed < STING_START_MS + PROMISE_STING_MS

  // Fires only once the meters have finished travelling, so the room reads it
  // as consequence rather than decoration.
  const coalitionStart = coalitionStartMs(broken.length > 0)
  const showCoalition =
    Boolean(log.coalitionBonus) &&
    log.alignedCount >= 3 &&
    elapsed >= coalitionStart &&
    elapsed < coalitionStart + COALITION_HOLD_MS

  /** The one sentence this seat put on the board, whatever shape it took. */
  const promiseFor = (role: Role) =>
    view.promises.find(
      (p) =>
        p.from === role &&
        p.round === log.round &&
        (p.kind === 'promise' || p.kind === 'deal') &&
        p.outcome !== 'unresolved',
    )

  return (
    <div className="reckoning">
      <header className="reckoning__bar">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">
          {view.round > 0 ? `${LABEL.reveal} · ROUND ${log.round}` : STEP_LABEL.practiceReveal}
        </span>
        <span className="reckoning__emissions">
          <span className="reckoning__emissions-label">CARBON</span>
          <span className="reckoning__emissions-value">{log.state.emissions.toFixed(0)}</span>
          <span
            className="reckoning__arrow"
            data-dir={log.deltas.e + log.drift < 0 ? 'down' : 'up'}
          >
            {log.deltas.e + log.drift < 0 ? '▼' : '▲'}
          </span>
        </span>
      </header>

      {/* Four seconds of ALL FOUR LOCKED · LOOK UP before the first card,
          counted down, because the fourth lock used to turn the first card
          before the player who locked it had lifted their eyes. */}
      {revealedCount === 0 ? (
        <div className="reckoning__cue" role="status">
          <span className="reckoning__cue-label">ALL FOUR LOCKED</span>
          <span className="reckoning__cue-big">LOOK UP</span>
          <span className="reckoning__cue-count">
            {Math.max(1, Math.ceil((RECKONING_FIRST_CARD_MS - elapsed) / 1000))}
          </span>
        </div>
      ) : null}

      <div className="reckoning__cards">
        {log.reveals.map((reveal, i) => {
          const shown = i < revealedCount
          const promise = promiseFor(reveal.role)
          const badges = revealBadges(reveal, promise)
          return (
            <article
              key={reveal.role}
              className={`rcard${shown ? ' rcard--in' : ' rcard--back'}`}
              data-role={reveal.role}
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
                    {/* Both lines, promise first: a card that broke a promise
                        and was also helped says both, because the phone in
                        that player's hand says both, and the room reads the
                        projector. A deal nobody took is neither kept nor
                        broken, and saying so is what makes offering one safe. */}
                    {badges.map((b) => (
                      <div key={b.text} className={`rcard__promise rcard__promise--${b.tone}`}>
                        {b.text}
                      </div>
                    ))}
                    {/* The practice cards carry no headline. An empty pair of
                        quotes is not a headline either. */}
                    {reveal.headline ? <p className="rcard__headline">“{reveal.headline}”</p> : null}
                  </div>
                </>
              ) : (
                // Face-down. The role is on the back because it was never a
                // secret, because the four seats always reveal in the same order, and
                // naming it is what makes the room read a card about to turn
                // rather than a screen that has gone out.
                <>
                  <div className="rcard__role">
                    <RoleGlyph role={reveal.role} size={18} />
                    <span>{ROLE_LABEL[reveal.role].toUpperCase()}</span>
                  </div>
                  <div className="rcard__back-mark" aria-hidden="true" />
                </>
              )}
            </article>
          )
        })}
      </div>

      {/* The meters travel in the gaps, staggered a second apart so three bars
          never move as one block. */}
      <div className="reckoning__meters" data-live={allRevealed}>
        <TravelBar
          label="CARBON"
          ink="var(--jtnz-meter-emissions)"
          fill={Math.max(0, Math.min(1, (100 - log.state.emissions) / 100))}
          delay={0}
          active={revealedCount >= 1}
        />
        <TravelBar
          label="CLEAN ECONOMY"
          ink="var(--jtnz-meter-green)"
          fill={log.state.greenShare / 100}
          delay={1000}
          active={revealedCount >= 2}
        />
        <TravelBar
          label="QUALITY OF LIFE"
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
