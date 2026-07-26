import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Leaf, LogIn, Users } from 'lucide-react'
import { ROLES, ROLE_ORDER } from '../game/roles'
import type { RoleId } from '../game/types'
import { transport } from '../lib/transport'
import { useRoom } from '../store/useRoom'
import {
  BrandMark,
  Card,
  CityHero,
  PrimaryButton,
  RoleBadge,
  RoleCard,
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
      <div className="screen-in mx-auto flex min-h-dvh w-full max-w-[var(--content-max)] flex-col">
        {/* A Malaysian low-carbon city: rooftop solar, electric transit, a
            clean river and planted riverside. The title sits on open sky above
            it rather than over the buildings. */}
        <div className="relative w-full shrink-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#CFE6F9] via-[#E4F1FB] to-[#F5F9FC]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center px-5 pt-7 text-center">
            <BrandMark size={58} />
            <h1 className="mt-2 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-navy">
              Journey to
              <br />
              <span className="text-leaf-dark">Net </span>
              <span className="text-brand">Zero</span>
            </h1>
            <p className="mt-2 text-[13px] font-medium text-muted">
              Malaysia · 2026 — 2050
            </p>
          </div>
          <CityHero className="relative mt-3 block h-[172px] w-full" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-canvas"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-1 flex-col px-5 pb-6">
          {mode === 'idle' && (
            <>
              <Card>
                <div className="flex gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf-light text-leaf-dark"
                    aria-hidden="true"
                  >
                    <Leaf size={20} strokeWidth={2} />
                  </span>
                  <p className="text-[15px] leading-6 text-body">
                    Four stakeholders. Eight rounds. One country that has to
                    grow its economy, cut its emissions and improve people’s
                    lives — all at once.
                  </p>
                </div>
              </Card>

              {/* Two-up rather than four-across: "Government" does not fit in
                  a quarter of a 320px screen without being clipped. */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ROLE_ORDER.map((r) => (
                  <div
                    key={r}
                    className="rounded-[var(--radius-small)] border border-line bg-surface px-2.5 py-2.5"
                  >
                    <RoleBadge role={r} size="sm" />
                  </div>
                ))}
              </div>

              <div className="flex-1" />

              <div className="mt-6 space-y-3">
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
                <p className="pt-1 text-center text-[13px] leading-5 text-muted">
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
