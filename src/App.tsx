/**
 * One build, three surfaces.
 *
 *   /               choose a surface (and, on a phone, join a room)
 *   /dashboard      the broadcast, on a TV or projector
 *   /play?room=X    the phone; with &seat=Y it goes straight to that chair
 *   /facilitator    the run of show, for the person holding the session
 *
 * The phone is a PWA: no app store, no login, no install. A player types a
 * four-letter code and takes a seat, or scans the code off the big screen,
 * which lands on the same page with the letters already in the box.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ROLES, type Role } from './engine/types'
import type { Command } from './game/room'
import type { DashboardView, PhoneView } from './game/session'
import { ROLE_LABEL } from './game/session'
import { RoleCard } from './ui/RoleCard'
import type { Endgame } from './game/room'
import { createTransport } from './net'
import type { ConnectionState, DeniedSnapshot, Snapshot, Transport } from './net/transport'
import { Dashboard } from './dashboard/Dashboard'
import { FacilitatorControls, PausedBanner, nextStep } from './dashboard/Controls'
import { JoinOverlay } from './dashboard/Join'
import { Facilitator, FacilitatorWindow } from './facilitator/Facilitator'
import { useFacilitatorLink } from './facilitator/link'
import { Phone } from './phone/Phone'
import { RoleGlyph } from './ui/primitives'
import { HOW_TO_PLAY_URL, facilitatorUrl, howToPlayUrl } from './ui/links'
import { canHostSession, measureDevice } from './ui/device'
import './phone/phone.css'

type Surface = 'home' | 'dashboard' | 'phone' | 'facilitator'

function readRoute(): { surface: Surface; code: string; role: Role | null; ready: boolean } {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const surface: Surface = path.startsWith('/dashboard')
    ? 'dashboard'
    : path.startsWith('/facilitator')
      ? 'facilitator'
      : path.startsWith('/play')
        ? 'phone'
        : 'home'
  return {
    surface,
    code: (params.get('room') ?? '').toUpperCase(),
    role: (params.get('seat') as Role) ?? null,
    // Set by the guide's way back in. It means the read-first choice has
    // already been answered, so asking it again would be a loop.
    ready: params.get('ready') === '1',
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
  if (route.surface === 'facilitator') return <FacilitatorWindow code={route.code} />
  if (route.surface === 'phone' && route.code && route.role) {
    // Keyed on the seat: changing room or chair has to build a new transport,
    // and without this React reuses the component and keeps the old one, so
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
  // A scanned QR carries the room but no seat, and lands here with the four
  // letters already filled in: the join page, minus the typing.
  return <Home go={go} initialCode={route.code} ready={route.ready} />
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
  const dash = snapshot?.kind === 'dashboard' ? snapshot : null
  const view = dash ? (dash.view as DashboardView) : null

  /** What is over the broadcast, if anything. One at a time. */
  const [overlay, setOverlay] = useState<'none' | 'qr' | 'script'>('none')

  // Publishes the session to a facilitator window, and accepts start/advance
  // back from it, the same two commands the spacebar sends.
  const facilitatorState = useFacilitatorLink(view, send)

  // Read inside the key handler, which is registered once and must not go
  // stale as the session moves through its phases.
  const phaseRef = useRef<DashboardView['phase']>('lobby')
  const codeRef = useRef<string>(code)
  const pausedRef = useRef<boolean>(false)
  if (view) {
    phaseRef.current = view.phase
    codeRef.current = view.code
    pausedRef.current = view.paused
  }

  /** Space and N both mean "on you go"; the lobby's version of that is start. */
  const step = () => {
    const next = nextStep(phaseRef.current)
    if (!next) return
    // A fresh room, not a reload: the URL carries the old code, and reloading
    // it walks straight back into the session that just ended.
    if (next.cmd === 'new') {
      window.location.assign('/dashboard')
      return
    }
    send({ t: next.cmd })
  }
  const togglePause = () => send({ t: pausedRef.current ? 'resume' : 'pause' })

  /**
   * The dashboard is a broadcast, not an admin panel, so the facilitator
   * controls are keys as well as the two buttons that fade in and out of the
   * corner: space or N starts and advances, P stops the clock and starts it
   * again, Q puts the join code up for a latecomer, F opens the script in its
   * own window.
   *
   * One command per press, never two. Sending `start` and `advance` together
   * meant the very first press walked the room straight through the briefing
   * into the crisis, so the twenty seconds written to explain the game to four
   * people who have never seen it could not be reached at all.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.code === 'Space' || e.key.toLowerCase() === 'n' || e.key === 'ArrowRight') {
        e.preventDefault()
        step()
        return
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        togglePause()
        return
      }
      if (e.key === 'Escape') {
        setOverlay('none')
        return
      }
      if (e.key.toLowerCase() === 'q') {
        e.preventDefault()
        setOverlay((o) => (o === 'qr' ? 'none' : 'qr'))
        return
      }
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault()
        openScript(codeRef.current, () => setOverlay((o) => (o === 'script' ? 'none' : 'script')))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [send])

  if (!view) return <Booting />

  // Keep the URL carrying the room code so a reload rejoins the same session.
  if (!code && view.code) {
    window.history.replaceState({}, '', `/dashboard?room=${view.code}`)
  }

  return (
    <>
      <Dashboard
        view={view}
        endgame={dash!.endgame as Endgame | null}
        onShowQr={() => setOverlay('qr')}
        onOpenScript={() => openScript(view.code, () => setOverlay('script'))}
      />
      {/* Outside `Dashboard` on purpose: it returns early for the attract, the
          briefing and both endings, and the whole point of these two is that
          they are on every screen without exception. */}
      {view.paused ? <PausedBanner /> : null}
      <FacilitatorControls
        phase={view.phase}
        paused={view.paused}
        onPause={togglePause}
        onNext={step}
      />
      {overlay === 'qr' ? (
        <JoinOverlay code={view.code} onClose={() => setOverlay('none')} />
      ) : null}
      {/* The fallback for a blocked pop-up. It covers the projector, which is
          why it is the second choice rather than the first. */}
      {overlay === 'script' ? (
        <div className="fac--overlay">
          <Facilitator
            code={view.code}
            state={facilitatorState}
            onCommand={(cmd) => send({ t: cmd })}
            onClose={() => setOverlay('none')}
          />
        </div>
      ) : null}
    </>
  )
}

