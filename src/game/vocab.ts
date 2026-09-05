/**
 * One name for each thing, and one line saying what it means.
 *
 * The same term used to be typed by hand in eleven files and the content pack,
 * and it drifted: the phase where the cards turn over was The Reveal on one
 * screen and The Reckoning on the next, a warning was a tip, a tip off, an
 * insider tip and a sealed brief. A player who is not reading in their first
 * language cannot tell whether two names are one thing or two, so every label,
 * chip and coach line now reads from here.
 *
 * `LANGUAGE-REVIEW.md` sections 3.4 and 3.5 are the source. Phase ids are not
 * renamed, only what the room calls them.
 */
import type { Phase } from './session'

/** The terms, as they read in a sentence. */
export const TERM = {
  crisis: 'The Crisis',
  talk: 'The Talk',
  choice: 'The Choice',
  reveal: 'The Reveal',
  tip: 'Tip',
  secretGoal: 'Secret goal',
  budget: 'Budget',
  companyMoney: 'Company Money',
  veto: 'Veto',
  sayNo: 'Veto',
  spotlight: 'Spotlight',
  publicTrust: 'Public Trust',
  movingTogether: 'Moving together',
  dirtyCard: 'Dirty card',
  protestCard: 'Protest card',
  partnership: 'Partnership',
  carbon: 'Carbon',
  economy: 'Economy',
  qualityOfLife: 'Quality of life',
  cleanEconomy: 'Clean Economy',
  netZero: 'Net zero',
  millionTonnes: 'million tonnes',
  lock: 'Lock',
  choose: 'Choose',
  facilitator: 'Facilitator',
} as const

export type Term = keyof typeof TERM

/** The same terms as a chip or heading reads them. */
export const LABEL: Record<Term, string> = Object.fromEntries(
  Object.entries(TERM).map(([k, v]) => [k, v.toUpperCase()]),
) as Record<Term, string>

/**
 * One line under a game word, on the screen where it is used, every time.
 * A player learns the word here, not in a guide.
 */
export const DEFINE: Partial<Record<Term, string>> = {
  spotlight: 'Pick a protest card. Then any dirty card the Government or Business picks only half works.',
  veto: 'You take one player’s dirty cards away for this round.',
  publicTrust: 'Points the people give to whoever helped them most. Some cards need them.',
  cleanEconomy: 'How much of the economy is clean. Higher means growth adds less carbon.',
  movingTogether: 'Three or four good cards together earn the country a bonus.',
  dirtyCard: 'A card that pollutes or makes others pay. It breaks moving together.',
  protestCard: 'A loud card. The Spotlight only works with one of these.',
  partnership: 'A Business card that only works fully if the Government pays half.',
  netZero: 'Carbon at 0. The country takes out as much as it puts in.',
  millionTonnes: 'Million tonnes of carbon.',
  secretGoal: 'A goal only you know. It only counts if the country reaches all three targets.',
  tip: 'A true warning about the next crisis. Only you can see it. One player gets one each round, in turn.',
}

/** What each step of the session is called, on every surface. */
export const STEP_LABEL: Record<Phase, string> = {
  lobby: 'THE LOBBY',
  briefing: 'THE BRIEFING',
  practiceTalk: 'PRACTICE · THE TALK',
  practiceChoice: 'PRACTICE · THE CHOICE',
  practiceReveal: 'PRACTICE · THE REVEAL',
  power: 'YOUR POWER',
  goal: 'YOUR SECRET GOAL',
  crisis: LABEL.crisis,
  table: LABEL.talk,
  choice: LABEL.choice,
  reckoning: LABEL.reveal,
  trust: LABEL.publicTrust,
  summary: 'THE STORY SO FAR',
  results: 'THE COUNTRY’S RESULT',
  ended: 'THE COUNTRY’S RESULT',
}
