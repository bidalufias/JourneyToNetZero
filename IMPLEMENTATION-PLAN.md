# Journey to Net Zero: implementation plan

The single plan of record for the overhaul. It merges three reviews on this
branch and turns them into ordered work packages that a fresh session can
pick up without the conversation that produced them.

| Review | What it holds | Read it for |
|---|---|---|
| `FLOW-REVIEW.md` | The session walked phase by phase, 19 confirmed defects, the three-stage overhaul | Sequencing, readiness, what each screen must say, defect line numbers |
| `LANGUAGE-REVIEW.md` | The plain English standard (section 4), one vocabulary (3.4), definitions (3.5), rewrites by surface (5) | Every string you touch |
| `ROLE-CARDS.md` | The sixty-word role card, the four cards written, the goals rewritten, where the card appears | The role screens, the power and goal steps |

Everything below points into those documents rather than repeating them.
When this plan and a review disagree, this plan wins, because it was
written last.

## Status: six work packages done, WP7 in progress

| Package | Commit | Left out |
|---|---|---|
| WP1 · Vocabulary and the copy defects | `adfcb57` | Nothing |
| WP2 · The role card | `fdd86de` | Nothing |
| WP3 · Sequencing | `40c4148` | Nothing |
| WP4 · The onboarding screens | `5eb7f9c` | Item 6, the Reveal ending on facilitator input, was optional and was not done |
| WP5 · The content pack in plain English | `ea89390` | Item 7, two students reading twenty cards each, is a live test still to run |
| WP6 · The guide and the facilitator's script | `6d6b5e6` | Nothing |
| WP7 · Play like a finished game | in progress | From the first family playtest |

All on branch `claude/net-zero-game-review-s1qp8q`. 120 tests pass, the
typecheck and build are clean, and the function bundle is fresh. The
acceptance test in section 8 is the next thing to run, with a real room.

---

## 0. Before you start

**Read** the three reviews in the order above. Then `README.md`, which
explains the architecture and the three rules that hold it together.

**Run** `npm install && npm test && npm run typecheck`. All 120 tests pass on
this branch and must still pass at the end of every change.

**Rehearse** a session in the browser. `tools/drive-session.mjs` opens the
projector and four phones in one Chromium and walks every phase,
screenshotting both surfaces into `shots/`. `tools/probe-session.mjs`
exercises the edges: a real veto, a broken promise, a co-fund pledge, a
player who never locks, a player who never seals, a declined tip. Both need
`npm run dev` running and Playwright installed:

```
npm install --no-save playwright@1.55.0
node tools/drive-session.mjs
node tools/probe-session.mjs
```

Look at the screenshots after every work package. The reviews were written
from them and the acceptance test in section 8 is run with them.

**Hard rules, from the README and the reviews.**

1. Never change an engine constant or the content pack's numbers. The engine
   was fitted over 200,000 simulated games and `test/parity.test.ts` will
   tell you if you drift. Words are free. Numbers are not.
2. `src/game/room.ts` and `src/game/session.ts` run inside the Supabase edge
   function. After any change to them, to `src/engine`, or to the content
   pack, run `npm run build:function` and commit the regenerated
   `supabase/functions/room/index.ts` and `content.gen.ts`. CI fails if the
   bundle is stale.
3. `test/content.test.ts` compares the JSON pack with `reference/content.py`
   field by field. It compares option **titles**, archetypes, numbers,
   costs, flags and gates. It does not compare option descriptions,
   headlines, crisis situations, goals or tips. So: rename an option title
   in both files; rewrite a description in the JSON only.
4. No em dashes or en dashes anywhere in copy or commits. The repository
   removed them on purpose. Use a comma, a full stop, or a new sentence.
5. Every new or changed string follows the ten rules in `LANGUAGE-REVIEW.md`
   section 4 and uses only the vocabulary in section 3.4. Twelve words or
   fewer on the phone, fifteen on the projector.
6. Commit messages in the repository's voice: one plain sentence as the
   title, a short paragraph saying why. Look at `git log` for the shape.

---

## 1. The target session

What the session looks like when every package is done. This is the thing
to hold in mind while working on any part of it.

