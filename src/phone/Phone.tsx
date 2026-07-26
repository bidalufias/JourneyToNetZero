/**
 * The phone — join, take a seat, seal a goal, argue, choose, look up.
 *
 * The design rule this file exists to honour: every second on the phone is a
 * second not spent negotiating. Nothing here scrolls when it could fit, no
 * Table action takes more than two taps, and the app never shows a number that
 * would turn a judgement call into a spreadsheet call.
 */
import { useState } from 'react'
import type { Role } from '../engine/types'
import type { Command } from '../game/room'
import type { Endgame } from '../game/room'
import type { PhoneView } from '../game/session'
import { ROLE_CHARACTER, ROLE_LABEL } from '../game/session'
import type { ConnectionState } from '../net/transport'
import { RoleGlyph, formatClock } from '../ui/primitives'
import { useCountdown } from '../dashboard/Dashboard'
import { TheChoice } from './TheChoice'
import { TableActions } from './TableActions'
import { Crisis, GoalPicker, Lobby, LookUp, RoleReveal, RoundResult, TipCard } from './screens'
import './phone.css'

export interface PhoneProps {
  view: PhoneView
  endgame: Endgame | null
  connection: ConnectionState
  send: (cmd: Command) => void
}

export function Phone({ view, endgame, connection, send }: PhoneProps) {
  const remaining = useCountdown(view.phaseEndsAt)
  const [tipOpen, setTipOpen] = useState(true)

  // Sealed goal first: chosen once, before anything else can happen.
  const needsGoal = view.goalId === null && view.goalChoices !== null

  const body = (() => {
    if (view.phase === 'lobby') {
      return needsGoal ? (
        <GoalPicker view={view} send={send} />
      ) : (
        <RoleReveal view={view} send={send} />
      )
    }
    if (view.phase === 'briefing') return <Lobby view={view} />
    if (view.phase === 'crisis') return <Crisis view={view} />
    if (view.phase === 'table') return <TableActions view={view} send={send} />
    if (view.phase === 'choice') {
      return view.locked ? <LookUp view={view} /> : <TheChoice view={view} send={send} remaining={remaining} />
    }
    if (view.phase === 'reckoning') return <LookUp view={view} reckoning />
    if (view.phase === 'summary') return <RoundResult view={view} />
    if (view.phase === 'results' || view.phase === 'ended') {
      return <Endgame view={view} endgame={endgame} />
    }
    return null
  })()

  const dark = view.phase === 'choice' && view.locked
  const skin = dark || view.phase === 'reckoning' ? 'deep' : 'role'

  return (
    <div className="phone" data-role={view.role} data-skin={skin}>
      {!dark && view.phase !== 'reckoning' ? <PhoneHeader view={view} remaining={remaining} /> : null}
      {body}

      {/* The tip lands the moment the crisis is revealed, before THE TABLE. */}
      {view.tip && !view.tip.published && tipOpen && (view.phase === 'crisis' || view.phase === 'table') ? (
        <TipCard tip={view.tip} role={view.role} send={send} onClose={() => setTipOpen(false)} />
      ) : null}

      {connection !== 'live' ? (
        <div className="reconnect" role="status">
          {connection === 'reconnecting'
            ? 'RECONNECTING — YOUR SEAT IS HELD'
            : connection === 'unreachable'
              ? "CAN'T REACH THE GAME SERVER — TELL THE FACILITATOR"
              : 'CONNECTING…'}
        </div>
      ) : null}
    </div>
  )
}

function PhoneHeader({ view, remaining }: { view: PhoneView; remaining: number | null }) {
  const character = ROLE_CHARACTER[view.role]
  const clock = formatClock(remaining)
  const urgent = (remaining ?? 1e9) < 10_000
  const total = view.phaseEndsAt && remaining !== null ? remaining : 0
  const pct = view.phaseEndsAt ? Math.max(0, Math.min(100, (total / 90_000) * 100)) : 0

  return (
    <>
      <header className="phead">
        <RoleGlyph role={view.role} size={18} />
        <div className="phead__org">
          <div>{character.org.toUpperCase()}</div>
          <div className="phead__title">{ROLE_LABEL[view.role]} · Round {view.round}</div>
        </div>
        {clock ? <span className={`phead__clock${urgent ? ' phead__clock--urgent' : ''}`}>{clock}</span> : null}
      </header>
      <div className="phead__bar">
        <span className="phead__bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </>
  )
}

function Endgame({ view, endgame }: { view: PhoneView; endgame: Endgame | null }) {
  if (!endgame) return null
  const me = endgame.players.find((p) => p.role === view.role)
  return (
    <div className="pbody">
      <span className="plabel">THE NATIONAL MISSION · 2050</span>
      <h1 className="pbig">{endgame.win ? 'Nation Builder' : 'Hollow Victory'}</h1>
      <p className="ptext">
        {endgame.win
          ? 'Three targets. All three. 34 million people live in a country that still works.'
          : 'The country missed. Look up — the room is reading the rest of it together.'}
      </p>
      {me ? (
        <div className="bubble">
          <div className="bubble__label">YOUR PRIVATE GOAL</div>
          <div className="bubble__lead">{me.goalTitle ?? '—'}</div>
          <p className="bubble__text">
            {me.goalMet ? 'You hit it.' : 'You did not hit it.'}{' '}
            {!endgame.win && me.goalMet
              ? 'You got exactly what you wanted. Was it worth it?'
              : ''}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export type { Role }
