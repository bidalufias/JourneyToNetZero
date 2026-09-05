# Playtest 1: a family of four, first time, one round

Four simulated players, each holding a real phone in one shared browser,
played from the lobby to the start of Round 2. Nobody had read anything.
Nobody was told the rules. The father ran the TV from a laptop as well as
playing. This file is the consolidated record; the four reports the players
wrote afterwards are beside it, with the living-room chat.

| Seat | Player | Age | Who they are |
|---|---|---|---|
| Government | Azman | 46 | Bank branch manager. Skims, impatient, holds the laptop |
| Business | Suraya | 44 | Secondary school science teacher. Reads everything, asks what words mean |
| Activist | Danial | 15 | Gamer. Taps first, reads later, competitive |
| Community | Aisyah | 11 | Reads slowly. Asks Mum about most grown-up words |

The players are language models playing people, so the timings are not
human timings and the words they say they did not know are a model's guess
at an eleven-year-old. Treat the findings as a rehearsal that found where the
screens fail, not as a substitute for the live test in the plan.

## What happened

| Clock | TV |
|---|---|
| 00:30 | Lobby. Code read off the TV, four seats taken in about a minute |
| 00:31 | Briefing. The father started with three of four READY, then skipped it after 15 seconds because the son was bored |
| 00:32 | Practice Talk. Everyone said one sentence. The father sent 1 Budget, the mother accepted |
| 00:33 | Practice Choice. All four locked; the fourth lock resolved it |
| 00:34 | Practice Reveal. Three of four players missed it |
| 00:34 | Power, then secret goal. Both ended on the fourth phone |
| 00:35 | Round 1 crisis, The Ringga Falls |
| 00:36 | Round 1 Talk. Everyone had spoken by about 50 seconds; the father skipped the rest |
| 00:37 | Round 1 Choice. The father and daughter changed away from the card they had promised |
| 00:38 | Round 1 Reveal. Two BROKE THE PROMISE, two BOTH KEPT THE DEAL. Carbon 100 to 58 |
| 00:38 | Public Trust. Both points to the Government |
| 00:39 | Round 2 crisis. Play stopped |

About nine minutes from the first seat to the second crisis.

## What worked

Every player named these without prompting.

- **Joining.** Four letters typed, the seat list appears, tap a seat, type a name. The eleven-year-old got in with one line of help.
- **The seat list.** Two lines per seat. All four knew their job in one sentence.
- **TWO LINES YOU CAN SAY.** All four read theirs aloud and were using them on each other within a minute. The best thirty seconds of the setup.
- **The card step.** TAP A CARD FIRST, then LOCK MY CARD, then Locked. Now look up. Nobody locked by accident and nobody wondered what to press.
- **The arrows.** The eleven-year-old picked cards by counting green arrows without reading the words, and avoided anything marked Dirty card. That is the design working.
- **SAY IT.** Three taps and a sentence with your name on it is on the TV. Every player called this a real move.
- **Look up.** Moved eyes to the TV at the right moments.
- **The tip.** THIS IS TRUE, SHARE IT, and what you get for sharing. Decided in one second.
- **BROKE THE PROMISE and BOTH KEPT THE DEAL on the Reveal.** The moment the whole family reacted at once. The teacher called it the game's real lesson.
- **The phone result card.** Cut carbon by 9.3 million tonnes, It worked as planned, the moving together bonus. The mother saw her money drop and knew the Government had really paid half.
- **The practice powers came back.** The children noticed the counters reset and understood practice was free, once it was over.

## What did not work

Ordered by how many players hit it and how much it cost them. Each item
says whether the code confirms it, and where.

### 1. Deals and promises are made blind

All four. During the Talk, the I will pick list shows the three card
titles and nothing else. The arrows, the cost and the Dirty card label
appear only when the Choice opens. The father promised Defend the Ringga,
saw ECONOMY two arrows down, and switched. The daughter promised Switch to
Local Food because it sounded nice, saw red arrows, and switched. Both were
marked BROKE THE PROMISE on the TV. The daughter's words: "Not fair, I only
promised because I couldn't see the arrows." Two of four players felt
cheated in the first real round.

Confirmed in `src/phone/TableActions.tsx`: the promise and deal lists render
`o.title` only, while the same `view.options` carry the arrows the Choice
screen draws. The data is already on the phone.

### 2. The practice Reveal vanished before anyone looked up

