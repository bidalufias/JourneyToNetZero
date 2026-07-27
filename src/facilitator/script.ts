/**
 * The facilitator's script — the thing that used to live in whoever ran it last.
 *
 * A session is thirty minutes long and the person running it has four people
 * looking at them, a projector behind them, and no second chance at the twenty
 * seconds where the game explains itself. Everything here is written to be read
 * off a laptop while that is happening: what is on the screen right now, what
 * to say over it, what to watch for, and what the next press of the spacebar
 * does.
 *
 * The four moments and the debrief questions come from PART 9 of
 * `JOURNEY-TO-NET-ZERO-design.md`. The timings are read from `PHASE_MS` rather
 * than retyped, so a phase that is retuned cannot leave this page lying.
 */
import { PHASE_MS, type Phase } from '../game/session'

const seconds = (phase: Phase) => `${Math.round(PHASE_MS[phase] / 1000)} seconds`

export interface Beat {
  phase: Phase
  label: string
  /** How long the phase runs, or what ends it. */
  length: string
  /** What the room is looking at. */
  onScreen: string
  /** Lines to say over it — paraphrase freely, they are cues not a script. */
  say: string[]
  /** What to watch in the room while it runs. */
  watch?: string
  /** What the next advance does. */
  next: string
}

export const BEATS: Beat[] = [
  {
    phase: 'lobby',
    label: 'THE LOBBY',
    length: 'until you start it',
    onScreen: 'The four-letter room code, and the four seats filling up.',
    say: [
      'Four of you are going to run a country for the next half hour. None of you can do it alone — that is not a hint, that is the whole design.',
      'Join on your phone: scan the code on the screen, or type the four letters at this address.',
      'Take whichever seat you like. Read your character properly — you are going to be them for thirty minutes.',
    ],
    watch:
      'All four seats named before you start. A seat still empty at the crisis is a phone that will be handed round all session.',
    next: 'Starts the session and opens the briefing.',
  },
  {
    phase: 'briefing',
    label: 'THE BRIEFING',
    length: seconds('briefing'),
    onScreen: 'The three national targets, and where the country stands today.',
    say: [
      'Three targets. Emissions down to 200, growth averaging 5%, happiness up to 7. All three, or nobody wins — including anyone who hits their own sealed goal.',
      'Six crises. Each one: you talk, then you each pick a card in secret, then all four flip at once.',
      'Nothing anybody promises at this table is binding. That is deliberate.',
    ],
    watch: 'Phones down and eyes up for these twenty seconds. It is the only time the game explains itself to everyone at once.',
    next: 'Opens the first crisis.',
  },
  {
    phase: 'crisis',
    label: 'THE CRISIS',
    length: seconds('crisis'),
    onScreen: 'The breaking-news sting: what has just happened to the country.',
    say: [
      'Read it. Your phone has the same story plus one line written for you alone — nobody else can see it.',
      'Do not start solving it yet. You get ninety seconds to talk in a moment.',
    ],
    watch: 'One player will get an insider tip this round. Nobody is told who. Let them decide what to do with it.',
    next: 'Opens the table. The clock starts on its own if you leave it.',
  },
  {
    phase: 'table',
    label: 'THE TABLE',
    length: seconds('table'),
    onScreen: 'Who is at the table, the promises made, and the countdown.',
    say: [
      'Ninety seconds. Talk to each other, not to your phones.',
      'You can offer resources, make a public promise, or make a public demand. The Activist has three Spotlights for the whole game; the Community has two Public Mandates.',
      'The most valuable sentence in this game is "what if we both did it?".',
    ],
    watch:
      'If the room goes quiet, name the tension out loud: "Business, what would it take?" — do not fill the silence with your own answer.',
    next: 'Closes the talking and deals the three cards.',
  },
  {
    phase: 'choice',
    label: 'THE CHOICE',
    length: seconds('choice'),
    onScreen: 'Four seats, locking one at a time. The last one to lock is named.',
    say: [
      'Three cards each, in secret. You do not have to do what you just promised.',
      'Lock in. If you run out of time the clock locks whatever you have selected.',
    ],
    watch: 'Say nothing here. The visible pressure of being the last unlocked seat is doing the work.',
    next: 'Resolves the round — this happens on its own when all four lock.',
  },
  {
    phase: 'reckoning',
    label: 'THE RECKONING',
    length: seconds('reckoning'),
    onScreen: 'The four cards flip one at a time, meters moving between each.',
    say: ['Look up. All four cards, one at a time.'],
    watch:
      'This is the loudest moment of every round. Do not talk over it — a broken promise on screen is worth more than anything you could say about trust.',
    next: 'Shows the story so far.',
  },
  {
    phase: 'summary',
    label: 'THE STORY SO FAR',
    length: seconds('summary'),
    onScreen: 'One line per round, and how far the three targets still are.',
    say: [
      'That is where you are. Rounds left, targets left.',
      'Notice the green economy share. Every point of it makes the next round of growth cost less carbon.',
    ],
    next: 'Opens the next crisis — or the results, after round six.',
  },
  {
    phase: 'results',
    label: 'THE NATIONAL MISSION',
    length: 'until you advance it',
    onScreen: 'The three targets judged, then the sealed goals and the titles.',
    say: [
      'Five seconds of silence before you say anything. Let it land.',
      'Then: the country either made all three or it did not. Everything else is a footnote to that.',
    ],
    watch: 'If somebody hit their private goal in a session that failed, they get Hollow Victory. That card is the lesson — do not soften it.',
    next: 'Ends the session and holds on the final screen.',
  },
  {
    phase: 'ended',
    label: 'AFTER',
    length: 'as long as you want',
    onScreen: 'The final standing, held.',
    say: ['Ten minutes of debrief is worth more than the thirty minutes of game. The five questions are below.'],
    next: 'Nothing further — reload the big screen for a new session.',
  },
]

