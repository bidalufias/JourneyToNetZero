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
import { ROLE_CHARACTER, ROLE_LABEL } from '../game/session'

interface Entry {
  term: string
  what: string
}

/** The one resource this seat actually spends, in the words its cards use. */
const RESOURCE_NOTE: Record<Role, Entry> = {
  government: {
    term: 'Fiscal Points (FP)',
    what: 'Public money. Option cards priced “2 FP” cost you two; “+1 FP” gives you one back. You cannot pick a card you cannot afford. It greys out and says so.',
  },
  business: {
    term: 'Capital (C)',
    what: 'Your company\'s money. Cards priced “3 C” cost you three; “+2 C” earns you two. You cannot pick a card you cannot afford. It greys out and says so.',
  },
  community: {
    term: 'Public Mandate',
    what: 'Two for the whole game. Spending one takes the dirtiest options away from one other player, for that round only, and everyone is told it was you.',
  },
  activist: {
    term: 'Spotlights',
    what: 'Three for the whole game. A Spotlight lands on whoever takes the dirtiest option this round, but only if you also escalate with your own card that round.',
  },
}

const SHARED: Entry[] = [
  {
    term: 'The three targets',
    what: 'By 2050 the country needs emissions down to 200 Mt, growth averaging 5%, and happiness at 7. Miss even one and nobody wins, however well you personally did.',
  },
  {
    term: 'Mt',
    what: 'Megatonnes of carbon a year. The country starts at 300 and the big screen tracks it.',
  },
  { term: 'RG', what: 'Ringga, the money in the news stories. Flavour, not a resource you hold.' },
  {
    term: 'Trust',
    what: 'How much the country backs you. The Community hands two out every round, and some option cards will not unlock without enough of it.',
  },
  {
    term: 'Co-fund',
    what: 'The Government paying half of a Business partnership card. Without it that card lands at half strength.',
  },
  {
    term: 'Moving together',
    what: 'If three or four of you pick options that pull the same way, the round does more than your four choices could separately.',
  },
]

const PHASES: Entry[] = [
  { term: 'THE CRISIS', what: 'The news, plus one line written for you alone. Nothing to tap.' },
  {
    term: 'THE TABLE',
    what: 'Ninety seconds to talk. Promise things, demand things, send resources. Nothing said here is binding, and that is the point.',
  },
  {
    term: 'THE CHOICE',
    what: 'Three cards, forty-five seconds. Tap one to select it, then LOCK IT IN to commit. You can change your mind until you lock.',
  },
  { term: 'THE RECKONING', what: 'All four cards flip on the big screen. Look up.' },
]

export function HowToPlay({ view }: { view: PhoneView }) {
  const character = ROLE_CHARACTER[view.role]
  const resource = RESOURCE_NOTE[view.role]

  return (
    <>
      <p className="ptext">
        You are the <strong>{ROLE_LABEL[view.role]}</strong>, {character.name}. {character.blurb}
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
          <span className="plabel">YOUR SEALED GOAL · NOBODY ELSE SEES THIS</span>
          <div className="bubble">
            <div className="bubble__lead">{view.goalTitle}</div>
            <p className="bubble__text">{view.goalDesc}</p>
            <p className="bubble__text">
              Hitting it only counts for something if the country hits all three targets too.
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
        selected nothing, the clock picks one for you, so select something early, even if you change
        it later.
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
