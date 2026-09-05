/**
 * How to play: the screen the game did not have.
 *
 * Four people arrive knowing nothing, on their own phones, with a projector
 * they may not be able to read from where they are sitting. Everything here is
 * written for that person: what the words on their own cards mean, what the
 * round does to them next, and what happens if they freeze.
 *
 * The words come first. The TV says "tap ⋯ to see what a word means", and an
 * eleven-year-old who tapped it landed on a page about money and rounds,
 * did not find her word, and closed it. The role card is last, because the
 * player has already read it twice.
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
    what: `Two for the whole game. ${DEFINE.veto} Everyone will know it was you. The Community cannot hold Public Trust.`,
  },
  activist: {
    term: 'Spotlights',
    what: `Three for the whole game. ${DEFINE.spotlight} You do not choose who it catches.`,
  },
}

/** The words a player meets on a card or a screen, each with its one line. */
const WORDS: Entry[] = [
  { term: TERM.dirtyCard, what: DEFINE.dirtyCard! },
  { term: TERM.protestCard, what: DEFINE.protestCard! },
  { term: TERM.partnership, what: DEFINE.partnership! },
  { term: TERM.movingTogether, what: DEFINE.movingTogether! },
  { term: TERM.publicTrust, what: `${DEFINE.publicTrust} Two points go out every round. Promises do not count.` },
  { term: TERM.spotlight, what: DEFINE.spotlight! },
  { term: TERM.veto, what: DEFINE.veto! },
  { term: TERM.secretGoal, what: DEFINE.secretGoal! },
  { term: TERM.tip, what: DEFINE.tip! },
  { term: TERM.cleanEconomy, what: `${DEFINE.cleanEconomy} It is the most useful number on the screen.` },
  { term: TERM.netZero, what: DEFINE.netZero! },
  {
    term: TERM.carbon,
    what: 'The country puts out 300 million tonnes a year. Its forests take in 200. So it starts at 100, and that 100 must reach zero.',
  },
  {
    term: 'The four arrows on a card',
    what: 'Each arrow shows what the card does to one meter. More arrows means a bigger change. Green is good for the country. Orange is bad.',
  },
  {
    term: 'The three targets',
    what: 'By 2050 the country must reach three targets. Carbon must reach net zero. The economy must grow 5% a year on average. Quality of life must reach 7 out of 10. Miss one and nobody wins.',
  },
]

const PHASES: Entry[] = [
  { term: STEP_LABEL.crisis, what: 'The news, plus one line only you can see. Tap GOT IT when you have read it.' },
  {
    term: STEP_LABEL.table,
    what: 'Talk. Promise things, ask for things, send money. Nobody has to keep a promise. Tap I AM DONE when you have said your part.',
  },
  {
    term: STEP_LABEL.choice,
    what: 'Three cards. Tap one card. Then tap LOCK MY CARD. You can change your card until you lock.',
  },
  { term: STEP_LABEL.reckoning, what: 'All four cards turn over on the big screen. Your phone shows them too.' },
]

export function HowToPlay({ view }: { view: PhoneView }) {
  const resource = RESOURCE_NOTE[view.role]

  return (
    <>
      <span className="plabel">WORDS ON YOUR SCREEN</span>
      {WORDS.map((e) => (
        <p key={e.term} className="ptext">
          <strong>{e.term}</strong>: {e.what}
        </p>
      ))}

      <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
        WHAT YOU SPEND
      </span>
      <div className="bubble">
        <div className="bubble__lead">
          {resource.term} · {view.resource.value} right now
        </div>
        <p className="bubble__text">{resource.what}</p>
      </div>

      <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
        HOW A ROUND GOES
      </span>
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

      <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
        YOUR CARD
      </span>
      <RoleCard
        role={view.role}
        name={view.name}
        goal={view.goalTitle && view.goalDesc ? { title: view.goalTitle, desc: view.goalDesc } : null}
        says
      />
      {view.goalTitle ? (
        <p className="pnote">Your secret goal only counts if the country reaches all 3 targets.</p>
      ) : null}
    </>
  )
}
