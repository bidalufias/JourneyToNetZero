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
import { createTransport } from './net'
import type { ConnectionState, DeniedSnapshot, Snapshot, Transport } from './net/transport'
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
    // Keyed on the seat: changing room or chair has to build a new transport,
    // and without this React reuses the component and keeps the old one — so
    // picking a free seat after being refused would silently do nothing.
    return (
      <PhoneSurface
        key={`${route.code}:${route.role}`}
        code={route.code}
        role={route.role}
        go={go}
      />
    )
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
  const release = useMemo(() => () => ref.current?.release(), [])
  return { snapshot, connection, send, release }
}

function DashboardSurface({ code }: { code: string }) {
  const { snapshot, send } = useTransport(() =>
    createTransport({ kind: 'dashboard', code: code || undefined }),
  )

  // Read inside the key handler, which is registered once and must not go
  // stale as the session moves through its phases.
  const phaseRef = useRef<string>('lobby')
  if (snapshot?.kind === 'dashboard') phaseRef.current = (snapshot.view as DashboardView).phase

  /**
   * The dashboard is a broadcast, not an admin panel, so the facilitator
   * controls are keyboard-only and invisible: space starts and advances.
   *
   * One command per press, never two. Sending `start` and `advance` together
   * meant the very first press walked the room straight through the briefing
   * into the crisis, so the twenty seconds written to explain the game to four
   * people who have never seen it could not be reached at all.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      send({ t: phaseRef.current === 'lobby' ? 'start' : 'advance' })
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

function PhoneSurface({
  code,
  role,
  go,
}: {
  code: string
  role: Role
  go: (url: string) => void
}) {
  const { snapshot, connection, send, release } = useTransport(() =>
    createTransport({ kind: 'phone', code, role }),
  )
  const [name, setName] = useState('')

  const leave = () => {
    release()
    go('/')
  }

  if (snapshot?.kind === 'denied') {
    return <SeatRefused snapshot={snapshot} code={code} go={go} />
  }
  if (!snapshot || snapshot.kind !== 'phone') {
    return <Booting phone connection={connection} code={code} go={go} />
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
          <button className="btn btn--ghost" onClick={leave}>
            PICK A DIFFERENT SEAT
          </button>
        </div>
      </div>
    )
  }

  return (
    <Phone
      view={view}
      endgame={snapshot.endgame as Endgame | null}
      connection={connection}
      send={send}
      onLeave={leave}
    />
  )
}

/**
 * The seat is not available, or the room is not there.
 *
 * A refusal used to be indistinguishable from a slow network: the phone sat on
 * "Connecting…" for as long as the player was willing to wait. Four letters is
 * easy to mistype and a seat is easy to race somebody for, so both need an
 * answer and a way onward.
 */
function SeatRefused({
  snapshot,
  code,
  go,
}: {
  snapshot: DeniedSnapshot
  code: string
  go: (url: string) => void
}) {
  const free = snapshot.seats.filter((s) => !s.taken)
  return (
    <div className="phone" data-role="government" data-skin="role">
      <div className="pbody">
        <span className="plabel">ROOM {snapshot.code || code}</span>
        {snapshot.reason === 'no-room' ? (
          <>
            <h1 className="pheading">No room with that code.</h1>
            <p className="ptext">
              Check the four letters on the big screen — it is easy to read an O as a zero. They are
              always letters.
            </p>
          </>
        ) : snapshot.reason === 'bad-seat' ? (
          <>
            <h1 className="pheading">That is not one of the seats.</h1>
            <p className="ptext">The link looks wrong. Go back and pick a seat from the list.</p>
          </>
        ) : (
          <>
            <h1 className="pheading">Somebody is already in that seat.</h1>
            <p className="ptext">
              {free.length
                ? 'Take one of the free ones instead.'
                : 'All four seats are taken. Tell the facilitator — if somebody left, they can free their seat from the ⋯ menu.'}
            </p>
          </>
        )}

        {snapshot.seats.length ? (
          <>
            <span className="plabel">THE FOUR SEATS</span>
            {snapshot.seats.map((s) => (
              <button
                key={s.role}
                className="btn btn--ghost"
                disabled={s.taken}
                onClick={() => go(`/play?room=${snapshot.code || code}&seat=${s.role}`)}
              >
                <RoleGlyph role={s.role} size={14} /> {ROLE_LABEL[s.role]}
                {s.taken ? ` — ${s.name} is here` : ' — free'}
              </button>
            ))}
          </>
        ) : null}

        <button className="btn" style={{ marginTop: 'auto' }} onClick={() => go('/')}>
          START AGAIN
        </button>
      </div>
    </div>
  )
}

/**
 * Connecting, and — after a few seconds — a way out.
 *
 * The escape hatch matters more than the spinner. A phone that cannot reach the
 * room has no back button of its own, so without this the only exit is the
 * browser's, which drops the player out of the game entirely.
 */
function Booting({
  phone = false,
  connection = 'connecting',
  code,
  go,
}: {
  phone?: boolean
  connection?: ConnectionState
  code?: string
  go?: (url: string) => void
}) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), 6000)
    return () => clearTimeout(id)
  }, [])

  const stuck = slow || connection === 'unreachable'
  return (
    <div className={phone ? 'phone' : 'dash'} data-role="government" data-skin="role">
      <div className="pbody">
        <span className="plabel">REPUBLIC OF SEMENANJARA{code ? ` · ROOM ${code}` : ''}</span>
        <h1 className="pheading">{stuck ? 'Still trying…' : 'Connecting…'}</h1>
        {stuck ? (
          <>
            <p className="ptext">
              {connection === 'unreachable'
                ? 'The game server is not answering. Tell the facilitator — this one is not your phone.'
                : 'This is taking longer than it should. The big screen has to be open for the room to exist.'}
            </p>
            {go ? (
              <button className="btn btn--ghost" onClick={() => go('/')}>
                START AGAIN
              </button>
            ) : null}
          </>
        ) : null}
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
