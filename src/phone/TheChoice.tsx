/**
 * THE CHOICE — three cards, forty-five seconds, secret until the Reckoning.
 *
 * Three cards plus the header fit above the fold with the lock button in the
 * bottom third, so nobody scrolls to find the thing they must do.
 *
 * Selecting and committing are two separate acts, and the gap between them is
 * the point. Tapping a card to read it more closely used to spend the round on
 * it — if you were the last player still deciding, that tap also ended the
 * round for everybody. Now a tap only moves the tick; LOCK IT IN is the door
 * that shuts, and it says so before you touch it.
 */
import type { Command } from '../game/room'
import type { PhoneOption, PhoneView } from '../game/session'

export function TheChoice({
  view,
  send,
  remaining,
  readOnly = false,
}: {
  view: PhoneView
  send: (c: Command) => void
  remaining: number | null
  readOnly?: boolean
}) {
  const selected = view.choiceId
  const urgent = !readOnly && !view.locked && (remaining ?? 1e9) < 8_000
  const committed = view.locked || readOnly

  return (
    <div className="pbody">
      {urgent ? (
        // The one place the app is allowed to be rude — the phone half of the
        // dashboard's blinking cell. The social pressure is on both surfaces.
        <div className="nudge">
          <div className="nudge__lead">Everyone is waiting for you.</div>
          <div className="nudge__sub">
            {Math.ceil((remaining ?? 0) / 1000)}s —{' '}
            {selected ? 'THEN WHAT YOU PICKED IS LOCKED' : 'THEN THE CLOCK PICKS FOR YOU'}
          </div>
        </div>
      ) : (
        <>
          <span className="plabel">
            ROUND {view.round} · {committed ? 'WHAT YOU LOCKED IN' : 'THE CHOICE'}
          </span>
          <h1 className="pheading">{committed ? 'Locked in.' : 'Pick one. Now.'}</h1>
        </>
      )}

      {view.options.map((o) => (
        <OptionCard
          key={o.id}
          option={o}
          selected={selected === o.id}
          committed={committed}
          onPick={() => !committed && o.available && send({ t: 'choose', role: view.role, optionId: o.id })}
        />
      ))}

      {committed ? (
        <p className="pmono">
          {readOnly && !view.locked
            ? 'STILL YOURS TO CHANGE — GO BACK TO NOW TO PICK.'
            : 'THIS IS FINAL. THE CARDS FLIP ON THE BIG SCREEN.'}
        </p>
      ) : (
        <>
          <button
            className="btn btn--accent"
            disabled={!selected}
            onClick={() => selected && send({ t: 'lock', role: view.role })}
          >
            {selected ? 'LOCK IT IN' : 'TAP A CARD FIRST'}
          </button>
          <p className="pmono">
            {selected ? 'YOU CAN STILL CHANGE YOUR MIND.' : 'TAPPING A CARD ONLY SELECTS IT.'}
          </p>
        </>
      )}
    </div>
  )
}

export function OptionCard({
  option,
  selected,
  committed = false,
  onPick,
}: {
  option: PhoneOption
  selected: boolean
  committed?: boolean
  onPick: () => void
}) {
  const cls = [
    'ocard',
    selected ? 'ocard--selected' : '',
    committed && !selected ? 'ocard--muted' : '',
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
    <button
      className={cls}
      onClick={onPick}
      disabled={!option.available || committed}
      aria-pressed={selected}
    >
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
