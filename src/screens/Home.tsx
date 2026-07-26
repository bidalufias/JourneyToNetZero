import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronRight, Clock, Leaf, LogIn, Users } from 'lucide-react'
import { ROLES, ROLE_ORDER } from '../game/roles'
import { TOTAL_ROUNDS } from '../game/situations'
import type { RoleId } from '../game/types'
import { transport } from '../lib/transport'
import { useRoom } from '../store/useRoom'
import {
  BrandMark,
  Card,
  CityHero,
  HowToPlay,
  PrimaryButton,
  RoleCard,
  RoleTile,
  SecondaryButton,
  TertiaryButton,
} from '../ui'

type Mode = 'idle' | 'create' | 'join'

export default function Home() {
  const nav = useNavigate()
  const { createRoom, joinRoom, busy, error } = useRoom()
  const [mode, setMode] = useState<Mode>('idle')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [role, setRole] = useState<RoleId | null>(null)
  const [taken, setTaken] = useState<RoleId[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)

  async function checkCode(next: string) {
    setCode(next)
    setLookupError(null)
    setTaken([])
    if (next.length !== 4) return
    const data = await transport.get(next).catch(() => null)
    if (!data) {
      setLookupError('No table with that code.')
      return
    }
    if (data.phase !== 'lobby') {
      setLookupError('That game has already started.')
      return
    }
    setTaken(ROLE_ORDER.filter((r) => data.seats[r]))
  }

  async function submit() {
    if (!role) return
    if (mode === 'create') {
      const created = await createRoom(name, role)
      if (created) nav(`/play/${created}`)
    } else {
      const ok = await joinRoom(code, name, role)
      if (ok) nav(`/play/${code}`)
    }
  }

  return (
    <main className="min-h-dvh bg-canvas">
      <HowToPlay open={showRules} onClose={() => setShowRules(false)} />
      <div className="screen-in mx-auto flex min-h-dvh w-full max-w-[var(--content-max)] flex-col">
        {/* A Malaysian low-carbon city — rooftop and utility-scale solar, an
            electric transit line, a clean river and a planted riverside walk —
            carrying the wordmark on open sky above it. */}
        <div className="relative w-full shrink-0">
          <CityHero
            className="block w-full"
            style={{ aspectRatio: '390 / 420' }}
          />
          {/* Keeps the wordmark legible over the skyline at every width. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-white/55 via-white/20 to-transparent"
            aria-hidden="true"
          />
          {/* The button in the stack below is past the fold on a phone, so the
              rules also get a control that is always on screen — in the same
              corner they sit in during the game. */}
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="absolute top-2 right-2 z-10 inline-flex h-12 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-navy/80 transition-colors duration-[var(--t-interaction)] hover:bg-surface/80 hover:text-navy active:scale-[0.97]"
          >
            <BookOpen size={16} strokeWidth={2} className="text-brand" aria-hidden="true" />
            How to play
          </button>

          <div className="absolute inset-x-0 top-0 flex flex-col items-center px-5 pt-[5%] text-center">
            <BrandMark size={70} />
            <h1
              className="mt-3 font-bold tracking-[-0.025em] text-navy"
              style={{ fontSize: 'clamp(33px, 10.4vw, 46px)', lineHeight: 1.06 }}
            >
              Journey to
              <br />
              <span className="text-leaf-dark">Net </span>
              <span className="text-brand">Zero</span>
            </h1>
            <p className="mt-2.5 text-[13px] font-medium text-muted">
              Malaysia · 2026 — 2050
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-6">
          {mode === 'idle' && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {ROLE_ORDER.map((r) => (
                  <RoleTile key={r} role={r} />
                ))}
              </div>

              <div className="mt-3">
                <Card>
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-leaf-light text-leaf-dark"
                      aria-hidden="true"
                    >
                      <Leaf size={21} strokeWidth={2} />
                    </span>
                    <p className="text-[15px] leading-6 text-body">
                      Four stakeholders. Eight rounds. One country that has to
                      grow its economy, cut its emissions and improve people’s
                      lives — all at once.
                    </p>
                  </div>
                </Card>
              </div>

              <div className="flex-1" />

              <div className="mt-5 space-y-3">
                <PrimaryButton
                  icon={Users}
                  trailingIcon={ChevronRight}
                  onClick={() => setMode('create')}
                >
                  Start a table
                </PrimaryButton>
                <SecondaryButton
                  icon={LogIn}
                  trailingIcon={ChevronRight}
                  onClick={() => setMode('join')}
                >
                  Join with a code
                </SecondaryButton>
                <TertiaryButton icon={BookOpen} onClick={() => setShowRules(true)}>
                  How to play
                </TertiaryButton>

                {/* The table size and the round count, both read from the game
                    rather than written here. */}
                <div className="flex items-center justify-center gap-4 rounded-[var(--radius-small)] border border-line bg-surface px-4 py-3">
                  <span className="flex items-center gap-2 text-[14px] text-body">
                    <Users size={17} strokeWidth={2} className="text-brand" aria-hidden="true" />
                    <span className="tabular font-bold text-navy">
                      {ROLE_ORDER.length}
                    </span>
                    Players
                  </span>
                  <span className="h-4 w-px bg-line-strong" aria-hidden="true" />
                  <span className="flex items-center gap-2 text-[14px] text-body">
                    <Clock size={17} strokeWidth={2} className="text-leaf-dark" aria-hidden="true" />
                    <span className="tabular font-bold text-navy">{TOTAL_ROUNDS}</span>
                    Rounds
                  </span>
                </div>

                <p className="pt-0.5 text-center text-[13px] leading-5 text-muted">
                  Best with four players in the same room, and a big screen for
                  the board.
                </p>
              </div>
            </>
          )}

          {mode !== 'idle' && (
            <div className="space-y-5">
              <p className="text-[15px] leading-6 text-body">
                There is no right answer. There is only what you are willing to
                trade, and who you are willing to trust.
              </p>

              {mode === 'join' && (
                <div>
                  <label
                    htmlFor="table-code"
                    className="block text-[13px] font-medium text-navy"
                  >
                    Table code
                  </label>
                  <input
                    id="table-code"
                    value={code}
                    onChange={(e) =>
                      void checkCode(e.target.value.toUpperCase().slice(0, 4))
                    }
                    placeholder="ABCD"
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-invalid={!!lookupError}
                    aria-describedby={lookupError ? 'code-error' : undefined}
                    className="tabular mt-2 h-14 w-full rounded-[var(--radius-button)] border border-line-strong bg-surface px-4 text-center text-[28px] font-bold tracking-[0.3em] text-navy outline-none placeholder:text-muted/50 focus:border-brand"
                  />
                  {lookupError && (
                    <p id="code-error" className="mt-2 text-[13px] font-medium text-negative">
                      {lookupError}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="player-name"
                  className="block text-[13px] font-medium text-navy"
                >
                  Your name
                </label>
                <input
                  id="player-name"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  placeholder="Aina"
                  className="mt-2 h-14 w-full rounded-[var(--radius-button)] border border-line-strong bg-surface px-4 text-[16px] text-navy outline-none placeholder:text-muted/60 focus:border-brand"
                />
              </div>

              <div>
                <span className="block text-[13px] font-medium text-navy">
                  Choose your role
                </span>
                <div className="mt-2 space-y-3">
                  {ROLE_ORDER.map((r) => {
                    const isTaken = taken.includes(r)
                    return (
                      <RoleCard
                        key={r}
                        role={r}
                        selected={role === r}
                        disabled={isTaken}
                        status={isTaken ? 'Taken' : ROLES[r].currency}
                        description={ROLES[r].blurb}
                        onSelect={() => setRole(r)}
                      />
                    )
                  })}
                </div>
              </div>

              {error && (
                <p role="alert" className="text-[13px] font-medium text-negative">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <TertiaryButton
                  icon={ArrowLeft}
                  fullWidth={false}
                  className="shrink-0"
                  onClick={() => {
                    setMode('idle')
                    setRole(null)
                  }}
                >
                  Back
                </TertiaryButton>
                <PrimaryButton
                  disabled={!role || busy || (mode === 'join' && code.length !== 4)}
                  onClick={() => void submit()}
                >
                  {busy ? 'One moment…' : mode === 'create' ? 'Create table' : 'Join'}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
