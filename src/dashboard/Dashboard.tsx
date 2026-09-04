/**
 * The dashboard: a broadcast on a TV or projector, seen by everyone.
 *
 * Semenanjara Tonight, anchored by Aida Rahman. If this ends up looking like a
 * control room, the session dies, so nothing from the first crisis onward
 * carries a control: the facilitator's affordances are keys, and what they
 * open, the join code and the script, covers the broadcast only for as long as
 * it is wanted. The lobby is the one exception, because nothing has started
 * there and the alternative is four people watching somebody hunt for a
 * shortcut they were never told about.
 */
import { useEffect, useMemo, useState } from 'react'
import type { Role } from '../engine/types'
import { driftK } from '../engine/engine'
import { localContent } from '../net/local'
import { serverNow } from '../net/clock'
import type { DashboardView } from '../game/session'
import type { Endgame } from '../game/room'
import { ROLE_LABEL } from '../game/session'
import { STEP_LABEL } from '../game/vocab'
import { Meter, RoleGlyph, Sparkline, formatClock } from '../ui/primitives'
import {
  driftSentence,
  emissionsMeter,
  growthMeter,
  happinessMeter,
  projectionNote,
} from './meters'
import { Reckoning } from './Reckoning'
import { TheTable } from './TheTable'
import {
  Attract,
  Briefing,
  Endgame as EndgameScreen,
  Onboarding,
  RoundSummary,
  TrustAward,
} from './screens'
import './dashboard.css'
import './screens.css'


/**
 * Ticks locally between server snapshots so the countdown stays smooth.
 *
 * Both ends of the subtraction have to come from the same clock or the number
 * is meaningless: the deadline is stamped on the server, so the near end is
 * `serverNow()`, this machine's clock plus whatever offset the transport has
 * measured, rather than a raw `Date.now()` that may be minutes out.
 *
 * While the room is paused the clock reads from the server's own `pausedAt`
 * instead, which does two things: it holds still, and it holds still at the
 * same number on every surface.
 */
export function useCountdown(endsAt: number | null, pausedAt: number | null = null): number | null {
  const [now, setNow] = useState(() => serverNow())
  useEffect(() => {
    if (endsAt === null || pausedAt !== null) return
    // Resuming must not leave the display a quarter-second behind the room.
    setNow(serverNow())
    const id = setInterval(() => setNow(serverNow()), 250)
    return () => clearInterval(id)
  }, [endsAt, pausedAt])
  if (endsAt === null) return null
  return Math.max(0, endsAt - (pausedAt ?? now))
}

