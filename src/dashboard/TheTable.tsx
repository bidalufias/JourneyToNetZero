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
import type { DashboardView } from '../game/session'
import { ROLE_LABEL } from '../game/session'
import { RoleGlyph } from '../ui/primitives'

export function TheTable({ view }: { view: DashboardView }) {
  const promises = view.promises
  return (
    <div className="table">
      <section className="table__record">
        <h2 className="table__heading">ON THE RECORD</h2>
        {promises.length === 0 ? (
          <p className="table__empty">Nothing has been said out loud yet.</p>
        ) : (
          <ul className="table__promises">
            {promises.map((p) => (
              <li key={p.id} className="pledge" data-role={p.from}>
                <RoleGlyph role={p.from} size={16} className="pledge__glyph" />
                <span className="pledge__text">{p.text}</span>
                <span className={`pledge__kind pledge__kind--${p.kind}`}>
                  {p.kind === 'promise' ? 'PLEDGED' : 'DEMAND'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="table__heading" style={{ marginTop: 'var(--space-6)' }}>
          IN FLIGHT
        </h2>
        {view.offersInFlight.length === 0 ? (
          <p className="table__empty">No offers on the table.</p>
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
                  {o.amount} {o.resource === 'fiscal' ? 'FISCAL POINT' : 'CAPITAL'}
                  {o.amount > 1 ? 'S' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="table__side">
        {view.spotlight ? (
          <div className="spotlight-panel">
            <h3 className="spotlight-panel__title">SPOTLIGHT</h3>
            <p className="spotlight-panel__body">
              {view.spotlight.target ? (
                <>
                  The Activist named the <strong>{ROLE_LABEL[view.spotlight.target]}</strong>.
                </>
              ) : (
                <>The Activist has called a Spotlight.</>
              )}
            </p>
            <p className="spotlight-panel__rule">
              It hits whoever takes the dirtiest card. For them, it only half works.
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
            <h3 className="veto-panel__title">THE PUBLIC SAID NO</h3>
            <p className="veto-panel__body">
              The Community has removed{' '}
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
              from the {ROLE_LABEL[view.veto.target]}'s choices.
            </p>
            <p className="veto-panel__count">
              {view.veto.remaining} VETO{view.veto.remaining === 1 ? '' : 'ES'} LEFT
            </p>
          </div>
        ) : null}

        {view.publishedTip ? (
          <div className="tip-panel">
            <h3 className="tip-panel__title">TOLD THE ROOM</h3>
            <p className="tip-panel__from">{ROLE_LABEL[view.publishedTip.from]} · {view.publishedTip.source}</p>
            <p className="tip-panel__body">{view.publishedTip.text}</p>
            {view.publishedTip.verdict ? (
              <p className={`tip-panel__verdict tip-panel__verdict--${view.publishedTip.verdict}`}>
                {view.publishedTip.verdict === 'true' ? 'IT WAS TRUE' : 'IT WAS NOT TRUE'}
              </p>
            ) : null}
          </div>
        ) : null}

        {view.tipDealtThisRound ? (
          <p className="table__tipline">
            Someone got a tip off this round. Nobody is told who.
          </p>
        ) : null}
      </aside>
    </div>
  )
}
