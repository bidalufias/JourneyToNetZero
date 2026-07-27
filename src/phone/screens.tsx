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
 * This now comes *before* the sealed goal rather than after it. The goals are
 * written in units, Capital, Trust and Mt, that mean nothing until you have been
 * told what you hold, and asking somebody to commit to a win condition before
 * then is asking them to guess.
 */
export function RoleReveal({ view, onNext }: { view: PhoneView; onNext: () => void }) {
  const c = ROLE_CHARACTER[view.role]
  return (
    <div className="pbody">
      <span className="plabel">{c.org.toUpperCase()}</span>
      <p className="ptext">You are the</p>
      <h1 className="pbig">{c.title}</h1>
      <div style={{ height: 4, background: 'var(--skin-mark)', width: 120 }} />
      {/* The seat has a job, not a name. The name below it is the player's own,
          typed when they took the chair, so the room addresses a real person
          holding an office rather than a stranger they have to remember. */}
      {view.name ? <h2 className="pheading">{view.name}</h2> : null}
      <p className="pmono">{c.post.toUpperCase()}</p>
      <p className="ptext">{c.blurb}</p>

      <span className="plabel">WHO YOU ARE</span>
      <p className="ptext">{c.whoYouAre}</p>

      <span className="plabel">WHAT YOU BELIEVE</span>
      <p className="ptext">{c.believe}</p>

      <span className="plabel">WHAT YOU ARE AFRAID OF</span>
      <p className="ptext">{c.afraidOf}</p>

      <span className="plabel">YOUR RESOURCE</span>
      <p className="ptext">
        <strong>{view.resource.label}</strong>: {view.resource.value} to start. It stays in the
        corner of your screen all game. The big screen tracks everything else.
      </p>
      <p className="ptext">{c.resourcePower}</p>

      <span className="plabel">HOW TO PLAY IT</span>
      <p className="ptext">{c.howToPlay}</p>

      {/* The three lines are the useful half of a character brief. A player who
          reads nothing else can still open their mouth in round one with one of
          these, which is the whole difference between a table that argues and a
          table that takes turns reading their cards out. */}
      <span className="plabel">THINGS YOU MIGHT SAY</span>
      {c.says.map((line) => (
        <div key={line} className="bubble">
          <p className="bubble__text">“{line}”</p>
        </div>
      ))}

      <span className="plabel">YOU WOULD NEVER SAY</span>
      <div className="bubble bubble--them">
        <p className="bubble__text">“{c.neverSay}”</p>
      </div>

      <button className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }} onClick={onNext}>
        ACCEPT THE ROLE
      </button>
    </div>
  )
}

/** P-04: three sealed cards. Lying about which you took is legal and expected. */
export function GoalPicker({ view, send }: { view: PhoneView; send: (c: Command) => void }) {
  const choices = view.goalChoices ?? []
  const [picked, setPicked] = useState<string | null>(null)
  const chosen = choices.find((g) => g.id === picked)

  // Sealing is permanent and used to happen on a single tap, with no statement
  // of what had been sealed. Two taps, and the second one says it back to you.
  if (chosen) {
    return (
      <div className="pbody">
        <span className="plabel">SEALED · NOBODY ELSE SEES THIS</span>
        <h1 className="pheading">Take this one?</h1>
        <div className="bubble">
          <div className="bubble__lead">{chosen.title}</div>
          <p className="bubble__text">{chosen.desc}</p>
        </div>
        <p className="ptext">
          It cannot be swapped later, and it only pays off if the country hits all three targets
          too. You can re-read it any time under ⋯.
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
      <span className="plabel">SEALED · NOBODY ELSE SEES THIS</span>
      <h1 className="pheading">What you want.</h1>
      <p className="ptext">
        Three of the twelve in this game are yours to pick from. What stays hidden is which one you
        took, and everyone else is choosing in secret too.
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
      <span className="plabel">SEMENANJARA TONIGHT · BREAKING</span>
      <h1 className="pheading">{s.title}</h1>
      <p className="ptext">{s.situation}</p>
      <div style={{ height: 2, background: 'var(--skin-base)', margin: 'var(--space-2) 0' }} />
      <span className="plabel">FOR YOUR EYES ONLY</span>
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
  const stake = role === 'community' ? 'a Public Mandate veto' : 'a Trust token'
  const clock = formatClock(remaining)

  return (
    <div className="tip" role="dialog" aria-label="Insider tip">
      <span className="tip__label">INSIDER TIP</span>
      <span className="tip__eyes">FOR YOUR EYES ONLY</span>
      {/* This is the only overlay that covers the whole phone, so it has to
          carry the clock it is hiding, because otherwise it is a timed decision with
          the timer behind it. */}
      {clock ? <span className="tip__clock">{clock}</span> : null}

      <span className={`tip__chip tip__chip--${unverified ? 'unverified' : 'confirmed'}`}>
        {unverified ? '◇ UNVERIFIED · TRUE 1 IN 2' : 'CONFIRMED'}
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
          PUBLISH TO THE NATION
        </button>
        <p className="tip__reminder">
          {unverified
            ? `A gamble. If it turns out true you gain ${stake}; if not, you lose ${stake}. You find out when the round resolves.`
            : `Safe to publish. It is true, and you gain ${stake} when the round resolves.`}
        </p>
        <button className="btn" onClick={onClose} style={{ color: '#fff' }}>
          KEEP IT QUIET
        </button>
        <p className="tip__reminder">
          Nobody knows you received this, and keeping it costs you nothing.
        </p>
      </div>
    </div>
  )
}

/** P-10: locked. The phone gets out of the way. */
export function LookUp({ view, reckoning = false }: { view: PhoneView; reckoning?: boolean }) {
  return (
    <div className="lookup" data-role={view.role}>
      <span className="lookup__label">{reckoning ? 'THE RECKONING' : 'LOCKED IN'}</span>
      <h1 className="lookup__big">
        Look
        <br />
        up.
      </h1>
      <div className="lookup__rule" />
      <p className="lookup__note">
        {reckoning
          ? 'The cards are flipping on the big screen.'
          : 'The cards flip on the big screen. This one has nothing more for you.'}
      </p>
      {!reckoning && view.waitingOn > 0 ? (
        <p className="lookup__note" style={{ opacity: 0.7 }}>
          WAITING · {4 - view.waitingOn} OF 4 IN
        </p>
      ) : null}
    </div>
  )
}

/** P-11: the round result. Three sentences, no numbers. */
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
          <span className="plabel">YOUR TWO TRUST TOKENS</span>
          <p className="ptext">
            One goes to whoever looked after people best, one to whoever did most for the future.
            The big screen shows where they landed.
          </p>
        </>
      ) : null}
    </div>
  )
}
