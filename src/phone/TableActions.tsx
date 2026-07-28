/**
 * THE TALK: ninety seconds. Argue, plead, threaten, trade.
 *
 * The phone's job here is to get out of the way. There used to be six buttons
 * on this screen and four of them put a sentence on the same board: PROMISE,
 * DEMAND, PAY HALF and, for two of the seats, a power. A player with ninety
 * seconds and a stranger to persuade should be choosing what to say, not which
 * of four verbs the app files it under.
 *
 * So there is one SAY IT button and one sheet behind it. The sheet asks a
 * question, not a taxonomy: what do you want to put on the big screen? The
 * shapes are sentences with a blank in them, composed by tapping, never typed,
 * so every line the room reads out loud is short and grammatical.
 *
 * An incoming offer is the only thing allowed to interrupt, and it announces
 * itself on the dashboard at the same instant so the room hears the deal even
 * if the recipient is mid-sentence.
 */
import { useState } from 'react'
import { ROLES, type Role } from '../engine/types'
import type { Command } from '../game/room'
import type { PhoneView, SayShape } from '../game/session'
import { ROLE_LABEL, ROLE_RESOURCE } from '../game/session'
import { BOARD_NAME, DEAL_CONDITIONS, DEMAND_PHRASES } from '../game/copy'
import { RoleGlyph } from '../ui/primitives'

type Sheet = 'say' | 'offer' | 'spotlight' | 'veto' | null

export function TableActions({
  view,
  send,
  readOnly = false,
}: {
  view: PhoneView
  send: (c: Command) => void
  readOnly?: boolean
}) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const close = () => setSheet(null)

  /** Only two seats hold anything that can change hands. */
  const canSend = view.resource.kind === 'fiscal' || view.resource.kind === 'capital'
  const mySent = view.sentOffers
  const spoke = view.promises.some((p) => p.from === view.role && p.kind !== 'cofund')

  return (
    <div className="pbody">
      <span className="plabel">ROUND {view.round} · THE TALK</span>
      <h1 className="pheading">Talk to each other.</h1>
      <p className="ptext">{view.privateLine}</p>

      {/* An incoming offer is the only interrupt allowed during THE TALK. */}
      {view.incomingOffers.map((o) => (
        <div key={o.id} className="bubble bubble--them">
          <div className="bubble__label">INCOMING OFFER</div>
          <div className="bubble__lead">
            {ROLE_LABEL[o.from]} sends you {o.amount} {o.resource === 'fiscal' ? 'Budget' : 'Company Money'}.
          </div>
          <p className="bubble__text">It ends when the round does. You owe nothing in return.</p>
          <div className="btn-row" style={{ marginTop: 'var(--space-3)' }}>
            <button
              className="btn btn--ghost"
              style={{ color: 'var(--color-text)' }}
              disabled={readOnly}
              onClick={() => send({ t: 'respondOffer', role: view.role, offerId: o.id, accept: true })}
            >
              ACCEPT
            </button>
            <button
              className="btn"
              disabled={readOnly}
              onClick={() => send({ t: 'respondOffer', role: view.role, offerId: o.id, accept: false })}
            >
              DECLINE
            </button>
          </div>
        </div>
      ))}

      {/* A transfer used to close its sheet and say nothing at all, so the
          sender had no way to know whether it had happened. */}
      {mySent.map((o) => (
        <div key={o.id} className="bubble">
          <div className="bubble__label">YOU SENT</div>
          <p className="bubble__text">
            {o.amount} {o.resource === 'fiscal' ? 'Budget' : 'Company Money'} to the{' '}
            {ROLE_LABEL[o.to]}:{' '}
            {o.status === 'pending'
              ? 'waiting for them to accept.'
              : o.status === 'accepted'
                ? 'accepted, and gone.'
                : o.status === 'declined'
                  ? 'declined.'
                  : 'nobody answered.'}
          </p>
        </div>
      ))}

      <span className="plabel" style={{ marginTop: 'var(--space-2)' }}>
        ON THE BOARD
      </span>
      {view.promises.length === 0 ? (
        <p className="pmono">Nothing said out loud yet.</p>
      ) : (
        view.promises.map((p) => (
          <div key={p.id} className={`bubble${p.from === view.role ? '' : ' bubble--them'}`}>
            <div className="bubble__label">
              {p.from === view.role ? 'YOU · ' : ''}
              {SAID_LABEL[p.kind]}
            </div>
            <p className="bubble__text">{p.text}</p>
          </div>
        ))
      )}

      {view.role === 'community' && view.vetoesRemaining < 2 ? (
        <p className="pnote">You used a veto this round. The big screen named you.</p>
      ) : null}
      {view.role === 'activist' && view.spotlightCalled ? (
        <p className="pnote">
          Spotlight called. It only lands if you also escalate with your own card this round.
        </p>
      ) : null}

      <div className="btn-row" style={{ marginTop: 'auto' }}>
        <button className="btn btn--accent" disabled={readOnly} onClick={() => setSheet('say')}>
          {spoke ? 'SAY SOMETHING ELSE' : 'SAY IT'}
        </button>
        <button
          className="btn btn--ghost"
          disabled={readOnly || !canSend}
          onClick={() => setSheet('offer')}
        >
          SEND MONEY
        </button>
        {view.role === 'activist' ? (
          <button
            className="btn btn--ghost"
            disabled={readOnly || view.spotlightsRemaining <= 0 || view.spotlightCalled}
            onClick={() => setSheet('spotlight')}
          >
            SPOTLIGHT · {view.spotlightsRemaining}
          </button>
        ) : null}
        {view.role === 'community' ? (
          <button
            className="btn btn--ghost"
            disabled={readOnly || view.vetoesRemaining <= 0}
            onClick={() => setSheet('veto')}
          >
            SAY NO · {view.vetoesRemaining}
          </button>
        ) : null}
      </div>

      {sheet ? <ActionSheet kind={sheet} view={view} send={send} onClose={close} /> : null}
    </div>
  )
}

