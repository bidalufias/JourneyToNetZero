/**
 * Phone screens: onboarding, the crisis brief, the insider tip, the locked
 * screen, and the round result.
 */
import { useState } from 'react'
import type { Role } from '../engine/types'
import type { Command } from '../game/room'
import type { InsiderTip, PhoneView } from '../game/session'
import { RECKONING_CARD_GAP_MS, RECKONING_FIRST_CARD_MS, ROLE_CARD, ROLE_LABEL, phaseMs } from '../game/session'
import { arrows } from '../game/impact'
import { LABEL, STEP_LABEL, TERM } from '../game/vocab'
import { revealedCount } from '../dashboard/reckoning-clock'
import { RoleGlyph, formatClock } from '../ui/primitives'
import { RoleCard } from '../ui/RoleCard'
import { DoneButton } from './TableActions'

/**
 * P-03: the role reveal. The skin applies here and never changes again.
 *
 * The card, the player's name, and I AM READY. That is the whole brief. It
 * used to be nine labelled sections and about 450 words, handed to somebody who
 * had never seen the game and had ninety seconds, so most of it went unread and
 * the useful part went unread with it. The two say-lines are one tap away.
 */
export function RoleReveal({ view, onNext }: { view: PhoneView; onNext: () => void }) {
  const c = ROLE_CARD[view.role]

  return (
    <div className="pbody">
      <span className="plabel">{c.org.toUpperCase()}</span>
      <h1 className="pbig">{c.title}</h1>
      <div style={{ height: 4, background: 'var(--skin-mark)', width: 120 }} />

      <RoleCard role={view.role} name={view.name} says />

      <p className="pnote">Your card is always under ⋯, top right.</p>

      <button className="btn btn--primary" style={{ marginTop: 'auto' }} onClick={onNext}>
        I AM READY
      </button>
    </div>
  )
}

/** After the goal is chosen: the card with its fifth line, and nothing to do. */
export function GoalChosen({ view }: { view: PhoneView }) {
  return (
    <div className="pbody">
      <span className="plabel">SECRET · NOBODY ELSE SEES THIS</span>
      <h1 className="pheading">Chosen. Look up.</h1>
      <p className="ptext">The first crisis is coming. Your phone will tell you what to do.</p>
      <RoleCard
        role={view.role}
        name={view.name}
        goal={view.goalTitle && view.goalDesc ? { title: view.goalTitle, desc: view.goalDesc } : null}
      />
      <p className="pnote">Your goal only counts if the country reaches all 3 targets.</p>
    </div>
  )
}

