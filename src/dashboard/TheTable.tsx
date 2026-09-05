/**
 * THE TALK: the dashboard becomes the record of what was said out loud.
 *
 * The phones go quiet during this phase and this screen does the remembering,
 * which is what lets the promise-broken moment land later. An offer in flight
 * is a literal bar crossing between two role glyphs, so the room watches a
 * resource physically change hands.
 *
 * The tip line at the bottom right is deliberately vague: announcing that
 * *someone* knows something is what makes four people suspicious of each other.
 */
import type { DashboardView, SayShape } from '../game/session'
import { ROLE_LABEL } from '../game/session'
import { LABEL } from '../game/vocab'
import { RoleGlyph } from '../ui/primitives'

/** A DEAL is called out because it is the one the room should be watching. */
const PLEDGE_LABEL: Record<SayShape, string> = {
  promise: 'PROMISED',
  demand: 'ASKED FOR',
  deal: 'A DEAL',
  cofund: 'PAYING HALF',
}

export function TheTable({ view }: { view: DashboardView }) {
  const promises = view.promises
  return (
    <div className="table">
      <section className="table__record">
        <h2 className="table__heading">WHAT PEOPLE SAID</h2>
        {promises.length === 0 ? (
          <p className="table__empty">Nobody has said anything yet.</p>
        ) : (
          <ul className="table__promises">
            {promises.map((p) => (
              <li key={p.id} className="pledge" data-role={p.from}>
                <RoleGlyph role={p.from} size={16} className="pledge__glyph" />
                <span className="pledge__text">{p.text}</span>
                <span className={`pledge__kind pledge__kind--${p.kind}`}>{PLEDGE_LABEL[p.kind]}</span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="table__heading" style={{ marginTop: 'var(--space-6)' }}>
          MONEY BEING SENT
        </h2>
        {view.offersInFlight.length === 0 ? (
          <p className="table__empty">
            {/* PAYING HALF above and "no money is being sent" below read as
                a contradiction to a boy waiting to be paid. */}
            {view.coFund
              ? 'No money is being sent. Paying half costs 1 Budget when the cards turn.'
              : 'No money is being sent.'}
          </p>
        ) : (
          <ul className="table__offers">
            {view.offersInFlight.map((o) => (
              <li key={o.id} className="inflight">
                <span data-role={o.from} className="inflight__end">
                  <RoleGlyph role={o.from} size={16} />
                </span>
                <span className="inflight__wire">
                  <span className="inflight__pulse" />
                </span>
                <span data-role={o.to} className="inflight__end">
                  <RoleGlyph role={o.to} size={16} />
                </span>
                <span className="inflight__label">
                  {o.amount} {o.resource === 'fiscal' ? 'BUDGET' : 'COMPANY MONEY'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="table__side">
        {view.spotlight ? (
          <div className="spotlight-panel">
            <h3 className="spotlight-panel__title">{LABEL.spotlight}</h3>
            <p className="spotlight-panel__body">
              {view.spotlight.target ? (
                <>
                  The Spotlight caught the <strong>{ROLE_LABEL[view.spotlight.target]}</strong>.
                </>
              ) : (
                <>The Activist is using a Spotlight.</>
              )}
            </p>
            <p className="spotlight-panel__rule">
              If a player picks a dirty card, that card only half works.
            </p>
            <div className="spotlight-panel__pips">
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < view.spotlight!.remaining ? 'pip pip--on' : 'pip'} />
              ))}
            </div>
          </div>
        ) : null}

        {view.veto ? (
          <div className="veto-panel">
            <h3 className="veto-panel__title">THE COMMUNITY SAID NO</h3>
            <p className="veto-panel__body">
              The Community took{' '}
              {view.veto.removed.length === 0 ? (
                <em>an option</em>
              ) : (
                view.veto.removed.map((title, i) => (
                  <span key={title}>
                    {i > 0 ? (i === view.veto!.removed.length - 1 ? ' and ' : ', ') : ''}
                    <em>{title}</em>
                  </span>
                ))
              )}{' '}
              away from the {ROLE_LABEL[view.veto.target]} this round.
            </p>
            <p className="veto-panel__count">
              {view.veto.remaining} VETO{view.veto.remaining === 1 ? '' : 'ES'} LEFT
            </p>
          </div>
        ) : null}

        {view.publishedTip ? (
          <div className="tip-panel">
            <h3 className="tip-panel__title">SHARED WITH EVERYONE</h3>
            <p className="tip-panel__from">{ROLE_LABEL[view.publishedTip.from]} · {view.publishedTip.source}</p>
            <p className="tip-panel__body">{view.publishedTip.text}</p>
          </div>
        ) : null}

        {/* Once the tip is shared, everyone knows who had it, so the line
            saying they do not would be false. */}
        {view.tipDealtThisRound && !view.publishedTip ? (
          <p className="table__tipline">
            Someone got a tip this round. The others do not know who.
          </p>
        ) : null}
      </aside>
    </div>
  )
}
