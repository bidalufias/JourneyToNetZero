import { buildReport } from '../game/engine'
import { ROLES } from '../game/roles'
import { THRESHOLDS } from '../game/synergies'
import type { RoleId } from '../game/types'
import type { RoomRow } from '../lib/supabase'
import { Meter } from './Meter'

/**
 * The 2050 report card. Three national outcomes, then every hidden agenda
 * revealed — who quietly won and who sacrificed themselves — and the three
 * rounds where the trajectory actually moved. That last part is the debrief.
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

  // On a projector the whole report must fit one screen, so the large variant
  // runs two columns: the national result on the left, the private ones right.
  return (
    <div className={large ? 'grid grid-cols-[1.05fr_1fr] gap-12' : ''}>
      <div>
        <p className="text-xs tracking-[0.2em] text-mist-400 uppercase">
          Malaysia, 2050
        </p>
        <h1
          className={`mt-2 font-semibold tracking-tight ${large ? 'text-6xl' : 'text-3xl'}`}
        >
          {report.ending.title}
        </h1>
        <p
          className={`mt-3 leading-relaxed text-mist-300 ${large ? 'text-lg' : 'text-sm'}`}
        >
          {report.ending.blurb}
        </p>

        <div className="mt-6 space-y-4">
          <Meter id="economy" value={room.indicators.economy} big />
          <Meter id="emissions" value={room.indicators.emissions} big />
          <Meter id="living" value={room.indicators.living} big />
        </div>
        <p className="mt-4 text-sm text-mist-400">
          {met} of 3 national targets met — economy ≥ {THRESHOLDS.economy},
          emissions ≤ {THRESHOLDS.emissions}, living standards ≥ {THRESHOLDS.living}.
        </p>

        <section className="mt-7">
          <h2 className="text-sm tracking-[0.18em] text-mist-400 uppercase">
            Where it turned
          </h2>
          <ol className="mt-2.5 space-y-1.5">
            {report.turningPoints.map((tp) => (
              <li key={tp.round} className="card flex items-baseline gap-3 px-3 py-2">
                <span className="tabular text-sm text-mist-400">{tp.year}</span>
                <span className="font-medium">{tp.title}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2.5 text-xs leading-relaxed text-mist-400">
            The rounds that moved the needle furthest, for better or worse.
            Start the conversation here.
          </p>
        </section>
      </div>

      <div>
      <section className={large ? '' : 'mt-8'}>
        <h2 className="text-sm tracking-[0.18em] text-mist-400 uppercase">
          What each of you was really playing for
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {report.agendas.map(({ role, agenda, met: ok, detail }) => {
            const seat = room.seats[role]
            return (
              <div
                key={role}
                className={`card p-3.5 ${highlight === role ? 'ring-1 ring-mist-100/50' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ROLES[role].accent }}
                  >
                    {ROLES[role].name}
                  </span>
                  <span className="truncate text-xs text-mist-400">{seat?.name}</span>
                </div>
                <h3 className="mt-1 font-semibold">{agenda.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-mist-400">
                  {agenda.description}
                </p>
                <p
                  className={`mt-2 text-sm font-medium ${ok ? 'text-living' : 'text-emissions'}`}
                >
                  {ok ? 'Achieved' : 'Missed'} — {detail}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      </div>
    </div>
  )
}
