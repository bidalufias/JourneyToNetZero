/**
 * How to play: the screen the game did not have.
 *
 * Four people arrive knowing nothing, on their own phones, with a projector
 * they may not be able to read from where they are sitting. Everything here is
 * written for that person: what the round does to them next, what the words on
 * their own cards mean, and what happens if they freeze.
 *
 * It is deliberately role-aware. A glossary that explains all four resources to
 * all four players is four times as long and three times as irrelevant, and the
 * point of the phone is that it knows which seat you are in.
 */
import type { Role } from '../engine/types'
import type { PhoneView } from '../game/session'
import { ROLE_CHARACTER } from '../game/session'

interface Entry {
  term: string
  what: string
}

/** The one resource this seat actually spends, in the words its cards use. */
const RESOURCE_NOTE: Record<Role, Entry> = {
  government: {
    term: 'Budget',
    what: 'Public money. A card priced “2 Budget” costs you two. A card priced “+1 Budget” gives you one back. You cannot pick a card you cannot afford; it greys out and says so.',
  },
  business: {
    term: 'Company Money',
    what: 'Your company’s money. A card priced “3 Company Money” costs you three. A card priced “+2” earns you two. You cannot pick a card you cannot afford; it greys out and says so.',
  },
  community: {
    term: 'Vetoes',
    what: 'Two for the whole game. One veto takes the dirtiest cards away from one other player, for that round only. Everyone is told it was you.',
  },
  activist: {
    term: 'Spotlights',
    what: 'Three for the whole game. A Spotlight hits whoever takes the dirtiest card this round, but only if you also escalate with your own card that round.',
  },
}

const SHARED: Entry[] = [
  {
    term: 'The three targets',
    what: 'By 2050 the country needs carbon at net zero, growth averaging 5%, and quality of life at 7. Miss one and nobody wins, however well you did.',
  },
  {
    term: 'Carbon',
    what: 'The country puts out 300 Mt a year. Its forests absorb 200. So it starts at 100 net, and that 100 has to reach zero.',
  },
  {
    term: 'Clean Economy',
    what: 'How much of the economy runs on clean things. The higher it is, the less carbon each bit of growth adds. It is the most useful number on the screen.',
  },
  {
    term: 'Public Trust',
    what: 'How much the country backs you. Two go out every round, one for whoever looked after people best and one for whoever did most for the future. Some cards need it before they unlock.',
  },
  {
    term: 'The four arrows on a card',
    what: 'Which way that card pushes carbon, the economy, quality of life and the clean economy. More arrows means a bigger push. Green is good for the country, orange is not.',
  },
  {
    term: 'Paying half',
    what: 'The Government paying half of a Business partnership card. Without it, that card only half works.',
  },
  {
    term: 'Moving together',
    what: 'If three or four of you pick cards that pull the same way, the round does more than your four choices could separately.',
  },
]

const PHASES: Entry[] = [
  { term: 'THE CRISIS', what: 'The news, plus one line written for you alone. Nothing to tap.' },
  {
    term: 'THE TALK',
    what: 'Ninety seconds to talk. Promise things, ask for things, send money. Nothing said here is binding, and that is the point.',
  },
  {
    term: 'THE CHOICE',
    what: 'Three cards, forty seconds. Tap one to select it, then LOCK IT IN. You can change your mind until you lock.',
  },
  { term: 'THE REVEAL', what: 'All four cards turn over on the big screen. Look up.' },
]

export function HowToPlay({ view }: { view: PhoneView }) {
  const character = ROLE_CHARACTER[view.role]
  const resource = RESOURCE_NOTE[view.role]

  return (
    <>
      <p className="ptext">
        You are the <strong>{character.title}</strong>. {character.blurb}
      </p>

      <span className="plabel">WHAT YOU SPEND</span>
      <div className="bubble">
        <div className="bubble__lead">
          {resource.term} · {view.resource.value} right now
        </div>
        <p className="bubble__text">{resource.what}</p>
      </div>

      {view.goalTitle ? (
        <>
          <span className="plabel">YOUR SECRET WIN · NOBODY ELSE SEES THIS</span>
          <div className="bubble">
            <div className="bubble__lead">{view.goalTitle}</div>
            <p className="bubble__text">{view.goalDesc}</p>
            <p className="bubble__text">
              This only counts if the country hits all 3 targets too.
            </p>
          </div>
        </>
      ) : null}

      <span className="plabel">HOW A ROUND GOES</span>
      {PHASES.map((e) => (
        <p key={e.term} className="ptext">
          <strong>{e.term}</strong>: {e.what}
        </p>
      ))}

      <span className="plabel">IF YOU RUN OUT OF TIME</span>
      <p className="ptext">
        The round never waits. If you selected a card but did not lock it, that card is used. If you
        selected nothing, the clock picks for you. So select something early, even if you change it.
      </p>

      <span className="plabel">WORDS ON YOUR SCREEN</span>
      {SHARED.map((e) => (
        <p key={e.term} className="ptext">
          <strong>{e.term}</strong>: {e.what}
        </p>
      ))}
    </>
  )
}
