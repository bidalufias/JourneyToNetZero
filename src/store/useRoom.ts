import { create } from 'zustand'
import { actionById } from '../game/actions'
import { agendasFor } from '../game/agendas'
import {
  availableActions,
  resolveRound,
  spendable,
  STARTING_INDICATORS,
} from '../game/engine'
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
  /** Round whose computer-seat funding the driver has already run. */
  botDealRound: number | null
  /**
   * The computer seats' picks for the round in progress, held by the driver
   * only. Same reason as `myChoice`: writing them to the room early would let
   * anyone watching the table read them before the reveal.
   */
  botChoices: Partial<Record<RoleId, string>>
  error: string | null
  busy: boolean

  createRoom: (name: string, role: RoleId) => Promise<string | null>
  joinRoom: (code: string, name: string, role: RoleId) => Promise<boolean>
  /** Fill every empty seat with a computer player. Lobby only. */
  addComputerPlayers: () => Promise<void>
  /** Hand a computer seat back, so a late arrival can take it. Lobby only. */
  removeComputerPlayer: (role: RoleId) => Promise<void>
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

/**
 * How often a computer seat funds the player who depends on it in a round.
 *
 * Every conditional action in the game — the strongest play on the board —
 * needs currency from one specific other role. A computer seat that never
 * transferred would leave a solo player permanently locked out of their
 * conditional for all eight rounds, which is not a lesson, just a smaller
 * game. So a computer seat takes the chance a little under half the time and
 * never negotiates: the strongest plays stay occasionally available and never
 * dependable. That gap — between a stakeholder at the table and a seat merely
 * filled — is the thing worth feeling.
 */
const BOT_DEAL_CHANCE = 0.45

/**
 * One pass of computer-seat funding for the round. Each computer seat may fund
 * the single player whose conditional action depends on it this round.
 */
function botDeals(
  round: number,
  seats: Partial<Record<RoleId, SeatRow>>,
  existing: Transfer[],
): Transfer[] {
  const out: Transfer[] = []
  const balance: Record<string, number> = {}
  for (const r of ROLE_IDS) balance[r] = spendable(seats[r]?.currency ?? 0, r, existing)

  for (const from of ROLE_IDS) {
    if (!seats[from]?.bot) continue
    if (Math.random() > BOT_DEAL_CHANCE) continue

    const target = ROLE_IDS.find((to) => {
      if (to === from || !seats[to]) return false
      return actionById(`r${round}-${short(to)}-conditional`).requires?.from === from
    })
    if (!target) continue

    const need = actionById(`r${round}-${short(target)}-conditional`).requires!.amount
    if (balance[from] < need) continue

    balance[from] -= need
    balance[target] += need
    out.push({ round, from, to: target, amount: need })
  }
  return out
}

/**
 * A computer seat picks uniformly at random from whatever it can actually
 * afford and has unlocked this round. Returns null when nothing is playable,
 * in which case the seat sits the round out — which the engine already
 * handles, and which the agenda checks already account for.
 *
 * Deliberately not clever. It fills the chair; it does not represent the
 * stakeholder, and the result should show that.
 */
