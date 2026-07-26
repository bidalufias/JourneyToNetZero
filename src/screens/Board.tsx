import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Meter } from '../components/Meter'
import { ReportCard } from '../components/ReportCard'
import { TimerRing, useCountdown } from '../components/Timer'
import { actionById } from '../game/actions'
import { ROLES } from '../game/roles'
import { situationFor, TOTAL_ROUNDS } from '../game/situations'
import { SYNERGIES } from '../game/synergies'
import { ROLE_IDS } from '../game/types'
import { PHASE_SECONDS } from '../lib/config'
import { useRoom } from '../store/useRoom'

/**
 * Read-only. No controls, nothing to tap — it can sit on a projector with
 * nobody attending it. This is the shared source of truth and the thing people
 * point at while they argue.
 */
export default function Board() {
  const { code = '' } = useParams()
  const { room, watch } = useRoom()

  useEffect(() => watch(code), [code, watch])

  const seconds = useCountdown(room?.phase_ends_at ?? null, room?.paused ?? false)

  if (!room) {
    return (
      <Frame>
        <p className="text-2xl text-mist-400">Waiting for the table…</p>
      </Frame>
    )
  }

  if (room.phase === 'lobby') {
    return (
      <Frame>
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-mist-400 uppercase">
            Join at this table
          </p>
          <p className="tabular mt-6 text-[10rem] leading-none font-semibold tracking-[0.1em]">
            {code}
          </p>
          <div className="mt-12 flex justify-center gap-4">
            {ROLE_IDS.map((r) => {
              const seat = room.seats[r]
              return (
                <div
                  key={r}
                  className={`w-56 rounded-2xl border px-5 py-4 text-left ${
                    seat
                      ? 'border-mist-400/30 bg-ink-700'
                      : 'border-dashed border-mist-400/20'
                  }`}
                >
                  <p className="font-semibold" style={{ color: ROLES[r].accent }}>
                    {ROLES[r].name}
                  </p>
                  <p className="mt-1 text-sm text-mist-400">
                    {seat ? seat.name : 'waiting…'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </Frame>
    )
  }

  if (room.phase === 'ending') {
    return (
      <Frame>
        <div className="w-full max-w-6xl">
          <ReportCard room={room} large />
        </div>
      </Frame>
    )
  }

  if (room.phase === 'briefing') {
    return (
      <Frame>
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-mist-400 uppercase">
            Everyone has their role
          </p>
          <p className="mt-6 text-6xl font-semibold tracking-tight">
            Malaysia, 2026
          </p>
          <p className="mt-4 max-w-2xl text-xl text-mist-300">
            Eight rounds to 2050. Grow the economy, cut the emissions, improve
            people’s lives. Nobody can do all three alone.
          </p>
        </div>
      </Frame>
    )
  }

  const situation = situationFor(room.round)
  const total = PHASE_SECONDS[room.phase as keyof typeof PHASE_SECONDS] ?? 0
  const last = room.history.at(-1)
  const showing = room.phase === 'reveal' ? room.pending_choices : last?.choices
  const fired =
    room.phase === 'resolution' && last
      ? SYNERGIES.filter((s) => last.firedSynergies.includes(s.id))
      : []

  return (
    <main className="flex min-h-dvh flex-col px-10 py-8">
      <header className="flex items-start justify-between gap-8">
        <div>
          <p className="text-sm tracking-[0.24em] text-mist-400 uppercase">
            Round {room.round} of {TOTAL_ROUNDS}
          </p>
          <h1 className="mt-1 text-5xl font-semibold tracking-tight">
            {situation.year} · {situation.title}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          {room.paused && (
            <span className="rounded-full bg-mist-100 px-4 py-1.5 text-sm font-semibold text-ink-900">
              Paused
            </span>
          )}
          {seconds !== null && total > 0 && (
            <TimerRing seconds={seconds} total={total} size={80} label={room.phase} />
          )}
        </div>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-10">
        <Meter
          id="economy"
          value={room.indicators.economy}
          delta={last && room.phase === 'resolution' ? last.after.economy - last.before.economy : undefined}
          big
        />
        <Meter
          id="emissions"
          value={room.indicators.emissions}
          delta={last && room.phase === 'resolution' ? last.after.emissions - last.before.emissions : undefined}
          big
        />
        <Meter
          id="living"
          value={room.indicators.living}
          delta={last && room.phase === 'resolution' ? last.after.living - last.before.living : undefined}
          big
        />
      </section>

      {(room.phase === 'situation' || room.phase === 'discussion') && (
        <section className="mt-10 flex max-w-5xl flex-1 flex-col justify-center">
          <p className="text-3xl leading-snug font-medium">{situation.headline}</p>
          <p className="mt-4 text-xl leading-relaxed text-mist-300">
            {situation.context}
          </p>
        </section>
      )}

      {room.phase === 'discussion' && room.pending_transfers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm tracking-[0.24em] text-mist-400 uppercase">
            Deals struck this round
          </h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {room.pending_transfers.map((t, i) => (
              <li key={i} className="card px-4 py-2.5 text-lg">
                <span style={{ color: ROLES[t.from].accent }}>{ROLES[t.from].name}</span>
                <span className="mx-2 text-mist-400">→</span>
                <span style={{ color: ROLES[t.to].accent }}>{ROLES[t.to].name}</span>
                <span className="tabular ml-3 font-semibold">{t.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {room.phase === 'locking' && (
        <section className="mt-12 flex flex-1 flex-col justify-center">
          <h2 className="text-sm tracking-[0.24em] text-mist-400 uppercase">
            Choosing now
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-5">
            {ROLE_IDS.map((r) => {
              const seat = room.seats[r]
              return (
                <div
                  key={r}
                  className={`rounded-2xl border px-6 py-8 text-center transition ${
                    seat?.locked
                      ? 'border-mist-100/60 bg-ink-600'
                      : 'border-mist-400/20 bg-ink-800'
                  }`}
                >
                  <p className="text-xl font-semibold" style={{ color: ROLES[r].accent }}>
                    {ROLES[r].name}
                  </p>
                  <p className="mt-3 text-3xl">{seat?.locked ? 'Locked' : '…'}</p>
                  <p className="mt-2 text-sm text-mist-400">{seat?.name}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {showing && (room.phase === 'reveal' || room.phase === 'resolution') && (
        <section className="mt-10 flex flex-1 flex-col justify-center">
          <div className="grid grid-cols-4 gap-5">
            {ROLE_IDS.map((r) => {
              const id = showing[r]
              if (!id) return null
              const action = actionById(id)
              return (
                <div key={r} className="card p-5">
                  <p className="text-sm font-semibold" style={{ color: ROLES[r].accent }}>
                    {ROLES[r].name}
                  </p>
                  <h3 className="mt-2 text-xl leading-snug font-semibold">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-300">
                    {action.summary}
                  </p>
                </div>
              )
            })}
          </div>

          {fired.length > 0 && (
            <div className="mt-6 space-y-3">
              {fired.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-2xl border px-6 py-4 ${
                    s.kind === 'amplify'
                      ? 'border-living/50 bg-living/10'
                      : 'border-emissions/50 bg-emissions/10'
                  }`}
                >
                  <p className="text-lg font-semibold">
                    {s.kind === 'amplify' ? '↗ ' : '↘ '}
                    {s.title}
                  </p>
                  <p className="mt-1 text-mist-300">{s.description}</p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-auto max-w-5xl pt-8 text-base leading-relaxed text-mist-400">
            <span className="text-mist-300">The real story: </span>
            {situation.realStory}
          </p>
        </section>
      )}
    </main>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-10 py-8">
      {children}
    </main>
  )
}
