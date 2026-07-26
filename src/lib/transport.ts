import type { RoomRow } from './supabase'
import { supabase } from './supabase'

/**
 * The room store, behind an interface.
 *
 * The default is Supabase Realtime across four phones. The local transport is
 * a drop-in that keeps rooms in this browser only, synchronised across tabs —
 * it makes the game playable with no network at all (useful for a classroom
 * with bad wifi, or for one person walking through it) and it is what the
 * end-to-end test drives.
 *
 * Enable it with `?local=1` on any URL, or by building with VITE_LOCAL_ROOMS=1.
 */
export interface Transport {
  get(code: string): Promise<RoomRow | null>
  insert(row: Partial<RoomRow> & { code: string }): Promise<void>
  update(code: string, changes: Partial<RoomRow>): Promise<void>
  subscribe(code: string, onChange: (row: RoomRow | null) => void): () => void
  purge(): Promise<void>
}

const supabaseTransport: Transport = {
  async get(code) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .maybeSingle<RoomRow>()
    if (error) throw error
    return data
  },

  async insert(row) {
    const { error } = await supabase.from('rooms').insert(row)
    if (error) throw error
  },

  async update(code, changes) {
    const { error } = await supabase.from('rooms').update(changes).eq('code', code)
    if (error) throw error
  },

  subscribe(code, onChange) {
    let cancelled = false
    const pull = async () => {
      const row = await supabaseTransport.get(code).catch(() => null)
      if (!cancelled) onChange(row)
    }
    void pull()

    const channel = supabase
      .channel(`room:${code}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        (payload) => {
          if (cancelled) return
          onChange(payload.eventType === 'DELETE' ? null : (payload.new as RoomRow))
        },
      )
      .subscribe()

    // A phone that sleeps mid-round can drop the socket, so keep a slow poll
    // behind it. Cheap insurance against a desynced screen.
    const poll = setInterval(() => void pull(), 4000)

    return () => {
      cancelled = true
      clearInterval(poll)
      void supabase.removeChannel(channel)
    }
  },

  async purge() {
    await supabase.rpc('purge_expired_rooms')
  },
}

/* ------------------------------------------------------------------ local */

const KEY = 'jtnz.rooms'
const CHANNEL = 'jtnz.sync'

interface Stored {
  row: RoomRow
  expiresAt: number
}

function readAll(): Record<string, Stored> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Stored>
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Stored>) {
  localStorage.setItem(KEY, JSON.stringify(all))
}

const bus =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null

const localTransport: Transport = {
  async get(code) {
    return readAll()[code]?.row ?? null
  },

  async insert(row) {
    const all = readAll()
    all[row.code] = {
      row: {
        phase: 'lobby',
        round: 1,
        indicators: { economy: 50, emissions: 100, living: 50 },
        seats: {},
        history: [],
        pending_choices: {},
        pending_transfers: [],
        phase_ends_at: null,
        paused: false,
        host_id: null,
        ...row,
      } as RoomRow,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    }
    writeAll(all)
    bus?.postMessage(row.code)
  },

  async update(code, changes) {
    const all = readAll()
    const existing = all[code]
    if (!existing) return
    all[code] = { ...existing, row: { ...existing.row, ...changes } }
    writeAll(all)
    bus?.postMessage(code)
  },

  subscribe(code, onChange) {
    let cancelled = false
    const emit = () => {
      if (!cancelled) onChange(readAll()[code]?.row ?? null)
    }
    emit()

    const onBus = (e: MessageEvent) => {
      if (e.data === code) emit()
    }
    bus?.addEventListener('message', onBus)
    window.addEventListener('storage', emit)
    // Same-tab writes do not raise events, so poll as well. Local only, cheap.
    const poll = setInterval(emit, 400)

    return () => {
      cancelled = true
      bus?.removeEventListener('message', onBus)
      window.removeEventListener('storage', emit)
      clearInterval(poll)
    }
  },

  async purge() {
    const all = readAll()
    const now = Date.now()
    for (const [code, entry] of Object.entries(all)) {
      if (entry.expiresAt < now) delete all[code]
    }
    writeAll(all)
  },
}

function useLocal(): boolean {
  if (import.meta.env.VITE_LOCAL_ROOMS === '1') return true
  if (typeof location === 'undefined') return false
  if (new URLSearchParams(location.search).get('local') === '1') {
    sessionStorage.setItem('jtnz.local', '1')
    return true
  }
  return sessionStorage.getItem('jtnz.local') === '1'
}

export const transport: Transport = useLocal() ? localTransport : supabaseTransport

export const isLocalMode = useLocal()