```
LOBBY          Seat buttons carry two lines of the role card. Taking a seat
               shows the full card. I AM READY is a room fact; the projector
               shows 3 OF 4 READY. Start is offered at four, or by override.
BRIEFING       Projector: three targets, plain words. Phone: "Look up."
PRACTICE TALK  Phone and projector both say PRACTICE. Practice scenario, practice
               private line. One SAY IT each. No round number anywhere.
PRACTICE PICK  Two practice cards. Resolves the moment four lock.
PRACTICE       The real Reveal, real flip cadence, meters twitch, the practice
REVEAL         promise judged. Twenty seconds. Then everything is discarded.
YOUR POWER     Phone: WHAT YOU HAVE and HOW TO PLAY from the role card, and
               GOT IT. Projector: all four cards. Advances on four, clock as fallback.
SECRET GOAL    Three plain goals. Projector shows 3 OF 4 CHOSEN. Advances on
               four. After choosing: "Chosen. Look up."
ROUND 1..6     Crisis, Talk, Choice, Reveal, Public Trust, Story so far, as now,
               with the defects fixed and the copy plain. A tip appears every
               round it is dealt. A vetoed player is told during the Talk. A
               funded partnership says so. The clock's default is the quiet card.
RESULT         As now, plain words. Then NEW SESSION on the projector.
```

---

## 2. Work packages, in order

Each package is one pull request. Each ends green on `npm test`,
`npm run typecheck`, and a browser rehearsal. Sizes: S is a few hours, M is
a day, L is two to three days.

### WP1 · Vocabulary and the copy defects (S)

**Done** in `adfcb57`.

No behaviour changes. Puts one vocabulary in place and fixes the sentences
that are wrong today, so every later package writes against a fixed word list.

1. Create `src/game/vocab.ts` holding the terms from `LANGUAGE-REVIEW.md`
   3.4 and the one-line definitions from 3.5. Export `TERM` (names) and
   `DEFINE` (definitions). Every later label, chip and coach line reads from
   it rather than typing the word.
2. Rename in copy only, not in phase ids: Reckoning becomes Reveal, Table
   becomes Talk, tip off becomes tip, secret win and private goal become
   secret goal, lock it in becomes lock, seal becomes choose. Places:
   `src/dashboard/Dashboard.tsx` `PHASE_LABEL`, `src/phone/Chrome.tsx`
   `SCREEN_LABEL`, `src/phone/screens.tsx`, `src/phone/TheChoice.tsx`,
   `src/phone/TableActions.tsx`, `src/dashboard/Reckoning.tsx`,
   `src/dashboard/TheTable.tsx`, `src/facilitator/script.ts`.
3. Fix the copy defects from `FLOW-REVIEW.md` section 4:
   - #6 demand grammar: rewrite `DEMAND_PHRASES` in `src/game/copy.ts` to the
     infinitive forms in `LANGUAGE-REVIEW.md` 5.7 ("to pay first") and the
     composer in `src/game/room.ts` `say()` to "X wants the Y to …".
   - #9 "It landed as you intended" after a clock pick: in
     `roundResultCopy`, when `player.defaulted` or `autoLocked`, the cost
     line says what happened to the card, never that it went as planned.
   - #10 third person on your own phone: `roundResultCopy` says "You broke
     your promise" when `b.from === role`.
   - #18 `src/dashboard/TheTable.tsx`: hide "Nobody is told who" once
     `publishedTip` is set.
   - #19 `src/dashboard/Reckoning.tsx:172`: the empty footer label becomes
     nothing, not "ON THE RECORD".
4. Apply the label and button rewrites in `LANGUAGE-REVIEW.md` 5.1, the
   coach lines in 5.2, the sheets in 5.7 and 5.8, the choice and result
   lines in 5.9, the ending in 5.10. These are string edits in the files
   named above plus `src/App.tsx`, `src/phone/onboarding.tsx`,
   `src/phone/Menu.tsx`, `src/phone/guide.tsx`, `src/dashboard/screens.tsx`,
   `src/dashboard/meters.ts`, `src/game/impact.ts`.
5. Add `test/copy.test.ts`: walks every string literal in `src/` and every
   text field in the content pack, fails on a banned list (the idioms and
   second names from `LANGUAGE-REVIEW.md` section 3, and both dash
   characters), and fails any phone-surface string over twelve words or
   projector string over fifteen. Allow-list the written guide and the
   facilitator script's `say` lines, which are spoken.

Done when: `npm test` passes including the new copy test, and the drive
script shows no "Reckoning", "Table", "tip off", "seal" or "lock it in" on
any screen.

### WP2 · The role card (M)

**Done** in `fdd86de`.

`ROLE-CARDS.md` in full.

