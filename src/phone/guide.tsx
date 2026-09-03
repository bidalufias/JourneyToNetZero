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
 *
 * The definitions are the ones in `vocab.ts`, so the word means the same thing
 * here as it does under the word on the screen where it is used.
 */
import type { Role } from '../engine/types'
import type { PhoneView } from '../game/session'
import { RoleCard } from '../ui/RoleCard'
import { DEFINE, STEP_LABEL, TERM } from '../game/vocab'

interface Entry {
  term: string
  what: string
}

/** The one resource this seat actually spends, in the words its cards use. */
const RESOURCE_NOTE: Record<Role, Entry> = {
  government: {
    term: TERM.budget,
    what: 'Your money. A card marked “2 Budget” costs 2. A card marked “+1 Budget” gives you 1 back. You cannot pick a card you cannot afford.',
  },
  business: {
    term: TERM.companyMoney,
    what: 'Your company’s money. A card marked “3 Company Money” costs 3. A card marked “+2” gives you 2. You cannot pick a card you cannot afford.',
  },
  community: {
    term: 'Vetoes',
    what: `Two for the whole game. ${DEFINE.veto} Everyone will know it was you.`,
  },
  activist: {
    term: 'Spotlights',
    what: `Three for the whole game. ${DEFINE.spotlight} It only works if you also pick a protest card.`,
  },
}

const SHARED: Entry[] = [
  {
    term: 'The three targets',
    what: 'By 2050 the country must reach three targets. Carbon must reach net zero. The economy must grow 5% a year on average. Quality of life must reach 7 out of 10. Miss one and nobody wins.',
  },
  {
    term: TERM.carbon,
    what: 'The country puts out 300 million tonnes a year. Its forests take in 200. So it starts at 100, and that 100 must reach zero.',
  },
  { term: TERM.netZero, what: DEFINE.netZero! },
  { term: TERM.cleanEconomy, what: `${DEFINE.cleanEconomy} It is the most useful number on the screen.` },
  { term: TERM.publicTrust, what: `${DEFINE.publicTrust} Two points go out every round.` },
  {
    term: 'The four arrows on a card',
    what: 'Each arrow shows what the card does to one meter. More arrows means a bigger change. Green is good for the country. Orange is bad.',
  },
  { term: TERM.dirtyCard, what: DEFINE.dirtyCard! },
  { term: TERM.movingTogether, what: DEFINE.movingTogether! },
  { term: TERM.partnership, what: DEFINE.partnership! },
  { term: TERM.tip, what: DEFINE.tip! },
]

const PHASES: Entry[] = [
  { term: STEP_LABEL.crisis, what: 'The news, plus one line only you can see. Nothing to tap.' },
  {
    term: STEP_LABEL.table,
    what: 'Ninety seconds to talk. Promise things, ask for things, send money. Nobody has to keep a promise.',
  },
  {
    term: STEP_LABEL.choice,
    what: 'Three cards, forty seconds. Tap one card. Then tap LOCK MY CARD. You can change your card until you lock.',
  },
  { term: STEP_LABEL.reckoning, what: 'All four cards are shown on the big screen. Look up.' },
]

export function HowToPlay({ view }: { view: PhoneView }) {
  const resource = RESOURCE_NOTE[view.role]

  return (
    <>
      <RoleCard
        role={view.role}
        name={view.name}
        goal={view.goalTitle && view.goalDesc ? { title: view.goalTitle, desc: view.goalDesc } : null}
        says
      />

      <span className="plabel">WHAT YOU SPEND</span>
      <div className="bubble">
        <div className="bubble__lead">
          {resource.term} · {view.resource.value} right now
        </div>
        <p className="bubble__text">{resource.what}</p>
      </div>

      {view.goalTitle ? (
        <p className="pnote">Your secret goal only counts if the country reaches all 3 targets.</p>
      ) : null}

      <span className="plabel">HOW A ROUND GOES</span>
      {PHASES.map((e) => (
        <p key={e.term} className="ptext">
          <strong>{e.term}</strong>: {e.what}
        </p>
      ))}

      <span className="plabel">IF YOU RUN OUT OF TIME</span>
      <p className="ptext">
        The round never waits. If you picked a card but did not lock, it is used. If you picked
        nothing, the game picks for you. So pick something early. You can change it later.
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
