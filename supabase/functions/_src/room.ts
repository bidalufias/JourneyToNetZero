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
  authorise,
  createRoom,
  dashboardView,
  endgame,
  phoneView,
  tick,
  type Command,
} from '../../../src/game/room'
import type { Room } from '../../../src/game/session'
import { PACK } from './content.gen.ts'

declare const Deno: { env: { get(k: string): string | undefined }; serve(h: (r: Request) => Promise<Response> | Response): void }

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/**
 * The content pack is embedded rather than fetched, because every option's
 * effects live in it: any URL a client could reach would hand a player the
 * numbers the whole design works to keep from them.
 */
const content: Content = loadContent(PACK)

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

/**
 * Compare-and-set on the revision.
 *
 * Four phones negotiating for ninety seconds means concurrent commands are
 * normal, not exceptional. A blind PATCH lets two of them read the same state
 * and write in turn, so the second silently erases the first — an accepted
 * offer or a declared veto simply never happened. Matching on the revision the
 * caller read makes the loser detectable, and `withRoom` retries it.
 *
 * Returns the new revision, or null when somebody else got there first.
 */
async function writeRoom(room: Room, revision: number): Promise<number | null> {
  const next = revision + 1
  const res = await rest(`rooms?code=eq.${room.code}&revision=eq.${revision}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ state: serialise(room), revision: next, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) return null
  const rows = (await res.json()) as unknown[]
  return rows.length ? next : null
}

/**
 * Read, mutate, write — retrying from a fresh read whenever another request
 * beat us to it. The mutation runs again rather than being replayed onto stale
 * state, so the reducer always sees the room as it actually is.
 */
async function withRoom(
  code: string,
  mutate: (room: Room) => Room,
): Promise<{ room: Room; revision: number } | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const loaded = await readRoom(code)
    if (!loaded) return null
    const next = mutate(loaded.room)
    const revision = await writeRoom(next, loaded.revision)
    if (revision !== null) return { room: next, revision }
  }
  return null
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
 * Who is in which chair. Already public — it is on the projector — so it is
 * safe to hand to somebody who has just been refused a seat, and it is the
 * only thing that makes the refusal actionable.
 */
function roster(room: Room) {
  return ROLES.map((role) => ({
    role,
    name: room.players[role].name || null,
    taken: Boolean(room.players[role].name),
  }))
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

    /**
     * A claimed seat is not handed out again.
     *
     * Returning the incumbent's token to whoever asks would let anybody who
     * types the room code sit down in an occupied chair, act as that player,
     * and read the insider tip written for them alone. A player who reloads or
     * loses signal still recovers, because their own device kept the token and
     * resumes with it before ever reaching this path.
     *
     * A row with no name on it is a claim that never became a player — someone
     * who opened the link and closed it. That chair is still free.
     */
    const held = await rest(`room_seats?code=eq.${code}&role=eq.${role}&select=token`)
    const heldRows = (await held.json()) as { token: string }[]
    if (heldRows.length) {
      if (existing.room.players[role].name) {
        return json({ error: 'seat taken', seats: roster(existing.room) }, 409)
      }
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
    // what time it is. Nothing advances before its own deadline, and a paused
    // room has no deadline it is heading for — `tick` would refuse anyway, but
    // checking here keeps a stopped session from writing the room twice a
    // second and bumping a revision every client would then go and re-fetch.
    if (room.pausedAt != null || room.phaseEndsAt === null || Date.now() < room.phaseEndsAt) {
      return json({ ...viewFor(room, seat), revision })
    }
    const written = await withRoom(code, (r) => tick(r, content, Date.now()))
    if (!written) return json({ ...viewFor(room, seat), revision })
    await broadcastRevision(code, written.revision)
    return json({ ...viewFor(written.room, seat), revision: written.revision })
  }

  /**
   * Give the chair back.
   *
   * Deleting the row is the half that matters: without it the seat keeps its
   * token for the rest of the workshop and nobody can ever sit there again,
   * which is the state a player who tapped the wrong seat used to be stuck in.
   */
  if (action === 'release') {
    if (seat === 'dashboard') return json({ error: 'the big screen holds no seat' }, 403)
    const written = await withRoom(code, (r) => apply(r, { t: 'leave', role: seat }, content, Date.now()))
    await rest(`room_seats?code=eq.${code}&token=eq.${token}`, { method: 'DELETE' })
    if (written) await broadcastRevision(code, written.revision)
    return json({ ok: true, revision: written?.revision ?? revision })
  }

  if (action === 'cmd') {
    const requested = body.cmd as Command
    const allowed = requested ? authorise(seat, requested) : null
    if (!allowed) return json({ error: 'not allowed from this seat' }, 403)

    const written = await withRoom(code, (r) => apply(r, allowed, content, Date.now()))
    // 503, not 409: a busy room is a retry, whereas 409 tells a phone its seat
    // was refused and sends the player to pick a different chair.
    if (!written) return json({ error: 'the room is busy — try again' }, 503)
    await broadcastRevision(code, written.revision)
    return json({ ...viewFor(written.room, seat), revision: written.revision })
  }

  return json({ error: 'unknown action' }, 400)
})
