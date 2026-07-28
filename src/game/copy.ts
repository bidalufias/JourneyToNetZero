/**
 * Presentation copy the content pack does not carry.
 *
 * Two kinds live here: the private line each role sees under a crisis brief
 * (the design gives every phone "the same news plus one private line each"),
 * and the preset phrasings promises are composed from. Players pick a subject
 * and an object, they never type, and a pledge quotes its option title
 * verbatim, so every line on the promise board is grammatical and one line
 * long.
 *
 * This is copy, not content: it is keyed by crisis *type* and role, so it
 * survives a content-pack swap without edits.
 */
import { DIRTY, type Archetype, type Role } from '../engine/types'

/** Keyed by scenario type, then role. */
export const PRIVATE_LINE: Record<string, Record<Role, string>> = {
  financial: {
    government: 'Your finance team wants one answer. Your own party wants another.',
    business: 'The board meets in an hour. They want to know what this costs.',
    community: 'Three people on your street lost their jobs before lunch.',
    activist: 'Every rescue is a chance to attach a condition. Or to be ignored.',
  },
  energy: {
    government: 'Fuel subsidies are now the biggest line in your budget. Everyone knows it.',
    business: 'Your energy costs just became your biggest risk, and your biggest opportunity.',
    community: 'The bill arrived this morning. People are talking about nothing else.',
    activist: 'This round decides the country’s power supply for thirty years.',
  },
  health: {
    government: 'Hospitals are calling your office directly. So are the employers.',
    business: 'Your workforce is the exposure here, not your plant.',
    community: 'People are frightened. They are looking to each other, not upward.',
    activist: 'Clean air just became real to people. Use that now or lose it.',
  },
  election: {
    government: 'Every choice you made so far is now a poster or a scandal.',
    business: 'Whoever wins writes your rules. Money talks, and it is on the record.',
    community: 'You are the only one in this room who actually casts a vote.',
    activist: 'Your backing is all you have to give. Spend it once, spend it well.',
  },
  pollution: {
    government: 'Somebody will be blamed. You decide if it is a company or a law.',
    business: 'Your permit may be legal. That is not the same as defensible.',
    community: 'This happened to your neighbourhood, not to a statistic.',
    activist: 'The evidence exists. The question is whether anyone has to look.',
  },
  disaster: {
    government: 'Last round. Whatever you do now is what you are remembered for.',
    business: 'The rebuild is a contract. It is also your last chance to be right.',
    community: 'Your people are in the water and the boats are mostly volunteers.',
    activist: 'Ten years of work, and one afternoon to decide what it was for.',
  },
}

export function privateLine(type: string, role: Role): string {
  return PRIVATE_LINE[type]?.[role] ?? 'The room is waiting for you.'
}

/**
 * Demands are public conditions with no mechanical hook. They raise the cost
 * of ignoring somebody, socially. Composed, never typed.
 */
export const DEMAND_PHRASES: { id: string; text: (target: string) => string }[] = [
  { id: 'pay-first', text: (t) => `the ${t} pays its share before anyone else moves` },
  { id: 'no-dirty', text: (t) => `the ${t} does not take the cheap card this round` },
  { id: 'go-public', text: (t) => `the ${t} says out loud what it is about to pick` },
  { id: 'co-fund', text: (t) => `the ${t} pays half of the partnership` },
  { id: 'protect-jobs', text: (t) => `the ${t} promises nobody loses a job over this` },
  { id: 'no-more-delay', text: (t) => `the ${t} stops asking everyone else to go first` },
]

/**
 * The "if" half of a deal, and the only part of a pledge the room resolves
 * against somebody else's card.
 *
 * Two conditions, not six, and both are settled by facts the reveal already
 * carries: whether that seat counted toward Moving Together, and whether it
 * took a card that breaks the coalition. Anything richer would need a phone to
 * name a card from another seat's deck, which means either showing every player
 * all sixteen cards, or letting them pledge against something they cannot see.
 *
 * Worded in the third person, because a pledge is composed on a phone and then
 * read off a projector. "…if the Government moves with me" is what the speaker
 * would say and is wrong the moment the board renders "The Business will choose
 * X if the Government moves with me". One sentence has to work in both places,
 * so it is the board's grammar that wins.
 */
export const DEAL_CONDITIONS: {
  id: string
  /** How the condition reads in the pledge. */
  text: (target: string) => string
  /** Settled from that seat's reveal. Nothing here consults the pledger. */
  met: (them: { aligned: boolean; arch: Archetype }) => boolean
}[] = [
  {
    id: 'moves-with-me',
    text: (t) => `the ${t} moves too`,
    met: (them) => them.aligned,
  },
  {
    // Weaker than moving together, and deliberately so: a seat that spends the
    // round asking somebody else to pay has not taken a cheap card, and it has
    // not moved with you either. A table that learns the difference has learned
    // most of what the coalition bonus is for.
    id: 'no-cheap-card',
    text: (t) => `the ${t} does not take the cheap card`,
    met: (them) => !DIRTY.has(them.arch),
  },
]

/** Role names as they read on the promise board, in the third person. */
export const BOARD_NAME: Record<Role, string> = {
  government: 'The Government',
  business: 'The Business',
  community: 'The Community',
  activist: 'The Activist',
}

