import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, ROLE_ORDER } from '../game/roles'
import type { RoleId } from '../game/types'
import { transport } from '../lib/transport'
import { useRoom } from '../store/useRoom'

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
    <main className="relative min-h-dvh overflow-hidden">
      <div
        className="bg-drift pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, #17332f 0%, transparent 70%), radial-gradient(50% 40% at 80% 90%, #21453f 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-10">
        <header className="pt-6">
          <p className="text-xs font-medium tracking-[0.2em] text-mist-400 uppercase">
            Malaysia · 2026 — 2050
          </p>
          <h1 className="font-display mt-3 text-5xl leading-[0.95] font-semibold tracking-tight">
            Journey to
            <br />
            Net Zero
          </h1>
          <p className="mt-5 text-mist-300">
            Four stakeholders. Eight rounds. One country that has to grow its
            economy, cut its emissions and improve people’s lives — all at once.
          </p>
          <p className="mt-3 text-sm text-mist-400">
            There is no right answer. There is only what you are willing to
            trade, and who you are willing to trust.
          </p>
        </header>

        <div className="flex-1" />

        {mode === 'idle' && (
          <div className="space-y-3 pb-6">
            <button
              onClick={() => setMode('create')}
              className="w-full rounded-2xl bg-mist-100 px-6 py-4 text-lg font-semibold text-ink-900 transition active:scale-[0.98]"
            >
              Start a table
            </button>
            <button
              onClick={() => setMode('join')}
              className="card w-full px-6 py-4 text-lg font-medium transition active:scale-[0.98]"
            >
              Join with a code
            </button>
            <p className="pt-3 text-center text-xs text-mist-400">
              Best with four players in the same room, and a big screen for the
              board.
            </p>
          </div>
        )}

        {mode !== 'idle' && (
          <div className="space-y-5 pb-6">
            {mode === 'join' && (
              <label className="block">
                <span className="text-sm text-mist-300">Table code</span>
                <input
                  value={code}
                  onChange={(e) => void checkCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="ABCD"
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="tabular mt-2 w-full rounded-xl border border-mist-400/25 bg-ink-800 px-4 py-3 text-center text-3xl font-semibold tracking-[0.4em] outline-none focus:border-mist-300"
                />
                {lookupError && (
                  <span className="mt-2 block text-sm text-emissions">{lookupError}</span>
                )}
              </label>
            )}

            <label className="block">
              <span className="text-sm text-mist-300">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Aina"
                className="mt-2 w-full rounded-xl border border-mist-400/25 bg-ink-800 px-4 py-3 text-lg outline-none focus:border-mist-300"
              />
            </label>

            <div>
              <span className="text-sm text-mist-300">Choose your role</span>
              <div className="mt-2 space-y-2">
                {ROLE_ORDER.map((r) => {
                  const meta = ROLES[r]
                  const isTaken = taken.includes(r)
                  return (
                    <button
                      key={r}
                      disabled={isTaken}
                      onClick={() => setRole(r)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        role === r
                          ? 'border-mist-100 bg-ink-600'
                          : 'border-mist-400/20 bg-ink-800'
                      } ${isTaken ? 'opacity-35' : 'active:scale-[0.99]'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold" style={{ color: meta.accent }}>
                          {meta.name}
                        </span>
                        <span className="text-xs text-mist-400">
                          {isTaken ? 'taken' : meta.currency}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-mist-400">
                        {meta.blurb}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && <p className="text-sm text-emissions">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('idle')
                  setRole(null)
                }}
                className="card px-5 py-3"
              >
                Back
              </button>
              <button
                disabled={!role || busy || (mode === 'join' && code.length !== 4)}
                onClick={() => void submit()}
                className="flex-1 rounded-xl bg-mist-100 px-6 py-3 font-semibold text-ink-900 transition disabled:opacity-30 active:scale-[0.98]"
              >
                {busy ? 'One moment…' : mode === 'create' ? 'Create table' : 'Join'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
