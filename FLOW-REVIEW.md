# Journey to Net Zero: flow review

A review of the shipped build against one question: can four people who have
never seen this game, plus one person who has never run it, get through a
session without the game being explained to them?

Method. The engine tests, parity tests and typecheck all pass on the branch
this was written on. Two full sessions were then driven in Chromium with the
projector at 1600x900 and four phones at 390x844 in one browser context, using
the local transport, and every phase was screenshotted on both surfaces. A
second run probed the edges: a real veto, a broken promise, a co-funding
pledge, a player who never locks, a player who never seals a goal, and a tip
that was declined. Everything below was seen on screen or confirmed in code.
Line references are to the current tree.

`DESIGN-REVIEW.md` and `REDESIGN-PLAN.md` cover balance, vocabulary and the
rationale for the staged onboarding. This document does not repeat them. It
is about the seams: where a phase hands over to the next, where a phone and
the projector disagree, and where a first-time player is left with nothing to
do or the wrong thing to do.

---

## 1. The verdict

The engine, the broadcast frame, the Reveal, the Hollow Victory card and the
new SAY IT sheet are all good and should survive an overhaul untouched.

The session does not flow. It has fourteen phases and the transitions between
them are where the mess lives. Specifically:

1. **The onboarding teaches the wrong half of the loop.** The practice round
   has a talk and a choice but never a reveal, so a table reaches Round 1
   having never seen a card turn over, a meter move, or a promise judged.
   Those are the three things the game is about. The practice choice also does
   not end when all four lock, which is exactly the rule the real round uses.
2. **Nothing gates a transition on the table being ready.** Starting the
   session throws a player who is still reading their role onto a seat list.
   The goal step auto-advances after 45 seconds whether or not everyone has
   sealed, and an unsealed player then gets the goal picker on top of the
   first crisis. The projector never shows how many have pressed ready, sealed
   a goal, or read their power, so the facilitator is advancing blind.
3. **The phone spends most of the session labelled wrong.** It says
   "Round 1" from the moment a player sits down, through the lobby, the
   briefing and all four practice steps. The practice talk is headed
   "ROUND 1 · THE TALK" and carries the real Round 1 private line, so the
   first crisis is half spoiled and the practice looks live.
4. **Feedback loops are missing at the moments the design depends on.** A
   vetoed player is told nothing until the choice opens. A Business player
   whose partnership the Government has just agreed to fund still sees a card
   saying it will only half work. Tips stop appearing after the first one on
   each phone, so the last two rounds' tips are never seen by anyone.
5. **The words assume the reader already plays.** "Moves too", "the cheap
   card", "escalate", "Collaborate card", "Mt", "25 Mt past net zero" all
   appear on screens a player must act on inside forty seconds, and none is
   explained where it appears.

The good news is that the room reducer is clean, every phase is already a
named state, and the surfaces are thin. The overhaul is mostly sequencing and
copy, not architecture.

---

## 2. The journey, step by step

Each step below says what a first-time player sees, what is wrong, and how
serious it is. Severity: **Blocker** derails a workshop; **Major** confuses
a first-time table; **Minor** is polish.

### 2.1 Joining

What happens. A scanned QR lands on an interstitial asking "First time? How
to play / Proceed to the game". Proceed shows the code and four seat buttons
labelled by role and title only. Tapping one asks for a first name, then
reveals the role.

- **Major.** The seat is chosen blind. The four buttons say "Government ·
  Minister" and nothing else. The one-line blurbs already exist in
  `ROLE_CHARACTER` and are not shown here. A player picks a half-hour
  identity on a word.
- **Major.** The interstitial's "How to play" opens a 4,000-word page. That is
  not a first-time on-ramp, it is a manual. The scanner who taps it will not
  come back before the session starts.
- **Minor.** The desktop home page presents the code box as a full-width bar
  under a "Running the session" button, so the projector laptop and a player
  share the same page with the wrong thing emphasised for each.

### 2.2 Role reveal and lobby

What happens. The three-line brief, the resource held, three things the
character would say, then "I am ready". After that, the seat list.

- **Blocker.** "I am ready" is local to the phone. Nothing reaches the
  projector, so the facilitator cannot see who has read their role. Pressing
  Space while a player is still reading pulls them straight onto the seat
  list and the role brief is gone. Confirmed by starting the session with the
  Government still on the reveal screen (`Phone.tsx:69-73`).
