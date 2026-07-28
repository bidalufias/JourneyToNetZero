/**
 * The facilitator's script, the thing that used to live in whoever ran it last.
 *
 * A session is thirty-five minutes long and the person running it has four people
 * looking at them, a projector behind them, and no second chance at the twenty
 * seconds where the game explains itself. Everything here is written to be read
 * off a laptop while that is happening: what is on the screen right now, what
 * to say over it, what to watch for, and what the next press of the spacebar
 * does.
 *
 * It is written in the voice of a host, out loud, ready to be read verbatim by
 * somebody who has never run this before, because that is usually who runs it.
 * The game itself is already a broadcast: the screen says LIVE, the crises
 * arrive as breaking news, there is an anchor with a name. A facilitator
 * narrating it in the flat register of a workshop brief is fighting their own
 * set. Warmth and pace are not decoration here; four strangers will not
 * negotiate hard in front of each other until somebody in the room has given
 * them permission to enjoy themselves.
 *
 * The lines are complete sentences rather than bullet prompts for the same
 * reason. Anyone can improvise by round three; nobody can improvise the
 * welcome, and the welcome is what decides whether the table plays.
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
  /** Lines to say out loud. Written to be read as they are. */
  say: string[]
  /**
   * Lines for round one only: the rules a table needs explaining once and
   * then resents hearing again. Six rounds of the same explanation is how a
   * thirty-five-minute game starts feeling like a training course.
   */
  firstTime?: string[]
  /** What to watch in the room while it runs. Direction, not dialogue. */
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
      'Good evening, and welcome to the Republic of Semenanjara! Thirty-four million people, one very warm peninsula, and, as of tonight, four of you in charge of the whole thing.',
      'Phones out. Point your camera at the code on that screen, or type those four letters in. Then take a seat: Government, Business, Community, Activist. First come, first served.',
      'While the rest of them are joining, read your character. Name, job, what they want, what they are frightened of. You are going to be that person for the next half hour, and I promise you it is a great deal more fun if you commit to it.',
      'And one warning before we begin. Not one of you can do this alone. That is not a hint. That is the entire design of the game.',
    ],
    watch:
      'Names on all four seats before you start. A seat still empty at the crisis is a phone that gets handed round all session, and one player carrying two roles argues with themselves, which is the one thing this game cannot do for you.',
    next: 'Starts the session and opens the briefing.',
  },
  {
    phase: 'briefing',
    label: 'THE BRIEFING',
    length: seconds('briefing'),
    onScreen: 'The three national targets, and where the country stands today.',
    say: [
      'Right. Here is the mission, and it is not a small one. It is 2025. You have got until 2050, and three numbers to hit.',
      'Emissions: this country puts out three hundred million tonnes a year, and its forests soak up two hundred of them, so it is sitting at a hundred net. You need that hundred down to nothing. Growth: averaging five percent, because a country that stops growing puts people out of work. Happiness: six out of ten today, and it needs to be seven.',
      'All three. Not two out of three. Miss one and this country has failed, and so have all of you, however brilliantly you personally did.',
      'Six crises stand between you and 2050. Every one of them goes the same way: you talk, you each pick a card in secret, and then all four turn over at once in front of the entire nation.',
      'We are going to practise that once before any of it counts.',
      'And here is my favourite rule, so listen to this one. Nothing you promise at that table is binding. Nothing. You can look somebody in the eye, shake their hand, and do the exact opposite, and this screen will tell everybody you did it. Good luck.',
    ],
    watch:
      'Phones face down and eyes up for these twenty seconds. It is the only moment in the session where the game explains itself to all four of them at once; everything after this they learn by being hit with it.',
    next: 'Opens the first crisis.',
  },
  {
    phase: 'practiceTalk',
    label: 'PRACTICE: TALKING',
    length: seconds('practiceTalk'),
    onScreen: 'The promise board, empty, waiting for somebody to say something.',
    say: [
      'Before any of it counts, we are going to practise. Two minutes, and nothing here goes on your record.',
      'This is the part of the round where you talk. On your phone you can promise to do something, or ask somebody else to. Everybody do one now, whatever you like.',
      'And watch this screen while you do it, because everything you say lands up here where the whole room can see it.',
    ],
    watch:
      'Wait until all four have appeared on the board. This is the only moment in the session where you can make somebody use a button without it costing them anything, and a player who has pressed it once will press it again in Round 2.',
    next: 'Moves on to practising the choice.',
  },
  {
    phase: 'practiceChoice',
    label: 'PRACTICE: CHOOSING',
    length: seconds('practiceChoice'),
    onScreen: 'One instruction, and how many have locked in.',
    say: [
      'Now the other half. Two cards each on your phone. Tap one to pick it, then press LOCK IT IN.',
      'Look at the four arrows on each card. They tell you which way it pushes the country: carbon, the economy, quality of life, and the clean economy. Green is the direction we want.',
      'You can change your mind right up until you lock. After that you cannot. Still practice, still counts for nothing.',
    ],
    watch:
      'Four locks on the screen before you move on. If somebody has not, say their seat out loud once; that is the whole lesson about the clock and it is cheaper to learn here.',
    next: 'Introduces each seat to its own special move.',
  },
  {
    phase: 'power',
    label: 'WHAT EACH OF YOU CAN DO',
    length: seconds('power'),
    onScreen: 'One line saying that each seat holds something the others do not.',
    say: [
      'One more thing, and this one is different for each of you. Read your own phone, because nobody else has what you are looking at.',
      'Activist, you have three Spotlights. Community, you have two vetoes. Minister and Company Boss, you have money, and you are the only two who do.',
    ],
    watch:
      'Thirty seconds, heads down, then move. Teaching all four powers to all four players is four times the words and three times the irrelevance, which is why each phone only shows its own.',
    next: 'Asks everybody for their secret win.',
  },
  {
    phase: 'goal',
    label: 'YOUR SECRET WIN',
    length: seconds('goal'),
    onScreen: 'The instruction, and the line to say over it.',
    say: [
      'Last thing before it starts counting. You have all now seen how this country works, so decide what you personally want out of it.',
      'Three goals on your phone. Pick one. Nobody sees which one you took, everybody is choosing at the same time, and you are allowed to lie about it for the rest of the game.',
      'And the sting: your goal only pays if the country hits all three targets as well. You cannot win alone here. Not even a little.',
    ],
    watch:
      'They are choosing now rather than at the start on purpose. The goals are written in carbon and Public Trust and clean economy, and asking somebody to commit to one before they have watched any of those move is asking them to pick the nicest title.',
    next: 'Opens the first real crisis.',
  },
  {
    phase: 'crisis',
    label: 'THE CRISIS',
    length: seconds('crisis'),
    onScreen: 'The breaking-news sting: what has just happened to the country.',
    say: [
      'And here we go. Breaking news. [Read the headline off the screen, and mean it.]',
      'Look at your phone. You have got the same story, plus one line written for you and nobody else in this room. Nobody knows what anybody else just read.',
      'Do not start fixing it yet. Take it in. The table opens in a moment and then you can shout at each other.',
    ],
    watch:
      'One player gets an insider tip this round and nobody is told who. If somebody suddenly goes quiet or suddenly gets loud, that is probably why. Let it play.',
    next: 'Opens the table. The clock starts on its own if you leave it.',
  },
  {
    phase: 'table',
    label: 'THE TALK',
    length: seconds('table'),
    onScreen: 'Who is at the table, the promises made, and the countdown.',
    say: [
      'Talking time! Ninety seconds. Talk to each other, not to your phones.',
      'The best sentence in this game is six words long: “what if we both did it?” Your phone will say it for you. SAY IT, then the second option down. Somebody use it.',
    ],
    firstTime: [
      'One button. SAY IT. Behind it are three sentences: I will choose this, I will choose this if you do that, or I want somebody to do something. Pick one, tap twice, and the whole room sees it.',
      'That middle one is a deal, and it is the most powerful thing on your phone. If they do their part and you go back on yours, this screen says so in front of everybody. If they never do their part, nothing is held against you. So there is no risk in offering one.',
      'Activist, you have three Spotlights for the whole game. Name somebody in public and their dirty card only half works. Community, you have two vetoes. Take somebody’s worst card off the table completely. Three and two. That is all you get, so spend them where it hurts.',
    ],
    watch:
      "If the room goes quiet, put the tension into somebody's mouth (“Business, what would it take?”) and then stop talking. Do not answer your own question; the silence after it is where the deal gets made.",
    next: 'Closes the talking and deals the three cards.',
  },
  {
    phase: 'choice',
    label: 'THE CHOICE',
    length: seconds('choice'),
    onScreen: 'Four seats, locking one at a time. The last one to lock is named.',
    say: [
      'Time! Phones up. Three cards each, forty seconds, and nobody sees what you pick.',
      'And remember, you do not have to do what you just promised.',
    ],
    firstTime: [
      'Tap a card to choose it, then LOCK IT IN. You can change your mind right up until you lock. If the clock beats you, it locks whatever you were holding, so pick something early.',
    ],
    watch:
      'Say nothing else. The screen is naming the last seat that has not locked, and four people looking at one person does more than you can.',
    next: 'Resolves the round. This happens on its own when all four lock.',
  },
  {
    phase: 'reckoning',
    label: 'THE REVEAL',
    length: seconds('reckoning'),
    onScreen: 'The four cards flip one at a time, meters moving between each.',
    say: [
      'Locked. Eyes up. Let us see what this table actually did.',
    ],
    watch:
      'Then be quiet. This is the loudest forty-five seconds of the round and it belongs to them. If a promise breaks on screen, the room will do the reacting; a broken promise landing in silence teaches more about trust than anything you could say over the top of it.',
    next: 'Shows where the two Public Trust tokens went.',
  },
  {
    phase: 'trust',
    label: 'PUBLIC TRUST',
    length: seconds('trust'),
    onScreen: 'The two seats the country backed this round, and the running totals.',
    say: [
      'And the country has been watching. Two Public Trust go out every round: one to whoever looked after people, one to whoever built the future.',
      'Nobody hands these out and you cannot ask for them. Look at your phone as well; it now tells you what your own card actually did.',
    ],
    firstTime: [
      'Minister, watch that number. Some of your best cards will not open until the country has backed you enough times.',
    ],
    next: 'Shows the story so far.',
  },
  {
    phase: 'summary',
    label: 'THE STORY SO FAR',
    length: seconds('summary'),
    onScreen: 'One line per round, and how far the three targets still are.',
    say: [
      'And that is the story of this country so far. Here is where it leaves you: what you have built, and what you still owe.',
      'Watch that clean economy number. Every point you put on it makes your next round of growth cost less carbon. The tables that work that out early are the tables that get there.',
    ],
    next: 'Opens the next crisis, or the results after round six.',
  },
  {
    phase: 'results',
    label: 'THE NATIONAL MISSION',
    length: 'until you advance it',
    onScreen: 'The three targets judged, then the secret wins and the titles.',
    say: [
      'Ladies and gentlemen, it is 2050. Let us see what became of Semenanjara.',
      '[Five seconds of silence. Count them.]',
      'Three targets. All three, or none of it counts. That was the deal you took half an hour ago.',
      '[Read the grade off the top of the screen, then the three lines under it, exactly as written. They name the gap.]',
    ],
    watch:
      'If somebody hit their private goal in a session where the country missed, they get Hollow Victory. Read it out and let it sit. That card does more teaching than an hour of slides, and softening it throws the session away at the last moment. The grade is about the country and the title is about the player: SO CLOSE and Hollow Victory can and do land on the same screen.',
    next: 'Ends the session and holds on the final screen.',
  },
  {
    phase: 'ended',
    label: 'AFTER',
    length: 'as long as you want',
    onScreen: 'The final standing, held.',
    say: [
      'Give yourselves a hand. You just ran a country for half an hour, which is longer than most people manage.',
      'Now the part that is actually worth your time. Five questions, ten minutes, and nobody is allowed to be in character any more.',
    ],
    next: 'Nothing further. Reload the big screen for a new session.',
  },
]

