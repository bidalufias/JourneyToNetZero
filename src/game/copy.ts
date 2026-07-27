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
import type { Role } from '../engine/types'

/** Keyed by scenario type, then role. */
export const PRIVATE_LINE: Record<string, Record<Role, string>> = {
  financial: {
    government: 'The Treasury wants a decision today. Your backbenchers want a different one.',
    business: 'The board meets in an hour. They want to know what this costs.',
    community: 'Three people on your street lost their jobs before lunch.',
    activist: 'Every rescue package is a chance to attach a condition. Or to be ignored.',
  },
  energy: {
    government: 'The subsidy bill is now the largest line in your budget. Everybody knows it.',
    business: 'Your energy costs just became your biggest risk, and your biggest opportunity.',
    community: 'The bill arrived this morning. People are talking about nothing else.',
    activist: 'This is the round where the country picks its next thirty years of power.',
  },
  health: {
    government: 'Hospitals are calling your office directly. So are the employers.',
    business: 'Your workforce is the exposure here, not your plant.',
    community: 'People are frightened, and they are looking to each other, not upward.',
    activist: 'Clean air just stopped being an abstraction. Use it or lose the moment.',
  },
  election: {
    government: 'Everything you chose in the last three rounds is now a poster or a scandal.',
    business: 'Whoever wins writes the rules you operate under. Money talks, and it is recorded.',
    community: 'You are the only one in this room who actually casts a vote.',
    activist: 'Endorsement is the only currency you have. Spend it once, spend it well.',
  },
  pollution: {
    government: 'Somebody will be blamed. You get to decide whether it is a company or a law.',
    business: 'Your permit may be lawful. That is not the same as being defensible.',
    community: 'This happened to your neighbourhood, not to a statistic.',
    activist: 'The evidence exists. The question is whether anyone has to look at it.',
  },
  disaster: {
    government: 'This is the last round. Whatever you do now is what you are remembered for.',
    business: 'The rebuild is a contract. It is also the last chance to be on the right side.',
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
  { id: 'no-dirty', text: (t) => `the ${t} does not take the cheap option this round` },
  { id: 'go-public', text: (t) => `the ${t} says out loud what it is about to choose` },
  { id: 'co-fund', text: (t) => `the ${t} co-funds the partnership on the table` },
  { id: 'protect-jobs', text: (t) => `the ${t} guarantees nobody loses a job over this` },
  { id: 'no-more-delay', text: (t) => `the ${t} stops asking everyone else to go first` },
]

/** Role names as they read on the promise board, in the third person. */
export const BOARD_NAME: Record<Role, string> = {
  government: 'The Government',
  business: 'The Business',
  community: 'The Community',
  activist: 'The Activist',
}

