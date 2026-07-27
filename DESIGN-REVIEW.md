# Journey to Net Zero: Design Review

> **Superseded as a plan by `REDESIGN-PLAN.md`**, which merges this review with a
> second independent review and applies the client's two decisions: rebasing
> emissions to 100 Mt net with net zero as the actual target, and a staged
> onboarding in place of a simplified first game. This document is retained as
> the evidence log behind that plan: the defect list, the code references and the
> balance findings live here and are not repeated there.

A review of the shipped build against two goals: world class as a strategy
simulation, and self explanatory enough that any four people can pick it up and
play. Written after reading the engine, the content pack, both play surfaces,
the written guide, the facilitator script, the design document and the balance
report.

---

## 1. The verdict first

**The simulation underneath this game is excellent and should not be touched.**
The balance work is real: 200,000 simulated games, nine documented faults found
and fixed, four selfish players winning 0.0%, all three targets genuinely
binding, three dead options and five dominant ones out of 216. Most commercial
strategy games ship without a tenth of that rigour. The broadcast concept
(LIVE, breaking news, an anchor, a ticker, cards flipping one at a time) is a
strong, coherent, distinctive frame. The Hollow Victory card is the best single
idea in the product.

**The layer between that engine and four human beings is where everything goes
wrong**, and it goes wrong in one specific way that explains every symptom you
named.

### The core diagnosis

The game has an identity split. It is a **facilitated training simulation**
wearing the clothes of a **party game**.

Everything about the presentation says party game: four minute rounds, a
broadcast skin, drama beats, "look up", a countdown that shames the last player
to lock. Everything about the systems says simulation: fourteen interacting
mechanics, 216 options with the numbers deliberately hidden, legacy flags,
marginal abatement curves, credibility decay.

Those two pull in opposite directions, and the seam is exactly where your
complaints land. A party game teaches itself in sixty seconds. A simulation
earns its complexity over hours. This asks for simulation depth at party game
pace, and the result is a table that is playing without understanding, which
reads to the players as "too heavy" even though no individual rule is hard.

Everything below follows from that single problem.

---

## 2. The complexity audit

Count what a table must hold in its head to play one round properly:

| # | System | Who must understand it |
|---|---|---|
| 1 | Three national targets, all or nothing | Everyone |
| 2 | Green Economy Share, the hidden fourth meter | Everyone, and nobody is told |
| 3 | Private sealed goal | Everyone |
| 4 | Fiscal Points, income, cap, cost gates | Government |
| 5 | Capital, income, cap, cost gates | Business |
| 6 | Trust, gates, and who awards it | Everyone, contradicted across surfaces |
| 7 | Spotlight (3, conditional on also escalating) | Activist, and its targets |
| 8 | Public Mandate veto (2 per game) | Community, and its targets |
| 9 | Co-fund | Government and Business |
| 10 | Coalition Bonus, and the 3 vs 4 cliff | Everyone |
| 11 | Offers (transfer, accept, decline, expiry) | Government and Business only, though the guide says everyone |
| 12 | Promises, unenforced | Everyone |
| 13 | Demands, no mechanical effect at all | Everyone |
| 14 | Insider tips: 4 types, 2 reliability grades, publish gamble | Whoever receives one |
| 15 | Legacy flags and resilience | Nobody is told, everyone is affected |

Fifteen systems. World class thirty minute games run four to six. Wingspan
teaches three engines in ten minutes because there are only three. One Night
Ultimate Werewolf is fifteen roles but exactly one loop. This has one loop and
fifteen systems, which is the harder version of the same problem.

**Word count on a first time player before Round 1 begins:** roughly 850 words
across the role reveal, the goal picker and the briefing. That is a five minute
read at ESL pace, inside a three minute setup budget.

---

## 3. Fix 1: cut fifteen systems to six

This is the single highest impact change and everything else gets easier once
it lands.

### Keep, exactly six

1. **Three targets, all or nothing.** The spine. Untouched.
2. **One resource per seat.** Untouched mechanically, renamed (section 6).
3. **One signature power per seat.** Government spends and legislates, Business
   invests, Community can say no, Activist can name and shame.
4. **The Coalition Bonus.** The teaching. Make it louder, not quieter.
5. **Public promises, unenforced.** The other teaching.
6. **The private goal.** Moved later (section 8), not removed.

### Fold, four

**Demands fold into Promises.** A Demand has zero mechanical effect and
duplicates the Promise button. Replace both with one action, **SAY IT**, that
composes three sentence shapes:

- `I will choose "<card>".`
- `I want the <seat> to <condition>.`
- `I will choose "<card>" if the <seat> chooses "<their card>".`

The third one is new, and it is the most valuable thing you could add. Your own
design document closes with: *"The most important number in this game is the
number of times someone says 'okay, what if we both did it?'"* Right now the
game has no way to say that sentence. Make it a first class, one tap,
grammatical, on the big screen, resolved at the Reckoning as KEPT or BROKEN by
both parties. That is a **better** game, not just a simpler one.

**Co-fund folds into SAY IT.** Remove the standalone toggle. Give the
Government one extra sentence in the sheet: `The Government will pay half of any
partnership the Business signs.` It sets the same flag, and it becomes a public
political commitment on the board instead of a private toggle nobody sees.

**Insider tips shrink to one type.** Four tip kinds, two reliability grades and
a trust gamble is an entire subsystem serving atmosphere. Your own known issues
list says it is the one module never simulated. Cut to: one player per round
gets **one warning about the next crisis**, with two buttons, TELL THE ROOM or
SAY NOTHING. No CONFIRMED/UNVERIFIED, no trust wager, no whispers about goals.
That preserves "somebody at this table knows something" at roughly a fifth of
the rules load. Restore the full module in the 45 minute variant.

**Offers stay, but the guide must stop lying.** `how-to-play.html` §7 and design
doc Part 4 both say Offer is available to "Everyone". `OfferSheet` in
`src/phone/TableActions.tsx:293` disables it for Community and Activist because
they hold nothing transferable. Two of your four players are told they have a
button they do not have.

### Hide, five

Legacy flags, resilience flags, the drift table, the marginal abatement curve
and role scaling should never appear in player facing text at all. They
currently leak into the guide (§11 defines "Legacy flag" and "Decoupling") and
into the design doc language that seeps back into copy. Players should feel
these, never learn them.

**Result: six systems a table must learn, four they discover, five they never
see.** That is a shape that teaches itself.

---

## 4. Fix 2: the Community seat is broken, and it is the most fixable thing here

This is the most serious content defect in the game, and it is not a balance
problem. It is a promise the game makes and does not keep.

Every player facing surface tells the Community they award Trust:

- `how-to-play.html:286` — "Every round **you award 2 Trust tokens**: one to
  whoever looked after people best, one to whoever did most for the future."
- Design doc Part 2 — "Something better: they decide who is trusted."

The engine does not do this. `src/engine/engine.ts:410-427` computes both awards
automatically from whoever contributed most happiness and most green share. The
Community player decides nothing.

Somebody noticed and patched one surface only. `src/game/session.ts:356` now
reads "You do not hand Trust out yourself; it goes to whoever earned it that
round." So the phone and the printed guide now directly contradict each other
about the Community's core power.

The lived consequence: in four rounds out of six, the Community player does
nothing but pick a card and talk. Two vetoes for a whole game is their entire
active agency. They are the weakest seat at the table by a wide margin, and
they are the seat that represents thirty four million people.

### The fix

**Make one of the two Trust tokens a real Community decision.**

At the Reckoning, after the four cards flip, the Community's phone shows one
screen for about eight seconds:

> **WHO LOOKED AFTER PEOPLE THIS ROUND?**
> [Government] [Business] [Activist]
> *The country thinks it was the Business. You decide.*

The engine keeps awarding the "future" token by calculation. The Community
places the "care" token by hand, with the engine's verdict shown as a
recommendation they may ignore.

Why this is the right shape:

- It is a judgement on what was *just revealed*, so it needs no forward
  planning and costs no time in the negotiation phase.
- It makes every other player **perform for the Community every single round**,
  which is precisely the political dynamic the game is about and which currently
  does not exist.
- It halves the balance exposure versus handing over both tokens, because the
  green share token still routes to whoever actually built the green economy,
  so trust gates and the Landslide goal cannot be starved arbitrarily.
- It costs one small screen and removes the contradiction.

**This needs a simulation re run** before you ship it. Add a Community policy
that awards the care token spitefully and one that awards it to the Government
every round, and check the gov trust gates still open at a reasonable rate.

---

## 5. Fix 3: icons on option cards, not prose

This is the highest return per hour of work in the entire product.

Today an option card carries a title, one line of description, a cost chip, and
a 52 character mood line from `src/game/hints.ts`. Examples of the hints
actually shipping:

> "Real money, real pain, real cuts."
> "Absorb it. Nobody enjoys this one."
> "Inside the room. Quieter every time."
> "A judgement call. Make it."

