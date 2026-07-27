/**
 * Phone screens: onboarding, the crisis brief, the insider tip, the locked
 * screen, and the round result.
 */
import { useState } from 'react'
import type { Role } from '../engine/types'
import type { Command } from '../game/room'
import type { InsiderTip, PhoneView } from '../game/session'
import { ROLE_CHARACTER, ROLE_LABEL } from '../game/session'
import { RoleGlyph, formatClock } from '../ui/primitives'

/**
 * P-03: the role reveal. The skin applies here and never changes again.
 *
 * Three lines, then the seat's resource, then three sentences this character
 * would actually say. That is the whole brief. It used to be nine labelled
 * sections and about 450 words, handed to somebody who had never seen the game
 * and had ninety seconds, so most of it went unread and the useful part went
 * unread with it. The rest is one tap away and nobody needs it to play.
 */
export function RoleReveal({ view, onNext }: { view: PhoneView; onNext: () => void }) {
  const c = ROLE_CHARACTER[view.role]
  const [full, setFull] = useState(false)

  return (
    <div className="pbody">
      <span className="plabel">{c.org.toUpperCase()}</span>
      <h1 className="pbig">{c.title}</h1>
      <div style={{ height: 4, background: 'var(--skin-mark)', width: 120 }} />
      {view.name ? <h2 className="pheading">{view.name}</h2> : null}

      <span className="plabel">YOU ARE</span>
      <p className="ptext">{c.youAre}</p>

      <span className="plabel">YOU WANT</span>
      <p className="ptext">{c.youWant}</p>

      <span className="plabel">YOUR MOVE</span>
      <p className="ptext">{c.yourMove}</p>

      <span className="plabel">YOU HOLD</span>
      <p className="ptext">
        <strong>
          {view.resource.value} {view.resource.label.replace(/^Your /, '')}
        </strong>
        . It stays in the corner of your screen. The big screen tracks everything else.
      </p>

      {/* Three lines a player can open their mouth with in Round 1. The single
          most useful thing on this screen, so it survives the cut. */}
      <span className="plabel">THINGS YOU MIGHT SAY</span>
      {c.says.map((line) => (
        <div key={line} className="bubble">
          <p className="bubble__text">\u201C{line}\u201D</p>
        </div>
      ))}

      {full ? (
        <>
          <span className="plabel">WHO YOU ARE</span>
          <p className="ptext">{c.whoYouAre}</p>

          <span className="plabel">WHAT YOU BELIEVE</span>
          <p className="ptext">{c.believe}</p>

          <span className="plabel">WHAT YOU FEAR</span>
          <p className="ptext">{c.afraidOf}</p>

          <span className="plabel">HOW YOUR RESOURCE WORKS</span>
          <p className="ptext">{c.resourcePower}</p>

          <span className="plabel">YOU WOULD NEVER SAY</span>
          <div className="bubble bubble--them">
            <p className="bubble__text">\u201C{c.neverSay}\u201D</p>
          </div>
        </>
      ) : (
        <button className="btn btn--ghost" onClick={() => setFull(true)}>
          MORE ABOUT ME
        </button>
      )}

      <button className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }} onClick={onNext}>
        I AM READY
      </button>
    </div>
  )
}

/** P-04: three secret cards. Lying about which you took is legal and expected. */
export function GoalPicker({ view, send }: { view: PhoneView; send: (c: Command) => void }) {
  const choices = view.goalChoices ?? []
  const [picked, setPicked] = useState<string | null>(null)
  const chosen = choices.find((g) => g.id === picked)

  // Sealing is permanent and used to happen on a single tap, with no statement
  // of what had been sealed. Two taps, and the second one says it back to you.
  if (chosen) {
    return (
      <div className="pbody">
        <span className="plabel">SECRET · NOBODY ELSE SEES THIS</span>
        <h1 className="pheading">Take this one?</h1>
        <div className="bubble">
          <div className="bubble__lead">{chosen.title}</div>
          <p className="bubble__text">{chosen.desc}</p>
        </div>
        <p className="ptext">
          You cannot change this later. It only counts if the country hits all 3 targets. Read it
          again any time under \u22EF.
        </p>
        <button
          className="btn btn--primary"
          style={{ marginTop: 'auto' }}
          onClick={() => send({ t: 'pickGoal', role: view.role, goalId: chosen.id })}
        >
          SEAL IT
        </button>
        <button className="btn btn--ghost" onClick={() => setPicked(null)}>
          LOOK AGAIN
        </button>
      </div>
    )
  }

  return (
    <div className="pbody">
      <span className="plabel">SECRET · NOBODY ELSE SEES THIS</span>
      <h1 className="pheading">Your secret win.</h1>
      <p className="ptext">
        Pick one of these three. Nobody sees which one you took. The other three are choosing in
        secret too, and you may lie about yours.
      </p>
      {choices.map((g) => (
        <button key={g.id} className="goal" onClick={() => setPicked(g.id)}>
          <div className="goal__title">{g.title}</div>
          <div className="goal__desc">{g.desc}</div>
        </button>
      ))}
    </div>
  )
}

