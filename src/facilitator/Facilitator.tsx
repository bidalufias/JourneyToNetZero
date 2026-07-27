/**
 * The facilitator's script, as a surface of its own.
 *
 * The dashboard is a broadcast and must never look like a control room, so
 * everything a facilitator needs to *read* lives here instead — in a window
 * they keep on their own laptop, beside the projector output rather than on
 * it. The whole run of show is on one scrolling page, and the phase the room
 * is actually in is pulled to the top and marked, because a facilitator
 * hunting for their place in a document is a facilitator not watching the room.
 *
 * It is deliberately usable with no live connection at all: opened cold on a
 * phone, it is the run sheet, the four moments and the debrief questions. The
 * live half is a bonus, not the point.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ROLE_LABEL } from '../game/session'
import type { Phase } from '../game/session'
import { QrCode } from '../ui/QrCode'
import { HOW_TO_PLAY_URL, joinUrl } from '../ui/links'
import {
  openChannel,
  type FacilitatorCommand,
  type FacilitatorMessage,
  type FacilitatorState,
} from './channel'
import { BEATS, CONTROLS, DEBRIEF, MOMENTS, SETUP, TROUBLE } from './script'
import './facilitator.css'

/** What the buttons do next, given where the room is. */
function nextAction(phase: Phase | undefined): { cmd: 'start' | 'advance'; label: string } | null {
  if (phase === undefined) return null
  if (phase === 'lobby') return { cmd: 'start', label: 'START THE SESSION' }
  if (phase === 'ended') return null
  return { cmd: 'advance', label: 'ADVANCE' }
}