These are good writing and bad interface. A player has forty five seconds, three
unfamiliar cards, and no way to compare them on any axis. The design intent was
"judgement calls, not spreadsheet calls" and that intent is correct, but the
implementation confuses *hiding magnitudes* with *hiding direction*. Hiding
direction does not create judgement. It creates guessing.

### The fix: four chips, direction only

Every card gets a strip of four impact chips. Arrows only, never numbers.

```
   CARBON      ECONOMY     PEOPLE     CLEAN ECONOMY
    ▼▼▼          ▲            ▲            ▲▲
```

Derived from the option's shape, exactly the way hints are derived today, so a
content pack swap needs no new authoring and no number can leak:

| Magnitude | Emissions `e` | Growth `g` | Happiness `h` | Green `gr` |
|---|---|---|---|---|
| Strong (three arrows) | \|e\| ≥ 8 | \|g\| ≥ 0.6 | \|h\| ≥ 0.5 | gr ≥ 8 |
| Medium (two) | 4 to 7 | 0.3 to 0.5 | 0.3 to 0.4 | 4 to 7 |
| Slight (one) | 1 to 3 | 0.1 to 0.2 | 0.1 to 0.2 | 1 to 3 |
| None (a dash) | 0 | 0 | 0 | 0 |

Keep exactly one line of prose for the thing arrows cannot say, the conditional:
"Only half works unless the Government pays too." Everything else goes to icons.

This is how Wingspan, Terraforming Mars and Pandemic communicate. It survives
ESL. It survives a forty five second timer. It survives being read across a
table. And it makes the game *more* strategic, not less, because a player can
finally form a plan instead of picking on vibes.

---

## 6. Fix 4: the vocabulary rewrite

You are right that the terminology is a barrier, and it is worse for a Malaysian
room than the copy assumes. The problem is not the fictional country. Semenanjara,
Kota Damai, Ringga and Sawit Prima land well with a Malaysian audience and get
the joke immediately. The problem is **abstract English economic nouns used as
game currency**, and the sheer number of invented proper nouns loaded during
setup.

### Rename these

| Currently | Proposed | Why |
|---|---|---|
| Fiscal Points (FP) | **Budget** | Universally understood. No one needs "fiscal" explained. |
| Capital (C) | **Company Money** | "Capital" reads as finance jargon. |
| Green Economy Share | **Clean Economy** | Three words to two, and "share" is doing nothing. |
| Mt CO₂e | **Carbon** (unit: Mt) | Drop CO₂e from every player surface. Explain it once in the glossary and never again. |
| Public Mandate | **The Public Says No** | Says what the button does. |
| Coalition Bonus | **Moving Together** | "Coalition" carries specific political baggage in Malaysia. "Moving together" is already the phrase used in the in-app glossary, so this is a consolidation, not an invention. |
| The Reckoning | **The Reveal** | "Reckoning" is a hard, literary word. The whole phase is four cards being revealed. |
| The Table | **The Talk** | Plainer, and it names the activity rather than the furniture. |
| Sealed goal / private goal | **Your Secret Win** | |
| Trust tokens | **Public Trust** | |
| Insider tip | **A Tip Off** | |
| Spotlight | *keep* | Universal, and the metaphor carries. |
| Hollow Victory | *keep* | It is the payoff. Do not touch it. |
| Nation Builder | *keep* | |

### Restrict these

Eight invented proper nouns currently appear before Round 1: Semenanjara, Kota
Damai, Ringga, Perindu, Kuala Jernih, Sungai Jernih, Sawit Prima, Bangkit Iklim,
plus NuriTenaga, The Damai Herald and Aida Rahman shortly after. Keep every one
of them **in scenario flavour text**, where they cost nothing and buy a great
deal. Remove all of them from **anything a player must understand in order to
act**. A role card that says "you represent Kuala Jernih, a semi rural seat" is
asking a player to memorise a place name to play their turn.

### Add Bahasa Malaysia

The README lists this under "not built yet". For your stated audience it is not
a nice to have, it is P1. Practically this means extracting strings, which is a
prerequisite for the plain language rewrite anyway. **Do both in the same pass**
so the copy is only rewritten once. A language toggle belongs on the join screen,
per phone, so a mixed table can run in two languages at once.

---

## 7. Fix 5: a plain language standard, and what it looks like

Set an explicit, testable bar and hold every string to it:

> **CEFR B1. Maximum 15 words per sentence on a phone. Active voice, present
> tense. No literary inversion. No word a Form 3 student would need to look up.**