/**
 * The script belongs on the facilitator's own screen, not on the projector.
 *
 * A separate window can be dragged to the laptop display while the game stays
 * full-screen on the extended one, which is how these rooms are actually set
 * up. Pop-up blockers being what they are, a refusal falls back to an overlay
 * rather than to nothing.
 */
function openScript(code: string, fallback: () => void) {
  // No `noopener` here: with it, `window.open` returns null by definition, and
  // a null return is how a blocked pop-up is detected, and every open would look
  // like a refusal and raise the overlay over the projector as well.
  const opened = window.open(facilitatorUrl(code), 'jtnz-facilitator', 'width=560,height=900')
  if (!opened) fallback()
  else opened.focus()
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
    return (
      <div className="phone" data-role={role} data-skin="role">
        <div className="pbody">
          <span className="plabel">TAKE A SEAT</span>
          <h1 className="pheading">This is your seat.</h1>
          <RoleCard role={role} lines="seat" />
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
            TAKE THIS SEAT
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
              Check the four letters on the big screen. It is easy to read an O as a zero. They are
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
                : 'All four seats are taken. Tell the facilitator. If somebody left, they can free their seat from the ⋯ menu.'}
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
                {s.taken ? ` · ${s.name} is here` : ' · free'}
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
 * Connecting, and, after a few seconds, a way out.
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
                ? 'The game server is not answering. Tell the facilitator. This one is not your phone.'
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

/**
 * The entry point: start a session, or join one.
 *
 * `initialCode` is what a scanned QR carries. Filling the box rather than
 * skipping it keeps one page for both routes: the scanner sees the same four
 * letters everyone else is being told out loud, and can still correct them if
 * they scanned the wrong room's code off somebody's laptop.
 */
function Home({
  go,
  initialCode = '',
  ready = false,
}: {
  go: (url: string) => void
  initialCode?: string
  ready?: boolean
}) {
  const [code, setCode] = useState(initialCode.slice(0, 4))
  // Arriving with a code means a camera brought you here. Lead with the seats:
  // that player is not looking for a projector, they are looking for a chair.
  const scanned = Boolean(initialCode)

  // Only a laptop, a desktop or a tablet is offered the big screen. A phone is
  // a player's phone: the dashboard is unreadable at that size, and the button
  // that starts and ends the session does not belong in a player's hand.
  // Measured once on mount, because nothing here changes device mid-session.
  const [canHost] = useState(() => {
    const { finePointer, shortestSide } = measureDevice()
    return canHostSession(finePointer, shortestSide)
  })

  // Somebody who scanned a code is asked one question before anything else:
  // read the rules, or sit down. They arrive knowing nothing, and the guide is
  // the only place that explains the game before it starts happening to them.
  // `ready` is the guide sending them back, so the question is not repeated.
  const [answered, setAnswered] = useState(ready)
  if (scanned && !answered) {
    return <ScanChoice code={code} onProceed={() => setAnswered(true)} />
  }

  const joining = (
    <>
      <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
        {scanned ? 'YOUR ROOM' : 'JOINING ON YOUR PHONE'}
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
            <button key={r} className="seatpick" onClick={() => go(`/play?room=${code}&seat=${r}`)}>
              <RoleCard role={r} lines="seat" />
            </button>
          ))}
        </>
      ) : null}
    </>
  )

  // No route to the facilitator's script from here. This page is what four
  // players see, three of whom scanned a code off a wall, and a button
  // offering them the host's lines is an invitation to read the crib sheet for
  // a game that works because nobody has seen it before. The script belongs to
  // the big screen, which is the one surface only the facilitator ever opens.
  const running = canHost ? (
    <>
      <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
        RUNNING THE SESSION
      </span>
      <button
        className={scanned ? 'btn btn--ghost' : 'btn btn--primary'}
        onClick={() => go('/dashboard')}
      >
        OPEN THE BIG SCREEN
      </button>
    </>
  ) : null

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
        <p className="ptext">Six crises. Thirty-five minutes. Four of you, and none of you can do it alone.</p>

        {scanned ? joining : running}
        {scanned ? running : joining}

        {/* Last, and quiet. Nobody has to read it to play, because the phone
            teaches the game as it goes, but the person who wants the rules before
            they sit down should not have to ask for them. */}
        <span className="plabel" style={{ marginTop: 'var(--space-6)' }}>
          NEW TO IT
        </span>
        <a className="btn btn--ghost" href={HOW_TO_PLAY_URL} target="_blank" rel="noreferrer">
          HOW TO PLAY
        </a>
      </div>
    </div>
  )
}