1. `src/game/session.ts`: replace `ROLE_CHARACTER` with `ROLE_CARD`, four
   fields plus two say-lines: `who`, `wants`, `has`, `howToPlay`, `says`.
   Copy the text from `ROLE-CARDS.md` section 2 exactly. Move `whoYouAre`,
   `believe`, `afraidOf`, `neverSay` into a `BACKSTORY` export consumed only
   by the facilitator script.
2. `src/ui/RoleCard.tsx`: one component, two sizes (phone and projector
   tile), optional fifth line for the goal, optional say-lines behind a tap.
3. Use it in: `src/App.tsx` seat buttons (first two lines only) and the
   take-a-seat screen; `src/phone/screens.tsx` `RoleReveal` and the goal
   confirmation; `src/phone/onboarding.tsx` `YourPower` (lines three and
   four, large, plus a GOT IT button that sends `ack`, see WP3);
   `src/phone/guide.tsx` opens with the card; `src/dashboard/screens.tsx`
   `Onboarding` for the `power` phase shows four cards.
4. Rewrite the twelve goals in `content/jtnz-content-pack-v2.json`
   `privateGoals[*].desc` and the three renamed titles ("Market Leader",
   "Trusted Company", "Our Own Hands") from `ROLE-CARDS.md`. Titles are not
   compared by the content test but keep `reference/content.py` in step
   anyway.
5. `src/facilitator/script.ts`: a new "The four characters" section built
   from `BACKSTORY`, and remove the character lines from the lobby beat that
   told players to read what is no longer on their phone.
6. Delete `public/how-to-play.html` character sections in favour of the
   cards, as part of WP6.

Done when: every role screen shows the same four headings in the same order,
the drive script's role reveal screenshots fit above the fold at 390x844,
and no role text over seventy words appears anywhere on a phone.

### WP3 · Sequencing (L)

**Done** in `40c4148`.

`FLOW-REVIEW.md` section 5 Stage A. This is the package that turns the
session from clock-driven to table-driven. Everything in it is in
`src/game/room.ts` and `src/game/session.ts` plus the surfaces that read
them. Rebuild the function bundle at the end.

1. **Ready and acknowledgement are room facts.** Add `ready: boolean` to
   `Player` and an `ack` command (`{ t: 'ack', role }`) that sets it. Clear
   it at every onboarding phase change so the same flag serves the lobby,
   the power step and the goal step. `dashboardView.seats[].ready` and a
   count. `Phone.tsx` keeps `RoleReveal` up until the player has sent `ack`,
   including after Start. The projector's lobby, power and goal screens
   print "N OF 4".
2. **Onboarding steps end on four, with the clock as fallback.** In
   `advance`/`tick`: the lobby offers Start at four ready (the facilitator
   can still press it early); `practiceChoice` resolves the instant
   `everyoneLocked`; `power` advances when all seated players have acked;
   `goal` advances when all seated players have a `goalId`. Keep every timer
   as the fallback. Add `everyoneAcked`/`everyoneSealed` helpers beside
   `everyoneLocked`.
3. **The practice reveals.** Add phase `practiceReveal` between
   `practiceChoice` and `power`, 20 seconds. On entry, build a scratch
   `Content` whose `scenarios` includes the tutorial under id `'T'` and a
   scratch `GameState` with `path: ['T']` from `createGame`; run `playRound`
   with the four locked practice cards, resolve practice promises exactly
   as `finishRound` does, and store the log as `room.practiceLog`. Never
   touch `room.game`. `dashboardView.lastRound` returns `practiceLog` during
   `practiceReveal` so `Reckoning.tsx` renders unchanged; the Reveal's
   masthead reads PRACTICE, not ROUND 1. `endPractice` runs on leaving
   `practiceReveal` and also clears `practiceLog`. Coach line on the phone:
   "Look up. This is what a Reveal looks like."
4. **No round number before the first crisis.** `displayRound` returns 0
   for every phase before `crisis` of round 1. Both mastheads print the
   step name when the round is 0. `PhoneHeader` prints "Practice" instead
   of "Round 0". `RoundOneCoach` keys off phase, not round.
5. **Practice is sealed off from the live scenario.** In `phoneView`, during
   `practiceTalk`, `practiceChoice` and `practiceReveal`, `scenario` is the
   tutorial's title and situation and `privateLine` is one practice line
   per role ("This is practice. Say anything."). Add
   `test/room.test.ts` case: the phone view during practice contains no
   text from any round-one scenario.