/** P-04: three secret goals. Lying about which you took is legal and expected. */
export function GoalPicker({ view, send }: { view: PhoneView; send: (c: Command) => void }) {
  const choices = view.goalChoices ?? []
  const [picked, setPicked] = useState<string | null>(null)
  const chosen = choices.find((g) => g.id === picked)

  // Choosing is permanent and used to happen on a single tap, with no statement
  // of what had been chosen. Two taps, and the second one says it back to you.
  if (chosen) {
    return (
      <div className="pbody">
        <span className="plabel">SECRET · NOBODY ELSE SEES THIS</span>
        <h1 className="pheading">Choose this one?</h1>
        <div className="bubble">
          <div className="bubble__lead">{chosen.title}</div>
          <p className="bubble__text">{chosen.desc}</p>
        </div>
        <p className="ptext">
          You cannot change this later. It only counts if the country reaches all 3 targets. You
          can read it again under ⋯.
        </p>
        <button
          className="btn btn--primary"
          style={{ marginTop: 'auto' }}
          onClick={() => send({ t: 'pickGoal', role: view.role, goalId: chosen.id })}
        >
          CHOOSE THIS ONE
        </button>
        <button className="btn btn--ghost" onClick={() => setPicked(null)}>
          BACK
        </button>
      </div>
    )
  }

  return (
    <div className="pbody">
      <span className="plabel">SECRET · NOBODY ELSE SEES THIS</span>
      <h1 className="pheading">Your secret goal.</h1>
      <p className="ptext">
        Choose one of these three. Nobody sees which one you took. The others are choosing in
        secret too. You may lie about yours.
      </p>
      {/* The goals are written in the country's numbers, and the numbers live
          at the top of this phone. Said once, here, where a player first has
          to read a number and know what it is. */}
      <p className="pnote">
        The goals use the country’s numbers. They are at the top of your phone. Carbon must reach
        0. Clean Economy is on the big screen.
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
          {s.role === view.role ? (
            <span className="pseat__tag">YOU</span>
          ) : s.name ? (
            <span className="pseat__tag">{s.ready ? 'READY' : 'IN'}</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/**
 * P-06: the crisis, plus the one line written for this seat alone.
 *
 * GOT IT under it, when the crisis is live. Four of them open the Talk, so a
 * room that has read the news does not sit through twenty seconds of
 * "nothing to tap yet".
 */
export function Crisis({ view, send }: { view: PhoneView; send?: (c: Command) => void }) {
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
      {send && view.phase === 'crisis' ? (
        <div style={{ marginTop: 'auto' }}>
          <DoneButton
            view={view}
            label="GOT IT"
            note="The Talk starts when all four have tapped, or the clock ends."
            send={send}
          />
        </div>
      ) : null}
    </div>
  )
}

/**
 * The Reveal, on the phone.
 *
 * The same clock as the projector: four seconds of LOOK UP with a countdown,
 * then the four cards, one every three seconds, each with the two lines the
 * big screen draws under it. A phone used to say "Look up." and nothing
 * else, and three of four first-time players lifted their eyes after the
 * practice cards had already turned.
 *
 * In the practice, GOT IT appears once the fourth card has turned, and four
 * of them end the step.
 */
export function RevealScreen({
  view,
  remaining,
  send,
}: {
  view: PhoneView
  remaining: number | null
  send: (c: Command) => void
}) {
  const mirror = view.reveal
  const total = phaseMs(view.phase, view.round)
  const elapsed = remaining === null ? total : Math.max(0, total - remaining)
  const shown = revealedCount(elapsed)
  const countdown = Math.max(1, Math.ceil((RECKONING_FIRST_CARD_MS - elapsed) / 1000))
  const seen = elapsed >= RECKONING_FIRST_CARD_MS + 4 * RECKONING_CARD_GAP_MS
  const practice = mirror?.practice ?? view.phase === 'practiceReveal'
  const label = practice ? STEP_LABEL.practiceReveal : `${LABEL.reveal} · ROUND ${view.round}`

  if (!mirror || shown === 0) {
    return (
      <div className="lookup" data-role={view.role}>
        <span className="lookup__label">{label}</span>
        <h1 className="lookup__big">
          Look
          <br />
          up.
        </h1>
        <div className="lookup__rule" />
        <p className="lookup__note">
          All four locked. The cards turn in <strong>{countdown}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="mirror" data-role={view.role}>
      <span className="lookup__label">{label}</span>
      <p className="mirror__cue">The big screen is showing the cards. Your phone shows them too.</p>
      {mirror.cards.map((c, i) => {
        const up = i < shown
        return (
          <div key={c.role} className={`mirror__card${up ? ' mirror__card--up' : ''}`} data-role={c.role}>
            <div className="mirror__role">
              <RoleGlyph role={c.role} size={14} />
              <span>{ROLE_LABEL[c.role].toUpperCase()}</span>
              {c.role === view.role ? <span className="mirror__you">YOU</span> : null}
            </div>
            {up ? (
              <>
                <div className="mirror__title">{c.title}</div>
                {c.badges.map((b) => (
                  <div key={b.text} className={`mirror__badge mirror__badge--${b.tone}`}>
                    {b.text}
                  </div>
                ))}
              </>
            ) : (
              <div className="mirror__back">turning next…</div>
            )}
          </div>
        )
      })}
      {practice && seen ? (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <p className="ptext">Nothing here counted. The country goes back to the start.</p>
          <DoneButton
            view={view}
            label="GOT IT"
            note="The game moves on when all four have seen this."
            send={send}
          />
        </div>
      ) : null}
      {!practice && shown >= 4 ? (
        <p className="pnote">Your own result comes next, on this phone.</p>
      ) : null}
    </div>
  )
}

/**
 * P-07: A Tip. The only dark screen on any phone, and the only place the
 * app uses a large shadow: it should feel like the app has gone quiet around
 * you.
 *
 * One kind of tip and one decision. It is always true, so the question is not
 * whether to believe it, it is whether an advantage is worth more than
 * standing. Two buttons, and the reason for each under it.
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
  const stake = role === 'community' ? '1 veto' : `1 ${TERM.publicTrust}`
  const clock = formatClock(remaining)

  return (
    <div className="tip" role="dialog" aria-label="A tip">
      <span className="tip__label">A {LABEL.tip}</span>
      <span className="tip__eyes">ONLY YOU CAN SEE THIS</span>
      {/* This is the only overlay that covers the whole phone, so it has to
          carry the clock it is hiding, because otherwise it is a timed decision with
          the timer behind it. */}
      {clock ? <span className="tip__clock">{clock}</span> : null}

      <span className="tip__chip tip__chip--confirmed">THIS IS TRUE</span>

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
          SHARE IT
        </button>
        <p className="tip__reminder">You get {stake}. Everyone sees the warning.</p>
        <button className="btn" onClick={onClose} style={{ color: '#fff' }}>
          KEEP IT SECRET
        </button>
        <p className="tip__reminder">Only you know this. You can use it first.</p>
      </div>
    </div>
  )
}

/** P-10: locked. The phone gets out of the way. */
/**
 * The four moments the phone has nothing to do but say so.
 *
 * A phone left on the seat list, or on a locked card, with no instruction
 * reads as a phone that has stopped working. Each of these names the step and
 * says where to look.
 */
export type LookUpVariant = 'locked' | 'reveal' | 'briefing' | 'practice'

const LOOK_UP: Record<LookUpVariant, { label: string; note: string }> = {
  locked: { label: 'LOCKED', note: 'Your card is locked. The cards will show on the big screen.' },
  reveal: { label: LABEL.reveal, note: 'The cards are showing on the big screen.' },
  briefing: {
    label: STEP_LABEL.briefing,
    note: 'The big screen is explaining the game. Your phone comes back for the practice.',
  },
  practice: { label: STEP_LABEL.practiceReveal, note: 'This is what a Reveal looks like. Nothing here counts.' },
}

export function LookUp({ view, variant = 'locked' }: { view: PhoneView; variant?: LookUpVariant }) {
  const copy = LOOK_UP[variant]
  return (
    <div className="lookup" data-role={view.role}>
      <span className="lookup__label">{copy.label}</span>
      <h1 className="lookup__big">
        Look
        <br />
        up.
      </h1>
      <div className="lookup__rule" />
      <p className="lookup__note">{copy.note}</p>
      {variant === 'locked' && view.waitingOn > 0 ? (
        <p className="lookup__note" style={{ opacity: 0.7 }}>
          {4 - view.waitingOn} OF 4 LOCKED
        </p>
      ) : null}
    </div>
  )
}

/**
 * P-11: the round result, and the only place the app shows a player a number
 * about their own card.
 *
 * The card promised four arrows. This says what those arrows turned into, with
 * the carbon figure the engine actually delivered rather than the one printed
 * on the option, because the gap between the two *is* the game: the same card
 * cuts less when nobody co-funds it, less again under a Spotlight, and less
 * every round as the cheap abatement runs out.
 */
export function RoundResult({ view }: { view: PhoneView }) {
  const r = view.roundResult
  if (!r) return <LookUp view={view} variant="reveal" />
  const c = ROLE_CARD[view.role]

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

      <span className="plabel">WHAT YOUR CARD DID</span>
      <div className="outcome">
        <div className="outcome__top">
          <span className="outcome__title">{r.title}</span>
          <span className="outcome__cost">{r.costLabel}</span>
        </div>
        {/* The same four chips the card carried, so a player can hold the
            promise and the outcome in one glance. */}
        <span className="impact">
          {r.impact.map((i) => (
            <span
              key={i.meter}
              className={`impact__cell impact__cell--${i.dir === 0 ? 'flat' : i.good ? 'good' : 'bad'}`}
            >
              <span className="impact__label">{i.label}</span>
              <span className="impact__arrows">{arrows(i.dir)}</span>
            </span>
          ))}
        </span>
        <p className="outcome__delivered">
          {r.carbon <= 0 ? 'Cut carbon by' : 'Added'} {Math.abs(r.carbon).toFixed(1)} million tonnes
          {r.carbon <= 0 ? '' : ' of carbon'}
        </p>
        {r.note ? <p className="outcome__note">{r.note}</p> : null}
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

      {view.trustAward ? (
        <>
          <span className="plabel">PUBLIC TRUST THIS ROUND</span>
          <p className="ptext">
            <strong>{ROLE_LABEL[view.trustAward.care]}</strong> looked after people best.{' '}
            <strong>{ROLE_LABEL[view.trustAward.future]}</strong> did most for the future.
          </p>
          {/* Why, in this seat's terms. A room that watched both points go to a
              promise-breaker decided the game was rigged, because nothing said
              that promises do not move Public Trust. */}
          {view.trustLines.map((line) => (
            <p key={line} className="pnote">
              {line}
            </p>
          ))}
        </>
      ) : null}
    </div>
  )
}
