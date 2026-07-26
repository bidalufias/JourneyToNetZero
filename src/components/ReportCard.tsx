import { CircleAlert, CircleCheckBig, KeyRound, TriangleAlert } from 'lucide-react'
import { buildReport } from '../game/engine'
import { TARGET_YEAR } from '../game/situations'
import { THRESHOLDS } from '../game/synergies'
import type { RoleId } from '../game/types'
import type { RoomRow } from '../lib/supabase'
import { Card, RoleBadge, StatusChip } from '../ui'
import { Meter } from './Meter'

/**
 * The 2050 report card. Three national outcomes, then every hidden agenda
 * revealed — who quietly won and who sacrificed themselves — and the three
 * rounds where the trajectory actually moved. That last part is the debrief.
 *
 * The framing follows the calculation: three targets met reads as a success,
 * one or two as a mixed result, none as a failure. Nothing here asserts that
 * net zero was reached unless the engine says the emissions target was met.
 */
export function ReportCard({
  room,
  highlight,
  large = false,
}: {
  room: RoomRow
  highlight?: RoleId
  large?: boolean
}) {
  const report = buildReport(room.indicators, room.seats, room.history)
  const met = Object.values(report.passed).filter(Boolean).length

  const outcome =
    met === 3
      ? { tone: 'positive' as const, icon: CircleCheckBig }
      : met === 0
        ? { tone: 'negative' as const, icon: TriangleAlert }
        : { tone: 'warning' as const, icon: CircleAlert }

  // On a projector the whole report must fit one screen, so the large variant
  // runs two columns: the national result on the left, the private ones right.
  return (
    <div className={large ? 'grid grid-cols-[1.05fr_1fr] gap-12' : ''}>
      <div>
        <p className="text-[12px] font-medium text-muted">Malaysia, {TARGET_YEAR}</p>
        <h1
          className={`mt-1.5 font-bold tracking-[-0.015em] text-navy ${
            large ? 'text-[52px] leading-[1.05]' : 'text-[28px] leading-[1.15]'
          }`}
        >
          {report.ending.title}
        </h1>

        <div className="mt-3">
          <StatusChip tone={outcome.tone} icon={outcome.icon}>
            {met} of 3 national targets met
          </StatusChip>
        </div>

        <p
          className={`mt-3 text-body ${large ? 'text-[18px] leading-[1.55]' : 'text-[15px] leading-6'}`}
        >
          {report.ending.blurb}
        </p>

        <div className="mt-5 space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <Meter id="economy" value={room.indicators.economy} big />
          <Meter id="emissions" value={room.indicators.emissions} big />
          <Meter id="living" value={room.indicators.living} big />
        </div>
        <p className="mt-3 text-[13px] leading-5 text-muted">
          {met} of 3 national targets met — economy ≥ {THRESHOLDS.economy},
          emissions ≤ {THRESHOLDS.emissions}, living standards ≥ {THRESHOLDS.living}.
        </p>

        <section className="mt-6">
          <h2 className="text-[20px] font-[650] text-navy">Where it turned</h2>
          <ol className="mt-3 space-y-2">
            {report.turningPoints.map((tp) => (
              <li
                key={tp.round}
                className="flex items-baseline gap-3 rounded-[var(--radius-small)] border border-line bg-surface px-3 py-2.5"
              >
                <span className="tabular shrink-0 text-[13px] font-[650] text-brand">
                  {tp.year}
                </span>
                <span className="text-[15px] font-medium text-navy">{tp.title}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] leading-5 text-muted">
            The rounds that moved the needle furthest, for better or worse.
            Start the conversation here.
          </p>
        </section>
      </div>

      <div>
        <section className={large ? '' : 'mt-7'}>
          <h2 className="flex items-center gap-2 text-[20px] font-[650] text-navy">
            <KeyRound size={19} strokeWidth={2} className="text-brand" aria-hidden="true" />
            What each of you was really playing for
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {report.agendas.map(({ role, agenda, met: ok, detail }) => {
              const seat = room.seats[role]
              return (
                <Card
                  key={role}
                  className={highlight === role ? 'ring-2 ring-brand/35' : ''}
                >
                  <div className="flex items-center justify-between gap-2">
                    <RoleBadge role={role} size="sm" />
                    <span className="truncate text-[12px] font-medium text-muted">
                      {seat?.name}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-[17px] leading-[1.3] font-[650] text-navy">
                    {agenda.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-body">
                    {agenda.description}
                  </p>
                  <p className="mt-2.5">
                    <StatusChip
                      tone={ok ? 'positive' : 'negative'}
                      icon={ok ? CircleCheckBig : CircleAlert}
                    >
                      {ok ? 'Achieved' : 'Missed'} — {detail}
                    </StatusChip>
                  </p>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
