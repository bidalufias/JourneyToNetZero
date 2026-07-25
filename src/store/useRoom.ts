import { create } from 'zustand'
import { actionById } from '../game/actions'
import { agendasFor } from '../game/agendas'
import { resolveRound, STARTING_INDICATORS } from '../game/engine'
import { TOTAL_ROUNDS } from '../game/situations'
import type { Phase, RoleId, Transfer } from '../game/types'
import { ROLE_IDS } from '../game/types'
import { DISCUSSION_EXTENSION, PHASE_SECONDS } from '../lib/config'
import { generateCode, newPlayerId, type RoomRow, type SeatRow } from '../lib/supabase'
import { transport } from '../lib/transport'

const ME_KEY = 'jtnz.me'

interface Me {
  id: string
  code: string
  role: RoleId
}

function loadMe(): Me | null {
  try {
    const raw = localStorage.getItem(ME_KEY)
    return raw ? (JSON.parse(raw) as Me) : null
  } catch {
    return null
  }
}

function saveMe(me: Me | null) {
  if (me) localStorage.setItem(ME_KEY, JSON.stringify(me))
  else localStorage.removeItem(ME_KEY)
}

interface RoomState {
  room: RoomRow | null
  me: Me | null
  /** Kept local until every seat is locked, so nobody can peek mid-round. */
  myChoice: string | null
  error: string | null
  busy: boolean

  createRoom: (name: string, role: RoleId) => Promise<string | null>
  joinRoom: (code: string, name: string, role: RoleId) => Promise<boolean>
  watch: (code: string) => () => void
  leave: () => void

  start: () => Promise<void>
  chooseAction: (actionId: string) => Promise<void>
  sendTransfer: (to: RoleId, amount: number) => Promise<void>
  extendDiscussion: () => Promise<void>
  togglePause: () => Promise<void>
  advance: () => Promise<void>
  tick: () => Promise<void>
}

function pickAgenda(role: RoleId): string {
  const options = agendasFor(role)
  return options[Math.floor(Math.random() * options.length)].id
}

function endsAt(phase: Phase, extraSeconds = 0): string | null {
  const secs = PHASE_SECONDS[phase as keyof typeof PHASE_SECONDS]
  if (!secs) return null
  return new Date(Date.now() + (secs + extraSeconds) * 1000).toISOString()
}

async function patch(code: string, changes: Partial<RoomRow>) {
  await transport.update(code, changes)
}

