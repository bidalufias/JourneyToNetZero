/**
 * THE CHOICE: three cards, forty seconds, secret until the Reveal.
 *
 * Three cards plus the header fit above the fold with the lock button in the
 * bottom third, so nobody scrolls to find the thing they must do.
 *
 * Selecting and committing are two separate acts, and the gap between them is
 * the point. A tap only moves the tick; LOCK MY CARD is the door that shuts.
 */
import type { Command } from '../game/room'
import { arrows } from '../game/impact'
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
  const committed = view.locked || readOnly
  const seconds = Math.max(0, Math.ceil((remaining ?? 0) / 1000))
  // The phone states the fact and stops. It used to say "Everyone is waiting
  // for you", which tells a player how to feel and, in a room of colleagues,
  // reads as being told off. The clock is already doing that job.
  const urgent = !readOnly && !view.locked && (remaining ?? 1e9) < 10_000

  return (
    <div className="pbody">
      <span className="plabel">
        {view.round > 0 ? `ROUND ${view.round}` : 'PRACTICE'} · {committed ? 'LOCKED' : 'YOUR CHOICE'}
      </span>
      <h1 className="pheading">{committed ? 'Locked.' : 'Pick one card.'}</h1>
      {urgent ? (
        <p className="pnote pnote--urgent">
          {seconds} seconds left.{' '}
          {selected ? 'Your card will lock by itself.' : 'If you pick nothing, the game picks for you.'}
        </p>
      ) : null}

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
        <p className="pnote">
          {readOnly && !view.locked
            ? 'You can still change this. Tap BACK TO THE GAME.'
            : 'Your card is locked. Look up at the big screen.'}
        </p>
      ) : (
        <>
          <button
            className="btn btn--accent"
            disabled={!selected}
            onClick={() => selected && send({ t: 'lock', role: view.role })}
          >
            {selected ? 'LOCK MY CARD' : 'TAP A CARD FIRST'}
          </button>
          <p className="pnote">
            {selected ? 'You can still change your card.' : 'Tapping a card does not lock it.'}
          </p>
        </>
      )}
    </div>
  )
}

/**
 * One card: what it is, what it costs, and which way it pushes each of the four
 * meters. The arrows carry direction and rough size but never a value, so the
 * cards can be compared without any of the maths crossing to the phone.
 */
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
      ? 'NOT ENOUGH MONEY'
      : option.disabled === 'veto'
        ? 'THE COMMUNITY SAID NO'
        : option.disabled === 'gate'
          ? 'LOCKED'
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
        <span className={`ocard__cost${option.cost.startsWith('+') ? ' ocard__cost--gain' : ''}`}>
          {option.cost}
        </span>
      </span>
      <span className="ocard__desc">{option.desc}</span>

      {option.disabled ? (
        <>
          <span className="ocard__flag">{flag}</span>
          <span className="ocard__note">{option.disabledNote}</span>
        </>
      ) : (
        <>
          <span className="impact">
            {option.impact.map((i) => (
              <span
                key={i.meter}
                className={`impact__cell impact__cell--${i.dir === 0 ? 'flat' : i.good ? 'good' : 'bad'}`}
              >
                <span className="impact__label">{i.label}</span>
                <span className="impact__arrows">{arrows(i.dir)}</span>
              </span>
            ))}
          </span>
          {option.condition ? <span className="ocard__note">{option.condition}</span> : null}
        </>
      )}

      {selected ? <span className="ocard__check">✓</span> : null}
    </button>
  )
}
