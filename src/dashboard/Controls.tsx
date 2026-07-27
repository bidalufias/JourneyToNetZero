/**
 * The facilitator's two buttons, on every screen of the broadcast.
 *
 * The dashboard is a broadcast and must never look like a control room, which
 * is why, from the first crisis onward, it used to carry nothing at all and the
 * whole session was driven by keys nobody in the room had been told about. That
 * holds right up until the moment a facilitator needs to stop: a fire alarm, a
 * latecomer, a question worth answering properly, or a table arguing so well
 * that cutting them off at the countdown would throw the session away.
 *
 * So the buttons are here, on every phase, and they behave like a video
 * player's: idle for a few seconds and they are gone, and the first twitch of
 * the mouse brings them back. Four people at four metres never see them; the
 * one person with a hand on the trackpad always can. The keys still work, and
 * each button prints its own, so using the buttons teaches the shortcut.
 *
 * The two exceptions to the hiding are the lobby, where nothing has started and
 * a visible control is a kindness, and a paused room, where the bar is the way back
 * out of a pause and must never be the thing you have to go hunting for.
 */
import { useEffect, useState } from 'react'
import type { Phase } from '../game/session'

/** What Next does from here, or null where there is nothing after this. */
export function nextStep(phase: Phase): { cmd: 'start' | 'advance'; label: string } | null {
  if (phase === 'lobby') return { cmd: 'start', label: 'START' }
  if (phase === 'ended') return null
  return { cmd: 'advance', label: 'NEXT' }
}

/**
 * Visible on movement, gone a few seconds after it stops.
 *
 * `pointermove` rather than `mousemove` so a trackpad, a mouse and a touch
 * screen all wake it; `keydown` too, because a facilitator driving with the
 * spacebar should still be shown what else is available.
 */
/**
 * Everything the broadcast has already put along the bottom of the screen.
 *
 * Every screen ends in a strip: the ticker on the dashboard, the briefing line
 * on the attract, the briefing and both endings. The playing screens stack
 * the four seats above it. Both are type-scaled, so they are one height on a
 * laptop and another on a projector, and a number guessed at design time put
 * the bar half on the strip and half off it: the one arrangement that reads as
 * broken rather than as floating.
 *
 * The lock row is in here as well as the strip, and it is the one that matters.
 * During THE CHOICE those four cards are the most-watched thing on the screen,
 * they name the seat everybody is waiting on, and a control panel parked on
 * top of the Government's card is worse than no control panel at all.
 *
 * Re-measured when the phase changes, because that is when this furniture is
 * swapped for different furniture, and on resize, because that is when it
 * changes height. Nothing else moves it.
 */
const BOTTOM_FURNITURE = '.dash .ticker, .dash .briefing-strip, .dash .locks'

function useBottomInset(phase: Phase): number {
  const [inset, setInset] = useState(0)
  useEffect(() => {
    const measure = () => {
      let top = window.innerHeight
      for (const el of document.querySelectorAll(BOTTOM_FURNITURE)) {
        const box = el.getBoundingClientRect()
        if (box.height > 0) top = Math.min(top, box.top)
      }
      setInset(Math.max(0, Math.round(window.innerHeight - top)))
    }
    // After paint: on a phase change the new furniture is not on screen yet,
    // and measuring the old puts the bar in the wrong place for a frame.
    const frame = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [phase])
  return inset
}

function useIdleReveal(ms = 4000): boolean {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    const wake = () => {
      // React bails out on an unchanged value, so this is cheap to call on
      // every pixel of mouse movement.
      setVisible(true)
      clearTimeout(id)
      id = setTimeout(() => setVisible(false), ms)
    }
    wake()
    window.addEventListener('pointermove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      clearTimeout(id)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [ms])
  return visible
}

export function FacilitatorControls({
  phase,
  paused,
  onPause,
  onNext,
}: {
  phase: Phase
  paused: boolean
  onPause: () => void
  onNext: () => void
}) {
  const revealed = useIdleReveal()
  const inset = useBottomInset(phase)
  const next = nextStep(phase)
  // Nothing has started in the lobby, and a paused room has to be able to find
  // its way back. Everywhere else the bar earns its place by disappearing.
  const held = paused || phase === 'lobby'

  return (
    <div
      className={`faccon${revealed || held ? ' faccon--in' : ''}`}
      data-paused={paused}
      style={{ bottom: `calc(${inset}px + var(--space-4))` }}
    >
      <button
        className={`faccon__btn${paused ? ' faccon__btn--resume' : ''}`}
        onClick={onPause}
        aria-label={paused ? 'Restart the clock' : 'Stop the clock'}
      >
        {paused ? '▶ RESUME' : '❙❙ PAUSE'}
        <span className="faccon__key">P</span>
      </button>
      {next ? (
        <button className="faccon__btn faccon__btn--next" onClick={onNext}>
          {next.label} ▸<span className="faccon__key">N</span>
        </button>
      ) : null}
    </div>
  )
}

/**
 * What the room sees while it is stopped.
 *
 * Loud on purpose. A frozen broadcast with no explanation reads as a crash, and
 * the four people watching it will start asking whether the game has broken
 * rather than listening to whoever stopped it.
 */
export function PausedBanner() {
  return (
    <div className="pausedbar" role="status">
      <span className="pausedbar__mark">❙❙</span>
      <span className="pausedbar__text">PAUSED</span>
      <span className="pausedbar__note">The clock is stopped. Nothing moves until it restarts.</span>
    </div>
  )
}
