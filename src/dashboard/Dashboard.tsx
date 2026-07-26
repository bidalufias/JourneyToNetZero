/**
 * The dashboard — a broadcast on a TV or projector, seen by everyone.
 *
 * Semenanjara Tonight, anchored by Aida Rahman. If this ends up looking like a
 * control room, the session dies, so there are no controls on it: the only
 * facilitator affordance is a keyboard shortcut, deliberately invisible.
 */
import { useEffect, useMemo, useState } from 'react'
import type { Role } from '../engine/types'
import { driftK } from '../engine/engine'
import { localContent } from '../net/local'
import type { DashboardView } from '../game/session'
import type { Endgame } from '../game/room'
import { ROLE_LABEL } from '../game/session'
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
import { Attract, Endgame as EndgameScreen, RoundSummary } from './screens'
import './dashboard.css'
import './screens.css'

const PHASE_LABEL: Record<string, string> = {
  briefing: 'THE BRIEFING',
  crisis: 'THE CRISIS',
  table: 'THE TABLE',
  choice: 'THE CHOICE',
  reckoning: 'THE RECKONING',
  summary: 'THE STORY SO FAR',
  results: 'THE NATIONAL MISSION',
}

/** Ticks locally between server snapshots so the countdown stays smooth. */
export function useCountdown(endsAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (endsAt === null) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [endsAt])
  return endsAt === null ? null : Math.max(0, endsAt - now)
}

export function Dashboard({ view, endgame }: { view: DashboardView; endgame: Endgame | null }) {
  const remaining = useCountdown(view.phaseEndsAt)
  const clock = formatClock(remaining)

  if (view.phase === 'lobby' || view.phase === 'briefing') {
    return <Attract view={view} />
  }
  if ((view.phase === 'results' || view.phase === 'ended') && endgame) {
    return <EndgameScreen view={view} endgame={endgame} />
  }

  return (
    <div className="dash">
      <Masthead view={view} clock={clock} urgent={(remaining ?? 1e9) < 10_000} />
      <div className="dash__body">
        <TheNation view={view} />
        {view.phase === 'table' || view.phase === 'choice' ? <TheTable view={view} /> : null}
        {view.phase === 'summary' ? <RoundSummary view={view} /> : null}
        <LockRow view={view} />
      </div>
      <Ticker headlines={view.headlines} />

      {view.phase === 'crisis' && view.scenario ? <CrisisSting view={view} clock={clock} /> : null}
      {/* The Reckoning owns its own beats, including when the Coalition Bonus
          is allowed to interrupt — it must land after the meters settle. */}
      {view.phase === 'reckoning' && view.lastRound ? <Reckoning view={view} /> : null}
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
        <span>
          ROUND {view.round} OF 6
        </span>
        <span>{PHASE_LABEL[view.phase] ?? ''}</span>
        {clock ? (
          <span className={`dash__clock${urgent ? ' dash__clock--urgent' : ''}`}>{clock}</span>
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
    () => [300, ...view.history.map((h) => h.state.emissions)],
    [view.history],
  )

  return (
    <>
      <div className="meters">
        <Meter spec={emissionsMeter(s, view.targets)} />
        <Meter spec={growthMeter(s, view.targets)} />
        <Meter spec={happinessMeter(s, view.targets)} />
      </div>

      <div className="dash__lower">
        <div className="green">
          <div className="green__head">
            <span className="green__label">GREEN ECONOMY SHARE</span>
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
          <span className="proj__label">ON CURRENT PATH, 2050</span>
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
  const showLocks = view.phase === 'choice' || view.phase === 'table'
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
                        ? 'LAST ONE'
                        : 'THINKING'}
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
 * atmosphere — the ticker is the country talking about what the table just did.
 */
function Ticker({ headlines }: { headlines: string[] }) {
  const items = headlines.length
    ? headlines
    : ['Semenanjara begins its journey to net zero', 'Four seats. Six crises. Thirty minutes.']
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

/** The one screen that fills with accent — Modernist's poster statement. */
function CrisisSting({ view, clock }: { view: DashboardView; clock: string | null }) {
  const s = view.scenario!
  const kicker: Record<string, string> = {
    financial: 'THE MONEY',
    energy: 'THE POWER',
    health: 'THE PEOPLE',
    election: 'THE ELECTION',
    pollution: 'THE DAMAGE',
    disaster: 'THE RECKONING',
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
            <div className="sting__countdown-label">THE TABLE OPENS IN</div>
            <div className="sting__countdown-value">{clock}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export type { Role }
