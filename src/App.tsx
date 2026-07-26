/**
 * One build, two surfaces.
 *
 *   /              choose a surface (and, on a phone, join a room)
 *   /dashboard     the broadcast — TV or projector
 *   /play?room=X   the phone
 *
 * The phone is a PWA: no app store, no login, no install. A player types a
 * four-letter code and takes a seat.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ROLES, type Role } from './engine/types'
import type { Command } from './game/room'
import type { DashboardView, PhoneView } from './game/session'
import { ROLE_CHARACTER, ROLE_LABEL } from './game/session'
import type { Endgame } from './game/room'
import { createLocalTransport } from './net/local'
import type { ConnectionState, Snapshot, Transport } from './net/transport'
import { Dashboard } from './dashboard/Dashboard'
import { Phone } from './phone/Phone'
import { RoleGlyph } from './ui/primitives'
import './phone/phone.css'

type Surface = 'home' | 'dashboard' | 'phone'

function readRoute(): { surface: Surface; code: string; role: Role | null } {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const surface: Surface = path.startsWith('/dashboard')
    ? 'dashboard'
    : path.startsWith('/play')
      ? 'phone'
      : 'home'
  return {
    surface,
    code: (params.get('room') ?? '').toUpperCase(),
    role: (params.get('seat') as Role) ?? null,
  }
}

export function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onPop = () => setRoute(readRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = (url: string) => {
    window.history.pushState({}, '', url)
    setRoute(readRoute())
  }

  if (route.surface === 'dashboard') return <DashboardSurface code={route.code} />
  if (route.surface === 'phone' && route.code && route.role) {
    return <PhoneSurface code={route.code} role={route.role} />
  }
  return <Home go={go} />
}

/** Subscribes to a transport and re-renders on every snapshot. */
function useTransport(make: () => Transport) {
  const ref = useRef<Transport | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [connection, setConnection] = useState<ConnectionState>('connecting')

  useEffect(() => {
    const transport = make()
    ref.current = transport
    const offSnap = transport.onSnapshot(setSnapshot)
    const offConn = transport.onConnection(setConnection)
    return () => {
      offSnap()
      offConn()
      transport.close()
      ref.current = null
    }
    // The factory is intentionally called once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const send = useMemo(() => (cmd: Command) => ref.current?.send(cmd), [])
  return { snapshot, connection, send }
}

function DashboardSurface({ code }: { code: string }) {
  const { snapshot, send } = useTransport(() =>
    createLocalTransport({ kind: 'dashboard', code: code || undefined }),
  )

  // The dashboard is a broadcast, not an admin panel, so the facilitator
  // controls are keyboard-only and invisible: space starts and advances.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        send({ t: 'start' })
        send({ t: 'advance' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [send])

  if (!snapshot || snapshot.kind !== 'dashboard') return <Booting />
  const view = snapshot.view as DashboardView

  // Keep the URL carrying the room code so a reload rejoins the same session.
  if (!code && view.code) {
    window.history.replaceState({}, '', `/dashboard?room=${view.code}`)
  }

  return <Dashboard view={view} endgame={snapshot.endgame as Endgame | null} />
}

function PhoneSurface({ code, role }: { code: string; role: Role }) {
  const { snapshot, connection, send } = useTransport(() =>
    createLocalTransport({ kind: 'phone', code, role }),
  )
  const [name, setName] = useState('')

  if (!snapshot || snapshot.kind !== 'phone') {
    return <Booting phone />
  }
  const view = snapshot.view as PhoneView

  if (!view.name) {
    const c = ROLE_CHARACTER[role]
    return (
      <div className="phone" data-role={role} data-skin="role">
        <div className="pbody">
          <span className="plabel">{c.org.toUpperCase()}</span>
          <h1 className="pheading">Take a seat</h1>
          <p className="ptext">
            You are the <strong>{ROLE_LABEL[role]}</strong> — {c.name}.
          </p>
          <span className="plabel">YOUR NAME</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            maxLength={16}
            autoFocus
          />
          <button
            className="btn btn--primary"
            disabled={!name.trim()}
            onClick={() => send({ t: 'join', role, name: name.trim() })}
          >
            TAKE THE SEAT
          </button>
        </div>
      </div>
    )
  }

  return (
    <Phone view={view} endgame={snapshot.endgame as Endgame | null} connection={connection} send={send} />
  )
}

function Booting({ phone = false }: { phone?: boolean }) {
  return (
    <div className={phone ? 'phone' : 'dash'} data-role="government" data-skin="role">
      <div className="pbody">
        <span className="plabel">REPUBLIC OF SEMENANJARA</span>
        <h1 className="pheading">Connecting…</h1>
      </div>
    </div>
  )
}

/** The entry point: start a session, or join one. */
function Home({ go }: { go: (url: string) => void }) {
  const [code, setCode] = useState('')

  return (
    <div className="phone" data-role="government" data-skin="role">
      <div className="pbody">
        <span className="plabel">REPUBLIC OF SEMENANJARA</span>
        <h1 className="pbig">
          Journey
          <br />
          to Net Zero
        </h1>
        <div style={{ height: 6, background: 'var(--color-accent)', width: 96 }} />
        <p className="ptext">Six crises. Thirty minutes. Four of you, and none of you can do it alone.</p>

        <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
          RUNNING THE SESSION
        </span>
        <button className="btn btn--primary" onClick={() => go('/dashboard')}>
          OPEN THE BIG SCREEN
        </button>

        <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
          JOINING ON YOUR PHONE
        </span>
        <input
          className="field field--code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="CODE"
          maxLength={4}
          inputMode="text"
          autoCapitalize="characters"
        />
        {code.length === 4 ? (
          <>
            <span className="plabel">TAKE A SEAT</span>
            {ROLES.map((r) => (
              <button
                key={r}
                className="btn btn--ghost"
                onClick={() => go(`/play?room=${code}&seat=${r}`)}
              >
                <RoleGlyph role={r} size={14} /> {ROLE_LABEL[r]} — {ROLE_CHARACTER[r].name}
              </button>
            ))}
          </>
        ) : null}
      </div>
    </div>
  )
}