export interface Moment {
  round: number
  phase: Phase
  title: string
  text: string
}

/**
 * PART 9 of the design doc: the four places a facilitator earns their fee.
 *
 * Each carries the line to say and then why it works, in that order, because
 * in the ten seconds where the moment is live nobody is reading the second half.
 */
export const MOMENTS: Moment[] = [
  {
    round: 1,
    phase: 'reckoning',
    title: 'After the first reveal',
    text: '“Hold on. Did anybody make a promise just then? … And did anybody keep it?” Round one is where this table finds out whether words are worth anything here, and they will play the other five rounds according to the answer.',
  },
  {
    round: 3,
    phase: 'summary',
    title: 'After the health crisis',
    text: '“Look at that. Carbon just fell, for free. Is that success?” If the pandemic cut the carbon while everything else collapsed, this is the cheapest and clearest lesson in the game, and it only lands if you ask before anybody has had time to rationalise it.',
  },
  {
    round: 4,
    phase: 'table',
    title: 'Before the round 4 choices',
    text: "Read the Government's Public Trust total off the screen, then: “that number was decided three rounds ago.” Path dependency, in one sentence, with the evidence sitting behind you.",
  },
  {
    round: 6,
    phase: 'results',
    title: 'After the final reveal',
    text: 'Nothing. Five full seconds of it. Count them in your head. Then: “right. Let us talk about what just happened.”',
  },
]

