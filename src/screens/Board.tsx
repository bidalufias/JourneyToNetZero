import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowRight,
  CircleCheckBig,
  Hourglass,
  Pause,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Meter } from '../components/Meter'
import { ReportCard } from '../components/ReportCard'
import { TimerRing, useCountdown } from '../components/Timer'
import { actionById } from '../game/actions'
import { situationFor, TOTAL_ROUNDS } from '../game/situations'
import { SYNERGIES } from '../game/synergies'
import { ROLE_IDS } from '../game/types'
import { PHASE_SECONDS } from '../lib/config'
import { useRoom } from '../store/useRoom'
import {
  BrandMark,
  Card,
  CityHero,
  LoadingState,
  ProgressIndicator,
  RoleBadge,
  ScenarioCard,
  SkylineBand,
  StatusChip,
  roleTheme,
} from '../ui'

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
        <LoadingState>Waiting for the table…</LoadingState>
      </Frame>
    )
  }

  if (room.phase === 'lobby') {
    return (
      <Frame hero>
        <div className="relative text-center">
          <div className="flex justify-center">
            <BrandMark size={88} />
          </div>
          <p className="mt-5 text-[16px] font-medium text-muted">Join at this table</p>
          <p className="tabular mt-3 text-[9rem] leading-none font-bold tracking-[0.08em] text-brand">
            {code}
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {ROLE_IDS.map((r) => {
              const seat = room.seats[r]
              const { color, light } = roleTheme(r)
              return (
                <div
                  key={r}
                  className="w-56 rounded-[var(--radius-card)] border p-5 text-left"
                  style={{
                    borderColor: seat ? color : 'var(--border)',
                    background: seat ? light : 'var(--surface)',
                    borderStyle: seat ? 'solid' : 'dashed',
                  }}
                >
                  <RoleBadge role={r} />
                  <p className="mt-2.5 truncate text-[15px] font-medium text-body">
                    {seat ? seat.name : 'Waiting…'}
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
      <main className="min-h-dvh bg-canvas">
        <div className="relative h-28 w-full overflow-hidden">
          <SkylineBand className="absolute inset-0 h-full w-full" />
          <div
            className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-canvas"
            aria-hidden="true"
          />
        </div>
        <div className="screen-in mx-auto w-full max-w-6xl px-10 pt-4 pb-10">
          <ReportCard room={room} large />
        </div>
      </main>
    )
  }

  if (room.phase === 'briefing') {
    return (
      <Frame hero>
        <div className="text-center">
          <p className="text-[16px] font-medium text-muted">Everyone has their role</p>
          <p className="mt-4 text-[64px] leading-[1.05] font-bold tracking-[-0.02em] text-navy">
            Malaysia, 2026
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[20px] leading-[1.55] text-body">
            Eight rounds to 2050. Grow the economy, cut the emissions, improve
            people’s lives. Nobody can do all three alone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {ROLE_IDS.map((r) => (
              <span
                key={r}
                className="rounded-full border border-line bg-surface px-4 py-2"
              >
                <RoleBadge role={r} size="sm" />
              </span>
            ))}
          </div>
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
    <main className="screen-in flex min-h-dvh flex-col bg-canvas px-10 py-8">
      <header className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <p className="text-[14px] font-medium text-muted">
              Round {room.round} of {TOTAL_ROUNDS}
            </p>
            <ProgressIndicator current={room.round} total={TOTAL_ROUNDS} />
          </div>
          <h1 className="mt-1.5 text-[46px] leading-[1.1] font-bold tracking-[-0.02em] text-navy">
            {situation.year} · {situation.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-6">
          {room.paused && (
            <StatusChip tone="warning" icon={Pause}>
              Paused
            </StatusChip>
          )}
          {seconds !== null && total > 0 && (
            <TimerRing seconds={seconds} total={total} size={80} label={room.phase} />
          )}
        </div>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-8 rounded-[var(--radius-card)] border border-line bg-surface p-6">
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
        <section className="mt-8 flex max-w-5xl flex-1 flex-col justify-center">
          <ScenarioCard headline={situation.headline} context={situation.context} large />
        </section>
      )}

      {room.phase === 'discussion' && room.pending_transfers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[20px] font-[650] text-navy">Deals struck this round</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {room.pending_transfers.map((t, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-2.5 text-[17px]"
              >
                <RoleBadge role={t.from} size="sm" />
                <ArrowRight size={18} strokeWidth={2} className="text-muted" aria-hidden="true" />
                <RoleBadge role={t.to} size="sm" />
                <span className="tabular ml-1 font-bold text-navy">{t.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {room.phase === 'locking' && (
        <section className="mt-10 flex flex-1 flex-col justify-center">
          <h2 className="text-[20px] font-[650] text-navy">Choosing now</h2>
          <div className="mt-4 grid grid-cols-4 gap-5">
            {ROLE_IDS.map((r) => {
              const seat = room.seats[r]
              const locked = !!seat?.locked
              const { color, light } = roleTheme(r)
              return (
                <div
                  key={r}
                  className="rounded-[var(--radius-card)] border px-6 py-8 text-center transition-[background-color,border-color] duration-[var(--t-interaction)]"
                  style={{
                    borderColor: locked ? color : 'var(--border)',
                    background: locked ? light : 'var(--surface)',
                  }}
                >
                  <div className="flex justify-center">
                    <RoleBadge role={r} />
                  </div>
                  <p className="mt-4 flex items-center justify-center gap-2 text-[22px] font-[650] text-navy">
                    {locked ? (
                      <>
                        <CircleCheckBig size={22} strokeWidth={2} className="text-positive" aria-hidden="true" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Hourglass size={22} strokeWidth={2} className="text-muted" aria-hidden="true" />
                        Choosing
                      </>
                    )}
                  </p>
                  <p className="mt-2 truncate text-[15px] text-muted">{seat?.name}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {showing && (room.phase === 'reveal' || room.phase === 'resolution') && (
        <section className="mt-8 flex flex-1 flex-col justify-center">
          <div className="grid grid-cols-4 gap-5">
            {ROLE_IDS.map((r) => {
              const id = showing[r]
              if (!id) return null
              const action = actionById(id)
              return (
                <Card key={r} className="p-5">
                  <RoleBadge role={r} size="sm" />
                  <h3 className="mt-2.5 text-[20px] leading-[1.25] font-[650] text-navy">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-6 text-body">
                    {action.summary}
                  </p>
                </Card>
              )
            })}
          </div>

          {fired.length > 0 && (
            <div className="mt-6 space-y-3">
              {fired.map((s) => {
                const up = s.kind === 'amplify'
                const Icon = up ? TrendingUp : TrendingDown
                return (
                  <div
                    key={s.id}
                    className="rounded-[var(--radius-card)] border px-6 py-4"
                    style={{
                      borderColor: up ? 'var(--positive)' : 'var(--negative)',
                      background: up ? '#F0FDF4' : '#FEF2F2',
                    }}
                  >
                    <p className="flex items-center gap-2.5 text-[20px] font-[650] text-navy">
                      <Icon
                        size={22}
                        strokeWidth={2}
                        style={{ color: up ? 'var(--positive)' : 'var(--negative)' }}
                        aria-hidden="true"
                      />
                      {s.title}
                    </p>
                    <p className="mt-1.5 text-[16px] leading-6 text-body">{s.description}</p>
                  </div>
                )
              })}
            </div>
          )}

          <p className="mt-auto max-w-5xl pt-8 text-[15px] leading-6 text-muted">
            <span className="font-[650] text-navy">The real story: </span>
            {situation.realStory}
          </p>
        </section>
      )}
    </main>
  )
}

function Frame({ children, hero = false }: { children: React.ReactNode; hero?: boolean }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-10 py-8">
      {hero && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] overflow-hidden">
          <CityHero className="absolute inset-0 h-full w-full opacity-55" />
          <div
            className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-canvas to-transparent"
            aria-hidden="true"
          />
        </div>
      )}
      <div className="screen-in relative w-full">{children}</div>
    </main>
  )
}
