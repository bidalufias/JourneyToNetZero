/**
 * The authoritative room, running server-side.
 *
 * This is the only thing in the system that reads or writes room state. It
 * imports the very same reducer the tests exercise (`src/game/room.ts`) — the
 * module has no React, DOM or transport imports precisely so it can run here
 * unchanged, which is what makes "all game logic server-side" a fact about the
 * code rather than a claim in a README.
 *
 * The contract with clients is narrow on purpose:
 *
 *   create   → a new room, and the dashboard's token
 *   claim    → take a named seat, and get the token that proves you hold it
 *   view     → the view for the seat your token proves you hold, and nothing else
 *   cmd      → apply one command as that seat
 *   tick     → advance the clock (the server uses its own, never the caller's)
 *
 * A phone's token buys it exactly one `PhoneView`. It cannot ask for the room,
 * another seat's view, or another player's insider tip, because no code path
 * here will build one for it.
 *
 * This file is never deployed directly: Deno cannot resolve the extensionless
 * imports into `src/`, so `npm run build:function` bundles it into
 * `supabase/functions/room/index.ts`, which is what the CLI and the dashboard
 * actually deploy.
 */
import { loadContent } from '../../../src/engine/content'
import { ROLES, type Content, type Role } from '../../../src/engine/types'
import {
  apply,
  createRoom,
  dashboardView,
  endgame,
  phoneView,
  tick,
  type Command,
} from '../../../src/game/room'
import type { Room } from '../../../src/game/session'
import { PACK_GZIP_B64 } from './content.gen.ts'

declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (r: Request) => Promise<Response> | Response): void }

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/**
 * The content pack, unpacked once at boot.
 *
 * It ships compressed and embedded rather than fetched, because every option's
 * effects live in it: any URL a client could reach would hand a player the
 * numbers the whole design works to keep from them.
 */
async function unpackContent(): Promise<Content> {
  const bytes = Uint8Array.from(atob(PACK_GZIP_B64), (c) => c.charCodeAt(0))
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return loadContent(JSON.parse(await new Response(stream).text()))
}

const content: Content = await unpackContent()

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

// ── Storage ────────────────────────────────────────────────────────────────

async function rest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

/** `Set` does not survive JSON, so flags are stored as an array. */
function serialise(room: Room): unknown {
  return { ...room, game: { ...room.game, flags: [...room.game.flags] } }
}

function deserialise(raw: unknown): Room {
  const room = raw as Room & { game: { flags: string[] } }
  room.game.flags = new Set(room.game.flags) as never
  return room as Room
}

async function readRoom(code: string): Promise<{ room: Room; revision: number } | null> {
  const res = await rest(`rooms?code=eq.${code}&select=state,revision`)
  if (!res.ok) return null
  const rows = (await res.json()) as { state: unknown; revision: number }[]
  if (!rows.length) return null
  return { room: deserialise(rows[0].state), revision: rows[0].revision }
}

async function writeRoom(room: Room, revision: number): Promise<number> {
  const next = revision + 1
  await rest(`rooms?code=eq.${room.code}`, {
    method: 'PATCH',
    body: JSON.stringify({ state: serialise(room), revision: next, updated_at: new Date().toISOString() }),
  })
  return next
}

/**
 * Tells every client in the room that something moved.
 *
 * The payload is a revision number and nothing else — clients then fetch their
 * own view. Pushing the state itself down a shared channel would hand every
 * phone every other phone's secrets, which is the one thing this design exists
 * to prevent.
 */
async function broadcastRevision(code: string, revision: number): Promise<void> {
  await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ topic: `room:${code}`, event: 'rev', payload: { revision } }],
    }),
  }).catch(() => {
    // A dropped broadcast costs latency, not correctness: clients poll as a
    // fallback and every view is rebuilt from authoritative state anyway.
  })
}

async function seatForToken(code: string, token: string): Promise<Role | 'dashboard' | null> {
  const res = await rest(`room_seats?code=eq.${code}&token=eq.${token}&select=role`)
  if (!res.ok) return null
  const rows = (await res.json()) as { role: Role | 'dashboard' }[]
  return rows.length ? rows[0].role : null
}

// ── Views ──────────────────────────────────────────────────────────────────

function viewFor(room: Room, seat: Role | 'dashboard') {
  const finished = room.phase === 'results' || room.phase === 'ended'
  const end = finished ? endgame(room, content) : null
  return seat === 'dashboard'
    ? { kind: 'dashboard', view: dashboardView(room, content), endgame: end }
    : { kind: 'phone', view: phoneView(room, content, seat), endgame: end }
}