- **Major.** The phone header reads "Government · Round 1" and shows a
  countdown of nothing while the player is in the lobby. The three national
  numbers are shown with no targets, so "Carbon 100" carries no meaning yet.
- **Minor.** The organisation name wraps to three lines in the header on
  every role, so the header is the tallest thing on the screen.

### 2.3 The briefing (45s, projector)

What happens. The projector shows the three targets and the rule that all
three must be met. The phone shows the lobby seat list with a countdown.

- **Major.** The phone gives no instruction. It should say "Look up" and
  nothing else. Instead it shows the seat list, which invites the player to
  keep reading their phone during the one moment the room is meant to be told
  the rules together.
- **Minor.** The projector's control bar sits on top of the last line of the
  briefing text at 1600x900 (`Controls.tsx`, `useBottomInset` measures the
  strip, not the text column).

### 2.4 Practice: talking (75s)

What happens. Both surfaces show the full live layout. The phone banner says
"Practice · step 1 of 4" and the body says "Round 1 · The Talk".

- **Blocker.** The practice talk carries the real Round 1 private line.
  `phoneView` hands the phone the live scenario during practice, and
  `TableActions` prints `view.privateLine` under the heading
  (`room.ts:1210-1214`, `TableActions.tsx:50`). In the run above every phone
  showed its Round 1 financial-crisis line, "Your finance team wants one
  answer", during a step that is supposed to be about nothing. This both
  spoils the first crisis and makes practice look live.
- **Major.** The projector shows the full scoreboard, with "SHORT" in red on
  two meters and "122 Mt to go" before anything has happened, headed "ROUND 1
  OF 6 · PRACTICE". Two steps later, for the practice choice, it switches to
  a bare instruction screen. The two practice steps should look like each
  other, and neither should look like a live round.
- **Major.** The Community's demand sheet is eighteen buttons, six phrasings
  times three targets, in a scrolling list. The deal sheet is six. A player
  with seventy-five seconds and a stranger to persuade cannot read eighteen
  options.
- **Major.** The demand sentence is ungrammatical on the board: "The
  Community wants the Government pays its share before anyone else moves"
  (`copy.ts:64-71` composed by `room.ts:613`).
- **Minor.** The veto control is a native range slider. It reads as a volume
  control. The intent, friction against an accidental veto, is right; the
  form is wrong.

### 2.5 Practice: choosing (60s)

What happens. Two cards each. Tap, lock. The projector counts locks.

- **Blocker.** Four locks do nothing. The phase waits for the clock or the
  facilitator, and the practice never reveals. The coach line says "In a real
  round the cards turn over on the big screen now", which is exactly the
  thing the player has not seen. The plan's own step 4 says "cards flip,
  meters twitch, nothing is kept". That is not built. A player's first Reveal
  is the one that counts.
- **Major.** The phone again says "Round 1 · Your choice". The coach banner
  says practice; the screen says Round 1.
- **Minor.** The projector's lock count is the only readiness signal in the
  whole onboarding, and it is on the one step where it does not trigger
  anything.

### 2.6 Your power (30s)

What happens. Each phone shows its own power as a heading and a paragraph.
The projector shows a one-line heading over a mostly black screen.

- **Major.** The paragraphs run 67 to 87 words, in thirty seconds, with no
  button and no interaction. The Community's text explains vetoes, Public
  Trust and who awards it in one block. The Activist's explains Spotlights,
  "escalate", and credibility decay. This is the step the plan called "taught
  in isolation"; it is taught as a wall.
- **Major.** The projector is 80 percent empty. It could show the four powers
  as four tiles so the table learns what the other three can do to them,
  which is the half of the rule each player actually needs.

### 2.7 Your secret win (45s)

What happens. Three goals on the phone. Pick, confirm, seal. The projector
shows the instruction.

- **Blocker.** The step is timed and nothing checks that four goals are
  sealed. When it expires with one player still choosing, that player gets
  the goal picker on top of the first crisis and misses the brief (confirmed:
  the Activist sealed late and was handed the goal screen while the projector
  was already on Breaking News). The projector shows no "3 of 4 sealed".
- **Major.** After sealing, the phone drops back to the lobby seat list. No
  "Sealed. The first crisis is coming." A player who has just made an
  irreversible choice is shown the room code.
