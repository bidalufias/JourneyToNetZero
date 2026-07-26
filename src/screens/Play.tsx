import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  CircleCheckBig,
  Eye,
  EyeOff,
  Handshake,
  Hourglass,
  Lock,
  Monitor,
  Plus,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'
import { ActionCard, RevealCard } from '../components/ActionCard'
import { Meter } from '../components/Meter'
import { TimerRing, useCountdown } from '../components/Timer'
import { TransferPanel } from '../components/TransferPanel'
import { ReportCard } from '../components/ReportCard'
import { actionById } from '../game/actions'
import { agendaById } from '../game/agendas'
import { availableActions, spendable } from '../game/engine'
import { ROLES } from '../game/roles'
import { situationFor, TOTAL_ROUNDS } from '../game/situations'
import { ROLE_IDS } from '../game/types'
import { PHASE_SECONDS } from '../lib/config'
import { useRoom } from '../store/useRoom'
import {
  AppShell,
  BottomActionArea,
  Card,
  HowToPlay,
  LoadingState,
  PrimaryButton,
  ProgressIndicator,
  RoleBadge,
  RoleCard,
  ScenarioCard,
  ScreenHeader,
  Section,
  SecondaryButton,
  SkylineBand,
  StatusChip,
  TertiaryButton,
} from '../ui'

