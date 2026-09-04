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
 * welcome, and the welcome is what decides whether the room plays.
 *
 * The four moments and the debrief questions come from PART 9 of
 * `JOURNEY-TO-NET-ZERO-design.md`. The timings are read from `PHASE_MS` rather
 * than retyped, so a phase that is retuned cannot leave this page lying.
 */
import { ROLES, type Role } from '../engine/types'
import { BACKSTORY, PHASE_MS, ROLE_CARD, type Phase } from '../game/session'

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
      'Good evening, and welcome to the Republic of Semenanjara! Thirty-four million people live here. It is hot. And from tonight, the four of you are in charge.',
      'Phones out. Point your camera at the code on that screen, or type the four letters. Then take a seat: Government, Business, Community, Activist. The first to tap a seat gets it.',
      'While the others join, read your card. Four lines: who you are, what you want, what you have, how to play. You are that person for the next half hour, and it is much more fun if you play the part.',
      'One warning before we start. None of you can win alone. The game is built that way.',
    ],
    watch:
      'Four names and four READY on the screen before you start. Anyone still reading keeps their card through the briefing, so you are not waiting for them. An empty seat at the crisis becomes a phone passed round all session, and one player with two roles argues with themselves. That is the one thing this game cannot do for you.',
    next: 'Starts the session and opens the briefing.',
  },
  {
    phase: 'briefing',
    label: 'THE BRIEFING',
    length: seconds('briefing'),
    onScreen: 'The three national targets, and where the country stands today.',
    say: [
      'Right. Here is the mission, and it is not a small one. It is 2025. You have until 2050, and three numbers to reach.',
      'Carbon: this country puts out three hundred million tonnes a year. Its forests take in two hundred. So it is at one hundred, and that hundred must reach zero. Economy: growing five percent a year on average, because a country that stops growing puts people out of work. Quality of life: six out of ten today, and it must reach seven.',
      'All three. Not two out of three. Miss one and this country has failed, and so have all of you, however well you did on your own.',
      'Six crises stand between you and 2050. Every one goes the same way: you talk, you each pick a card in secret, and then all four cards turn over in front of the whole nation.',
      'We are going to practise that once before anything counts.',
      'And here is my favourite rule, so listen. Nothing you promise is binding. Nothing. You can promise something and then do the opposite. The game allows it. But this screen will show everyone what you did. Good luck.',
    ],
    watch:
      'Phones face down and eyes up for these twenty seconds. It is the only moment in the session where the game explains itself to all four of them at once; everything after this they learn by playing it.',
    next: 'Opens the first crisis.',
  },
  {
    phase: 'practiceTalk',
    label: 'PRACTICE: TALKING',
    length: seconds('practiceTalk'),
    onScreen: 'The promise board, empty, waiting for somebody to say something.',
    say: [
      'Before anything counts, we practise. Two minutes, and nothing here counts.',
      'This is the part of the round where you talk. On your phone you can promise to do something, or ask another player to. Everybody do one now, anything you like.',
      'And watch this screen while you do it. Everything you say appears up here, where the whole room can see it.',
    ],
    watch:
      'Wait until all four have appeared on the board. This is the only moment in the session where a button costs nobody anything, and a player who has pressed it once will press it again in Round 2.',
    next: 'Moves on to practising the choice.',
  },
  {
    phase: 'practiceChoice',
    label: 'PRACTICE: CHOOSING',
    length: seconds('practiceChoice'),
    onScreen: 'The same board as the practice talk. The four seats lock one at a time, and the count is in the top corner.',
    say: [
      'Now the other half. Two cards each on your phone. Tap one to pick it, then press LOCK MY CARD.',
      'Look at the four arrows on each card. They show which way it pushes the country: carbon, the economy, quality of life, and the Clean Economy. Green is the way we want.',
      'You can change your mind until you lock. After that you cannot. Still practice, still counts for nothing.',
    ],
    watch:
      'The fourth lock turns the cards over by itself. If somebody has not locked, say their seat out loud once; that is the whole lesson about the clock and it is cheaper to learn here.',
    next: 'Shows the practice Reveal. The fourth lock does this on its own.',
  },
  {
    phase: 'practiceReveal',
    label: 'PRACTICE: THE REVEAL',
    length: seconds('practiceReveal'),
    onScreen: 'The four practice cards turning over, any practice promise judged, and the meters moving.',
    say: [
      'Eyes up. This is what happens at the end of every round: the four cards turn over, one at a time, in front of everybody.',
      'Watch the meters move. And if anybody promised something up here and then did the other thing, the screen says so. That is the part that is going to matter.',
      'None of this counted. In a moment the country goes back to where it started.',
    ],
    watch:
      'Point at the promise board if a practice promise was broken. A table that has seen the sting once, for free, plays the first real Talk very differently.',
    next: 'Throws the practice away and introduces each seat to its own special move.',
  },
  {
    phase: 'power',
    label: 'WHAT EACH OF YOU CAN DO',
    length: seconds('power'),
    onScreen: 'All four role cards side by side, showing what each seat has and how to play it.',
    say: [
      'One more thing, and this one is different for each of you. Read your own phone, then look up: all four cards are on the screen, so you can see what the other three can do to you.',
      'Activist, you have three Spotlights. Community, you have two vetoes. Minister and Company Boss, you have money, and you are the only two who do.',
    ],
    watch:
      'Heads down, then GOT IT on every phone; the screen counts them, and the step moves on by itself at four. Teaching all four powers to all four players is four times the words and three times the irrelevance, which is why each phone only shows its own.',
    next: 'Asks everybody for their secret goal. The fourth GOT IT does this on its own.',
  },
  {
    phase: 'goal',
    label: 'YOUR SECRET GOAL',
    length: seconds('goal'),
    onScreen: 'The instruction, and the line to say over it.',
    say: [
      'Last thing before it starts counting. You have all seen how this country works, so decide what you personally want out of it.',
      'Three goals on your phone. Pick one. Nobody sees which one you took. Everybody is choosing at the same time, and you may lie about it for the rest of the game.',
      'And the catch: your goal only counts if the country reaches all three targets as well. You cannot win alone here. Not even a little.',
    ],
    watch:
      'They are choosing now rather than at the start on purpose. The goals are written in carbon and Public Trust and Clean Economy, and asking somebody to choose one before they have watched any of those move is asking them to pick the nicest title.',
    next: 'Opens the first real crisis. The fourth goal chosen does this on its own.',
  },
  {
    phase: 'crisis',
    label: 'THE CRISIS',
    length: seconds('crisis'),
    onScreen: 'The breaking-news sting: what has just happened to the country.',
    say: [
      'And here we go. Breaking news. [Read the headline off the screen, and mean it.]',
      'Look at your phone. You have the same story, plus one line written for you and nobody else in this room. Nobody knows what anyone else just read.',
      'Do not start fixing it yet. Take it in. The Talk opens in a moment, and then you can shout at each other.',
    ],
    watch:
      'One player gets a tip this round and nobody is told who. If somebody suddenly goes quiet or suddenly gets loud, that is probably why. Let it play.',
    next: 'Opens the Talk. The clock starts on its own if you leave it.',
  },
  {
    phase: 'table',
    label: 'THE TALK',
    length: seconds('table'),
    onScreen: 'Who is in the room, the promises made, and the countdown.',
    say: [
      'Talking time! Ninety seconds. Talk to each other, not to your phones.',
      'The best sentence in this game is: “what if we both did it?” Your phone will say it for you. SAY IT, then the deal. Somebody use it.',
    ],
    firstTime: [
      'One button. SAY IT. Behind it are three sentences: I will pick this card, I will pick this card if you do that, or I want you to do something. Pick one, tap twice, and the whole room sees it.',
      'The middle one is a deal, and it is the most powerful thing on your phone. If they keep their part and you do not, this screen says so in front of everybody. If they never keep their part, you are free. So there is no risk in offering one.',
      'Activist, you have three Spotlights for the whole game. Name somebody in public, and if they pick a dirty card it only half works. Community, you have two vetoes. Take somebody’s dirty cards away for the round. Three and two. That is all you get, so spend them where they hurt.',
    ],
    watch:
      "If the room goes quiet, put the question in somebody's mouth (“Business, what would it take?”) and then stop talking. Do not answer your own question. The silence after it is where the deal gets made.",
    next: 'Closes the Talk and deals the three cards.',
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
      'Tap a card to choose it, then LOCK MY CARD. You can change your mind until you lock. If the clock beats you, it locks the card you were holding, so pick something early.',
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
      'Locked. Eyes up. Let us see what this room actually did.',
    ],
    watch:
      'Then be quiet. This is the loudest forty-five seconds of the round and it belongs to them. If a promise breaks on screen, the room will do the reacting. A broken promise shown in silence teaches more about trust than anything you could say over it.',
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
      'Watch that Clean Economy number. Every point you put on it makes your next round of growth cost less carbon. The rooms that work that out early are the rooms that get there.',
    ],
    next: 'Opens the next crisis, or the results after round six.',
  },
  {
    phase: 'results',
    label: 'THE COUNTRY’S RESULT',
    length: 'until you advance it',
    onScreen: 'The three targets judged, then the secret goals and the titles.',
    say: [
      'Ladies and gentlemen, it is 2050. Let us see what became of Semenanjara.',
      '[Five seconds of silence. Count them.]',
      'Three targets. All three, or none of it counts. That was the deal you took half an hour ago.',
      '[Read the grade off the top of the screen, then the three lines under it, exactly as written. They name the gap.]',
    ],
    watch:
      'If somebody hit their secret goal in a session where the country missed, they get Hollow Victory. Read it out and let it sit. That card does more teaching than an hour of slides, and softening it throws the session away at the last moment. The grade is about the country and the title is about the player: SO CLOSE and Hollow Victory can appear on the same screen.',
    next: 'Ends the session and holds on the final screen.',
  },
  {
    phase: 'ended',
    label: 'AFTER',
    length: 'as long as you want',
    onScreen: 'The final standing, held.',
    say: [
      'Well done, all of you. You just ran a country for half an hour, which is longer than most people manage.',
      'Now the part that is actually worth your time. Five questions, ten minutes, and nobody is in character any more.',
    ],
    next: 'NEW SESSION opens a fresh room with a new code. Everybody joins the new code on their phone.',
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
    text: '“Hold on. Did anybody make a promise just then? … And did anybody keep it?” Round one is where this room finds out whether words are worth anything here, and they will play the other five rounds according to the answer.',
  },
  {
    round: 3,
    phase: 'summary',
    title: 'After the health crisis',
    text: '“Look at that. Carbon just fell, for free. Is that success?” If the pandemic cut the carbon while everything else collapsed, this is the cheapest and clearest lesson in the game, and it only works if you ask before anybody has had time to explain it away.',
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
/**
 * The four characters, for a table that wants colour.
 *
 * None of this is on a phone any more. The card a player reads is sixty words
 * and says who they are, what they want, what they have and how to play; the
 * backstory lives here so the host can read it aloud when it would help, and
 * a player never has to.
 */
export interface Character {
  role: Role
  title: string
  org: string
  post: string
  whoYouAre: string
  believe: string
  afraidOf: string
  neverSay: string
}

export const CHARACTERS: Character[] = ROLES.map((role) => ({
  role,
  title: ROLE_CARD[role].title,
  org: ROLE_CARD[role].org,
  ...BACKSTORY[role],
}))

/**
 * Playing in character, and the strategy the written guide used to teach.
 *
 * The guide is now five short sections a player can read in three minutes, so
 * this moved here: the host can read a point aloud when a room needs it, in
 * the welcome, in a quiet Talk, or in the debrief.
 */
export interface Point {
  title: string
  text: string
}

export const IN_CHARACTER: Point[] = [
  {
    title: 'Argue from your interests, not your opinions',
    text: 'You may think the Business should just go clean now. The Company Boss does not. Play them properly. Say what they would say and defend what they would defend. The lesson comes from holding a position you do not hold.',
  },
  {
    title: 'Every character here is right about something',
    text: 'The Minister cannot act without votes. The Company Boss cannot ignore the shareholders. The Community Leader cannot pay another price rise. The Youth Activist is running out of time. Nobody here is the fool. If you think one of them is, you are not listening.',
  },
  {
    title: 'Say things out loud',
    text: 'Do not just pick a card. Say what you are thinking of doing and ask what it is worth. Deals only happen if somebody offers one. The most useful sentence in this game is “what if we both did it?”, and the phone will say it for you.',
  },
  {
    title: 'You are allowed to break a promise',
    text: 'You are also allowed to be angry when someone breaks one on you. Both are part of the design. Be ready to talk about it afterwards, because you will be asked.',
  },
]

export const HOUSE_RULES: string[] = [
  'Phones face down during the Talk. Look at each other.',
  'Do not show anyone your secret goal, even at the end. Wait for the reveal.',
  'Speak in character where you can. “I cannot afford that” beats “this card costs two”.',
  'When the clock reaches zero it locks, ready or not. Decide early.',
]

export const STRATEGY: Point[] = [
  {
    title: 'The most useful number',
    text: 'Clean Economy starts at 10%. Growth adds carbon every round whatever anyone picks, and the higher Clean Economy goes, the less carbon each point of growth adds. Under 20% it is brutal. Over 60% a country can grow and still cut. So the answer to “how do we cut 100 million tonnes without wrecking the economy” is not do less. It is build a different economy. Most rooms work this out around Round 3.',
  },
  {
    title: 'The deal is the best button in the game',
    text: 'A deal ends three ways. Both kept it: the screen says so. They kept it and you did not: you broke it in front of everyone. They never kept theirs: you are free. So there is no risk in offering one. The worst that happens is nobody takes it.',
  },
  {
    title: 'Moving together',
    text: 'When three or four players pick good cards in the same round, the country gets a bonus no player can produce alone: extra carbon cut, a lift in quality of life, a jump in Clean Economy. Four is much better than three. Holding a polluter to account counts as a good card. Only dirty cards break it: expanding dirty, cutting rules, or making somebody else pay.',
  },
  {
    title: 'Early rounds decide late rounds',
    text: 'Build coal in Round 2 and the pollution crisis in Round 5 hits about twice as hard. Set up a river watch in Round 5 and the flood in Round 6 does less damage. Nothing is forgotten.',
  },
  {
    title: 'Tips',
    text: 'Every round one player gets a true tip about the next crisis, and nobody is told who. Keeping it costs nothing in the rules. Sharing it earns Public Trust and gives everyone the warning. A player may also describe it wrongly, and nobody can check.',
  },
]

export const DEBRIEF: string[] = [
  'Who did you need most in there, and did you ever actually tell them?',
  'What is the one thing you gave up?',
  'Which promise mattered more: the one that was kept, or the one that was broken?',
  'Round six was made easier, or harder, by something one of you did in round two. What was it?',
  'In your real job, which of these four are you? And who is the one you never talk to?',
]

export const SETUP: string[] = [
  'Big screen open on /dashboard, sitting on the lobby with a room code showing.',
  'Four phones, four seats. Four names and four READY on that screen before you start. Do not start on three.',
  '“Phones face down while we talk.” Say it once, early, in the welcome. It holds all session.',
  'Anybody who wants it can have the written guide. It is short, and nobody needs to read it to play, so do not hand it out and wait.',
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
    fix: 'Let it run out. The default lock is part of the design and the first time it happens the room starts choosing earlier.',
  },
  {
    problem: 'The phones say the game server is not answering.',
    fix: 'That is the backend, not their phones. The big screen has to stay open for the room to exist. If it persists, open a new session from the big screen and have everyone join the new code. Do not reload: the address remembers the old room and takes you straight back into it.',
  },
  {
    problem: 'A latecomer arrives after the start.',
    fix: 'Press P to stop the clock, then Q for the join code at full size. An empty seat can be taken at any point in the session, and pausing means the round they are joining is still there when they sit down.',
  },
  {
    problem: 'Something in the room needs you: a question, a fire alarm, an argument worth having.',
    fix: 'P stops the clock wherever the session has got to, on any screen, and P again gives back exactly the seconds that were left. Nobody in the room can lock or promise while it is stopped, so the round cannot resolve behind your back.',
  },
]

export const CONTROLS: { key: string; what: string }[] = [
  { key: 'Space  ·  N', what: 'Start the session, then go straight to the next step. After the ending, open a new session.' },
  {
    key: 'P',
    what: 'Stop the clock, anywhere in the session, and start it again with the seconds it had left. Nobody in the room can lock, promise or spend while it is stopped.',
  },
  { key: 'Q', what: 'Show or hide the join QR code, full screen.' },
  { key: 'F', what: 'Open this script in its own window.' },
  { key: 'Esc', what: 'Close whatever is open over the broadcast.' },
]
