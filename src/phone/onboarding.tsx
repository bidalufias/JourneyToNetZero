/**
 * The onboarding, on the phone.
 *
 * Four steps between taking a seat and Round 1, each teaching exactly one verb
 * and then making the player use it. The rule they are all built on: no step is
 * a wall of text, and nothing is explained that could be practised instead.
 *
 * A player used to meet a room code, a role, a resource, a sealed goal and three
 * national targets before making a single decision. That is around 850 words
 * inside a three minute setup, delivered to somebody who has never seen the
 * game, and most of it went unread.
 */
import type { Command } from '../game/room'
import type { Phase, PhoneView } from '../game/session'
import { RoleCard } from '../ui/RoleCard'
import { RevealScreen } from './screens'
import { TheChoice } from './TheChoice'
import { TableActions } from './TableActions'

/** A step's banner. Says what is being learned and that it does not count. */
function Coach({ step, of, children }: { step: number; of: number; children: React.ReactNode }) {
  return (
    <div className="coach">
      <span className="coach__step">
        PRACTICE · STEP {step} OF {of}
      </span>
      <p className="coach__text">{children}</p>
    </div>
  )
}

/** Step 1: say one thing to the table. Teaches the only social verb there is. */
export function PracticeTalk({ view, send }: { view: PhoneView; send: (c: Command) => void }) {
  const said = view.promises.some((p) => p.from === view.role)
  return (
    <>
      <Coach step={1} of={4}>
        {said
          ? 'Good. Everyone can see it on the big screen. Now tap I AM DONE.'
          : 'Practice. Tap SAY IT and pick a sentence. This does not count.'}
      </Coach>
      <TableActions view={view} send={send} />
    </>
  )
}

/** Step 2: tap, lock, look up. The mechanical skill, on a card that cannot cost. */
export function PracticeChoice({
  view,
  send,
  remaining,
}: {
  view: PhoneView
  send: (c: Command) => void
  remaining: number | null
}) {
  return (
    <>
      <Coach step={2} of={4}>
        {view.locked
          ? 'Locked. Now look up. The cards will show on the big screen.'
          : 'Tap a card. Then tap LOCK MY CARD. The arrows show what the card does to the country.'}
      </Coach>
      <TheChoice view={view} send={send} remaining={remaining} />
    </>
  )
}

/**
 * Between the practice choice and the power step: the cards turn over.
 *
 * The projector runs the real flip sequence on the practice cards and the
 * phone mirrors it, card for card, then offers GOT IT. Four of them end it.
 */
export function PracticeReveal({
  view,
  remaining,
  send,
}: {
  view: PhoneView
  remaining: number | null
  send: (c: Command) => void
}) {
  return <RevealScreen view={view} remaining={remaining} send={send} />
}

/**
 * Step 3: the one thing this seat can do that nobody else can.
 *
 * Taught to one player at a time. This is what lets the Spotlight and the veto
 * stay in the game from Round 1 without every player paying for them in rules:
 * the other three are not being asked to absorb anything while this is on screen.
 */
export function YourPower({ view, onAck }: { view: PhoneView; onAck: () => void }) {
  const ready = view.seats.filter((s) => s.name && s.ready).length
  return (
    <div className="pbody">
      <Coach step={3} of={4}>This is your special power. Each player has a different one.</Coach>

      {/* The practice took carbon to 53 and this step puts it back to 100.
          Said, because an eleven-year-old decided the 53 had been "fake". */}
      <p className="pnote">Practice over. The country is back at the start. So are your powers.</p>

      <RoleCard role={view.role} size="big" lines="power" />
      {view.role === 'community' ? (
        <p className="pnote">You cannot hold Public Trust. Your power is the veto.</p>
      ) : null}

      {/* The card stays up after GOT IT. The button tells the room this player
          has read it, and the step ends when the fourth one does, so a quick
          reader waits with the card rather than with a blank screen. */}
      {view.ready ? (
        <p className="pnote" style={{ marginTop: 'auto' }}>
          You are ready. Waiting for {4 - ready} more. Their powers are on the big screen.
        </p>
      ) : (
        <button className="btn" style={{ marginTop: 'auto' }} onClick={onAck}>
          GOT IT
        </button>
      )}
    </div>
  )
}

/** The Round 1 strip. Says what to do now, and goes away from Round 2. */
const ROUND_ONE_LINE: Partial<Record<Phase, string>> = {
  crisis: 'Read the news. Then tap GOT IT.',
  table: 'Talk to each other. Tap I AM DONE when you have said your part.',
  choice: 'Pick one card. You can change it until you lock.',
  reckoning: 'Look up. Your phone shows the cards too.',
}

export function RoundOneCoach({ view }: { view: PhoneView }) {
  // The line is chosen by the step, and shown only while the round counter
  // reads 1, which it does from the first crisis to the first summary and at
  // no point before: the onboarding has its own coach.
  const line = view.round === 1 ? ROUND_ONE_LINE[view.phase] : undefined
  if (!line) return null
  return <div className="coach coach--slim">{line}</div>
}
