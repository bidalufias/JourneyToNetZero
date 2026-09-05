# Playtest 2: the same family, after WP7, one round

Four simulated players, each holding a real phone in one shared browser,
played from the lobby to the start of Round 2 with the WP7 build (commits
c50aaff to b51cfff). Same rules as the first playtest: nobody had read
anything, nobody was told the rules, the father ran the TV from a laptop
as well as playing. This time the seats were dealt differently, so the
eleven-year-old held the Activist's Spotlight and the teacher held the
Community's veto. The four reports and the living-room chat are beside
this file.

| Seat | Player | Age | Who they are |
|---|---|---|---|
| Government | Azman | 46 | Bank branch manager. Skims, impatient, holds the laptop |
| Community | Suraya | 44 | Secondary school science teacher. Reads everything, asks what words mean |
| Business | Danial | 15 | Gamer. Taps first, reads later, competitive |
| Activist | Aisyah | 11 | Reads slowly. Asks Mum about most grown-up words |

A first attempt at this run was cut short by a rate limit on the players
after the practice Talk; its chat is in `living-room-attempt-1.log` and
nothing from it is counted here. The run that counts was room WKDX. The
players are language models playing people; the caveats from playtest 1
apply.

## What happened

| Clock | TV |
|---|---|
| 00:00 | Lobby. Four seats taken in about a minute and a half |
| 00:01 | Briefing. The father read the targets out, then skipped ahead |
| 00:02 | Practice Talk. Everyone said one sentence. Three tapped I AM DONE; the mother's clock ran out with the veto sheet open |
| 00:03 | Practice Choice. All four locked. The son picked the dirty card on purpose |
| 00:03 | Practice Reveal. The phones counted down and mirrored the cards. All four watched it |
| 00:04 | Power, then secret goal. The daughter said hers out loud by accident |
| 00:05 | Round 1 crisis, The Credit Downgrade. The son got the tip and shared it |
| 00:06 | Round 1 Talk. A deal, a request, a pay-half, a Spotlight, a promise. Ended on four dones |
| 00:07 | Round 1 Choice. Everyone picked the card they had promised |
| 00:08 | Round 1 Reveal. Three BOTH KEPT THE DEAL, one HELPED. Carbon 100 to 59. Economy 4.5 to 2.9 |
| 00:08 | Public Trust. Both points and the tip's point to the Business |
| 00:09 | Round 2 crisis. The daughter got the tip. Play stopped |

About nine minutes from the first seat to the second crisis, the same as
playtest 1.

## Playtest 1's findings, checked

None of the ten recurred.

| # | Playtest 1 finding | This time |
|---|---|---|
| 1 | Deals and promises made blind | Every promise and deal was made with the card, arrows and cost in view. Nobody switched away from a promised card. Four ticks on the Reveal |
| 2 | The practice Reveal vanished | The phones counted down LOOK UP, then mirrored the cards. All four saw it |
| 3 | Public Trust made no sense | The screen said promises do not count, said the Community holds vetoes, and the Business's tip point showed as 3, not 2. Still unfair to the daughter, for a new reason, below |
| 4 | Practice spent the powers | Both children read Practice over. So are your powers. Neither asked |
| 5 | The Spotlight asked nobody | The sheet said it catches whoever picks the dirtiest card. The result said why it caught nobody, and that she kept it |
| 6 | The Talk was long and then empty | Round 1's Talk ended on the fourth I AM DONE TALKING at about 1:10 of 2:00 |
| 7 | One badge, the promise wins | Not testable this round: nobody was both helped and judged. The code renders both |
| 8 | The Business could not make its own deal | The son offered if the Government pays half, the father took it, the card said It works in full, and the Reveal said BOTH KEPT THE DEAL |
| 9 | ⋯ was a wall with LEAVE THE GAME at the bottom | Words first, leave is a small link. Still a wall: item 10 below |
| 10 | Send buttons, veto slider, greyed SEND MONEY, wrong numbers, still-reading | Fixed. The TV names who is still reading; the family used it to nag the mother |