Three of four missed it. The practice Reveal runs 20 seconds and starts the
instant the fourth seat locks, so the player who locked last is still
looking at Locked. Now look up when the cards are already turning. The
father said the TV was on YOUR POWER by the time he looked. This is the one
screen the whole practice exists to show.

Confirmed: `practiceReveal: 20_000` in `src/game/session.ts`, resolved on
the fourth lock in `src/game/room.ts`. Item 6 of WP4 in the plan, the
Reveal ending on facilitator input, was marked optional and not built. This
playtest says it is not optional.

### 3. Public Trust made no sense to the room

All four. The TV said the people give the points to whoever helped them
most, then gave both to the Government, who had just been marked BROKE THE
PROMISE. The Community, whose phone said The biggest carbon cut this round,
was not on the list at all. The Activist had shared a tip for 1 Public Trust
and the TV showed Activist 0. The son's verdict: "This game is rigged for
the Minister." Three separate causes:

- The two awards go to the biggest quality of life and Clean Economy movers
  by the engine's numbers, and promises do not affect them. That is the
  design, but nothing on the screen says the awards ignore promises, and
  the one-line reasons (Most for quality of life this round) do not explain
  how a promise-breaker qualifies.
- The Community cannot hold Public Trust; its power is the veto. That is
  the design, but the Community's phone never says so, and the TV lists
  three seats without saying why the fourth is missing.
- The trust screen is wrong by one. `src/dashboard/screens.tsx` line 311
  reads `log.state.trust`, the engine's snapshot, while the shared tip's
  point is added afterwards by `applyTipStake` in `src/game/room.ts`. The
  Activist held 1 when the TV said 0. This is a bug.

### 4. Practice spends the powers and says nothing

Both children. The daughter's veto counter went 2 to 1 and she asked if she
had lost it for real. The son's button said SPOTLIGHT · 2 LEFT while his
header said SPOTLIGHTS 3. Both counters came back at the power step, but for
a minute two children believed they had wasted their one power.