6. **Tips every round.** `Phone.tsx`: derive tip visibility from the tip's
   id rather than a mount-time flag. `const [dismissed, setDismissed] =
   useState<string | null>(null)` and show when `view.tip.id !== dismissed`.
   Add a test that drives six rounds and asserts the phone view carries a
   tip in every round it was dealt.
7. **The clock's default is the quiet card.** In `resolveRound`, replace
   `opts[0]` with the choosable option whose summed absolute banded impact
   (`optionImpact` dirs) is smallest, ties to the first. Add a test: a
   silent Government in a round whose first affordable card is dirty does
   not get the dirty card.
8. **Vetoed player is told.** `PhoneView.vetoed: boolean` from
   `room.vetoTarget === role`. `TableActions` shows "The Community took your
   dirty cards away this round" during the Talk.
9. **Funded partnership says so.** `optionCondition(option, coFund)` in
   `src/game/impact.ts`; `phoneView` passes `room.coFund`. Text from
   `LANGUAGE-REVIEW.md` 5.9.
10. **The phone always says what to do.** New `LookUp` variants in
    `src/phone/screens.tsx` for `briefing` ("Look up.") and for the goal
    phase after choosing ("Chosen. Look up."). No seat list after Start.
11. **New session.** After `ended`, the projector's control bar offers NEW
    SESSION, which navigates to `/dashboard` with no room code; the
    transports already create a room when no code is given. Fix
    `src/facilitator/script.ts` `ended.next` and the TROUBLE entry that
    says to reload.
12. **Header progress bar.** `Chrome.tsx` divides by `phaseMs(phase,
    round)` instead of 90,000.
13. **Control bar placement.** `useBottomInset` in `Controls.tsx` also
    measures `.brief__lead`, `.table__record` and `.onboard__cue`, or the
    bar moves to the bottom right where no text column sits. Check the
    briefing and talk screenshots at 1600x900.
14. Rebuild: `npm run build:function`, commit the bundle.

Done when: `test/room.test.ts` covers ready, four-lock practice resolution,
the practice reveal and its discard, the goal gate, tips in every round and
the quiet default; the drive script reaches Round 1 without pressing Next
during practice choice or goal; and the probe script shows the veto notice,
the funded partnership line and a Round 6 tip on a phone.

### WP4 · The onboarding screens (M)

**Done** in `5eb7f9c`, without the optional item 6.

`FLOW-REVIEW.md` section 5 Stage B, with the copy from `LANGUAGE-REVIEW.md`.

1. `src/App.tsx`: remove `ScanChoice`. A scanned code lands on the seat
   list with the role card's first two lines on each button. The guide link
   stays only in the ⋯ menu.
2. `src/dashboard/screens.tsx` `Briefing`: the plain text and target lines
   from `LANGUAGE-REVIEW.md` 5.3. `Onboarding`: the `power` phase shows four
   `RoleCard` tiles (WP2); the `goal` phase shows the count (WP3); the
   `practiceChoice` phase keeps the count and gains the same masthead as the
   practice talk so the two practice steps look alike.
3. `src/phone/TableActions.tsx` `SaySheet`: the demand flow becomes
   sentence first, then target (six buttons, then three). Deal conditions
   read from `copy.ts` with the plain wording.
4. `src/phone/TheChoice.tsx`: at 390x844 with the coach strip and nation
   bar, the lock button must sit above the fold with three cards. Tighten
   card padding or make the nation bar collapse during the Choice.
5. Coach strip and heading agree on every phone screen: the heading never
   says a round number during practice, and the coach never says "nothing
   to tap" while a tip card is open (hide the strip under the tip).
6. Optional: the Reveal ends on facilitator input with the 45-second timer
   as a soft cap that becomes 60 seconds. Only if the room feels dead in
   rehearsal.

Done when: a new player can go from scanning the code to Round 1 reading
only the role card, the coach strip and the projector.

### WP5 · The content pack in plain English (L, writing not code)

**Done** in `ea89390`. The ratchets in the copy test are hard limits now, and
a third check holds option card fragments under five percent. Item 7, the
reading by two students, is still to run.

`LANGUAGE-REVIEW.md` 5.12, 5.13, 5.14 and 5.6.

1. Replace the eighteen `situation` strings with the versions in 5.12.
2. Rewrite all 216 option `desc` strings to the five rules in 5.13,
   starting from the twenty given. Descriptions are JSON only. Where a
   title changes, change it in `reference/content.py` too or the content
   test fails.
3. Rewrite the headlines that carry a pun, idiom or specialist word (about
   twenty-four; examples in 5.14). JSON only.