/** P-02: the waiting lobby. */
export function Lobby({ view }: { view: PhoneView }) {
  const filled = view.seats.filter((s) => s.name).length
  return (
    <div className="pbody">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span className="plabel">ROOM</span>
          <div className="pbig">{view.code}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="plabel">SEATS</span>
          <div className="pbig">
            {filled}
            <span style={{ opacity: 0.4 }}>/4</span>
          </div>
        </div>
      </div>

      <span className="plabel">THE FOUR SEATS</span>
      {view.seats.map((s) => (
        <div
          key={s.role}
          className={`pseat${s.name ? '' : ' pseat--empty'}${s.role === view.role ? ' pseat--you' : ''}`}
          data-role={s.role}
        >
          <RoleGlyph role={s.role} size={18} />
          <div>
            <div className="pseat__role">{ROLE_LABEL[s.role]}</div>
            <div className="pseat__name">{s.name ?? 'waiting…'}</div>
          </div>
          {s.role === view.role ? <span className="pseat__tag">YOU</span> : s.name ? <span className="pseat__tag">IN</span> : null}
        </div>
      ))}
    </div>
  )
}

/** P-06: the crisis, plus the one line written for this seat alone. */
export function Crisis({ view }: { view: PhoneView }) {
  const s = view.scenario
  if (!s) return null
  return (
    <div className="pbody">
      <span className="plabel">BREAKING NEWS</span>
      <h1 className="pheading">{s.title}</h1>
      <p className="ptext">{s.situation}</p>
      <div style={{ height: 2, background: 'var(--skin-base)', margin: 'var(--space-2) 0' }} />
      <span className="plabel">ONLY YOU CAN SEE THIS</span>
      <p className="ptext" style={{ fontWeight: 600 }}>
        {view.privateLine}
      </p>
    </div>
  )
}

/**
 * P-07: the insider tip. The only dark screen on any phone, and the only
 * place the app uses a large shadow: it should feel like the app has gone
 * quiet around you.
 */
export function TipCard({
  tip,
  role,
  remaining,
  send,
  onClose,
}: {
  tip: InsiderTip
  role: Role
  remaining: number | null
  send: (c: Command) => void
  onClose: () => void
}) {
  const unverified = tip.reliability === 'UNVERIFIED'
  const stake = role === 'community' ? 'a veto' : 'Public Trust'
  const clock = formatClock(remaining)

  return (
    <div className="tip" role="dialog" aria-label="Insider tip">
      <span className="tip__label">A TIP OFF</span>
      <span className="tip__eyes">ONLY YOU CAN SEE THIS</span>
      {/* This is the only overlay that covers the whole phone, so it has to
          carry the clock it is hiding, because otherwise it is a timed decision with
          the timer behind it. */}
      {clock ? <span className="tip__clock">{clock}</span> : null}

      <span className={`tip__chip tip__chip--${unverified ? 'unverified' : 'confirmed'}`}>
        {unverified ? '\u25C7 NOT CHECKED \u00B7 TRUE HALF THE TIME' : 'CHECKED \u00B7 TRUE'}
      </span>

      <p className="tip__source">{tip.source}</p>
      <p className="tip__body">{tip.text}</p>

      <div className="tip__foot">
        <button
          className="btn btn--accent"
          onClick={() => {
            send({ t: 'publishTip', role })
            onClose()
          }}
        >
          TELL THE ROOM
        </button>
        <p className="tip__reminder">
          {unverified
            ? `A gamble. If it turns out true you gain ${stake}. If not, you lose ${stake}. You find out at the end of the round.`
            : `Safe to share. It is true, and you gain ${stake} at the end of the round.`}
        </p>
        <button className="btn" onClick={onClose} style={{ color: '#fff' }}>
          SAY NOTHING
        </button>
        <p className="tip__reminder">Nobody knows you got this. Keeping it costs you nothing.</p>
      </div>
    </div>
  )
}

/** P-10: locked. The phone gets out of the way. */
export function LookUp({ view, reckoning = false }: { view: PhoneView; reckoning?: boolean }) {
  return (
    <div className="lookup" data-role={view.role}>
      <span className="lookup__label">{reckoning ? 'THE REVEAL' : 'LOCKED IN'}</span>
      <h1 className="lookup__big">
        Look
        <br />
        up.
      </h1>
      <div className="lookup__rule" />
      <p className="lookup__note">
        {reckoning
          ? 'The cards are turning over on the big screen.'
          : 'The cards turn over on the big screen. Nothing more to do here.'}
      </p>
      {!reckoning && view.waitingOn > 0 ? (
        <p className="lookup__note" style={{ opacity: 0.7 }}>
          {4 - view.waitingOn} OF 4 LOCKED IN
        </p>
      ) : null}
    </div>
  )
}

/** P-11: the round result. Three short sentences. */
export function RoundResult({ view }: { view: PhoneView }) {
  const r = view.roundResult
  if (!r) return <LookUp view={view} reckoning />
  const c = ROLE_CHARACTER[view.role]

  return (
    <div className="pbody">
      <div className="pseat" data-role={view.role}>
        <RoleGlyph role={view.role} size={18} />
        <div>
          <div className="pseat__role">{c.org}</div>
          <div className="pseat__name">Round {view.round}</div>
        </div>
        <span className="pseat__tag">R{view.round} ✓</span>
      </div>

      <div className="chat">
        <div className="bubble">
          <div className="bubble__label">WHAT YOU DID</div>
          <div className="bubble__lead">{r.didWhat}</div>
        </div>
        <div className="bubble">
          <div className="bubble__label">WHAT IT COST</div>
          <p className="bubble__text">{r.cost}</p>
        </div>
        <div className="bubble bubble--them">
          <div className="bubble__label">AND THE OTHERS</div>
          <p className="bubble__text">{r.others}</p>
        </div>
      </div>

      {view.role === 'community' ? (
        <>
          <span className="plabel">PUBLIC TRUST THIS ROUND</span>
          <p className="ptext">
            Two go out every round. One to whoever looked after people best, one to whoever did most
            for the future. The big screen shows where they landed.
          </p>
        </>
      ) : null}
    </div>
  )
}