export interface Moment {
  round: number
  phase: Phase
  title: string
  text: string
}

/** PART 9 of the design doc: the four places a facilitator earns their fee. */
export const MOMENTS: Moment[] = [
  {
    round: 1,
    phase: 'reckoning',
    title: 'After the first reveal',
    text: 'Ask it straight: "Did anyone make a promise? Did anyone keep it?" Round 1 is where the table learns whether words are worth anything here.',
  },
  {
    round: 3,
    phase: 'summary',
    title: 'After the health crisis',
    text: 'If emissions fell while everything else collapsed, ask "is that success?". It is the cheapest and clearest lesson in the game and it only works if you ask before anybody has rationalised it.',
  },
  {
    round: 4,
    phase: 'table',
    title: 'Before the round 4 choices',
    text: 'Read the Government\'s Trust total aloud, then say: "this number was decided three rounds ago." Path dependency, in one sentence, with evidence on screen.',
  },
  {
    round: 6,
    phase: 'results',
    title: 'After the final reveal',
    text: 'Five seconds of silence. Count them. Then start the debrief.',
  },
]

export const DEBRIEF: string[] = [
  'Who did you need most, and did you tell them?',
  "What's the one thing you gave up?",
  'Which promise mattered more — the one kept or the one broken?',
  'Round 6 was easier or harder because of something you did in Round 2. What was it?',
  'In your real job, which of these four are you? And who do you never talk to?',
]

export const SETUP: string[] = [
  'Big screen open on /dashboard, at the lobby with a room code showing.',
  'Four phones, four seats, four names on the screen before you start.',
  'Phones face down during THE TABLE. Say it once, early, and it holds all session.',
  'Send anyone who wants the full rules to the written guide — it is a QR code away and nobody has to read it to play.',
  'Thirty minutes end to end. Budget ten more for the debrief if you have them.',
]

export interface Trouble {
  problem: string
  fix: string
}

export const TROUBLE: Trouble[] = [
  {
    problem: 'A player says their seat is taken but nobody is in it.',
    fix: 'Their old tab still holds it. On the phone that has it, the ⋯ menu frees the seat; otherwise pick a different seat and carry on — the game does not care which chair which person is in.',
  },
  {
    problem: 'A phone lost its connection mid-round.',
    fix: 'Nothing to do. The seat is held, the phone rejoins by itself, and if the clock runs out first it locks whatever was selected. The session never stalls waiting for a phone.',
  },
  {
    problem: 'Somebody typed the code wrong.',
    fix: 'It is always four letters, never digits — O is a letter here. Or have them scan the QR code, which cannot be mistyped.',
  },
  {
    problem: 'Nobody is locking and the clock is nearly out.',
    fix: 'Let it run out. The default lock is part of the design and the first time it happens the table starts choosing earlier.',
  },
  {
    problem: 'The phones say the game server is not answering.',
    fix: 'That is the backend, not their phones. The big screen has to stay open for the room to exist. If it persists, restart from the lobby with a fresh code.',
  },
  {
    problem: 'A latecomer arrives after the start.',
    fix: 'Press Q on the big screen for the join code at full size. An empty seat can be taken at any point in the session.',
  },
]

export const CONTROLS: { key: string; what: string }[] = [
  { key: 'Space', what: 'Start the session, then advance to the next phase.' },
  { key: 'Q', what: 'Show or hide the join QR code, full screen.' },
  { key: 'F', what: 'Open this script in its own window.' },
  { key: 'Esc', what: 'Close whatever is open over the broadcast.' },
]
