/**
 * The big screen's half of the facilitator link.
 *
 * Publishes where the session has got to, answers a script window that has
 * just opened, and forwards the two commands that window is allowed to send.
 * Those are the same two the spacebar sends — `start` and `advance` — and the
 * room refuses anything else from a dashboard client anyway, so the channel
 * cannot become a back door into the game state.
 *
 * State is only posted when something a facilitator would notice changes. The
 * local transport pushes a snapshot several times a second, and a message per
 * snapshot would have the script window re-rendering continuously to say the
 * same thing.
 */
import { useEffect, useMemo, useRef } from 'react'
import type { Command } from '../game/room'
import type { DashboardView } from '../game/session'
import { openChannel, type FacilitatorMessage, type FacilitatorState } from './channel'

export function useFacilitatorLink(view: DashboardView | null, send: (cmd: Command) => void) {
  const state: FacilitatorState | null = useMemo(
    () =>
      view
        ? {
            code: view.code,
            phase: view.phase,
            round: view.round,
            phaseEndsAt: view.phaseEndsAt,
            seats: view.seats.map((s) => ({
              role: s.role,
              name: s.name,
              connected: s.connected,
              locked: s.locked,
            })),
          }
        : null,
    [view],
  )

  const signature = state
    ? [
        state.code,
        state.phase,
        state.round,
        state.phaseEndsAt,
        state.seats.map((s) => `${s.role}:${s.name ?? ''}:${s.connected}:${s.locked}`).join(','),
      ].join('|')
    : ''

  const channelRef = useRef<BroadcastChannel | null>(null)
  const latest = useRef<FacilitatorState | null>(state)
  latest.current = state

  const code = view?.code ?? ''
  useEffect(() => {
    const channel = openChannel(code)
    channelRef.current = channel
    if (!channel) return
    channel.onmessage = (e: MessageEvent<FacilitatorMessage>) => {
      const msg = e.data
      if (msg.t === 'hello' && latest.current) {
        channel.postMessage({ t: 'state', state: latest.current } satisfies FacilitatorMessage)
      }
      if (msg.t === 'cmd') send({ t: msg.cmd })
    }
    return () => {
      channel.postMessage({ t: 'gone' } satisfies FacilitatorMessage)
      channel.onmessage = null
      channel.close()
      channelRef.current = null
    }
  }, [code, send])

  useEffect(() => {
    if (latest.current) {
      channelRef.current?.postMessage({
        t: 'state',
        state: latest.current,
      } satisfies FacilitatorMessage)
    }
  }, [signature])

  return state
}