/** Ten minutes, in this order, in plain English rather than in character. */
export const DEBRIEF: string[] = [
  'Who did you need most in there, and did you ever actually tell them?',
  'What is the one thing you gave up?',
  'Which promise mattered more: the one that was kept, or the one that was broken?',
  'Round six was made easier, or harder, by something one of you did in round two. What was it?',
  'In your real job, which of these four are you? And who is the one you never talk to?',
]

export const SETUP: string[] = [
  'Big screen open on /dashboard, sitting on the lobby with a room code showing.',
  'Four phones, four seats, four names on that screen before you start. Do not start on three.',
  '“Phones face down while we talk.” Say it once, early, in the welcome. It holds all session.',
  'Anybody who wants the full rules can have the written guide, but nobody needs to read a word of it to play, so do not hand it out and wait.',
  'Thirty-five minutes end to end. Another ten for the debrief, which is where the value is.',
  'Read the lobby and briefing lines below out loud once before the room fills. They are the only two you cannot improvise.',
]

export interface Trouble {
  problem: string
  fix: string
}

export const TROUBLE: Trouble[] = [
  {
    problem: 'A player says their seat is taken but nobody is in it.',
    fix: 'Their old tab still holds it. On the phone that has it, the ⋯ menu frees the seat; otherwise pick a different seat and carry on. The game does not care which chair which person is in.',
  },
  {
    problem: 'A phone lost its connection mid-round.',
    fix: 'Nothing to do. The seat is held, the phone rejoins by itself, and if the clock runs out first it locks whatever was selected. The session never stalls waiting for a phone.',
  },
  {
    problem: 'Somebody typed the code wrong.',
    fix: 'It is always four letters, never digits. O is a letter here. Or have them scan the QR code, which cannot be mistyped.',
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
    fix: 'Press P to stop the clock, then Q for the join code at full size. An empty seat can be taken at any point in the session, and pausing means the round they are joining is still there when they sit down.',
  },
  {
    problem: 'Something in the room needs you: a question, a fire alarm, an argument worth having.',
    fix: 'P stops the clock wherever the session has got to, on any screen, and P again gives back exactly the seconds that were left. Nobody at the table can lock or promise while it is stopped, so the round cannot resolve behind your back.',
  },
]

export const CONTROLS: { key: string; what: string }[] = [
  { key: 'Space  ·  N', what: 'Start the session, then go straight to the next step.' },
  {
    key: 'P',
    what: 'Stop the clock, anywhere in the session, and start it again with the seconds it had left. Nobody at the table can lock, promise or spend while it is stopped.',
  },
  { key: 'Q', what: 'Show or hide the join QR code, full screen.' },
  { key: 'F', what: 'Open this script in its own window.' },
  { key: 'Esc', what: 'Close whatever is open over the broadcast.' },
]
