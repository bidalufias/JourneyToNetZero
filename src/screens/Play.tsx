import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ActionCard, RevealCard } from '../components/ActionCard'
import { Meter } from '../components/Meter'
import { TimerRing, useCountdown } from '../components/Timer'
import { TransferPanel } from '../components/TransferPanel'
import { ReportCard } from '../components/ReportCard'
import { actionById } from '../game/actions'
import { agendaById } from '../game/agendas'
import { availableActions } from '../game/engine'
import { ROLES } from '../game/roles'
import { situationFor, TOTAL_ROUNDS } from '../game/situations'
import type { RoleId } from '../game/types'
import { ROLE_IDS } from '../game/types'
import { PHASE_SECONDS } from '../lib/config'
import { useRoom } from '../store/useRoom'

export default function Play() {
  const { code = '' } = useParams()
  const nav = useNavigate()
  const { room, me, myChoice, watch, tick, start, chooseAction, sendTransfer, extendDiscussion, advance, leave } =
    useRoom()

  useEffect(() => watch(code), [code, watch])

  // Every client ticks; the store decides who is allowed to act on it.
  useEffect(() => {
    const t = setInterval(() => void tick(), 1000)
    return () => clearInterval(t)
  }, [tick])

  const seconds = useCountdown(room?.phase_ends_at ?? null, room?.paused ?? false)

  if (!room || !me) {
    return (
      <Centre>
        <p className="text-mist-300">Finding your table…</p>
      </Centre>
    )
  }

  const seat = room.seats[me.role]
  if (!seat) {
    return (
      <Centre>
        <p className="text-mist-300">You are no longer seated at this table.</p>
        <button
          onClick={() => {
            leave()
            nav('/')
          }}
          className="mt-4 rounded-xl bg-mist-100 px-5 py-2.5 font-semibold text-ink-900"
        >
          Back to start
        </button>
      </Centre>
    )
  }

  const role = ROLES[me.role]
  const filled = ROLE_IDS.filter((r) => room.seats[r]).length

  /* ------------------------------------------------------------- lobby */
  if (room.phase === 'lobby') {
    const isHost = room.host_id === me.id
    return (
      <Shell role={me.role}>
        <p className="text-xs tracking-[0.2em] text-mist-400 uppercase">Table code</p>
        <p className="tabular mt-2 text-6xl font-semibold tracking-[0.2em]">{code}</p>
        <p className="mt-3 text-sm text-mist-300">
          Share this with the other three players. Open{' '}
          <span className="text-mist-100">/board/{code}</span> on a big screen so
          everyone can follow along.
        </p>

        <div className="mt-8 space-y-2">
          {ROLE_IDS.map((r) => {
            const s = room.seats[r]
            return (
              <div
                key={r}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  s ? 'border-mist-400/25 bg-ink-700' : 'border-dashed border-mist-400/20'
                }`}
              >
                <span className="font-medium" style={{ color: ROLES[r].accent }}>
                  {ROLES[r].name}
                </span>
                <span className="text-sm text-mist-400">
                  {s ? s.name : 'waiting…'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-8">
          {isHost ? (
            <button
              disabled={filled < 4}
              onClick={() => void start()}
              className="w-full rounded-2xl bg-mist-100 px-6 py-4 text-lg font-semibold text-ink-900 disabled:opacity-30"
            >
              {filled < 4 ? `Waiting for ${4 - filled} more` : 'Begin — 2026'}
            </button>
          ) : (
            <p className="text-center text-sm text-mist-400">
              {filled < 4
                ? `Waiting for ${4 - filled} more player${4 - filled === 1 ? '' : 's'}…`
                : 'Ready. Waiting for the host to begin.'}
            </p>
          )}
        </div>
      </Shell>
    )
  }

  /* ---------------------------------------------------------- briefing */
  if (room.phase === 'briefing') {
    const agenda = seat.agendaId ? agendaById(seat.agendaId) : null
    return (
      <Shell role={me.role}>
        <p className="text-xs tracking-[0.2em] text-mist-400 uppercase">You are</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight" style={{ color: role.accent }}>
          {role.name}
        </h1>
        <p className="text-sm text-mist-400">{role.nameMs}</p>
        <p className="mt-4 leading-relaxed text-mist-300">{role.blurb}</p>

        <div className="card mt-6 p-4">
          <h2 className="text-sm font-semibold">{role.power.name}</h2>
          <p className="mt-1 text-sm leading-relaxed text-mist-300">
            {role.power.description}
          </p>
        </div>

        {agenda && (
          <div className="mt-4 rounded-2xl border border-dashed border-mist-100/40 bg-ink-700 p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-mist-400 uppercase">
              Private — do not show anyone
            </p>
            <h2 className="mt-2 font-semibold">{agenda.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-mist-300">
              {agenda.description}
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-mist-400">
          You hold <span className="text-mist-100">{seat.currency} {role.currency}</span>.
        </p>

        {room.host_id === me.id ? (
          <button
            onClick={() => void advance()}
            className="mt-4 w-full rounded-2xl bg-mist-100 px-6 py-4 font-semibold text-ink-900"
          >
            Start round 1
          </button>
        ) : (
          <p className="mt-4 text-center text-sm text-mist-400">
            Waiting for the host…
          </p>
        )}
      </Shell>
    )
  }

  /* ----------------------------------------------------------- ending */
  if (room.phase === 'ending') {
    return (
      <Shell role={me.role}>
        <ReportCard room={room} highlight={me.role} />
        <button
          onClick={() => {
            leave()
            nav('/')
          }}
          className="mt-6 w-full rounded-2xl bg-mist-100 px-6 py-4 font-semibold text-ink-900"
        >
          Finish
        </button>
      </Shell>
    )
  }

  /* ------------------------------------------------------- round loop */
  const situation = situationFor(room.round)
  const transfers = room.pending_transfers
  const options = availableActions(room.round, me.role, seat.currency, transfers)
  const total = PHASE_SECONDS[room.phase as keyof typeof PHASE_SECONDS] ?? 0

  return (
    <Shell role={me.role}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-mist-400 uppercase">
            Round {room.round} of {TOTAL_ROUNDS} · {situation.year}
          </p>
          <h1 className="mt-1 text-2xl leading-tight font-semibold tracking-tight">
            {situation.title}
          </h1>
        </div>
        {seconds !== null && total > 0 && (
          <TimerRing seconds={seconds} total={total} label={phaseLabel(room.phase)} />
        )}
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Meter id="economy" value={room.indicators.economy} />
        <Meter id="emissions" value={room.indicators.emissions} />
        <Meter id="living" value={room.indicators.living} />
      </div>

      {(room.phase === 'situation' || room.phase === 'discussion') && (
        <>
          <p className="mt-5 text-lg leading-snug font-medium">{situation.headline}</p>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            {situation.context}
          </p>
        </>
      )}

      {room.phase === 'discussion' && (
        <div className="mt-5 space-y-4">
          <TransferPanel
            me={me.role}
            seats={room.seats}
            onSend={(to, amount) => void sendTransfer(to, amount)}
          />
          {transfers.length > 0 && (
            <ul className="space-y-1 text-xs text-mist-400">
              {transfers.map((t, i) => (
                <li key={i}>
                  {ROLES[t.from].name} sent {t.amount} to {ROLES[t.to].name}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => void extendDiscussion()}
            className="card w-full py-3 text-sm"
          >
            Need more time — add 45 seconds
          </button>
        </div>
      )}

      {room.phase === 'locking' && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-mist-300">
            Choose privately. Nobody sees this until all four are in.
          </p>
          {options.map(({ action, playable, reason }) => (
            <ActionCard
              key={action.id}
              action={action}
              playable={playable && !seat.locked}
              reason={reason}
              selected={myChoice === action.id}
              onSelect={() => void chooseAction(action.id)}
            />
          ))}
          {seat.locked && (
            <p className="pt-1 text-center text-sm text-living">
              Locked in. Waiting for{' '}
              {ROLE_IDS.filter((r) => !room.seats[r]?.locked)
                .map((r) => ROLES[r].name)
                .join(', ') || 'the reveal'}
              …
            </p>
          )}
        </div>
      )}

      {(room.phase === 'reveal' || room.phase === 'resolution') && (
        <div className="mt-5 space-y-3">
          <h2 className="text-sm tracking-[0.18em] text-mist-400 uppercase">
            {room.phase === 'reveal' ? 'What everyone chose' : 'How it landed'}
          </h2>
          {ROLE_IDS.map((r) => {
            const id = room.phase === 'reveal'
              ? room.pending_choices[r]
              : room.history.at(-1)?.choices[r]
            const s = room.seats[r]
            if (!id || !s) return null
            return <RevealCard key={r} action={actionById(id)} name={s.name} />
          })}
          <p className="pt-1 text-center text-xs text-mist-400">
            {situation.realStory}
          </p>
        </div>
      )}

      <div className="h-8" />
    </Shell>
  )
}

function phaseLabel(phase: string): string {
  return (
    {
      situation: 'read',
      discussion: 'discuss',
      locking: 'choose',
      reveal: 'reveal',
      resolution: 'results',
    }[phase] ?? ''
  )
}

function Shell({ children, role }: { children: React.ReactNode; role: RoleId }) {
  return (
    <main className="min-h-dvh">
      <div
        className="h-1 w-full"
        style={{ background: ROLES[role].accent }}
        aria-hidden
      />
      <div className="mx-auto w-full max-w-lg px-5 py-6">{children}</div>
    </main>
  )
}

function Centre({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      {children}
    </main>
  )
}
