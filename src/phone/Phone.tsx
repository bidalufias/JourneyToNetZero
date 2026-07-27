/**
 * The phone — join, take a seat, seal a goal, argue, choose, look up.
 *
 * The design rule this file exists to honour: every second on the phone is a
 * second not spent negotiating. Nothing here scrolls when it could fit, no
 * Table action takes more than two taps, and the app never shows a number that
 * would turn a judgement call into a spreadsheet call.
 *
 * The one thing the phone now does when it is *not* your turn is remember. BACK
 * walks the round you are in — the crisis, the board, your own locked card —
 * without ever letting you change a thing you have committed to.
 */
import { useEffect, useState } from 'react'
import type { Role } from '../engine/types'
import type { Command } from '../game/room'
import type { Endgame } from '../game/room'
import type { PhoneView } from '../game/session'
import type { ConnectionState } from '../net/transport'
import { useCountdown } from '../dashboard/Dashboard'
import { PhoneHeader, ReviewBar, SCREEN_ORDER, reviewableUpTo, type Screen } from './Chrome'
import { MenuSheet } from './Menu'
import { TheChoice } from './TheChoice'
import { TableActions } from './TableActions'
import { Crisis, GoalPicker, Lobby, LookUp, RoleReveal, RoundResult, TipCard } from './screens'
import './phone.css'

export interface PhoneProps {
  view: PhoneView
  endgame: Endgame | null
  connection: ConnectionState
  send: (cmd: Command) => void
  onLeave: () => void
}

export function Phone({ view, endgame, connection, send, onLeave }: PhoneProps) {
  const remaining = useCountdown(view.phaseEndsAt)
  const [tipOpen, setTipOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  /** Which earlier screen of this round is being read, or null for "now". */
  const [reviewing, setReviewing] = useState<number | null>(null)

  const live = reviewableUpTo(view)

  // Any move by the room pulls the player back to the present. Reading the
  // crisis brief must never mean missing the moment the choice opens.
  useEffect(() => {
    setReviewing(null)
  }, [view.phase, view.round])

  // Sealed goal first: chosen once, before anything else can happen.
  const needsGoal = view.goalId === null && view.goalChoices !== null
  const [readBriefing, setReadBriefing] = useState(false)

  const screen: Screen | null = reviewing !== null ? SCREEN_ORDER[reviewing] : null
  const canGoBack = live > 0 && (reviewing === null ? live > 0 : reviewing > 0)

  const body = (() => {
    // Reading back through the round. Nothing here may send a command that
    // changes a committed decision.
    if (screen) {
      if (screen === 'crisis') return <Crisis view={view} />
      if (screen === 'table') return <TableActions view={view} send={send} readOnly />
      return <TheChoice view={view} send={send} remaining={remaining} readOnly />
    }

    if (view.phase === 'lobby') {
      // The briefing comes first: choosing a win condition before being told
      // what your resource is asks somebody to guess.
      if (!readBriefing && needsGoal) return <RoleReveal view={view} onNext={() => setReadBriefing(true)} />
      return needsGoal ? <GoalPicker view={view} send={send} /> : <Lobby view={view} />
    }
    if (needsGoal) {
      // Took a vacated seat mid-session, or arrived late. Still needs a goal.
      return <GoalPicker view={view} send={send} />
    }
    if (view.phase === 'briefing') return <Lobby view={view} />
    if (view.phase === 'crisis') return <Crisis view={view} />
    if (view.phase === 'table') return <TableActions view={view} send={send} />
    if (view.phase === 'choice') return <TheChoice view={view} send={send} remaining={remaining} />
    if (view.phase === 'reckoning') return <LookUp view={view} reckoning />
    if (view.phase === 'summary') return <RoundResult view={view} />
    if (view.phase === 'results' || view.phase === 'ended') {
      return <Endgame view={view} endgame={endgame} />
    }
    return null
  })()

  const bare = !screen && view.phase === 'reckoning'
  const skin = bare ? 'deep' : 'role'

  return (
    <div className="phone" data-role={view.role} data-skin={skin}>
      {!bare ? (
        <PhoneHeader
          view={view}
          remaining={remaining}
          onBack={canGoBack ? () => setReviewing(reviewing === null ? live - 1 : reviewing - 1) : null}
          onMenu={() => setMenuOpen(true)}
        />
      ) : null}
      {screen ? <ReviewBar screen={screen} onNow={() => setReviewing(null)} /> : null}
      {body}

      {/* The tip lands the moment the crisis is revealed, before THE TABLE. */}
      {!screen && view.tip && !view.tip.published && tipOpen && (view.phase === 'crisis' || view.phase === 'table') ? (
        <TipCard tip={view.tip} role={view.role} remaining={remaining} send={send} onClose={() => setTipOpen(false)} />
      ) : null}

      {menuOpen ? (
        <MenuSheet view={view} onClose={() => setMenuOpen(false)} onLeave={onLeave} />
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

function Endgame({ view, endgame }: { view: PhoneView; endgame: Endgame | null }) {
  if (!endgame) return null
  const me = endgame.players.find((p) => p.role === view.role)
  const hadGoal = Boolean(me?.goalTitle)
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
          <div className="bubble__lead">{me.goalTitle ?? 'You never sealed one'}</div>
          <p className="bubble__text">
            {!hadGoal
              ? 'You joined after the goals were dealt, so there was nothing of your own to hit.'
              : me!.goalMet
                ? 'You hit it.'
                : 'You did not hit it.'}{' '}
            {!endgame.win && hadGoal && me!.goalMet
              ? 'You got exactly what you wanted. Was it worth it?'
              : ''}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export type { Role }