export function Dashboard({
  view,
  endgame,
  onShowQr,
  onOpenScript,
}: {
  view: DashboardView
  endgame: Endgame | null
  /** The lobby's two buttons; the keys do the same thing everywhere else. */
  onShowQr?: () => void
  onOpenScript?: () => void
}) {
  const remaining = useCountdown(view.phaseEndsAt, view.pausedAt)
  const clock = formatClock(remaining)

  // The briefing is a screen of its own now that a single spacebar no longer
  // skips straight past it. Showing the attract screen for both meant the one
  // phase written to explain the game never appeared.
  if (view.phase === 'lobby') {
    return <Attract view={view} onShowQr={onShowQr} onOpenScript={onOpenScript} />
  }
  if (view.phase === 'briefing') return <Briefing view={view} clock={clock} />
  // The power and goal steps own the whole screen, the way the briefing does.
  // Rendered inside the meters column they overflowed, and put the one line
  // the person running the room needs to read behind the pause and next
  // buttons. The practice choice stays on the board below, because it is the
  // second half of the practice and should look like the first.
  if (view.phase === 'power' || view.phase === 'goal') {
    return <Onboarding view={view} clock={clock} />
  }
  // Two names, fifteen seconds, its own screen. Rendered beside the meters it
  // would be a caption; the point is that the room looks up for it.
  if (view.phase === 'trust' && view.trustAward) return <TrustAward view={view} clock={clock} />
  if ((view.phase === 'results' || view.phase === 'ended') && endgame) {
    return <EndgameScreen view={view} endgame={endgame} />
  }

  return (
    <div className="dash">
      <Masthead view={view} clock={clock} urgent={!view.paused && (remaining ?? 1e9) < 10_000} />
      <div className="dash__body">
        <TheNation view={view} />
        {view.phase === 'table' ||
        view.phase === 'choice' ||
        view.phase === 'practiceTalk' ||
        view.phase === 'practiceChoice' ? (
          <TheTable view={view} />
        ) : null}

        {view.phase === 'summary' ? <RoundSummary view={view} /> : null}
        <LockRow view={view} />
      </div>
      <Ticker headlines={view.headlines} />

      {view.phase === 'crisis' && view.scenario ? <CrisisSting view={view} clock={clock} /> : null}
      {/* The Reveal owns its own beats, including when the moving together bonus
          is allowed to interrupt. It must land after the meters settle. */}
      {/* Keyed on the round so every Reveal starts its own stopwatch, even
          in the case where one follows another without the screen unmounting. */}
      {(view.phase === 'reckoning' || view.phase === 'practiceReveal') && view.lastRound ? (
        <Reckoning key={view.phase === 'practiceReveal' ? 'practice' : view.lastRound.round} view={view} />
      ) : null}
    </div>
  )
}

function Masthead({
  view,
  clock,
  urgent,
}: {
  view: DashboardView
  clock: string | null
  urgent: boolean
}) {
  return (
    <header className="dash__masthead">
      <span className="dash__live">LIVE</span>
      <span className="dash__channel">SEMENANJARA TONIGHT</span>
      <div className="dash__masthead-right">
        {/* No round before the first crisis. The step name carries the line. */}
        {view.round > 0 ? <span>ROUND {view.round} OF 6</span> : null}
        {/* The practice choice ends on the fourth lock, so the count is the
            one number the facilitator is watching. */}
        {view.phase === 'practiceChoice' ? (
          <span>{view.seats.filter((x) => x.locked).length} OF 4 LOCKED</span>
        ) : null}
        <span>{STEP_LABEL[view.phase] ?? ''}</span>
        {clock ? (
          <span
            className={`dash__clock${urgent ? ' dash__clock--urgent' : ''}${
              view.paused ? ' dash__clock--held' : ''
            }`}
          >
            {clock}
          </span>
        ) : null}
      </div>
    </header>
  )
}

/** The persistent state: three numbers, the sentence, the 2050 figure. */
function TheNation({ view }: { view: DashboardView }) {
  const s = view.state
  const k = driftK(s.greenShare, localContent)
  const projection = projectionNote(s.projection2050, view.targets.emissions, s.round)
  const trail = useMemo(
    () => [localContent.config.start.e, ...view.history.map((h) => h.state.emissions)],
    [view.history],
  )

  return (
    <>
      <div className="meters">
        <Meter spec={emissionsMeter(s, view.targets, localContent)} />
        <Meter spec={growthMeter(s, view.targets)} />
        <Meter spec={happinessMeter(s, view.targets)} />
      </div>

      <div className="dash__lower">
        <div className="green">
          <div className="green__head">
            <span className="green__label">CLEAN ECONOMY</span>
            <span className="green__value">
              {s.greenShare.toFixed(0)}
              <span className="green__pct">%</span>
            </span>
          </div>
          <div className="meter__track" style={{ marginTop: 'var(--space-2)' }}>
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`meter__seg${i < Math.round(s.greenShare / 10) ? ' meter__seg--on' : ''}`}
                style={{ '--meter-ink': 'var(--jtnz-meter-green)' } as React.CSSProperties}
              />
            ))}
          </div>
          <p className="green__sentence">{driftSentence(k)}</p>
        </div>

        <div className="proj">
          <span className="proj__label">IF NOTHING CHANGES, IN 2050</span>
          <div className="proj__row">
            <span className="proj__value" data-on-track={projection.onTrack}>
              {s.projection2050.toFixed(0)}
            </span>
            <span className="proj__unit">Mt</span>
            <Sparkline values={trail} target={view.targets.emissions} />
          </div>
          <p className="proj__note">{projection.text}</p>
        </div>
      </div>
    </>
  )
}