export function Facilitator({
  code,
  state,
  onCommand,
  onClose,
}: {
  code: string
  /** Null when nothing is publishing — the script still reads. */
  state: FacilitatorState | null
  onCommand?: (cmd: FacilitatorCommand) => void
  /** Present when this is an overlay on the big screen rather than its own window. */
  onClose?: () => void
}) {
  const phase = state?.phase
  const round = state?.round ?? 0
  const action = nextAction(phase)
  const live = state !== null
  const paused = state?.paused ?? false

  const moment = useMemo(
    () => MOMENTS.find((m) => m.round === round && m.phase === phase) ?? null,
    [round, phase],
  )

  /**
   * Follow the room.
   *
   * When the session moves on, the page moves with it — to the facilitator's
   * moment if this phase has one, because that prompt is worth more than
   * anything else on the page and is easy to sail past, and otherwise to the
   * beat now on screen. The advance button does not move: it lives in the
   * sticky header, so scrolling can never take the session's controls away.
   */
  const liveRef = useRef<HTMLElement | null>(null)
  const momentRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const target = momentRef.current ?? liveRef.current
    target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [phase, round])

  return (
    <div className="fac">
      <header className="fac__head">
        <div className="fac__head-main">
          <p className="fac__kicker">FACILITATOR · JOURNEY TO NET ZERO</p>
          <h1 className="fac__title">
            {live ? `ROUND ${Math.max(round, 1)} OF 6 · ${beatFor(phase!).label}` : 'THE RUN OF SHOW'}
          </h1>
          <p className="fac__status">
            {live
              ? `Room ${state!.code} · ${state!.seats.filter((s) => s.name).length} of 4 seated${
                  paused ? ' · PAUSED' : ''
                }`
              : 'Not connected to a big screen. Everything below still applies.'}
          </p>
        </div>

        {/* Pause is offered wherever the room has got to, including the two
            phases with no advance left — stopping is the one control that is
            never inapplicable. */}
        {live && onCommand ? (
          <div className="fac__head-action">
            {action ? (
              <button className="fac__btn fac__btn--primary" onClick={() => onCommand(action.cmd)}>
                {action.label}
              </button>
            ) : null}
            <button
              className={`fac__btn${paused ? ' fac__btn--primary' : ' fac__btn--ghost'}`}
              onClick={() => onCommand(paused ? 'resume' : 'pause')}
            >
              {paused ? '▶ RESUME THE CLOCK' : '❙❙ PAUSE'}
            </button>
            <p className="fac__next">
              {paused ? 'The clock is stopped. It restarts with the seconds it had left.' : beatFor(phase!).next}
            </p>
          </div>
        ) : null}

        {onClose ? (
          <button className="fac__btn fac__btn--ghost" onClick={onClose}>
            CLOSE
          </button>
        ) : null}
      </header>

      <div className="fac__body">
        {moment ? (
          <section
            className="fac__moment"
            ref={(el) => {
              momentRef.current = el
            }}
          >
            <p className="fac__label">THE MOMENT IS NOW · {moment.title.toUpperCase()}</p>
            <p className="fac__moment-text">{moment.text}</p>
          </section>
        ) : null}

        {live ? (
          <section className="fac__seats">
            {state!.seats.map((s) => (
              <div key={s.role} className={`fac__seat${s.name ? '' : ' fac__seat--empty'}`}>
                <span className="fac__seat-role">{ROLE_LABEL[s.role].toUpperCase()}</span>
                <span className="fac__seat-name">{s.name ?? 'empty'}</span>
                <span className="fac__seat-state">
                  {!s.name
                    ? '—'
                    : !s.connected
                      ? 'reconnecting'
                      : s.locked
                        ? 'locked'
                        : phase === 'choice' || phase === 'table'
                          ? 'thinking'
                          : 'in'}
                </span>
              </div>
            ))}
          </section>
        ) : null}

        <Join code={state?.code || code} />

        <h2 className="fac__h2">The run of show</h2>
        {BEATS.map((beat) => {
          const isLive = beat.phase === phase
          return (
            <section
              key={beat.phase}
              ref={isLive ? (el) => { liveRef.current = el } : undefined}
              className={`fac__beat${isLive ? ' fac__beat--live' : ''}`}
            >
              <div className="fac__beat-head">
                <span className="fac__beat-label">{beat.label}</span>
                <span className="fac__beat-length">{beat.length}</span>
                {isLive ? <span className="fac__beat-live">ON SCREEN NOW</span> : null}
              </div>
              <p className="fac__beat-screen">{beat.onScreen}</p>
              <p className="fac__label">SAY</p>
              <ul className="fac__say">
                {beat.say.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {/* The rules a table needs once. Hidden from round two on, so
                  the live script stops offering an explanation the room has
                  already had — but always here when reading it cold. */}
              {beat.firstTime && (!live || round <= 1) ? (
                <>
                  <p className="fac__label fac__label--aside">FIRST ROUND ONLY</p>
                  <ul className="fac__say fac__say--aside">
                    {beat.firstTime.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {beat.watch ? <p className="fac__watch">{beat.watch}</p> : null}
              <p className="fac__beat-next">
                <strong>Next:</strong> {beat.next}
              </p>
            </section>
          )
        })}

        <h2 className="fac__h2">The four moments</h2>
        <p className="fac__lead">
          The game runs itself. These four are where a facilitator changes what the room takes home.
        </p>
        {MOMENTS.map((m) => (
          <section key={m.title} className={`fac__card${m === moment ? ' fac__card--live' : ''}`}>
            <p className="fac__label">ROUND {m.round} · {m.title.toUpperCase()}</p>
            <p className="fac__card-text">{m.text}</p>
          </section>
        ))}

        <h2 className="fac__h2">The debrief</h2>
        <p className="fac__lead">
          Ten minutes, five questions, in this order. Ask them of the table, not of individuals.
        </p>
        <ol className="fac__debrief">
          {DEBRIEF.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>

        <h2 className="fac__h2">Before you start</h2>
        <ul className="fac__list">
          {SETUP.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2 className="fac__h2">If something goes wrong</h2>
        {TROUBLE.map((t) => (
          <section key={t.problem} className="fac__card">
            <p className="fac__trouble">{t.problem}</p>
            <p className="fac__card-text">{t.fix}</p>
          </section>
        ))}

        <h2 className="fac__h2">The big screen's controls</h2>
        <p className="fac__lead">
          The dashboard is a broadcast, so PAUSE and NEXT sit in the bottom corner and fade out
          after a few seconds — move the mouse and they come back. The keys below do the same
          things, and work whenever the big screen has focus.
        </p>
        <dl className="fac__keys">
          {CONTROLS.map((c) => (
            <div key={c.key}>
              <dt>{c.key}</dt>
              <dd>{c.what}</dd>
            </div>
          ))}
        </dl>

        <footer className="fac__foot">
          <p>
            The written player guide is at{' '}
            <a href={HOW_TO_PLAY_URL} target="_blank" rel="noreferrer">
              /how-to-play.html
            </a>{' '}
            — characters, goals, every word explained. Players do not need it to play.
          </p>
        </footer>
      </div>
    </div>
  )
}

function beatFor(phase: Phase) {
  return BEATS.find((b) => b.phase === phase) ?? BEATS[0]
}

/** The join code and its QR, so a latecomer can be seated from this window. */
function Join({ code }: { code: string }) {
  if (!code) return null
  const url = joinUrl(code)
  return (
    <section className="fac__join">
      <QrCode value={url} size={132} title={`Join room ${code}`} />
      <div>
        <p className="fac__label">PLAYERS JOIN AT</p>
        <p className="fac__join-code">{code}</p>
        <p className="fac__join-url">{url}</p>
      </div>
    </section>
  )
}

/**
 * The route: `/facilitator?room=CODE`, opened in its own window.
 *
 * It listens for the big screen and can ask it to advance, which means the
 * facilitator can run the whole session from the laptop in front of them
 * without reaching over to the machine driving the projector.
 */
export function FacilitatorWindow({ code }: { code: string }) {
  const [state, setState] = useState<FacilitatorState | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const channel = openChannel(code)
    channelRef.current = channel
    if (!channel) return
    channel.onmessage = (e: MessageEvent<FacilitatorMessage>) => {
      const msg = e.data
      if (msg.t === 'state') setState(msg.state)
      if (msg.t === 'gone') setState(null)
    }
    channel.postMessage({ t: 'hello' } satisfies FacilitatorMessage)
    return () => {
      channel.onmessage = null
      channel.close()
      channelRef.current = null
    }
  }, [code])

  const onCommand = (cmd: FacilitatorCommand) =>
    channelRef.current?.postMessage({ t: 'cmd', cmd } satisfies FacilitatorMessage)

  return <Facilitator code={code} state={state} onCommand={onCommand} />
}