The current voice is genuinely good writing, and that is the trap. It is
mannered British literary register, and it is the second largest source of the
"too wordy, not very clear" feeling after the systems count.

### Before and after

| Now | Proposed |
|---|---|
| "Real money, real pain, real cuts." | "Costs a lot. Cuts a lot." |
| "Halves in value unless someone co-funds it." | "Only half works unless the Government pays too." |
| "A seat at the table costs you credibility." | "You get influence. You lose support." |
| "Nothing today. Something big by Round 6." | "Nothing now. Big payoff later." |
| "It cannot be swapped later, and it only pays off if the country hits all three targets too." | "You cannot change this. It only counts if the country hits all 3 targets." |
| "Absorb it. Nobody enjoys this one." | "Quiet, cheap, and it hurts a little." |
| "Doubles if the powerful actually back you." | "Twice as strong if the Government or Business helps." |
| "The Treasury wants a decision today. Your backbenchers want a different one." | "Your finance team wants one answer. Your own party wants another." |
| "You hold no transferable resource. Your power is the mandate, not the money." | "You have no money to send. Your power is saying no." |
| "It lands on whoever takes the dirtiest option this round. For them it only half works, it costs them standing, and the country notices." | "It hits whoever picks the worst card this round. Their card only half works. They lose Public Trust." |

Two structural rules on top:

- **One idea per screen.** The role reveal currently stacks nine labelled
  sections. Cut to three, put the rest behind "More about me".
- **Never state a rule twice in different words.** The Spotlight rule is
  currently stated three different ways across three surfaces, and only one of
  them prominently mentions that it fires only if the Activist also escalates.

---

## 8. Fix 6: restructure onboarding, and move the goal pick

The current order asks a first time player to make an irreversible strategic
commitment at the moment of minimum information.

**Today:** Role Reveal (about 450 words) → Goal Picker → Briefing → Round 1.

The Goal Picker offers choices like "Green Economy Share reaches 55% or more"
and "Personally deliver 40 Mt or more of cuts" to a person who has not yet been
told what green share is, what a Mt is, or how much 40 of them is. There is no
way to choose well. Everybody picks the one with the nicest title.

**Proposed:**

| Step | Where | Time | Content |
|---|---|---|---|
| 1 | Big screen | 40s | The mission. Three numbers. All three or nobody wins. One diagram of the round loop. |
| 2 | Phone | 30s | Role card, three lines only. Everything else behind a tap. |
| 3 | — | 4 min | **Round 1, played as the tutorial.** |
| 4 | Phone | 30s | **Now pick your Secret Win.** |
| 5 | — | 20 min | Rounds 2 to 6. |

Moving the goal pick to after Round 1 is the strongest single change in this
section. Same commitment, made with real information. It removes a blocking
screen from setup, gives Round 1 one clean job (learn the loop), and creates a
genuinely good beat for the facilitator: *"Now you have seen how this country
works. Decide what you actually want out of it."*

### The three line role card

Replace the nine section reveal with this, and put the full profile behind
"More about me":

> **YOU ARE** the Minister. You hold the country's Budget and the power to make law.
> **YOU WANT** growth, and to still be in office in 2050.
> **YOUR MOVE** Spend Budget to change the country. Or give Budget to someone else so they can act.

Then one line under it: *"3 things you might say"*, which is the single most
useful thing on the current screen and should survive.

---

## 9. Fix 7: make it run without a facilitator

This is goal #2, and today the game cannot meet it. A table of four with no
fifth person cannot run a session: somebody has to drive the big screen with
keyboard shortcuts while reading a 285 line script written for a host. The
facilitator is not an option, they are a dependency.

Four things close the gap:

**1. Self Run mode.** The big screen advances itself on the clock, and between
phases it shows the host line as on screen text. The facilitator script already
contains every word needed. It just needs to be renderable rather than only
readable. Add a mode toggle on the lobby: `WITH A HOST` / `ON OUR OWN`.

**2. Round 1 as an explicit tutorial.** Extra time on every phase, plus a
persistent coach strip on the phone that says what to do right now: "Read the
news." → "Talk. Try saying: what if we both did it?" → "Pick one card. You can
change it until you lock." → "Look up at the big screen."

**3. Four printed role cards, one A5 page each.** This is the artefact that
actually makes a game pick up and play, and it does not exist. One page per
seat: your job, your one resource, your one power, your three lines, the three
national targets on the back. A table that has these on the table in front of
them does not need a guide at all.