Confirmed: `src/game/room.ts` gives the Activist header `room.game.spotlights`
(the engine's count, unchanged until a round resolves) while the button
shows `spotlightsRemaining`, which subtracts the pending call. Two numbers
for one thing. The Community's header and button agree, so the daughter's
problem is only that the practice screen says This does not count while the
number moves.

### 5. The Spotlight never asks who, and nothing says what a protest card is

The son, twice out loud. The definition under the word says You name one
player, the role card says A Spotlight punishes a player who picks a dirty
card, and the button asks nobody. His cards said Free and nothing else, so
he guessed which one was a protest card.

Confirmed: the Spotlight command carries no target. In `src/engine/engine.ts`
it only fires if the Activist picks an ESCALATE card and the Government or
Business picks a dirty card, and then hits the dirtier of the two. The
definition in `src/game/vocab.ts` is wrong for this mechanic, and no card
carries a Protest label the way dirty cards carry Dirty card.

### 6. The Talk is long and then empty

All four. Everyone had spoken by about 50 seconds of a two-minute Talk. The
phone offers nothing to do after that. The father, who alone could skip it,
did so both times. The children called it the boring part, along with the
21 seconds of Read the news. Nothing to tap yet.

Design choice, and the round-one Talk is deliberately long. But the plan's
own principle, the room ends each step, is not applied here: four players
who have each tapped an I am done would end it without the laptop.

### 7. The Reveal shows one badge, and the promise wins

The daughter. Her card on the TV said BROKE THE PROMISE. Her phone said The
Government or Business helped, so it worked twice as well, and The biggest
carbon cut this round. In practice the same card had shown HELPED · WORKED
TWICE AS WELL in gold. To the room she looked like the worst player when
the numbers said she was the best.

Confirmed: `src/dashboard/Reckoning.tsx` lines 150 to 175 render one badge
in an if-else chain, promise first.

### 8. The Business cannot make the deal its own card tells it to make

The mother. Her role card says I will do it if the Government pays half. The
deal sentence offers only if the Government also picks a good card and if
the Government does not pick a dirty card. She had to say a different deal
from the one the game gave her.

Confirmed in `src/game/copy.ts`: two deal conditions, both about the other
player's card. Design gap.

### 9. The words under ⋯ are a wall, with LEAVE THE GAME at the bottom

The daughter and the son. The TV said Tap ⋯ to see what a word means. The
daughter tapped it, got the whole how-to-play sheet, did not find her word,
closed it, and said she was afraid of pressing LEAVE THE GAME by accident.
The son read three lines. The mother, a teacher, liked it. It is an adult's
page.

### 10. Smaller things, all real

- SEND 1 and SEND 2 look disabled until you tap the only possible recipient.
  `to` starts null in `src/phone/TableActions.tsx` even when there is one choice.
- The veto is a slider when everything else is a tap. The daughter nearly
  ran out of time on it. It is deliberate, to stop accidents, and it should
  say so or become a two-tap confirm like the Spotlight.
- SEND MONEY sits greyed out on the Community's and Activist's phones all
  game. The daughter asked why a button she can never press is there.
- The phone sheet says Three cards, forty seconds. Round 1 gives sixty and
  the practice gives two cards.
- SPACE STARTS THE SESSION started with three of four READY. The plan chose
  not to gate on READY. The TV could at least say who is still reading.
- Carbon went 100 to 58 while the four phones added up to about 33. The
  moving together bonus is the difference and nothing says how big it was.
- The practice took carbon to 53 and then back to 100 with no line saying
  Practice over, back to 100. The daughter: "the 53 was fake."

### Not a defect

- **HOW TO PLAY did nothing.** The mother tapped it on the join page and
  nothing happened. It opens the guide in a new tab, and the simulation
  cannot see a new tab. On a real phone it opens. Harness artefact.
- **Nobody gave the Community a tip.** One tip per round, rotating. Round 1
  went to the Activist and round 2 to the Government. Design.

## Words the players said they did not know

Merged from the four reports. The daughter's list is the longest and is
the one that matters.

**Game words, never defined on the screen where they appeared:** protest
card, Public Trust (as a rule, not a name), moving together, Partnership,
Clean Economy, Mt, works in full, needs 5.0 a round from here, 0.8 short,
IF NOTHING CHANGES IN 2050 122 Mt, Every 1% of growth now adds 0.8 million
tonnes of carbon, FACILITATOR SCRIPT, BRIEFING.

**Grown-up words on cards and crises:** Minister, Profit, vetoes, subsidy,
Treasury, exporters, imported, value (of a currency), funds, price controls,
buying groups, residents, households, Cabinet Situation Room, the board.

**Fiction the eleven-year-old could not place:** Ringga, Semenanjara, Kota
Damai, Aida Rahman, Bangkit Iklim, Kampung Baru Jernih.

Three names for money in one session: Budget, Company Money, and MONEY in
the phone header.

## What to change, in order

1. **Show the arrows, the cost and the Dirty card label in the promise and
   deal lists.** Same card component as the Choice, smaller. This is the
   change every player asked for first.
2. **Hold the practice Reveal.** End it on the facilitator's NEXT, or run it
   for the full flip plus fifteen seconds with a visible countdown, and buzz
   the phones LOOK UP NOW before the first card turns. Same for the real Reveal.
3. **Fix the trust screen** to read the room's trust after the tip stake, and
   put one plain line under each award: "Promises do not count here. Only
   what the card did." List all four seats, and say on the Community's phone
   at the power step that its power is the veto, not Public Trust.
4. **One number per power.** The Activist header should show the same count
   as the button. In practice, write "practice, you get it back" beside a
   counter that moves.
5. **Make the Spotlight honest.** Change the definition to what it does:
   "If you pick a protest card and someone picks a dirty card, their card
   only half works." Label protest cards Protest card the way dirty cards
   are labelled.
6. **Let the room end the Talk.** An I AM DONE on each phone; four of them
   end the Talk. The father should not be the remote control.
7. **Two badges on a Reveal card.** The promise verdict and the helped or
   spotlit line, both.
8. **Add "if the Government pays half" as a deal condition** for the
   Business, since the role card tells the player to say it.
9. **Split ⋯ into a short word list first and the full sheet behind it**,
   and move LEAVE THE GAME behind a second tap.
10. Preselect the only recipient in SEND MONEY. Hide SEND MONEY for seats
    with no money. Fix Three cards, forty seconds. Say Practice over, back
    to 100.

## Did they have fun

All four said yes and all four would play again. The father wants to play
rather than be the projector man. The mother wants the blind promise fixed
before she brings it to her class. The son wants his Spotlight to catch
someone. The daughter wants to beat her brother, and Mum next to her to
read the words.
