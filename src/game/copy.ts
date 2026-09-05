/**
 * Presentation copy the content pack does not carry.
 *
 * Two kinds live here: the private line each role sees under a crisis brief
 * (the design gives every phone "the same news plus one private line each"),
 * and the preset phrasings promises are composed from. Players pick a subject
 * and an object, they never type, and a promise quotes its option title
 * verbatim, so every line on the big screen is grammatical and one line long.
 *
 * This is copy, not content: it is keyed by crisis *type* and role, so it
 * survives a content-pack swap without edits.
 *
 * Every sentence here follows the plain standard in `LANGUAGE-REVIEW.md`
 * section 4: one idea per sentence, twelve words or fewer, no idiom.
 */
import { DIRTY, type Archetype, type Role } from '../engine/types'

/** Keyed by scenario type, then role. */
export const PRIVATE_LINE: Record<string, Record<Role, string>> = {
  financial: {
    government: 'Your finance team wants one answer. Your own party wants another.',
    business: 'The board meets in an hour. They want to know what this costs.',
    community: 'Three people on your street lost their jobs before lunch.',
    activist: 'Every rescue is a chance to ask for something in return.',
  },
  energy: {
    government: 'Fuel subsidies are now the biggest cost in your Budget. Everyone knows it.',
    business: 'Your energy bill is now your biggest risk, and your biggest chance.',
    community: 'The bill arrived this morning. People are talking about nothing else.',
    activist: 'This round decides the country’s power supply for thirty years.',
  },
  health: {
    government: 'Hospitals are calling your office directly. So are the employers.',
    business: 'Your workers are the ones at risk here, not your factory.',
    community: 'People are frightened. They are helping each other, not waiting for you.',
    activist: 'Clean air just became real to people. Use that now or lose it.',
  },
  election: {
    government: 'Every choice you made is now a poster or a scandal.',
    business: 'Whoever wins writes your rules. Everyone can see who you paid.',
    community: 'You are the only one in this room who actually votes.',
    activist: 'Your support is all you have to give. Give it once, and wisely.',
  },
  pollution: {
    government: 'Somebody will be blamed. You decide if it is a company or a law.',
    business: 'Your permit may be legal. People will still blame you.',
    community: 'This happened to your neighbourhood, not to a number on a screen.',
    activist: 'The evidence exists. The question is whether anyone has to look at it.',
  },
  disaster: {
    government: 'Last round. Whatever you do now is what people will remember.',
    business: 'The rebuild is a contract. It is also your last chance to be right.',
    community: 'Your people are in the water. Most of the boats are volunteers.',
    activist: 'Ten years of work. This afternoon decides what it was for.',
  },
}

export function privateLine(type: string, role: Role): string {
  return PRIVATE_LINE[type]?.[role] ?? 'The room is waiting for you.'
}

/**
 * The line for this seat during the practice round.
 *
 * The practice talk used to show the Round 1 private line, so a player read
 * their real brief a step early, in a phase that told them nothing counted.
 * These say what the step is for and suggest the one button to press.
 */
export const PRACTICE_LINE: Record<Role, string> = {
  government: 'This is practice. Say anything. Try offering the Business some Budget.',
  business: 'This is practice. Say anything. Try asking the Government to pay half.',
  community: 'This is practice. Say anything. Try telling one player no.',
  activist: 'This is practice. Say anything. Try a deal: I will support you if you go clean.',
}

/**
 * Demands are public requests with no mechanical hook. They raise the cost of
 * ignoring somebody, socially. Composed, never typed.
 *
 * Each phrase is the "to ..." half of "X wants the Y to ...", so the same
 * text reads on a phone button as "I want the Government to pay first" and on
 * the big screen as "The Community wants the Government to pay first". It
 * used to be a clause of its own ("the Government pays its share"), which was
 * not grammatical after "wants".
 *
 * `you` is the same request before a player has said who it is for. The
 * sheet offers the six sentences first and the three players second: six
 * buttons and then three, where it used to be eighteen in one list.
 */
export const DEMAND_PHRASES: { id: string; you: string; text: (target: string) => string }[] = [
  { id: 'pay-first', you: 'I want you to pay first.', text: (t) => `the ${t} to pay first` },
  {
    id: 'no-dirty',
    you: 'I want you not to pick a dirty card.',
    text: (t) => `the ${t} not to pick a dirty card`,
  },
  { id: 'go-public', you: 'I want you to tell us your card.', text: (t) => `the ${t} to tell us its card` },
  {
    id: 'co-fund',
    you: 'I want you to pay half of the partnership.',
    text: (t) => `the ${t} to pay half of the partnership`,
  },
  {
    id: 'protect-jobs',
    you: 'I want you to promise no job cuts.',
    text: (t) => `the ${t} to promise no job cuts`,
  },
  {
    id: 'no-more-delay',
    you: 'I want you to stop waiting for others.',
    text: (t) => `the ${t} to stop waiting for others`,
  },
]

/**
 * The "if" half of a deal, and the only part of a promise the room resolves
 * against somebody else's card.
 *
 * Three conditions, and all are settled by facts the round already carries:
 * whether that seat counted toward moving together, whether it picked a
 * dirty card, and whether the Government paid half. Anything richer would
 * need a phone to name a card from another seat's deck, which means either
 * showing every player all sixteen cards, or letting them promise against
 * something they cannot see.
 *
 * The third is only offered to a partnership card aimed at the Government,
 * because it is the sentence the Business's own role card tells the player
 * to say, and for a round the phone had no way to say it.
 *
 * Worded in the third person, because a deal is composed on a phone and then
 * read off a projector. "...if the Government moves with me" is what the
 * speaker would say and is wrong the moment the board renders "The Business
 * will pick X if the Government moves with me". One sentence has to work in
 * both places, so it is the board's grammar that wins.
 */
export interface DealContext {
  /** The Government said it would pay half, and did. */
  coFund: boolean
}

export const DEAL_CONDITIONS: {
  id: string
  /** How the condition reads in the deal. */
  text: (target: string) => string
  /** Settled from that seat's reveal and the round. Nothing here consults the promiser's card. */
  met: (them: { aligned: boolean; arch: Archetype }, round: DealContext) => boolean
  /** Only offered against this seat, when set. */
  onlyFor?: Role
  /** Only offered on a partnership card, when set. */
  needsPartnership?: boolean
}[] = [
  {
    id: 'moves-with-me',
    text: (t) => `the ${t} also picks a good card`,
    met: (them) => them.aligned,
  },
  {
    // Weaker than moving together, and deliberately so: a seat that spends the
    // round asking somebody else to pay has not picked a dirty card, and it has
    // not moved with you either. A table that learns the difference has learned
    // most of what the moving together bonus is for.
    id: 'no-cheap-card',
    text: (t) => `the ${t} does not pick a dirty card`,
    met: (them) => !DIRTY.has(them.arch),
  },
  {
    id: 'pays-half',
    text: (t) => `the ${t} pays half`,
    met: (_them, round) => round.coFund,
    onlyFor: 'government',
    needsPartnership: true,
  },
]

/** Role names as they read on the big screen, in the third person. */
export const BOARD_NAME: Record<Role, string> = {
  government: 'The Government',
  business: 'The Business',
  community: 'The Community',
  activist: 'The Activist',
}
