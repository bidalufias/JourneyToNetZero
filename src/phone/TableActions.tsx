/**
 * THE TALK: ninety seconds. Argue, plead, threaten, trade.
 *
 * The phone's job here is to get out of the way. Five actions, each two taps,
 * each in a sheet that rises from the bottom and never covers the timer. An
 * incoming offer is the only thing allowed to interrupt, and it announces
 * itself on the dashboard at the same instant so the room hears the deal even
 * if the recipient is mid-sentence.
 */
import { useState } from 'react'
import { ROLES, type Role } from '../engine/types'
import type { Command } from '../game/room'
import type { PhoneView } from '../game/session'
import { ROLE_LABEL, ROLE_RESOURCE } from '../game/session'
import { BOARD_NAME, DEMAND_PHRASES } from '../game/copy'
import { RoleGlyph } from '../ui/primitives'

type Sheet = 'offer' | 'promise' | 'demand' | 'spotlight' | 'veto' | null

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
  const spoke = view.promises.some((p) => p.from === view.role)

  return (
    <div className="pbody">
      <span className="plabel">ROUND {view.round} \u00B7 THE TALK</span>
      <h1 className="pheading">Talk to each other.</h1>
      <p className="ptext">{view.privateLine}</p>

      {/* An incoming offer is the only interrupt allowed during THE TABLE. */}
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
              {p.kind === 'promise' ? 'PLEDGED' : 'DEMAND'}
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
      {view.role === 'government' && view.coFund ? (
        <p className="pnote">Paying half of the partnership. It costs you 1 Budget this round.</p>
      ) : null}

      <div className="btn-row" style={{ marginTop: 'auto' }}>
        <button
          className="btn btn--ghost"
          disabled={readOnly || !canSend}
          onClick={() => setSheet('offer')}
        >
          OFFER
        </button>
        <button className="btn btn--ghost" disabled={readOnly} onClick={() => setSheet('promise')}>
          {spoke ? 'REPLACE' : 'PROMISE'}
        </button>
        <button className="btn btn--ghost" disabled={readOnly} onClick={() => setSheet('demand')}>
          DEMAND
        </button>
        {view.role === 'activist' ? (
          <button
            className="btn btn--ghost"
            disabled={readOnly || view.spotlightsRemaining <= 0 || view.spotlightCalled}
            onClick={() => setSheet('spotlight')}
          >
            SPOTLIGHT \u00B7 {view.spotlightsRemaining}
          </button>
        ) : null}
        {view.role === 'community' ? (
          <button
            className="btn btn--ghost"
            disabled={readOnly || view.vetoesRemaining <= 0}
            onClick={() => setSheet('veto')}
          >
            SAY NO \u00B7 {view.vetoesRemaining}
          </button>
        ) : null}
        {view.role === 'government' ? (
          <button
            className="btn btn--ghost"
            disabled={readOnly}
            onClick={() => send({ t: 'coFund', role: 'government', agree: !view.coFund })}
          >
            {view.coFund ? 'STOP PAYING HALF' : 'PAY HALF'}
          </button>
        ) : null}
      </div>

      {sheet ? <ActionSheet kind={sheet} view={view} send={send} onClose={close} /> : null}
    </div>
  )
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
  const others = ROLES.filter((r) => r !== view.role)
  const titles: Record<Exclude<Sheet, null>, string> = {
    offer: 'SEND AN OFFER',
    promise: 'PROMISE SOMETHING',
    demand: 'ASK FOR SOMETHING',
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
          {kind === 'offer' ? <OfferSheet view={view} send={send} onClose={onClose} /> : null}

          {kind === 'promise' ? (
            <>
              <p className="pnote">The big screen will show it. Nothing makes you keep it.</p>
              {view.options.map((o) => (
                <button
                  key={o.id}
                  className="btn btn--ghost"
                  onClick={() => {
                    send({ t: 'promise', role: view.role, optionId: o.id })
                    onClose()
                  }}
                >
                  {BOARD_NAME[view.role]} promises to choose “{o.title}”.
                </button>
              ))}
            </>
          ) : null}

          {kind === 'demand' ? (
            <>
              <p className="pnote">
                This is pressure, not a rule. Nothing makes them do it, and everyone sees you ask.
                One per round. A second one replaces it.
              </p>
              {others.map((target) => (
                <div key={target}>
                  <span className="plabel">{ROLE_LABEL[target].toUpperCase()}</span>
                  {DEMAND_PHRASES.map((phrase) => (
                    <button
                      key={`${target}-${phrase.id}`}
                      className="btn btn--ghost"
                      onClick={() => {
                        send({ t: 'demand', role: view.role, target, phraseId: phrase.id })
                        onClose()
                      }}
                    >
                      {phrase.text(ROLE_LABEL[target])}
                    </button>
                  ))}
                </div>
              ))}
            </>
          ) : null}

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
        \u201CThe public will not accept this.\u201D
      </p>

      <label className="plabel" htmlFor="veto-slide">
        HOLD AND SLIDE TO SAY NO \u2192
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
