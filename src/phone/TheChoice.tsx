/**
 * THE CHOICE — three cards, forty-five seconds, secret until the Reckoning.
 *
 * Three cards plus the header fit above the fold with the lock button in the
 * bottom third, so nobody scrolls to find the thing they must do. The card
 * anatomy is fixed: cost chip top-right, title, one line, hint rule.
 */
import type { Command } from '../game/room'
import type { PhoneOption, PhoneView } from '../game/session'

export function TheChoice({
  view,
  send,
  remaining,
}: {
  view: PhoneView
  send: (c: Command) => void
  remaining: number | null
}) {
  const selected = view.choiceId
  const urgent = (remaining ?? 1e9) < 8_000

  return (
    <div className="pbody">
      {urgent ? (
        // The one place the app is allowed to be rude — the phone half of the
        // dashboard's blinking cell. The social pressure is on both surfaces.
        <div className="nudge">
          <div className="nudge__lead">Everyone is waiting for you.</div>
          <div className="nudge__sub">
            {Math.ceil((remaining ?? 0) / 1000)}s — THEN THE CLOCK PICKS FOR YOU.
          </div>
        </div>
      ) : (
        <>
          <span className="plabel">ROUND {view.round} · THE CHOICE</span>
          <h1 className="pheading">Pick one. Now.</h1>
        </>
      )}

      {view.options.map((o) => (
        <OptionCard
          key={o.id}
          option={o}
          selected={selected === o.id}
          onPick={() => o.available && send({ t: 'choose', role: view.role, optionId: o.id })}
        />
      ))}

      <button
        className="btn btn--accent"
        disabled={!selected}
        onClick={() => selected && send({ t: 'choose', role: view.role, optionId: selected })}
      >
        {selected ? 'LOCK IT IN' : 'CHOOSE ONE'}
      </button>
    </div>
  )
}

export function OptionCard({
  option,
  selected,
  onPick,
}: {
  option: PhoneOption
  selected: boolean
  onPick: () => void
}) {
  const cls = [
    'ocard',
    selected ? 'ocard--selected' : '',
    option.disabled ? `ocard--${option.disabled}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const flag =
    option.disabled === 'afford'
      ? '✕ CAN’T AFFORD'
      : option.disabled === 'veto'
        ? '● PUBLIC MANDATE'
        : option.disabled === 'gate'
          ? '▬ LOCKED OUT'
          : null

  return (
    <button className={cls} onClick={onPick} disabled={!option.available} aria-pressed={selected}>
      <span className="ocard__top">
        <span className="ocard__title">{option.title}</span>
        <span className="ocard__cost">{option.cost}</span>
      </span>
      <span className="ocard__desc">{option.desc}</span>

      {option.disabled ? (
        <>
          <span className="ocard__flag">{flag}</span>
          <span className="ocard__note">{option.disabledNote}</span>
        </>
      ) : (
        <span className="ocard__hint">{option.hint}</span>
      )}

      {selected ? <span className="ocard__check">✓</span> : null}
    </button>
  )
}