/** How each shape reads on the board. The deal is the one worth naming loudly. */
const SAID_LABEL: Record<SayShape, string> = {
  promise: 'PLEDGED',
  demand: 'ASKED FOR',
  deal: 'OFFERED A DEAL',
  cofund: 'PAYING HALF',
}

function ActionSheet({
  kind,
  view,
  send,
  onClose,
}: {
  kind: Exclude<Sheet, null>
  view: PhoneView
  send: (c: Command) => void
  onClose: () => void
}) {
  const titles: Record<Exclude<Sheet, null>, string> = {
    say: 'SAY IT',
    offer: 'SEND MONEY',
    spotlight: 'CALL A SPOTLIGHT',
    veto: 'THE PUBLIC SAYS NO',
  }

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={titles[kind]}>
        <div className="sheet__head">
          <span className="sheet__title">{titles[kind]}</span>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sheet__body">
          {kind === 'say' ? <SaySheet view={view} send={send} onClose={onClose} /> : null}
          {kind === 'offer' ? <OfferSheet view={view} send={send} onClose={onClose} /> : null}

          {kind === 'spotlight' ? (
            <>
              <p className="ptext">
                It hits whoever takes the dirtiest card this round. Their card only half works and
                they lose Public Trust.
              </p>
              <p className="pnote">
                It only fires if you also escalate with your own card this round. If nobody goes
                dirty, it costs you nothing.
              </p>
              <p className="pnote">
                Three for the whole game. You have {view.spotlightsRemaining} left.
              </p>
              <button
                className="btn btn--accent"
                onClick={() => {
                  send({ t: 'spotlight', role: view.role })
                  onClose()
                }}
              >
                CALL IT
              </button>
              <button className="btn" onClick={onClose}>
                NOT THIS TIME
              </button>
            </>
          ) : null}

          {kind === 'veto' ? <VetoSheet view={view} send={send} onClose={onClose} /> : null}
        </div>
      </div>
    </>
  )
}

/**
 * One sheet, three sentences, two taps each.
 *
 * The shapes are offered in the order a table actually uses them: state your
 * position, then trade, then push. The deal is second rather than last because
 * it is the sentence the whole game is built to provoke, and a player scrolling
 * for it will not find it in ninety seconds.
 */