- **Major.** The goals are written in units the practice round never
  produced: "Never take a Collaborate card, and still take the country 25 Mt
  past net zero", "Clean Economy reaches 52% or more", "at least one
  Spotlight lands". The plan moved this step after the practice so the units
  would mean something. The practice never showed a Mt, a percentage of clean
  economy or a Spotlight landing, so they still do not.

### 2.8 The crisis (35s in Round 1, 25s after)

What happens. Breaking news on both surfaces, plus a private line on the
phone. One player gets a tip that covers their whole screen.

This step is good. The sting screen is the best-looking thing in the product.
Two issues:

- **Blocker.** The tip card only ever opens once per phone. `tipOpen` is set
  to true on mount and set false on either button, and nothing resets it on
  a new round (`Phone.tsx:38,131`). In the probe run tips were dealt in every
  round, the cards in rounds 1 to 4 each landed on a phone that had not yet
  seen one, and the round 5 and 6 tips were never displayed on any phone.
  The projector still announced "Someone got a tip off this round".
- **Minor.** The projector keeps "Someone got a tip off this round. Nobody is
  told who" on screen directly under a panel headed "TOLD THE ROOM ·
  Community" once the tip is published.

### 2.9 The talk (120s in Round 1, 90s after)

What happens. SAY IT, SEND MONEY, and the power button for two seats. The
board on the projector fills with sentences.

- **Major.** A vetoed player is told nothing during the talk. The Community's
  phone says "You used a veto this round"; the projector shows the panel; the
  Business's phone shows no change at all until the choice opens and a card
  is struck through. The one person who most needs to renegotiate does not
  know why.
- **Major.** When the Government pledges to pay half, the Business's
  partnership card still says "Only half works unless the Government pays
  too" on the choice screen. The condition text is static
  (`impact.ts:79`). The most co-operative act in the game, which the design
  moved onto the board precisely so the Business could see it, is invisible
  on the one screen where the Business decides.
- **Major.** The deal conditions are "the Business moves too" and "does not
  take the cheap card". Neither phrase is defined anywhere a player can reach
  in the moment. "Moves" means counted toward the coalition; "the cheap card"
  means the card the engine flags as dirty. A player has no way to tell which
  of their three cards is the cheap one.
- **Minor.** With three or more sentences on the board the projector's
  "IN FLIGHT" section is clipped under the seat row, and at four sentences
  plus an offer the layout overflows.
- **Minor.** The header progress bar divides by a fixed ninety seconds
  (`Chrome.tsx:65`), so it is wrong on every phase but one and reads as full
  at the start of a 120-second talk.

### 2.10 The choice (60s in Round 1, 40s after)

What happens. Three cards, arrows, cost chip, lock button. The projector names
the last seat to lock.

This screen is close to right. The cards are readable, the arrows work, the
disabled states are distinct.

- **Major.** The clock's default pick is the first affordable card in the
  list (`room.ts:797-801`). In the probe run that was "Fire Up the Old Coal
  Plants" for a Government that had not touched its phone. A silent player
  should get the quietest card, not whichever one the content pack listed
  first. The result screen then says "You ran out of time. The clock picked
  X" followed by "It landed as you intended", which is untrue by
  construction (`room.ts:1268-1281`).
- **Minor.** Round 1's lock button sits below the fold on a 390x844 phone
  with three cards showing. The comment in `TheChoice.tsx` says it fits above
  the fold. It does not, with the coach strip and the nation bar in place.

### 2.11 The reveal (45s)

What happens. Four cards flip three seconds apart, meters travel, a promise
sting, a coalition screen. The phone says "Look up".

This is the strongest sequence in the game and needs no change. Two notes:

- **Minor.** The flip sequence finishes at about seventeen seconds. The
  remaining twenty-eight seconds are a static screen unless the facilitator
  presses next. That is fine when the room is talking, and dead when it is
  not. Consider ending the phase on facilitator input with a soft 45-second
  cap rather than a hard one.
- **Minor.** A card with nothing to say carries "ON THE RECORD" as its footer
  label. It means nothing to the room.

### 2.12 Public Trust and the story so far (15s + 8s)

- **Major.** The phone result says "The Business broke a promise" on the
  Business's own phone (`room.ts:1293-1294`). It should say "You broke your
  promise".
- **Minor.** Eight seconds is not long enough to read a four-line story plus
  a four-row standing. Either drop the phase into the Trust beat or give it
  fifteen.