/**
 * Commands a seat is allowed to issue.
 *
 * Every command names a role, and a client could name somebody else's. The
 * seat its token proves is the only one that counts, so the role is rewritten
 * here rather than trusted from the wire.
 */
function authorise(seat: Role | 'dashboard', cmd: Command): Command | null {
  if (seat === 'dashboard') {
    // The facilitator's screen may start and advance the session. It may not
    // choose, pledge or spend anybody's resources.
    return cmd.t === 'start' || cmd.t === 'advance' ? cmd : null
  }
  switch (cmd.t) {
    case 'join':
    case 'reconnect':
    case 'leave':
    case 'pickGoal':
    case 'promise':
    case 'demand':
    case 'respondOffer':
    case 'spotlight':
    case 'veto':
    case 'coFund':
    case 'publishTip':
    case 'choose':
    case 'lock':
      return { ...cmd, role: seat } as Command
    case 'offer':
      return { ...cmd, from: seat } as Command
    default:
      return null
  }
}

// ── Handler ────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad json' }, 400)
  }

  const action = String(body.action ?? '')
  const now = Date.now()

  if (action === 'create') {
    const seed = Math.floor(Math.random() * 2 ** 31)
    let room = createRoom(content, seed, now)

    // Four letters is 331,776 codes; collisions are rare but not impossible
    // and a collision would drop two workshops into one another's session.
    for (let attempt = 0; attempt < 8; attempt++) {
      const res = await rest('rooms', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ code: room.code, state: serialise(room), revision: 1 }),
      })
      if (res.ok) break
      if (res.status !== 409) return json({ error: 'could not create room' }, 500)
      room = createRoom(content, seed + attempt + 1, now)
      if (attempt === 7) return json({ error: 'no free room code' }, 503)
    }

    const seat = await rest('room_seats', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ code: room.code, role: 'dashboard' }),
    })
    const rows = (await seat.json()) as { token: string }[]
    return json({ code: room.code, token: rows[0].token, ...viewFor(room, 'dashboard'), revision: 1 })
  }

  const code = String(body.code ?? '').toUpperCase()
  if (!/^[A-Z]{4}$/.test(code)) return json({ error: 'bad room code' }, 400)

  if (action === 'claim') {
    const role = String(body.role ?? '') as Role
    if (!ROLES.includes(role)) return json({ error: 'unknown seat' }, 400)

    const existing = await readRoom(code)
    if (!existing) return json({ error: 'no such room' }, 404)

    // A seat already claimed keeps its token, so a player who reloads or
    // loses signal rejoins the same seat rather than being locked out.
    const held = await rest(`room_seats?code=eq.${code}&role=eq.${role}&select=token`)
    const heldRows = (await held.json()) as { token: string }[]
    if (heldRows.length) {
      return json({ token: heldRows[0].token, ...viewFor(existing.room, role), revision: existing.revision })
    }

    const res = await rest('room_seats', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ code, role }),
    })
    if (!res.ok) return json({ error: 'seat taken' }, 409)
    const rows = (await res.json()) as { token: string }[]
    return json({ token: rows[0].token, ...viewFor(existing.room, role), revision: existing.revision })
  }

  const token = String(body.token ?? '')
  const seat = token ? await seatForToken(code, token) : null
  if (!seat) return json({ error: 'not your seat' }, 403)

  const loaded = await readRoom(code)
  if (!loaded) return json({ error: 'no such room' }, 404)
  let { room, revision } = loaded

  if (action === 'view') {
    return json({ ...viewFor(room, seat), revision })
  }

  if (action === 'tick') {
    // The caller asks the server to look at the clock; it does not get to say
    // what time it is. Nothing advances before its own deadline.
    const before = room.phase
    const beforeEnds = room.phaseEndsAt
    room = tick(room, content, Date.now())
    if (room.phase !== before || room.phaseEndsAt !== beforeEnds) {
      revision = await writeRoom(room, revision)
      await broadcastRevision(code, revision)
    }
    return json({ ...viewFor(room, seat), revision })
  }

  if (action === 'cmd') {
    const requested = body.cmd as Command
    const allowed = requested ? authorise(seat, requested) : null
    if (!allowed) return json({ error: 'not allowed from this seat' }, 403)

    room = apply(room, allowed, content, Date.now())
    revision = await writeRoom(room, revision)
    await broadcastRevision(code, revision)
    return json({ ...viewFor(room, seat), revision })
  }

  return json({ error: 'unknown action' }, 400)
})