function SaySheet({
  view,
  send,
  onClose,
}: {
  view: PhoneView
  send: (c: Command) => void
  onClose: () => void
}) {
  const [shape, setShape] = useState<SayShape | null>(null)
  const others = ROLES.filter((r) => r !== view.role)

  if (shape === null) {
    return (
      <>
        <p className="pnote">
          One thing at a time. The big screen shows it to everyone. Nothing makes you keep it.
        </p>
        <button className="btn btn--ghost say__shape" onClick={() => setShape('promise')}>
          <span className="say__lead">I will choose…</span>
          <span className="say__hint">Say what you are about to do.</span>
        </button>
        <button className="btn btn--ghost say__shape" onClick={() => setShape('deal')}>
          <span className="say__lead">I will choose… if you…</span>
          <span className="say__hint">A deal. You go if they go.</span>
        </button>
        <button className="btn btn--ghost say__shape" onClick={() => setShape('demand')}>
          <span className="say__lead">I want someone to…</span>
          <span className="say__hint">Ask for something, in public.</span>
        </button>
        {view.role === 'government' ? (
          <button
            className="btn btn--ghost say__shape"
            onClick={() => {
              send({ t: 'say', role: 'government', shape: 'cofund', on: !view.coFund })
              onClose()
            }}
          >
            <span className="say__lead">
              {view.coFund ? 'Stop paying half.' : 'I will pay half of any partnership.'}
            </span>
            <span className="say__hint">
              {view.coFund
                ? 'You are paying half. It costs 1 Budget if the Business signs one.'
                : 'A partnership only half works unless you do. Costs 1 Budget.'}
            </span>
          </button>
        ) : null}
      </>
    )
  }

  if (shape === 'promise') {
    return (
      <>
        <p className="pnote">Pick the card you are pledging to.</p>
        {view.options.map((o) => (
          <button
            key={o.id}
            className="btn btn--ghost"
            onClick={() => {
              send({ t: 'say', role: view.role, shape: 'promise', optionId: o.id })
              onClose()
            }}
          >
            {BOARD_NAME[view.role]} will choose “{o.title}”.
          </button>
        ))}
        <button className="btn" onClick={() => setShape(null)}>
          BACK
        </button>
      </>
    )
  }

  if (shape === 'deal') return <DealSheet view={view} send={send} onClose={onClose} onBack={() => setShape(null)} />

  return (
    <>
      <p className="pnote">
        This is pressure, not a rule. Nothing makes them do it, and everyone sees you ask.
      </p>
      {others.map((target) => (
        <div key={target}>
          <span className="plabel">{ROLE_LABEL[target].toUpperCase()}</span>
          {DEMAND_PHRASES.map((phrase) => (
            <button
              key={`${target}-${phrase.id}`}
              className="btn btn--ghost"
              onClick={() => {
                send({ t: 'say', role: view.role, shape: 'demand', target, phraseId: phrase.id })
                onClose()
              }}
            >
              {phrase.text(ROLE_LABEL[target])}
            </button>
          ))}
        </div>
      ))}
      <button className="btn" onClick={() => setShape(null)}>
        BACK
      </button>
    </>
  )
}

/**
 * The deal, built in two taps: your card, then whose move it hangs on.
 *
 * The design document closes by saying the most important number in a session
 * is the number of times somebody says "what if we both did it?", and until now
 * there was no way to say it. It is one sentence with two blanks, and the room
 * watches it resolve as kept, broken, or never called in.
 */
function DealSheet({
  view,
  send,
  onClose,
  onBack,
}: {
  view: PhoneView
  send: (c: Command) => void
  onClose: () => void
  onBack: () => void
}) {
  const [optionId, setOptionId] = useState<string | null>(null)
  const card = view.options.find((o) => o.id === optionId)

  if (!card) {
    return (
      <>
        <p className="pnote">First: what will you do, if they come with you?</p>
        {view.options.map((o) => (
          <button key={o.id} className="btn btn--ghost" onClick={() => setOptionId(o.id)}>
            {o.title}
          </button>
        ))}
        <button className="btn" onClick={onBack}>
          BACK
        </button>
      </>
    )
  }

  return (
    <>
      <p className="ptext">
        “{BOARD_NAME[view.role]} will choose <strong>{card.title}</strong> if…”
      </p>
      {ROLES.filter((r) => r !== view.role).map((target) => (
        <div key={target}>
          <span className="plabel">{ROLE_LABEL[target].toUpperCase()}</span>
          {DEAL_CONDITIONS.map((c) => (
            <button
              key={`${target}-${c.id}`}
              className="btn btn--ghost"
              onClick={() => {
                send({
                  t: 'say',
                  role: view.role,
                  shape: 'deal',
                  optionId: card.id,
                  target,
                  conditionId: c.id,
                })
                onClose()
              }}
            >
              …{c.text(ROLE_LABEL[target])}.
            </button>
          ))}
        </div>
      ))}
      <p className="pnote">
        If they do their part and you do not, the big screen says you broke it. If they never do
        theirs, nothing is held against you.
      </p>
      <button className="btn" onClick={() => setOptionId(null)}>
        BACK
      </button>
    </>
  )
}