export default function Play() {
  const { code = '' } = useParams()
  const nav = useNavigate()
  const {
    room,
    me,
    myChoice,
    watch,
    tick,
    start,
    chooseAction,
    sendTransfer,
    extendDiscussion,
    advance,
    leave,
    addComputerPlayers,
    removeComputerPlayer,
  } = useRoom()

  useEffect(() => watch(code), [code, watch])

  // Every client ticks; the store decides who is allowed to act on it.
  useEffect(() => {
    const t = setInterval(() => void tick(), 1000)
    return () => clearInterval(t)
  }, [tick])

  const [showRules, setShowRules] = useState(false)
  const rules = <HowToPlay open={showRules} onClose={() => setShowRules(false)} />
  const openRules = () => setShowRules(true)

  const seconds = useCountdown(room?.phase_ends_at ?? null, room?.paused ?? false)

  if (!room || !me) {
    return (
      <Centre>
        <LoadingState>Finding your table…</LoadingState>
      </Centre>
    )
  }

  const seat = room.seats[me.role]
  if (!seat) {
    return (
      <Centre>
        <Card className="w-full max-w-[var(--content-max)] text-center">
          <p className="text-[15px] leading-6 text-body">
            You are no longer seated at this table.
          </p>
          <div className="mt-4">
            <PrimaryButton
              onClick={() => {
                leave()
                nav('/')
              }}
            >
              Back to start
            </PrimaryButton>
          </div>
        </Card>
      </Centre>
    )
  }

  const role = ROLES[me.role]
  const filled = ROLE_IDS.filter((r) => room.seats[r]).length

  /* ------------------------------------------------------------- lobby */
  if (room.phase === 'lobby') {
    const isHost = room.host_id === me.id
    return (
      <AppShell role={me.role} onHelp={openRules}>
        {rules}
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-center shadow-[var(--shadow-card)]">
          <p className="text-[12px] font-medium text-muted">Table code</p>
          <p className="tabular mt-1.5 text-[52px] leading-none font-bold tracking-[0.16em] text-brand">
            {code}
          </p>
          {filled < 4 ? (
            <p className="mt-3 text-[15px] leading-6 text-body">
              Share this with the other {['one', 'two', 'three'][3 - filled - 1]}{' '}
              player{4 - filled === 1 ? '' : 's'}.
            </p>
          ) : (
            <p className="mt-3 text-[15px] leading-6 text-body">
              Everyone is seated.
            </p>
          )}
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-navy">
            <Monitor size={15} strokeWidth={2} className="text-brand" aria-hidden="true" />
            Open /board/{code} on a big screen
          </p>
        </div>

        <Section title="At the table">
          <div className="space-y-3">
            {ROLE_IDS.map((r) => {
              const s = room.seats[r]
              return (
                <RoleCard
                  key={r}
                  role={r}
                  status={s?.bot ? undefined : s ? s.name : 'Waiting…'}
                  description={
                    s?.bot ? (
                      <span className="flex items-center justify-between gap-2">
                        <StatusChip tone="information" icon={Bot}>
                          Computer
                        </StatusChip>
                        {isHost && (
                          <button
                            type="button"
                            onClick={() => void removeComputerPlayer(r)}
                            className="-my-2 -mr-2 inline-flex h-12 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted transition-colors duration-[var(--t-interaction)] hover:bg-surface-2 hover:text-navy"
                          >
                            <X size={15} strokeWidth={2.25} aria-hidden="true" />
                            Open seat
                            <span className="sr-only">
                              for a player to take {ROLES[r].name}
                            </span>
                          </button>
                        )}
                      </span>
                    ) : undefined
                  }
                />
              )
            })}
          </div>
        </Section>

        <BottomActionArea>
          {isHost ? (
            <>
              {filled < 4 && (
                <>
                  <SecondaryButton icon={Bot} onClick={() => void addComputerPlayers()}>
                    Fill {4 - filled} seat{4 - filled === 1 ? '' : 's'} with the computer
                  </SecondaryButton>
                  <p className="text-center text-[13px] leading-5 text-muted">
                    A computer seat chooses at random from what it can afford,
                    and never opens a deal.
                  </p>
                </>
              )}
              <PrimaryButton
                disabled={filled < 4}
                trailingIcon={filled < 4 ? undefined : ArrowRight}
                onClick={() => void start()}
              >
                {filled < 4 ? `Waiting for ${4 - filled} more` : 'Begin — 2026'}
              </PrimaryButton>
            </>
          ) : (
            <p className="py-2 text-center text-[15px] text-muted" role="status">
              {filled < 4
                ? `Waiting for ${4 - filled} more player${4 - filled === 1 ? '' : 's'}…`
                : 'Ready. Waiting for the host to begin.'}
            </p>
          )}
        </BottomActionArea>
      </AppShell>
    )
  }

  /* ---------------------------------------------------------- briefing */
  if (room.phase === 'briefing') {
    const agenda = seat.agendaId ? agendaById(seat.agendaId) : null
    return (
      <AppShell role={me.role} onHelp={openRules}>
        {rules}
        <ScreenHeader
          eyebrow="You are"
          title={role.name}
          subtitle={
            <>
              <span className="block text-[13px] font-medium text-muted">
                {role.nameMs}
              </span>
              <span className="mt-2 block">{role.blurb}</span>
            </>
          }
          right={<RoleBadge role={me.role} showName={false} />}
        />

        <Section title={role.power.name} icon={Sparkles}>
          <Card>
            <p className="text-[15px] leading-6 text-body">
              {role.power.description}
            </p>
          </Card>
        </Section>

        {agenda && (
          <Section>
            <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface-2 p-4">
              <StatusChip tone="warning" icon={EyeOff}>
                Private — do not show anyone
              </StatusChip>
              <h2 className="mt-2.5 text-[17px] leading-[1.3] font-[650] text-navy">
                {agenda.title}
              </h2>
              <p className="mt-1.5 text-[15px] leading-6 text-body">
                {agenda.description}
              </p>
            </div>
          </Section>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-[15px] text-body">
          <Wallet size={17} strokeWidth={2} className="text-brand" aria-hidden="true" />
          <span>
            You hold{' '}
            <span className="font-[650] text-navy">
              {seat.currency} {role.currency}
            </span>
            .
          </span>
        </p>

        <BottomActionArea>
          {room.host_id === me.id ? (
            <PrimaryButton trailingIcon={ArrowRight} onClick={() => void advance()}>
              Start round 1
            </PrimaryButton>
          ) : (
            <p className="py-2 text-center text-[15px] text-muted" role="status">
              Waiting for the host…
            </p>
          )}
        </BottomActionArea>
      </AppShell>
    )
  }

  /* ----------------------------------------------------------- ending */
  if (room.phase === 'ending') {
    return (
      <AppShell
        role={me.role}
        onHelp={openRules}
        bleed={
          <div className="relative h-24 w-full overflow-hidden">
            <SkylineBand className="absolute inset-0 h-full w-full" />
            <div
              className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-canvas"
              aria-hidden="true"
            />
          </div>
        }
      >
        {rules}
        <ReportCard room={room} highlight={me.role} />
        {/* The report is long and meant to be read end to end, so Finish sits
            after it rather than floating over the debrief. */}
        <div className="mt-7">
          <TertiaryButton
            onClick={() => {
              leave()
              nav('/')
            }}
          >
            Finish
          </TertiaryButton>
        </div>
      </AppShell>
    )
  }

  /* ------------------------------------------------------- round loop */
  const situation = situationFor(room.round)
  const transfers = room.pending_transfers
  const purse = spendable(seat.currency, me.role, transfers)
  const options = availableActions(room.round, me.role, purse, transfers)
  const total = PHASE_SECONDS[room.phase as keyof typeof PHASE_SECONDS] ?? 0
  const waitingOn = ROLE_IDS.filter((r) => !room.seats[r]?.locked)

  return (
    <AppShell role={me.role} onHelp={openRules}>
      {rules}
      <ScreenHeader
        eyebrow={`Round ${room.round} of ${TOTAL_ROUNDS} · ${situation.year}`}
        title={situation.title}
        right={
          seconds !== null && total > 0 ? (
            <TimerRing seconds={seconds} total={total} label={phaseLabel(room.phase)} />
          ) : undefined
        }
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RoleBadge role={me.role} size="sm" />
        <ProgressIndicator current={room.round} total={TOTAL_ROUNDS} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Meter id="economy" value={room.indicators.economy} />
        <Meter id="emissions" value={room.indicators.emissions} />
        <Meter id="living" value={room.indicators.living} />
      </div>

      {(room.phase === 'situation' || room.phase === 'discussion') && (
        <div className="mt-5">
          <ScenarioCard headline={situation.headline} context={situation.context} />
        </div>
      )}

      {room.phase === 'discussion' && (
        <Section title="Strike a deal" icon={Handshake}>
          <div className="space-y-3">
            <TransferPanel
              me={me.role}
              seats={room.seats}
              transfers={transfers}
              onSend={(to, amount) => void sendTransfer(to, amount)}
            />
            {transfers.length > 0 && (
              <ul className="space-y-1.5">
                {transfers.map((t, i) => (
                  <li key={i} className="text-[13px] text-muted">
                    {ROLES[t.from].name} sent {t.amount} to {ROLES[t.to].name}
                  </li>
                ))}
              </ul>
            )}
            <TertiaryButton icon={Plus} onClick={() => void extendDiscussion()}>
              Need more time — add 45 seconds
            </TertiaryButton>
          </div>
        </Section>
      )}

      {room.phase === 'locking' && (
        <Section title="Your choice" icon={Lock}>
          <p className="mb-3 text-[15px] leading-6 text-body">
            Choose privately. Nobody sees this until all four are in.
          </p>
          <div className="space-y-3">
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
          </div>

          {seat.locked && (
            <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <div className="shimmer h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <span className="shimmer-bar" />
              </div>
              <p
                className="mt-3 flex items-center gap-2 text-[15px] font-medium text-navy"
                role="status"
              >
                <CircleCheckBig size={17} strokeWidth={2} className="text-positive" aria-hidden="true" />
                Locked in.
              </p>
              <p className="mt-2 text-[13px] text-muted">
                {waitingOn.length > 0 ? 'Waiting for' : 'Waiting for the reveal…'}
              </p>
              {waitingOn.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {waitingOn.map((r) => (
                    <li key={r}>
                      <StatusChip tone="role" role={r} icon={Hourglass}>
                        {ROLES[r].name}
                      </StatusChip>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Section>
      )}

      {(room.phase === 'reveal' || room.phase === 'resolution') && (
        <Section
          title={room.phase === 'reveal' ? 'What everyone chose' : 'How it landed'}
          icon={Eye}
        >
          <div className="space-y-3">
            {ROLE_IDS.map((r) => {
              const id = room.phase === 'reveal'
                ? room.pending_choices[r]
                : room.history.at(-1)?.choices[r]
              const s = room.seats[r]
              if (!id || !s) return null
              return <RevealCard key={r} action={actionById(id)} name={s.name} />
            })}
          </div>
          <p className="mt-4 rounded-[var(--radius-small)] bg-surface-2 p-3 text-[13px] leading-5 text-muted">
            {situation.realStory}
          </p>
        </Section>
      )}

      <div className="h-6" />
    </AppShell>
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

function Centre({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 text-center">
      {children}
    </main>
  )
}