## What worked

Named by the players without prompting.

- **Joining, the seat list, TWO LINES YOU CAN SAY, the arrows, Dirty card, LOCK MY CARD.** All still the best parts. The father: "the best moment of the night" was BOTH KEPT THE DEAL.
- **The deal flow.** The son offered with the card in view, the card's own text changed to "The Government pays half. It works in full." when the father agreed, and the TV stamped both. The son: "I could prove to Dad the deal worked."
- **The practice Reveal on the phone.** "All four locked. The cards turn in 4." then the cards one by one. Nobody missed it.
- **The done buttons.** All four used GOT IT and I AM DONE TALKING and knew the step would end on the fourth.
- **The Spotlight explained.** The daughter turned it on, read that it cannot choose who, and read afterwards why it caught nobody and that she kept it.
- **The tip.** The son's warning said the next crisis was about power, and it was. "Made me feel like I had inside info."
- **The green MOVING TOGETHER screen.** The mother called it the game's real lesson, again. The son argued his dirty card "no problem what" and the screen answered him.
- **SAY THIS on the TV.** The father read the lines out and felt like the host.

## What did not work

Ordered by how many players hit it and how much it cost them. Each item
says whether the code confirms it, and where.

### 1. Nobody could see their cards on the Talk screen

All four, and the mother worst. The Talk screen shows the buttons and what
people said. The cards appear only inside SAY IT, under I will pick, and
only three of four found that route. The mother negotiated the whole Talk
without seeing her cards, said so twice, and saw them only when the Choice
opened. "All of you can see your cards but my phone shows no cards, only
the talk."

Confirmed in `src/phone/TableActions.tsx`: `view.options` is rendered in
`SaySheet` and `DealSheet` and nowhere on the Talk screen itself. WP7 put
the cards in the sheets, which fixed blind promises, and stopped there.

### 2. The money is a black box

The father, the son, and the mother overhearing. The father's Budget said
4 before the round and 4 after, though his card said +2 Budget and paying
half said Costs 1 Budget. The son's Company Money went 5 to 3 for a card
that cost 1 with the Government paying half. They argued for two minutes
about whether the father had paid. The son's secret goal is about money,
and he "now has no idea if I am on track".

Confirmed, and both numbers are right. In `src/engine/engine.ts`:

- Government: 4, minus 1 (The Credit Downgrade's shock takes 1 Budget),
  plus 2 (Raise Taxes on Carbon and Wealth), minus 1 (paying half) is 4.
- Business: 5, minus 1 (Build the Rail Line Together), minus 1 (when the
  Government regulates, the Business pays 1) is 3.

Nothing on any screen says any of this. The result screen's WHAT IT COST
says "It worked as planned." The engine does not record where the money
went, so the room cannot say it. Also, "You get 2 more each round" arrives
when the next round's cards turn, not at the crisis, so the header at the
Round 2 crisis still shows 4.

### 3. HELPED · WORKED TWICE AS WELL, and nobody knew who helped

All four, twice. The mother's card said it in the practice and in Round 1.
"Who helped her? Nobody sent her anything." The TV said No money is being
sent at the same time. The mother guessed, correctly, that a card helped,
not money. The phone said "Another player's card made yours work better."
without naming the card.

Confirmed: `src/game/reveal.ts` has the fixed string; the engine sets
`selfOrganiseSupported` when the Government or Business picked a
supportive card (`SUPPORTIVE` in `src/engine/types.ts`), and the log has
both cards, so the helper can be named.

### 4. The tip: two clocks, then no confirmation, then only one seat

The son and the daughter, and the mother and father asking. The tip opens
over the crisis screen with its own copy of the clock, so the son saw two
clocks and three buttons at once and tapped SHARE IT without knowing what
Public Trust was. After SHARE IT nothing on his phone said it had happened
until the result. The daughter got hers in Round 2 with eight seconds on
the clock and "just smashed SHARE IT". The other two asked how to share a
tip and were told nobody knew.

Confirmed: `TipCard` in `src/phone/screens.tsx` is a full-screen overlay
carrying the phase clock; nothing renders after `publishTip`; tips go to
one seat per round in rotation (`dealTip` in `src/game/room.ts`), which is
the design, and nothing says so.

### 5. Public Trust is a score nobody can see on their phone

The son, the daughter, the father. The son got 3, the TV showed it, and
his header shows only MONEY. The daughter: "I only found out about Public
Trust when Abang got 3 and I got 0. That is the score, right? Why is it
hidden?" The father: "Still don't know what it buys."

Confirmed: `PhoneHeader` in `src/phone/Chrome.tsx` shows the seat's
resource and nothing else. `view.trust` is already on the phone.

### 6. The practice dirty card looked fine on the phone

The son, on purpose. He picked Run the Old Plant Harder, carbon still fell
to 80, and his phone said only Nothing here counted. He learned "dirty is
fine" and his parents corrected him from the TV's green screen. The TV
card carried no Dirty mark either.

Confirmed: `RevealCard` in `src/game/session.ts` carries title, desc and
badges, not the card's kind, and the practice Reveal on the phone has no
line for the player who broke moving together.

### 7. Face-down cards on the TV read as black boxes

The daughter, out loud: "mine and Mum's one is black, empty! Where is my
card?" The father had to say the cards turn one at a time. The phone
mirror says turning next…; the TV back shows only the role name.

Confirmed in `src/dashboard/Reckoning.tsx`: the face-down card renders a
role and a mark.

### 8. Smaller things, all real

- **The power step after GOT IT.** "1 OF 4 READY. The game moves on when
  everyone has read theirs." with no button. The son thought his phone
  was broken and asked whether he was the 1. `src/phone/onboarding.tsx`.
- **SAY NO is the veto.** The mother thought it was another sentence.
  Everyone else in the room called it the veto. `LABEL.sayNo`.
- **The veto in practice.** The sheet says You have 2 for the whole game
  and the banner says This does not count. She cancelled to be safe.
- **The ⋯ sheet hides the clock.** The mother opened the word list
  during the briefing and the practice Talk ran under it. Nothing in the
  sheet shows a clock.
- **Nobody Left Behind: Quality of life never falls below 6.3.** Today is
  6.0. The mother asked whether she had already failed. The check is on
  the value after each round, so she has not. The sentence is wrong, not
  the goal.
- **PAYING HALF and No money is being sent, side by side on the TV.** The
  son read the second as proof the father had not paid.
- **The last reader is named.** "STILL READING: Suraya" three times, and
  the family used it. The mother: "the person who reads everything is
  punished by the clocks and by the family." The TV naming her is
  playtest 1's item 10, done. Whether it should be softer is a design
  call, left as is.
- **Steady Hand died on the first card.** The Government's only clean
  card in Round 1 dropped the economy three arrows, so a goal that says
  the economy never grows less than 4% was lost in one round. Content
  balance, not code. Recorded for the author, unchanged.

### Not in this batch

- **Three taps for one sentence.** All four said it. One-tap chips for a
  seat's most likely sentences are a real feature, not a fix, and they
  change what the TV shows. Recorded for the next work package.
- **Pictures on cards and crises.** The daughter's first ask. A content
  and art job.
- **Twenty-five words the eleven-year-old did not know.** Credit rating,
  lender, data centres, Ministry. The crisis texts are the story and the
  word list is the answer the game has; a tap-a-word glossary on the news
  is a feature for later.
- **HOW TO PLAY and FACILITATOR SCRIPT F did nothing.** Both open a new
  tab or window, which the harness cannot see. On a real phone and laptop
  they open. Same artefact as playtest 1.