function LockRow({ view }: { view: DashboardView }) {
  const showLocks = view.phase === 'choice' || view.phase === 'table' || view.phase === 'practiceChoice'
  return (
    <div className="locks">
      {view.seats.map((seat) => {
        const empty = !seat.name
        const cls = empty
          ? 'lock lock--empty'
          : `lock${seat.locked ? '' : ' lock--waiting'}${seat.lastToLock ? ' lock--last' : ''}`
        return (
          <div key={seat.role} className={cls} data-role={seat.role}>
            <RoleGlyph role={seat.role} size={20} className="lock__glyph" />
            <div>
              <div className="lock__role">
                {ROLE_LABEL[seat.role].toUpperCase()}
                {seat.name ? <span style={{ opacity: 0.7 }}> · {seat.name}</span> : null}
              </div>
              <div className="lock__state">
                {empty
                  ? 'WAITING…'
                  : !showLocks
                    ? seat.connected
                      ? 'IN'
                      : 'RECONNECTING'
                    : seat.locked
                      ? 'LOCKED'
                      : seat.lastToLock
                        ? 'LAST TO LOCK'
                        : 'STILL CHOOSING'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Every option carries a pre-written headline. Cheap to build, enormous for
 * atmosphere. The ticker is the country talking about what the table just did.
 */
function Ticker({ headlines }: { headlines: string[] }) {
  const items = headlines.length
    ? headlines
    : ['Semenanjara begins its journey to net zero', 'Four seats. Six crises. Thirty-five minutes.']
  // Doubled so the loop is seamless.
  const rail = [...items, ...items]
  return (
    <div className="ticker">
      <span className="ticker__label">HEADLINES</span>
      <div className="ticker__viewport">
        <div className="ticker__rail">
          {rail.map((h, i) => (
            <span key={i} className="ticker__item">
              {h}
              <span className="ticker__dot"> ●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The one screen that fills with accent: Modernist's poster statement. */
function CrisisSting({ view, clock }: { view: DashboardView; clock: string | null }) {
  const s = view.scenario!
  const kicker: Record<string, string> = {
    financial: 'THE MONEY',
    energy: 'THE POWER',
    health: 'THE PEOPLE',
    election: 'THE ELECTION',
    pollution: 'THE DAMAGE',
    disaster: 'THE DISASTER',
  }
  return (
    <div className="sting">
      <div className="sting__bar">
        <span className="sting__breaking">BREAKING</span>
        <span className="dash__channel">SEMENANJARA TONIGHT</span>
        <span style={{ marginLeft: 'auto', font: '800 20px/1 var(--font-heading)', letterSpacing: '.1em' }}>
          ROUND {view.round} OF 6
        </span>
      </div>
      <div className="sting__main">
        <div className="sting__kicker">{kicker[s.type] ?? s.type.toUpperCase()}</div>
        <h1 className="sting__title">{s.title}</h1>
        <p className="sting__situation">{s.situation}</p>
      </div>
      <div className="sting__lower">
        <div className="sting__reporting">
          <span className="sting__cue">REPORTING</span>
          <span className="sting__anchor">
            <span className="sting__anchor-name">AIDA RAHMAN</span>
            <br />
            <span className="sting__anchor-role">POLITICAL EDITOR · KOTA DAMAI</span>
          </span>
        </div>
        {clock ? (
          <div className="sting__countdown">
            <div className="sting__countdown-label">THE TALK STARTS IN</div>
            <div className="sting__countdown-value">{clock}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export type { Role }