/**
 * The one question a scanned code asks before anything else.
 *
 * Three of the four players arrive by pointing a camera at a wall, knowing
 * nothing. Before this they landed straight on a seat list, which is a decision
 * about a role they have not been told anything about yet, taken under the
 * social pressure of three other people already choosing.
 *
 * The guide opens in this tab rather than a new one. It is a long read, and the
 * point of it is to come back: a second tab leaves the player to find their own
 * way to a chair, which is exactly the thing they did not know how to do.
 */
function ScanChoice({ code, onProceed }: { code: string; onProceed: () => void }) {
  return (
    <div className="phone" data-role="government" data-skin="role">
      <div className="pbody">
        <span className="plabel">REPUBLIC OF SEMENANJARA{code ? ` · ROOM ${code}` : ''}</span>
        <h1 className="pbig">
          Journey
          <br />
          to Net Zero
        </h1>
        <div style={{ height: 6, background: 'var(--color-accent)', width: 96 }} />
        <p className="ptext">
          Six crises. Thirty-five minutes. Four of you, and none of you can do it alone.
        </p>

        <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
          FIRST TIME?
        </span>
        <a className="btn btn--ghost" href={howToPlayUrl(code)}>
          HOW TO PLAY
        </a>
        <p className="pnote">The full rules. You can come back here after.</p>

        <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
          READY
        </span>
        <button className="btn btn--primary" onClick={onProceed}>
          JOIN THE GAME
        </button>
        <p className="pmono">PICK YOUR SEAT. YOUR PHONE WILL TEACH YOU THE REST.</p>
      </div>
    </div>
  )
}