### 2.13 Results and after

- **Major.** The facilitator script says "Reload the big screen for a new
  session". The dashboard rewrites its URL to carry the room code
  (`App.tsx:192-194`), so a reload rejoins the ended room under both
  transports. There is no "new session" control anywhere.
- **Minor.** On the final screen the only visible control is PAUSE, which
  does nothing useful once the game has ended.

---

## 3. Cross-cutting problems

**Labelling.** `displayRound` returns 1 for every phase before the first
crisis, and both mastheads print it. The onboarding should have no round
number at all. The phone label should read "Practice", "Before it counts", or
the step name, and the projector masthead should not say "Round 1 of 6" until
the first crisis.

**Readiness.** The facilitator drives with Space and cannot see the table's
state at any onboarding step except the practice choice. Every step that
asks four people to do something on a phone needs a "3 of 4" on the
projector, and the natural steps, ready, sealed, locked, should advance on
four rather than on a clock.

**Empty projector.** Power, goal and practice-choice screens are a heading
and a cue on black. The projector is the one thing everyone can see and it
should carry the shared half of every rule while the phones carry the private
half.

**Jargon in the moment.** Every undefined term appears on a timed screen:
"moves too", "the cheap card", "escalate", "Collaborate card", "Mt",
"partnership", "Spotlight lands". The written guide defines them all, on a
different page, in 4,000 words. The card, the sheet and the goal each need
the one-line definition next to the word.

**Consistency between coach and screen.** The coach strip says practice; the
heading says Round 1. The coach says "nothing to tap yet"; the tip card
demands a tap. The result says the clock chose; the next line says it landed
as you intended. Each of these is a small contradiction and a first-time
player notices every one.

---

## 4. Confirmed defects

| # | Where | What | Severity |
|---|---|---|---|
| 1 | `Phone.tsx:38,131` | `tipOpen` never resets, so a phone shows at most one tip per session. Round 5 and 6 tips were never displayed in a full run. | Blocker |
| 2 | `room.ts:1210-1214`, `TableActions.tsx:50` | Practice talk shows the live Round 1 private line. | Blocker |
| 3 | `room.ts:531`, `advance` | Practice choice never resolves on four locks and never reveals. | Blocker |
| 4 | `room.ts:691-692`, phase machine | Goal phase auto-advances with unsealed players; the picker then covers the crisis. No readiness on the projector. | Blocker |
| 5 | `Phone.tsx:69-73` | Starting the session removes the role reveal from any phone still reading it. Ready state never reaches the room. | Blocker |
| 6 | `copy.ts:64-71`, `room.ts:613` | "wants the Government pays its share": demand sentences are ungrammatical. | Major |
| 7 | `impact.ts:79` | Partnership card still says "only half works" after co-funding is pledged. | Major |
| 8 | `room.ts:797-801` | Clock default is the first affordable card, which can be the dirtiest. | Major |
| 9 | `room.ts:1268-1281` | "The clock picked X" followed by "It landed as you intended". | Major |
| 10 | `room.ts:1293-1294` | Round result names the reader in the third person for their own broken promise. | Major |
| 11 | `TableActions.tsx` | Vetoed player gets no notice during the talk. | Major |
| 12 | `session.ts:120`, both mastheads | "Round 1" shown throughout the lobby and onboarding. | Major |
| 13 | `Phone.tsx:73,82` | Briefing and post-seal screens show the lobby seat list with no instruction. | Major |
| 14 | `TableActions.tsx:321-347` | Demand sheet is 18 buttons. | Major |
| 15 | `Chrome.tsx:65` | Header progress bar uses a fixed 90-second denominator. | Minor |
| 16 | `Controls.tsx`, `useBottomInset` | Control bar overlaps briefing text and the "In flight" heading at 1600x900. | Minor |
| 17 | `script.ts:250`, `App.tsx:192` | "Reload for a new session" rejoins the ended room. | Minor |
| 18 | `TheTable.tsx:126-130` | "Nobody is told who" stays on screen under the published tip. | Minor |
| 19 | `Reckoning.tsx:172` | "ON THE RECORD" as a footer label on cards with nothing to report. | Minor |

Defects 1 to 5 are the ones that would show up in the first ten minutes of a
real workshop.

---

## 5. The overhaul