function pickBotAction(
  round: number,
  role: RoleId,
  currency: number,
  transfers: Transfer[],
): string | null {
  const playable = availableActions(round, role, currency, transfers).filter(
    (o) => o.playable,
  )
  if (playable.length === 0) return null
  return playable[Math.floor(Math.random() * playable.length)].action.id
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
  botChoices: {},
  botDealRound: null,
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

  async addComputerPlayers() {
    const { room } = get()
    if (!room || room.phase !== 'lobby') return
    const seats = { ...room.seats }
    for (const role of ROLE_IDS) {
      if (seats[role]) continue
      seats[role] = {
        id: newPlayerId(),
        role,
        name: 'Computer',
        currency: 0,
        agendaId: '',
        connected: true,
        locked: false,
        bot: true,
      }
    }
    await patch(room.code, { seats })
  },

  async removeComputerPlayer(role) {
    const { room } = get()
    if (!room || room.phase !== 'lobby') return
    if (!room.seats[role]?.bot) return
    const seats = { ...room.seats }
    delete seats[role]
    await patch(room.code, { seats })
  },

  watch(code) {
    return transport.subscribe(code, (row) => set({ room: row }))
  },

  leave() {
    saveMe(null)
    set({ me: null, room: null, myChoice: null, botChoices: {}, botDealRound: null })
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
    if (!from || !target || amount <= 0) return
    if (spendable(from.currency, me.role, room.pending_transfers) < amount) return

    // The deal is binding the moment it is struck, and everyone sees it on the
    // board. The money itself settles at resolution, where `resolveRound`
    // applies transfers, costs and income together — moving it here as well
    // would charge the sender twice.
    await patch(room.code, {
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
        // Publish this player's own choice now that the round is closed, plus
        // any computer seat that has not been published yet — otherwise a seat
        // the driver owns would silently sit the round out on a timeout.
        const fallback = myChoice ?? `r${room.round}-${short(me.role)}-self`
        const { botChoices } = get()
        const bots: Partial<Record<RoleId, string>> = {}
        for (const r of ROLE_IDS) {
          const pick = botChoices[r]
          if (room.seats[r]?.bot && pick && !room.pending_choices[r]) bots[r] = pick
        }
        await patch(room.code, {
          phase: 'reveal',
          phase_ends_at: endsAt('reveal'),
          pending_choices: { ...room.pending_choices, ...bots, [me.role]: fallback },
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
        set({ myChoice: null, botChoices: {} })
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

    // Computer seats take their one funding chance while the humans are still
    // talking, so the deals are visible on the board like anyone else's.
    if (room.phase === 'discussion' && iAmDriver && get().botDealRound !== room.round) {
      set({ botDealRound: room.round })
      const deals = botDeals(room.round, room.seats, room.pending_transfers)
      if (deals.length > 0) {
        await patch(room.code, {
          pending_transfers: [...room.pending_transfers, ...deals],
        })
        return
      }
    }

    if (room.phase === 'locking') {
      // The driver commits the computer seats first, keeping their picks local
      // exactly as a human's are, so nothing is readable before the reveal.
      if (iAmDriver) {
        const pending = ROLE_IDS.filter((r) => room.seats[r]?.bot && !room.seats[r]!.locked)
        if (pending.length > 0) {
          const seats = { ...room.seats }
          const picks = { ...get().botChoices }
          for (const r of pending) {
            const seat = room.seats[r]!
            const id = pickBotAction(
              room.round,
              r,
              spendable(seat.currency, r, room.pending_transfers),
              room.pending_transfers,
            )
            if (id) picks[r] = id
            seats[r] = { ...seat, locked: true }
          }
          set({ botChoices: picks })
          await patch(room.code, { seats })
          return
        }
      }

      // Every client publishes its own choice the moment all four are locked.
      const allLocked = ROLE_IDS.every((r) => room.seats[r]?.locked)
      if (allLocked) {
        const additions: Partial<Record<RoleId, string>> = {}
        if (myChoice && !room.pending_choices[me.role]) additions[me.role] = myChoice
        if (iAmDriver) {
          const { botChoices } = get()
          for (const r of ROLE_IDS) {
            const pick = botChoices[r]
            if (room.seats[r]?.bot && pick && !room.pending_choices[r]) additions[r] = pick
          }
        }
        if (Object.keys(additions).length > 0) {
          await patch(room.code, {
            pending_choices: { ...room.pending_choices, ...additions },
          })
          return
        }
      }
      if (allLocked && iAmDriver) {
        // A computer seat with nothing playable has no choice to publish, so
        // waiting for one would stall the round. Treat it as settled.
        const { botChoices } = get()
        const published = ROLE_IDS.filter((r) => room.seats[r]).every(
          (r) => room.pending_choices[r] || (room.seats[r]!.bot && !botChoices[r]),
        )
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
      set({ botChoices: {} })
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