**4. Table mode.** Not every room has a projector. Let one phone or laptop be
the shared screen, with a layout that works at 300mm rather than 3m.

The written guide at `/how-to-play.html` is a good document and should stay, but
it is 5,500 words. It is a reference, not an onboarding path. Nobody reads it
before playing, and the design already acknowledges this in a code comment
(`src/game/session.ts:299`: "Most tables never open the guide").

---

## 10. Fix 8: the game never teaches cause and effect

For a training simulation this is the most damaging omission.

`RoundResult` on the phone is documented as "Three sentences, no numbers". A
player finishes all six rounds having never once been told which of their
choices moved which meter, or by how much. They learn that things happened.
They do not learn that *they* caused them.

The no numbers rule is right **before** a choice and wrong **after** it. Once
the cards are face up, the information is no longer private and hiding it serves
nothing.

### The fix

**After each Reveal, every phone shows one causal line:**

> **You chose: Retool for the Green Market**
> Carbon −8 · Clean economy +10 · Cost 3 Company Money
> *That was the biggest cut anyone made this round.*

**Add a per player debrief at the end.** Six rounds, six choices, what each one
did, and the one moment that mattered most. This is the thing a workshop
participant photographs and takes back to their desk, and it is currently the
only artefact the session does not produce.

**Surface the growth trap.** The balance report is unambiguous: mixed tables
miss carbon 24% of the time, happiness 23%, and **growth 74%**. Growth is the
binding constraint by a factor of three, and no player facing surface says so.
The dashboard should treat average growth as the danger meter, and the phone
should be able to see it at all. Right now the three national numbers appear
nowhere on any phone, so any player who cannot read the projector from where
they are sitting is playing blind.

---

## 11. Fix 9: timing

Current round: 30s crisis + 90s table + 45s choice + 75s reckoning = 240s.

The Reckoning is 75 seconds of passive watching, six times, which is 7.5 minutes
of the 24 minute play budget spent not playing. The card sequence itself needs
about 15 seconds (four flips, 3s apart) plus room to react.

| Phase | Now | Proposed | Round 1 |
|---|---|---|---|
| The Crisis | 30s | 25s | 35s |
| The Talk | 90s | 90s | 120s |
| The Choice | 45s | 40s | 60s |
| The Reveal | 75s | 45s | 45s |
| Public Trust award | — | 15s | 15s |
| **Total** | **240s** | **215s** | **275s** |

That funds the tutorial round, funds the new Trust beat, and still comes in
under the 24 minute play budget.

Separately: 45 seconds to read three unfamiliar cards in Round 1 is genuinely
too short, and it is why the game feels heavy in exactly the round that decides
whether people enjoy it.

---

## 12. Fix 10: presentation

The broadcast frame is the best thing about the look and should be pushed
harder, not softened.

**Add a persistent score bug.** The three targets should live in a strip that
never leaves the big screen, including during the Reveal. Right now the meters
vanish during the most important 75 seconds of each round, so the room watches
consequences without a scoreboard.

**Give the phone a miniature of the national state.** Three numbers, always
visible, under the header. This is a two hour change and it fixes the "I have no
idea how we are doing" problem for every player who cannot see the projector.

**Make Moving Together the loudest moment in the game.** It is the mathematical
spine of the entire training message and it currently gets a four second
overlay. It should stop the room. Sound, if you ever add sound, goes here first.

**Show the near miss.** Today the ending is binary. Add the gap: "GROWTH: 4.7%
average. You needed 5.0%." The country result should show how close, because
"you missed growth by three tenths of a percent" is a vastly better debrief than
"you failed". Do **not** soften Hollow Victory itself. Grade the country, never
the goal.

---

## 13. Concrete defects found while reading

These are small, verifiable, and worth fixing regardless of which direction you
take the redesign.

| # | Where | Problem |
|---|---|---|
| 1 | `how-to-play.html:286` vs `session.ts:356` | The guide says the Community awards Trust. The phone says they do not. Both ship. |
| 2 | `how-to-play.html:403`, design doc Part 4 | Offer listed as available to "Everyone". `TableActions.tsx:293` disables it for Community and Activist. |
| 3 | `session.ts:393` | `ROLE_RESOURCE.community` has `kind: 'trust-awards'` with `label: 'Public Mandate vetoes'`. The key is a leftover from the abandoned design and is actively misleading. |
| 4 | `how-to-play.html:280` vs `session.ts:351` | The Community Elder's "son has asthma" in the guide, "child has asthma" on the phone. |
| 5 | Design doc Part 2 | Still names all four characters (Datuk Nurul Aziz and so on). The app removed those names in commit `41f794b`. The doc is stale. |
| 6 | Three surfaces | The Spotlight rule is stated three different ways, and the "only fires if you also escalate" condition is prominent in only one. |
| 7 | All phone screens | The three national numbers appear on no phone at any point. |
| 8 | `hints.ts:128` | Fallback hint "A judgement call. Make it." can ship on a real card if an archetype is missing. It says nothing. |