The shape of the fix is a session that is gated by the table, not by a clock,
until the first crisis; a practice round that is a real round with the stakes
removed; and a projector that carries the shared rule at every step. Three
stages, each shippable on its own.

### Stage A: sequencing and feedback (no new screens)

1. **Ready is a room fact.** Add a `ready` command. The lobby shows "3 of 4
   ready" on the projector, and Start is offered when four are ready or the
   facilitator overrides. A phone that has not pressed ready keeps its role
   brief through the briefing.
2. **Every onboarding step ends on four, with a clock as the fallback.**
   Practice choice resolves on four locks. Goal advances on four seals.
   Power advances on four taps of "Got it". The projector prints the count
   for each. The timed fallback stays so a stuck table never stalls.
3. **The practice reveals.** Add a `practiceReckoning` phase. Resolve the
   four practice cards through the engine against a scratch copy of the
   state, run the real Reveal on the projector with the real flip sequence,
   show the promise judged, show the meters twitch, and then discard the
   state, which `endPractice` already knows how to do. Ten seconds, once,
   and the table has seen the whole loop before it counts.
4. **No round number before the first crisis.** `displayRound` returns 0
   during onboarding; both mastheads print the step name instead.
5. **Practice is sealed off from the live scenario.** The phone view carries
   the practice scenario's own title, situation and a practice private line
   during both practice phases.
6. **Fix defects 1, 6 to 11, 13, 17, 18** as listed. Each is a few lines.
7. **The clock's default is the quiet card.** Pick the affordable option with
   the smallest absolute effect, or a card the content pack marks as the
   default, never the first in the list.

### Stage B: the onboarding teaches

1. **Seat picking with a line each.** The four seat buttons carry the blurb
   that already exists. The interstitial goes; the guide link moves to the
   ⋯ menu where it already lives.
2. **Power is one card, not one paragraph.** Each phone shows the power as a
   card in the same shape as an option card: name, one line, the number held,
   and one "Got it" button. The projector shows all four powers as four
   tiles, because the rule a player needs most is what the other three can do
   to them.
3. **Goals in plain words with the unit explained.** Each goal carries a
   second line that says what the number is: "Carbon is the big number on the
   screen. Net zero is 0. This wants it at minus 25."
4. **The phone always says what to do now.** Briefing: "Look up." After seal:
   "Sealed. Look up. The first crisis is coming." After lock: what is already
   there. Nothing on the phone is ever a seat list once the session has
   started.
5. **Round 1 keeps the coach strip; so does the reveal.** Already true; make
   the strip and the heading agree.

### Stage C: the words on the timed screens

1. **Deal conditions in the player's words.** "if the Business also picks a
   card that helps" and "if the Business does not pick its dirty card". Mark
   the dirty card on the choice screen with the same word, so the sentence and
   the card agree.
2. **Demands as six sentences, then a target.** Pick the sentence first, then
   who it is aimed at. Six buttons, then three.
3. **Cards say when the room has changed them.** A partnership card whose
   funding is pledged says "The Government is paying half. This works at full
   strength." A vetoed player's talk screen says "The Community took your
   dirtiest card away this round. You will see which when the choice opens."
4. **One line under every term on the goal, the power and the sheet.**
   "Spotlight: names whoever picks the dirtiest card." "Collaborate card: the
   one that says you gain influence and lose support."
5. **The written guide becomes a reference, not an on-ramp.** Keep it, but
   nothing on the join path points at it.

Stage A is the one to do first. It contains every blocker, needs no new
design, and turns the session from clock-driven to table-driven, which is
the property a self-explanatory game has to have before any copy change
helps.

---

## 6. What to keep

- The room reducer and the phase machine. Every phase is a named state and
  the fix is adding two and gating four, not restructuring.
- The Reveal, in full: the flip cadence, the face-down cards, the sting, the
  coalition screen.
- The SAY IT sheet's three shapes, and the deal in particular.
- The option card: title, one line, cost chip, four arrows, one condition.
- The crisis sting screen.
- The Hollow Victory ending and the three-grade country result.
- The pause. It works on every surface and freezes the Reveal mid-flip.
- The facilitator script's voice.

---

## 7. The test that decides it

Give one person who has never run this the projector and nothing else. Give
four more the phones. Do not answer questions. The session passes when the
four reach the first Reveal having already seen one, when no phone ever shows
a seat list after Start, and when nobody at the table asks what a word on
their screen means. Every question they do ask is the next ticket.