export const useRoom = create<RoomState>((set, get) => ({
  room: null,
  me: loadMe(),
  myChoice: null,
  error: null,
  busy: false,

  async createRoom(name, role) {
    set({ busy: true, error: null })
    try {
      await transport.purge().catch(() => {})
      const code = generateCode()
      const id = newPlayerId()
      const seat: SeatRow = {
        id,
        role,
        name: name.trim() || 'Host',
        currency: 0,
        agendaId: '',
        connected: true,
        locked: false,
      }
      await transport.insert({
        code,
        host_id: id,
        seats: { [role]: seat },
        indicators: STARTING_INDICATORS,
      })
      const me = { id, code, role }
      saveMe(me)
      set({ me, busy: false })
      return code
    } catch (e) {
      set({ error: (e as Error).message, busy: false })
      return null
    }
  },

  async joinRoom(code, name, role) {
    set({ busy: true, error: null })
    try {
      const data = await transport.get(code)
      if (!data) throw new Error('No table with that code.')
      if (data.phase !== 'lobby') throw new Error('That game has already started.')
      if (data.seats[role]) throw new Error('That role is already taken.')

      const id = newPlayerId()
      const seat: SeatRow = {
        id,
        role,
        name: name.trim() || 'Player',
        currency: 0,
        agendaId: '',
        connected: true,
        locked: false,
      }
      await patch(code, { seats: { ...data.seats, [role]: seat } })
      const me = { id, code, role }
      saveMe(me)
      set({ me, busy: false })
      return true
    } catch (e) {
      set({ error: (e as Error).message, busy: false })
      return false
    }
  },

  watch(code) {
    return transport.subscribe(code, (row) => set({ room: row }))
  },

  leave() {
    saveMe(null)
    set({ me: null, room: null, myChoice: null })
  },

  async start() {
    const { room } = get()
    if (!room) return
    const seats: Record<string, SeatRow> = {}
    for (const role of ROLE_IDS) {
      const seat = room.seats[role]
      if (!seat) continue
      seats[role] = {
        ...seat,
        agendaId: pickAgenda(role),
        currency: { government: 6, business: 6, community: 5, activist: 5 }[role],
        locked: false,
      }
    }
    await patch(room.code, { phase: 'briefing', seats, phase_ends_at: null })
  },

  async chooseAction(actionId) {
    const { room, me } = get()
    if (!room || !me) return
    const seat = room.seats[me.role]
    if (!seat) return
    set({ myChoice: actionId })
    await patch(room.code, {
      seats: { ...room.seats, [me.role]: { ...seat, locked: true } },
    })
  },

  async sendTransfer(to, amount) {
    const { room, me } = get()
    if (!room || !me) return
    const from = room.seats[me.role]
    const target = room.seats[to]
    if (!from || !target || amount <= 0 || from.currency < amount) return

    // Currency moves the moment it is agreed. Deals are binding; the promise
    // of what you do with it afterwards is not.
    await patch(room.code, {
      seats: {
        ...room.seats,
        [me.role]: { ...from, currency: from.currency - amount },
        [to]: { ...target, currency: target.currency + amount },
      },
      pending_transfers: [
        ...room.pending_transfers,
        { round: room.round, from: me.role, to, amount },
      ] satisfies Transfer[],
    })
  },

  async extendDiscussion() {
    const { room } = get()
    if (!room || room.phase !== 'discussion') return
    const current = room.phase_ends_at ? new Date(room.phase_ends_at).getTime() : Date.now()
    await patch(room.code, {
      phase_ends_at: new Date(current + DISCUSSION_EXTENSION * 1000).toISOString(),
    })
  },

  async togglePause() {
    const { room } = get()
    if (!room) return
    await patch(room.code, { paused: !room.paused })
  },

  async advance() {
    const { room, me, myChoice } = get()
    if (!room || !me) return

    switch (room.phase) {
      case 'briefing':
        await patch(room.code, { phase: 'situation', phase_ends_at: endsAt('situation') })
        break
      case 'situation':
        await patch(room.code, { phase: 'discussion', phase_ends_at: endsAt('discussion') })
        break
      case 'discussion':
        await patch(room.code, { phase: 'locking', phase_ends_at: endsAt('locking') })
        break
      case 'locking': {
        // Publish this player's own choice now that the round is closed.
        const fallback = myChoice ?? `r${room.round}-${short(me.role)}-self`
        await patch(room.code, {
          phase: 'reveal',
          phase_ends_at: endsAt('reveal'),
          pending_choices: { ...room.pending_choices, [me.role]: fallback },
        })
        break
      }
      case 'reveal':
        await patch(room.code, { phase: 'resolution', phase_ends_at: endsAt('resolution') })
        break
      case 'resolution': {
        const last = room.round >= TOTAL_ROUNDS
        await patch(room.code, {
          phase: last ? 'ending' : 'situation',
          round: last ? room.round : room.round + 1,
          phase_ends_at: last ? null : endsAt('situation'),
        })
        set({ myChoice: null })
        break
      }
      default:
        break
    }
  },

  /**
   * Called on an interval by every client. Only the host acts, so phase
   * transitions and resolution happen exactly once — but if the host has left
   * the table, the first remaining seat takes over rather than stalling.
   */
  async tick() {
    const { room, me, myChoice } = get()
    if (!room || !me || room.paused) return

    const driverId =
      room.host_id && Object.values(room.seats).some((s) => s?.id === room.host_id)
        ? room.host_id
        : ROLE_IDS.map((r) => room.seats[r]).find(Boolean)?.id
    const iAmDriver = driverId === me.id

    // Every client publishes its own choice the moment all four are locked.
    if (room.phase === 'locking') {
      const allLocked = ROLE_IDS.every((r) => room.seats[r]?.locked)
      if (allLocked && myChoice && !room.pending_choices[me.role]) {
        await patch(room.code, {
          pending_choices: { ...room.pending_choices, [me.role]: myChoice },
        })
        return
      }
      if (allLocked && iAmDriver) {
        const published = ROLE_IDS.every((r) => room.pending_choices[r])
        if (published) {
          await patch(room.code, { phase: 'reveal', phase_ends_at: endsAt('reveal') })
          return
        }
      }
    }

    if (!iAmDriver) return

    // Resolution is computed once, by the driver, and written to the room.
    if (room.phase === 'reveal' && expired(room.phase_ends_at)) {
      const out = resolveRound({
        round: room.round,
        indicators: room.indicators,
        seats: room.seats,
        choices: room.pending_choices,
        transfers: room.pending_transfers,
      })
      const seats: Record<string, SeatRow> = {}
      for (const role of ROLE_IDS) {
        const next = out.seats[role]
        const prev = room.seats[role]
        if (next && prev) seats[role] = { ...prev, ...next, locked: false }
      }
      await patch(room.code, {
        phase: 'resolution',
        phase_ends_at: endsAt('resolution'),
        indicators: out.indicators,
        seats,
        history: [...room.history, out.result],
        pending_choices: {},
        pending_transfers: [],
      })
      return
    }

    if (expired(room.phase_ends_at)) await get().advance()
  },
}))

function expired(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() <= Date.now()
}

function short(role: RoleId): string {
  return { government: 'gov', business: 'biz', community: 'com', activist: 'act' }[role]
}

export function myAction(actionId: string | null) {
  return actionId ? actionById(actionId) : null
}