---

## 14. What not to change

Consultants and designers both have a habit of redesigning the parts that
already work. These should survive untouched:

- **The engine and every tuned constant.** It is fitted, tested and correct.
- **All or nothing on the three targets.** It is the teaching.
- **Hollow Victory.** The single best moment in the game.
- **Promises are never enforced.** The other best moment.
- **Cards flip one at a time.** The gap is where the drama lives, and the
  face down card treatment is exactly right.
- **The broadcast frame.** Distinctive, coherent and well executed.
- **The fictional country.** It works, and it works especially well for the
  intended audience. Only its onboarding load is a problem.
- **The three lines each character would say.** The most useful thing on the
  role screen by a distance.
- **Content as data.** The variant swap architecture is the right call.

---

## 15. Prioritised roadmap

Sequenced so each stage ships something playable and each one makes the next
cheaper.

### Stage 1: comprehension (highest return, roughly a week)

| | Change | Effort |
|---|---|---|
| 1.1 | Impact icons on option cards | M |
| 1.2 | Vocabulary rename, all surfaces | M |
| 1.3 | Plain language rewrite to the B1 bar, with string extraction | L |
| 1.4 | Three line role card, full profile behind a tap | S |
| 1.5 | National numbers on the phone | S |
| 1.6 | Fix the eight defects in section 13 | S |

**After stage 1 alone the game will feel like a different product.** Nothing
here touches the engine, and nothing needs re simulation.

### Stage 2: structure (roughly a week)

| | Change | Effort |
|---|---|---|
| 2.1 | Merge Promise and Demand into SAY IT, add the conditional pledge | M |
| 2.2 | Fold co-fund into SAY IT | S |
| 2.3 | Cut insider tips to one type, two buttons | S |
| 2.4 | Move the goal pick to after Round 1 | M |
| 2.5 | Retime the phases, Round 1 gets tutorial timings | S |
| 2.6 | Causal feedback after each Reveal | M |

### Stage 3: self running (roughly a week and a half)

| | Change | Effort |
|---|---|---|
| 3.1 | Self Run mode, script rendered on screen | M |
| 3.2 | Round 1 coach strip | M |
| 3.3 | Four printed role cards | S, design led |
| 3.4 | Table mode for rooms with no projector | M |
| 3.5 | Per player end of game debrief | M |

### Stage 4: depth and reach

| | Change | Effort |
|---|---|---|
| 4.1 | Community awards the care Trust token, plus simulation re run | L |
| 4.2 | Bahasa Malaysia | M, once 1.3 lands |
| 4.3 | Persistent score bug, louder Moving Together, near miss grading | M |
| 4.4 | 45 minute variant with the full tip module restored | M |

---

## 16. The test to hold yourself to

The measure of whether this has worked is a single, cheap, brutal experiment:

> **Sit four people who have never seen the game in a room. Hand them nothing
> but four role cards and a screen. Leave. Come back in thirty five minutes.**

If they played, it works. If they had to ask a question you had to answer, that
question is your next ticket. Run it four times with four different tables and
you will have a better prioritised list than this document.

Ship stage 1, then run that test. Everything after it should be decided by what
the room actually asks.

---

## 17. Open questions

Answers to these will change the recommendations above:

1. **Is the facilitator optional or removed?** Self Run mode is cheap. Designing
   so that a facilitator adds value but is never required is a different and
   larger job.
2. **Who is the primary audience?** A corporate workshop, a university class and
   a public engagement event want three different difficulty curves. Right now
   the game is tuned for the first and shaped like the third.
3. **Is the 22% mixed table win rate a feature?** It is defensible as teaching.
   It also means four in five workshop groups leave having failed, and this game
   is played once, not twenty times.
4. **Is Bahasa Malaysia a translation or a co design?** Translating the current
   copy would produce something stiff. Writing the plain language pass in both
   languages at once would produce something good.
5. **How firm is the thirty minute constraint?** Several tensions above dissolve
   at forty five minutes and get worse at twenty.