4. Tips: every forecast line ends with "The next crisis is about X." and the
   intel lines drop "briefed", "procurement", "codes" for plain words. JSON
   only, in `insiderTips.forecasts` and `insiderTips.intel`.
5. Tutorial: the practice scenario text and the four practice cards in
   plain words, and the practice private lines from WP3.
6. Rebuild `content.gen.ts` and the function bundle.
7. Have two Malaysian secondary school students each read twenty cards and
   say what the card does. A card they cannot explain goes back.

Done when: `test/copy.test.ts` passes over the content pack with the banned
list and the sentence limit, and the fragment count from the review's
measurement script (three words or fewer) is under five percent of option
sentences.

### WP6 · The guide and the facilitator's script (S)

**Done** in `6d6b5e6`. The guide is 895 words.

1. `public/how-to-play.html`: cut to about 800 words in the plain standard,
   structured as `LANGUAGE-REVIEW.md` 5.15 says. Character profiles,
   strategy and the "playing in character" essay move to the facilitator
   page.
2. `src/facilitator/script.ts`: idiom pass on every `say` line, keeping the
   warmth (`LANGUAGE-REVIEW.md` 3.8). Add the character backstories from
   WP2. Fix the `ended` beat and the reload advice from WP3. Update the
   SETUP list to say "four names and four READY on the screen before you
   start".
3. `README.md`: update the phase list, the controls table and the "Running
   a session" section for the new onboarding and the NEW SESSION control.

Done when: the guide is under 900 words, and the script has no hit on the
banned list except inside quoted character lines.

---

### WP7 · Play like a finished game (L)

From `playtests/2026-09-05-family/FINDINGS.md`: four first-time players,
one round, no rules, no script. Every item below was verified against the
code. The rule that ties them together: nothing on a screen may contradict
another screen, nobody waits on the laptop, and every reward is explained
where it is given.

1. **Promise with the card in view.** The promise and deal lists in the SAY
   IT sheet draw the same option card the Choice draws: title, cost, four
   arrows, and the Dirty card, Protest card or Partnership line. A player
   never promises a card they have not seen.
2. **The room ends the Crisis and the Talk.** A `done` command: GOT IT on
   the crisis screen, I AM DONE on the Talk. Four of them end the step, the
   clock is the fallback. The TV counts them in the masthead and the seat
   row. The practice Talk ends the same way, and the practice Reveal ends on
   four GOT ITs once the cards have turned.
3. **Hold the Reveal.** Four seconds of ALL FOUR LOCKED · LOOK UP with a
   countdown on the TV and on every phone before the first card turns. The
   phone then mirrors the four cards as they flip, with the same badges as
   the TV, so nobody plays the Reveal blind again. The practice Reveal runs
   forty seconds.
4. **Two badges on a Reveal card.** The promise verdict and the effect line
   (helped, spotlit, nobody paid half) both show, on the TV and on the phone.
5. **Public Trust, explained where it is given.** The trust screen reads
   the trust the room holds after a shared tip has paid, says that promises
   do not count there, names the tip stake, and lists the Community as
   holding vetoes, not trust. The phone's result says the same in the
   player's own terms.
6. **One number per power.** The Spotlight count changes only when a
   Spotlight is spent, on the TV and on the phone. A called Spotlight reads
   SPOTLIGHT IS ON. In the practice, a used veto or Spotlight says it comes
   back. The power step says the country is back at the start.
7. **The Spotlight tells the truth.** The definition, the role card, the
   sheet and the note all say the same thing: pick a protest card, and any
   dirty card the Government or Business picks only half works. Protest
   cards carry a Protest card line the way dirty cards carry Dirty card. The
   Activist's result says whether the Spotlight caught anyone.
8. **The Business can say "if the Government pays half".** A third deal
   condition, offered when the card is a partnership and the target is the
   Government, judged on whether the Government paid.
9. **The ⋯ sheet starts with the words.** Words on your screen first, then
   how a round goes, then the card and the full guide. LEAVE THE GAME is a
   small line at the end and still asks twice.
10. **Small things.** The veto is two taps and a confirm, not a slider. SEND
    MONEY is not shown to seats with no money. The only possible recipient
    is preselected. The lobby names who is still reading. The result says
    what the moving together bonus added. The phone sheet no longer says
    forty seconds.

Done when: `test/room.test.ts` covers the done command, the reveal hold,
trust after the stake, the spotlight count and the pays-half deal; the copy
test passes; a drive rehearsal shows the countdown, the mirror and the two
badges; and a second four-player playtest against the same script produces
none of the ten findings above.