function OfferSheet({
  view,
  send,
  onClose,
}: {
  view: PhoneView
  send: (c: Command) => void
  onClose: () => void
}) {
  const [to, setTo] = useState<Role | null>(null)
  const resource = view.resource.kind === 'capital' ? 'capital' : 'fiscal'
  const unit = resource === 'fiscal' ? 'Budget' : 'Company Money'
  const canSend = view.resource.kind === 'fiscal' || view.resource.kind === 'capital'

  if (!canSend) {
    return (
      <p className="ptext">You have no money to send. Your power is saying no.</p>
    )
  }

  /**
   * Only the Government and the Business can hold money. Offering to either of
   * the other two moved nothing on acceptance while the big screen announced a
   * transfer, so the recipient believed they had been paid.
   */
  const recipients = ROLES.filter(
    (r) => r !== view.role && (ROLE_RESOURCE[r].kind === 'fiscal' || ROLE_RESOURCE[r].kind === 'capital'),
  )

  return (
    <>
      <span className="plabel">
        YOU HOLD {view.resource.value} {unit.toUpperCase()}
      </span>
      <span className="plabel">TO WHOM</span>
      {recipients.map((r) => (
        <button
          key={r}
          className={`btn ${to === r ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTo(r)}
        >
          <RoleGlyph role={r} size={14} /> {ROLE_LABEL[r]}
        </button>
      ))}
      <p className="pnote">
        Only the Government and the Business hold money. The others cannot be paid.
      </p>
      <span className="plabel">HOW MANY</span>
      <div className="btn-row">
        {[1, 2].map((n) => (
          <button
            key={n}
            className="btn btn--accent"
            disabled={!to || n > view.resource.value}
            onClick={() => {
              if (!to) return
              send({ t: 'offer', from: view.role, to, resource, amount: n })
              onClose()
            }}
          >
            SEND {n}
          </button>
        ))}
      </div>
      <p className="pnote">
        They have to accept. Once they do it is gone, and nothing makes them repay it.
      </p>
    </>
  )
}

/**
 * The only hold-and-slide in the app, and the only screen that goes full-bleed
 * in a role's deep tone. Two vetoes for a whole game deserve friction: an
 * accidental veto would be the single worst bug in the product.
 */
function VetoSheet({
  view,
  send,
  onClose,
}: {
  view: PhoneView
  send: (c: Command) => void
  onClose: () => void
}) {
  const [target, setTarget] = useState<Role | null>(null)
  const [slide, setSlide] = useState(0)

  return (
    <>
      <p className="ptext">You are about to take a choice away.</p>
      <span className="plabel">TAKE IT FROM</span>
      {ROLES.filter((r) => r !== 'community').map((r) => (
        <button
          key={r}
          className={`btn ${target === r ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTarget(r)}
        >
          <RoleGlyph role={r} size={14} /> {ROLE_LABEL[r]}
        </button>
      ))}
      <p className="pnote">
        This round only. Everyone will be told it was you. You will have{' '}
        {view.vetoesRemaining - 1} left.
      </p>
      <p className="pnote" style={{ color: 'var(--jtnz-com-deep)' }}>
        “The public will not accept this.”
      </p>

      <label className="plabel" htmlFor="veto-slide">
        HOLD AND SLIDE TO SAY NO →
      </label>
      <input
        id="veto-slide"
        type="range"
        min={0}
        max={100}
        value={slide}
        disabled={!target}
        onChange={(e) => {
          const v = Number(e.target.value)
          setSlide(v)
          if (v >= 100 && target) {
            send({ t: 'veto', role: 'community', target })
            onClose()
          }
        }}
        onPointerUp={() => setSlide(0)}
        style={{ width: '100%', height: 48 }}
      />
      <button className="btn" onClick={onClose}>
        NOT THIS TIME
      </button>
    </>
  )
}
