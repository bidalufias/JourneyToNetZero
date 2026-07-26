/**
 * THE TABLE — ninety seconds. Argue, plead, threaten, trade.
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
import { ROLE_LABEL } from '../game/session'
import { DEMAND_PHRASES } from '../game/copy'
import { RoleGlyph } from '../ui/primitives'

type Sheet = 'offer' | 'promise' | 'demand' | 'spotlight' | 'veto' | null

export function TableActions({ view, send }: { view: PhoneView; send: (c: Command) => void }) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const close = () => setSheet(null)

  return (
    <div className="pbody">
      <span className="plabel">ROUND {view.round} · THE TABLE</span>
      <h1 className="pheading">Talk to each other.</h1>
      <p className="ptext">{view.privateLine}</p>

      {/* An incoming offer is the only interrupt allowed during THE TABLE. */}
      {view.incomingOffers.map((o) => (
        <div key={o.id} className="bubble bubble--them">
          <div className="bubble__label">INCOMING OFFER</div>
          <div className="bubble__lead">
            {ROLE_LABEL[o.from]} sends you {o.amount}{' '}
            {o.resource === 'fiscal' ? 'Fiscal Point' : 'Capital'}
            {o.amount > 1 ? 's' : ''}.
          </div>
          <div className="btn-row" style={{ marginTop: 'var(--space-3)' }}>
            <button
              className="btn btn--ghost"
              style={{ color: 'var(--color-text)' }}
              onClick={() => send({ t: 'respondOffer', role: view.role, offerId: o.id, accept: true })}
            >
              ACCEPT
            </button>
            <button
              className="btn"
              onClick={() => send({ t: 'respondOffer', role: view.role, offerId: o.id, accept: false })}
            >
              DECLINE
            </button>
          </div>
        </div>
      ))}

      <span className="plabel" style={{ marginTop: 'var(--space-2)' }}>
        ON THE BOARD
      </span>
      {view.promises.length === 0 ? (
        <p className="pmono">Nothing said out loud yet.</p>
      ) : (
        view.promises.map((p) => (
          <div key={p.id} className="bubble">
            <div className="bubble__label">{p.kind === 'promise' ? 'PLEDGED' : 'DEMAND'}</div>
            <p className="bubble__text">{p.text}</p>
          </div>
        ))
      )}

      <div className="btn-row" style={{ marginTop: 'auto' }}>
        <button className="btn btn--ghost" onClick={() => setSheet('offer')}>
          OFFER
        </button>
        <button className="btn btn--ghost" onClick={() => setSheet('promise')}>
          PROMISE
        </button>
        <button className="btn btn--ghost" onClick={() => setSheet('demand')}>
          DEMAND
        </button>
        {view.role === 'activist' ? (
          <button
            className="btn btn--ghost"
            disabled={view.spotlightsRemaining <= 0}
            onClick={() => setSheet('spotlight')}
          >
            SPOTLIGHT · {view.spotlightsRemaining}
          </button>
        ) : null}
        {view.role === 'community' ? (
          <button
            className="btn btn--ghost"
            disabled={view.vetoesRemaining <= 0}
            onClick={() => setSheet('veto')}
          >
            MANDATE · {view.vetoesRemaining}
          </button>
        ) : null}
        {view.role === 'government' ? (
          <button className="btn btn--ghost" onClick={() => send({ t: 'coFund', role: 'government', agree: true })}>
            CO-FUND
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
    promise: 'MAKE A PUBLIC PROMISE',
    demand: 'MAKE A DEMAND',
    spotlight: 'CALL A SPOTLIGHT',
    veto: 'PUBLIC MANDATE',
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
              <p className="pmono">
                THE BIG SCREEN WILL SAY IT. NOTHING MAKES YOU KEEP IT.
              </p>
              {view.options.map((o) => (
                <button
                  key={o.id}
                  className="btn btn--ghost"
                  onClick={() => {
                    send({ t: 'promise', role: view.role, optionId: o.id })
                    onClose()
                  }}
                >
                  “{ROLE_LABEL[view.role]} will {o.title.toLowerCase()}.”
                </button>
              ))}
            </>
          ) : null}

          {kind === 'demand' ? (
            <>
              {others.map((target) =>
                DEMAND_PHRASES.slice(0, 3).map((phrase) => (
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
                )),
              )}
            </>
          ) : null}

          {kind === 'spotlight' ? (
            <>
              <p className="ptext">
                Name whoever takes the dirtiest option this round. It only half works for them, it
                costs them standing, and the country notices.
              </p>
              <p className="pmono">THREE FOR THE WHOLE GAME. {view.spotlightsRemaining} LEFT.</p>
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
  const canSend = view.resource.kind === 'fiscal' || view.resource.kind === 'capital'

  if (!canSend) {
    return (
      <p className="ptext">
        You hold no transferable resource — your power is the mandate, not the money.
      </p>
    )
  }

  return (
    <>
      <span className="plabel">TO WHOM</span>
      {ROLES.filter((r) => r !== view.role).map((r) => (
        <button
          key={r}
          className={`btn ${to === r ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTo(r)}
        >
          <RoleGlyph role={r} size={14} /> {ROLE_LABEL[r]}
        </button>
      ))}
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
      <p className="pmono">TRANSFERS ARE IMMEDIATE AND PERMANENT.</p>
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
      <span className="plabel">REMOVING FROM</span>
      {ROLES.filter((r) => r !== 'community').map((r) => (
        <button
          key={r}
          className={`btn ${target === r ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTarget(r)}
        >
          <RoleGlyph role={r} size={14} /> {ROLE_LABEL[r]}
        </button>
      ))}
      <p className="pmono">
        THIS ROUND ONLY. EVERYONE WILL BE TOLD IT WAS YOU, AND YOU WILL HAVE{' '}
        {view.vetoesRemaining - 1} LEFT.
      </p>
      <p className="pmono" style={{ color: 'var(--jtnz-com-deep)' }}>
        “THE PUBLIC WILL SIMPLY NOT ACCEPT THIS.”
      </p>

      <label className="plabel" htmlFor="veto-slide">
        HOLD AND SLIDE TO VETO →
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