---

## 3. Defect map

Every confirmed defect from `FLOW-REVIEW.md` section 4, and where it is fixed.

| # | Defect | Package |
|---|---|---|
| 1 | Tip shows at most once per phone | WP3.6 |
| 2 | Practice talk shows the live Round 1 line | WP3.5 |
| 3 | Practice choice never resolves or reveals | WP3.2, WP3.3 |
| 4 | Goal step expires with players unsealed, no count | WP3.1, WP3.2 |
| 5 | Start removes the role brief; ready never reaches the room | WP3.1 |
| 6 | Demand sentence ungrammatical | WP1.3 |
| 7 | Partnership card ignores co-funding | WP3.9 |
| 8 | Clock default can be the dirtiest card | WP3.7 |
| 9 | "Landed as you intended" after a clock pick | WP1.3 |
| 10 | Own broken promise in the third person | WP1.3 |
| 11 | Vetoed player not told | WP3.8 |
| 12 | "Round 1" through the onboarding | WP3.4 |
| 13 | Seat list shown during briefing and after goal | WP3.10 |
| 14 | Demand sheet is eighteen buttons | WP4.3 |
| 15 | Progress bar fixed to ninety seconds | WP3.12 |
| 16 | Control bar overlaps text | WP3.13 |
| 17 | "Reload for a new session" rejoins the ended room | WP3.11, WP6.2 |
| 18 | "Nobody is told who" under the published tip | WP1.3 |
| 19 | "ON THE RECORD" on empty reveal cards | WP1.3 |

---

## 4. Tests to add

| Test | Where | Package |
|---|---|---|
| Banned words and sentence length over all strings and the pack | `test/copy.test.ts` | WP1 |
| Practice phone view carries no round-one scenario text | `test/room.test.ts` | WP3 |
| Four practice locks resolve; practice reveal discards state | `test/room.test.ts` | WP3 |
| Goal phase waits for four, advances on four | `test/room.test.ts` | WP3 |
| Ready gates nothing for the facilitator but is counted | `test/room.test.ts` | WP3 |
| A tip is in the phone view in every round it was dealt | `test/room.test.ts` | WP3 |
| Silent player gets the quiet card | `test/room.test.ts` | WP3 |
| Vetoed flag and funded-partnership text in the phone view | `test/room.test.ts` | WP3 |
| The function bundle is fresh | existing CI check | every package |

---

## 5. Order and dependencies

```
WP1 vocabulary + copy defects
 └─ WP2 role card            (needs the vocabulary)
     └─ WP3 sequencing       (uses RoleCard on the power step; changes room.ts)
         └─ WP4 screens      (needs ready counts, practice phases, RoleCard)
WP5 content pack             (independent; can run in parallel from WP1 on)
WP6 guide + script           (last; depends on WP2 backstories and WP3 controls)
```

WP1 to WP3 are the ones that fix every blocker. If only one package ships,
ship WP3 with the copy defects from WP1 folded in.

---

## 6. Things not to do

- Do not rename phase ids in `Phase` (`reckoning`, `table`). Rename the
  labels. The ids are in tests, the edge function and stored rooms.
- Do not soften Hollow Victory. Keep the title, add the plain line under it.
- Do not move the goal step back before the practice. The practice reveal
  is what makes the goal units mean something.
- Do not add a second rules explanation anywhere. The role card, the coach
  strip and the definition-under-the-word are the whole teaching surface.
- Do not touch `reference/engine.py`, the balance constants, or the option
  numbers.

---

## 7. Sizing

| Package | Size | Mostly | Status |
|---|---|---|---|
| WP1 | S | String edits, one new test | Done |
| WP2 | M | One component, five call sites, twelve goals | Done |
| WP3 | L | Reducer, one new phase, eight tests, bundle | Done |
| WP4 | M | Four screens | Done |
| WP5 | L | Writing, 216 cards, two readers | Done, readers still to run |
| WP6 | S | Two documents | Done |

About three weeks for one person, or two weeks with the content pass running
beside the code.

---

## 8. The acceptance test

Give one person who has never run this the projector and nothing else. Give
four more the phones. Do not answer questions.

It passes when:

1. All four reach the first Reveal having already watched one.
2. No phone shows a seat list after Start.
3. Nobody asks what a word on their screen means.
4. The facilitator never presses Next during the onboarding because the
   room advanced itself.
5. Every player can say, unprompted, what they want and what their power
   does, in one sentence each.

Every question the table asks is the next ticket.
