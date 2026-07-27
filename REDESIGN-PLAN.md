# Journey to Net Zero: redesign plan

The single plan of record. It merges two independent design reviews and applies
two decisions taken by the client. `DESIGN-REVIEW.md` is retained as the
evidence log behind it: the defect list, the code references and the balance
findings live there and are not repeated here.

---

## 0. The two decisions, and what they resolve

### Decision 1: rebase emissions to 100 Mt net, and make the target actual zero

The country starts at **100 Mt net** and must reach **net zero**. The cut
required is still 100 Mt, so the arithmetic the engine was fitted against is
preserved in absolute terms.

This resolves the most serious credibility problem in the product. The game is
called Journey to Net Zero, is set in 2050, and until now asked for a 33% cut
and called it success. A climate-literate participant, which is exactly who
sits in the target room, notices that in the debrief. Now the title is literally
true.

**The framing that makes 100 Mt honest: gross minus sink.**

34 million people emitting 100 Mt gross is about 2.9 tonnes per person, which is
too low for the industrialising country the scenarios describe. Do not shrink
the country to fix this. Instead state the number the way a tropical forested
nation actually reports it:

> Semenanjara puts out about 300 Mt a year. Its forests and peatlands absorb
> about 200 Mt. **Net: 100 Mt.** That is the number that has to reach zero.

This is accurate to how Malaysia reports its own inventory, it keeps the 300 Mt
figure that the scenario text and the industrial fiction were written around, and
it teaches gross versus net, which is the single most misunderstood idea in
climate policy. It also puts a future mechanic on the table at no cost today:
the sink is a thing that can be protected or lost.

### Decision 2: a guided onboarding, not a First Game

The other review proposed splitting into a simplified First Game and an Advanced
Game. Replace that with **one game, preceded by a staged onboarding that teaches
by doing**.

This is the better call, and it removes a real risk. Two rule sets means two
balance fits: the First Game with the Spotlight removed is not the game that was
simulated 200,000 times, and removing the Spotlight in particular deletes the
coalition's main lever against a defecting Business in a configuration that
already only wins 23.8%. One game, one balance fit, one set of rules, learned in
stages.

---

## 1. The design contract

Everything below is subordinate to these. When a proposed feature conflicts with
one of them, the feature loses.

**The promise.** Scan, take a seat, learn one action at a time, make a decision
that matters inside the first few minutes.

**Complexity budget.** In any round, a player tracks:

- one role objective
- one role resource
- three shared outcomes
- one choice
- at most one thing said publicly

**The standing rule.** Do not add a system unless it replaces another system or
changes how players negotiate. This is what stops the game re-accreting to
fifteen mechanics in a year.

**Where drama lives.** The shared screen is a broadcast and should be loud,
urgent and theatrical. The phone is calm, direct and respectful. Urgency comes
from a visible clock and from the people at the table, never from the app
scolding a player. No phone copy tells a player what to feel.

**Reading level.** CEFR B1. Maximum 15 words per sentence on a phone. Active
voice, present tense, no literary inversion, no word a Form 3 student would need
to look up.

**Teach by doing.** No onboarding step is a wall of text. Every step introduces
exactly one verb and immediately makes the player use it.

**Hide magnitudes, never directions.** A player must always be able to tell
which way an option pushes each meter. Exact values appear only after choices
lock.

---

## 2. The emissions rebase: SHIPPED

Done, validated and merged. This section records what was actually required,
which differed from what this plan first predicted in three places. The
measured outcome is in `reference/jtnz-balance-report.txt` (v2.0).

### 2.1 Config changes as shipped

| Constant | Was | Now | Why |
|---|---|---|---|
| `start.e` | 300 | **100** | The rebase. 300 gross less a ~200 land sink. |
| `tgt_e` | 200 | **0** | Net zero, and emissions are never clamped, so a table can finish net negative. |
| `mac_ref` | 150 | **50** | Midpoint of the new state space. |
| `mac_range` | 150 | **50** | Preserves the curve's shape. |
| `mac_lo` | 0.45 | **0.60** | Not predicted. See 2.2. |
| `mac_span` | 0.70 | **0.55** | Holds the ceiling at 1.15 while the floor rises. |
| `driftTable` k | 2.4 / 1.9 / 1.5 / 1.1 | **0.80 / 0.63 / 0.50 / 0.37** | Divided by three, as predicted. |
| `r6_high_e` | 260 | **87** | "Still high in Round 6", proportionally. |
| Goal B-b | −40 Mt | **−33 Mt** | Re-measured to 41.4%, against a published 40.9%. |
| Goal A-a | ≤ 175 Mt | **≤ −25 Mt** | Re-measured to 42.0%, against a published 40.9%. |

The 216 option cards were **not** changed, which this plan predicted, though the
reasoning given for it was wrong and the alternative was tested rather than
assumed. Sizing the cards down to match the smaller country was tried across
four scale factors and made the game worse at every one of them: only the very
strongest tables could still reach zero and every weaker cohort collapsed to
nothing. The cards stay as authored.

### 2.2 The abatement floor had to rise, and this plan said it should not

The prediction was that the harsher endgame should be kept and the win rate
restored through drift alone. That was wrong, and the simulation said so.

The old game ran 300 to 200 and never touched the flat part of the curve, so its
whole life was spent in the multiplier's cheap half. The rebased game crosses the
entire curve. Leaving the floor at 0.45 while making that traverse mandatory did
not produce a hard endgame, it produced a broken one: three cooperators against a
single defecting Business fell from 23.8% to 0.6%, which is the exact failure the
original playtest identified as fault #5 and deliberately fixed.

Raising the floor to 0.60 and holding the ceiling at 1.15 keeps the lesson,
because the last tonnes are still worth only just over half what the first ones
were, while leaving the game playable.

**The lesson survives. It is a shallower curve than this plan wanted, and a
real one.**

### 2.3 Drift was the real risk, and dividing by three was right

`drift = growth x k`. At 4.5% growth and k = 2.4 that is 10.8 Mt a round: 3.6% of
a 300 Mt country and 10.8% of a 100 Mt one. Left alone, six rounds of drift would
have added two thirds of the national budget back and nothing could have won.
Dividing the coefficients by three restored the proportional pressure exactly,
and this was the one prediction in the original spec that needed no adjustment.

### 2.4 Validation: measured, not assumed

Every figure below is a fresh run against `reference/engine.py`, 2,000 games per
archetype and 6,000 mixed, compared with the published v1.0 report.

| Table | v1.0 | v2.0 |
|---|---|---|
| Everyone selfish | 0.0% | **0.0%** |
| Everyone cooperates | 83.9% | **85.8%** |
| All balanced | 97.1% | **96.7%** |
| Everyone populist | 8.9% | **9.0%** |
| All ideologue | 0.1% | **0.5%** |
| All random | 0.7% | **0.4%** |
| Three cooperate, Business defects | 23.8% | **22.8%** |
| Three cooperate, Government defects | 14.2% | **10.7%** |
| Four different agendas | 1.3% | **0.5%** |
| **Mixed tables** | **22.0%** | **20.8%** |

Miss rates on mixed tables: carbon 24.9% against 24.0%, growth 76.6% against
73.8%, happiness 22.2% against 23.0%. Growth remains the binding target by a
factor of three, exactly as before.

All twelve private goals land within 3.2 points of their published rates. Dead
options 3, unchanged. Dominant options 5, unchanged. Variant fairness within 11
points, against 13 before. Resource exhaustion 12.3% and 20.1%, against 12.1%
and 20.5%.

75.1% of mixed tables now finish net negative. That is not overshoot: it is the
same population that used to clear 200 Mt. The carbon pass rate did not move,
only the number it is measured against.

`npm test`: 68 passed. Parity with the reference holds bit-exact on 96.7% of
1,440 recorded rounds, worst deviation 3.65e-16.

### 2.5 Two bugs found by doing this

Both were pre-existing, both were invisible until the numbers moved, and both are
fixed.

**The Community's veto never fired.** `Game.play_round` gated the Public Mandate
on `self.e > 300 - (300 - 200) * (rnd - 1) / 6`, with both figures hardcoded.
Against a 100 Mt country that is never true, so the agent never spent a veto. The
design credits this single mechanic with moving a defecting Business from 0.0% to
23.8%, so its silent removal was most of the collapse described above. The
condition now reads the schedule, and lives in one place: it was duplicated in
`tools/gen_golden.py`, which is how the two drifted apart, and the generator now
asks the engine instead of restating it.

**The agents' idea of "behind schedule" was a straight line.** Fine while the
multiplier was flat, wrong once the run crosses the curve: a table sitting exactly
on the line in Round 4 is already behind, because its remaining cuts are worth a
third less than the ones it has spent. Both engines now solve for a MAC-weighted
schedule (`pace_schedule` / `paceSchedule`). The dashboard's ON TRACK / OFF TRACK
indicator used the same straight line and would have told a room it was fine when
it was not, so it now reads the same schedule.

### 2.6 A third defect, recorded and not fixed

`COMPROMISED` appears exactly once in the entire content pack: inside the text of
the goal that tests for it. No option sets it. The "never collaborate" half of the
Activist's No Compromise goal **has never done anything**, in any version, and the
goal has always been a carbon threshold alone. Left as it is deliberately, because
making the flag real changes what the goal measures and its threshold would have
to be found again against the fixed version. Logged in `DESIGN-REVIEW.md`.

### 2.7 Interface constants, as shipped

| File | Change |
|---|---|
| `src/dashboard/meters.ts` | `START_EMISSIONS` deleted; the start now comes from the content pack, and the pace comes from `paceSchedule` |
| `src/dashboard/meters.ts` | "Emissions can no longer reach 200." becomes "Net zero is no longer reachable." |
| `src/dashboard/meters.ts` | The unreachable cutoff stays at roughly 50 Mt a round, re-measured as the 99th percentile of 18,000 simulated rounds. It is absolute, so the rebase left it where it was. |
| `src/dashboard/Reckoning.tsx` | Meter fill rebased from `(300 - e) / 100` to `(100 - e) / 100` |
| `src/dashboard/screens.tsx` | "DOWN TO 200 Mt" becomes "DOWN TO NET ZERO"; `reachable()` matched to the meters |
| `src/dashboard/Dashboard.tsx` | Sparkline seeded from the content pack rather than a literal 300 |
| `src/phone/guide.tsx` | Targets and the Mt entry restated as gross, sink and net |
| `src/facilitator/script.ts` | The briefing lines say 300 out, 200 absorbed, 100 net, down to nothing |
| `public/how-to-play.html` | Mission meter, the No Compromise goal and the "net zero" glossary entry, which used to say the game "doesn't ask you to reach it" |
| `JOURNEY-TO-NET-ZERO-design.md` | Starting position and the mission table |

### 2.8 Below zero, as decided

Emissions are never clamped in either engine, so this needed no code: a table
that keeps cutting past zero simply goes net negative, and 75.1% of mixed tables
now do. That is the same population that used to clear 200 Mt.

---

## 3. The onboarding

Replaces the current sequence, which asks a player to commit to a sealed goal in
units they have not been taught, after roughly 850 words of reading.

Target: **75 seconds to a seat and an identity, and a real decision made inside
four minutes.** Every step teaches one verb and then uses it.

| # | Step | Where | Time | Player does |
|---|---|---|---|---|
| 0 | **Join** | Phone | 45s | Scan or type the code. Type your name. Take a seat. |
| 1 | **Who you are** | Phone | 45s | Read three lines. Tap "I'm in." Full profile behind "More about me". |
| 2 | **The country** | Shared | 45s | Watch. 300 gross, 200 absorbed, 100 net, and it has to reach zero. The round loop as one diagram. |
| 3 | **What you hold** | Phone | 30s | See your one number. One line on what it does. Tap once. |
| 4 | **Practice the choice** | Both | 60s | A no-stakes mini crisis. Two cards. Tap one, LOCK IT IN, look up. Cards flip, meters twitch, nothing is kept. |
| 5 | **Practice the talk** | Both | 75s | Say one thing to the table using the new SAY IT action. Everyone must use it once. |
| 6 | **Your one power** | Phone | 30s | Only the seat that holds it. Community sees the veto, Activist the Spotlight, Government co-funding, Business partnership. Taught in isolation, when nobody else is being taught anything. |
| 7 | **Your secret win** | Phone | 45s | Now pick it, with everything understood. |
| 8 | **Round 1** | | | |

Total: about 6 minutes.

### Why the goal pick moved to step 7

It is currently offered before a player knows what a Mt is, what green share is,
or how much 40 of anything represents. There is no way to choose well, so
everybody picks the nicest title. At step 7 it is the same irreversible
commitment made with real information, and it gives the facilitator a genuinely
good line: *"Now you have seen how this country works. Decide what you actually
want out of it."*

### Why step 4 is worth 60 seconds

The practice round is the single most reliable mechanism for making a game
self-teaching, and it is the only place a player can safely learn that tapping a
card is not the same as committing to it. Two cards, not three. No consequences
carried forward.

### Step 6 is the argument against the First Game

Each asymmetric power is taught to exactly one player, at a moment when the other
three are not being asked to absorb anything. That is how you keep the Spotlight
and the Public Mandate in the game from Round 1 without paying for them in
collective rules load. No second rule set, no second balance fit.

### Progressive disclosure continues into Round 1

Round 1 keeps a coach strip on every phone: "Read the news." then "Talk. Try
saying: what if we both did it?" then "Pick one card. You can change it until you
lock." then "Look up." It disappears from Round 2.

### The honest session length

Onboarding of 6 minutes plus six rounds plus results does not fit in 30. Publish
the session as **35 minutes**, and offer a **returning table** path that skips
steps 1 through 6 and lands on step 7, which brings it back to about 29.
Publishing 30 and running 37 is worse than publishing 35.

---

## 4. Systems: keep, fold, defer, hide

| System | Verdict | Note |
|---|---|---|
| Three targets, all or nothing | **Keep** | The spine. |
| One resource per seat | **Keep** | Renamed, section 6. |
| One signature power per seat | **Keep** | Taught in onboarding step 6. |
| Coalition Bonus | **Keep, and make it louder** | The mathematical spine of the teaching, currently a four second overlay. |
| Public promises, unenforced | **Keep** | |
| Private goal | **Keep, moved** | To onboarding step 7. |
| Demands | **Fold into SAY IT** | Zero mechanical effect, duplicates Promise. |
| Co-funding | **Fold into SAY IT** | Becomes a public pledge instead of a private toggle. |
| Offers | **Keep, fix the docs** | Guide claims everyone has it; two seats do not. |
| Insider tips | **Cut to one type** | One warning about the next crisis. Two buttons. Full module returns in the 45 minute variant. |
| Trust | **Keep, and fix it** | Section 5. |
| Legacy flags, drift, MAC, role scaling | **Hide entirely** | Felt, never explained. Remove from the guide's glossary. |

### SAY IT, the merged negotiation verb

Three overlapping verbs plus a toggle become one action with three sentence
shapes, composed not typed:

- `I will choose "<card>".`
- `I want the <seat> to <condition>.`
- `I will choose "<card>" if the <seat> chooses "<their card>".`

The third is new and is the most valuable addition in this plan. The design
document closes by saying the most important number in the game is the number of
times somebody says *"what if we both did it?"* The game currently has no way to
say that sentence. Make it one tap, grammatical, on the shared screen, and
resolved at the Reveal as kept or broken by both parties.

The Government gets one extra sentence: `The Government will pay half of any
partnership the Business signs.` That is co-funding, as a public commitment.

**Note on the other review's proposal to cap deals at one per round:** cap the
verbs, not the deals. The negotiation phase is where the learning happens. It is
confusing because there are four ways to speak, not because people speak too
often.

---

## 5. The Community seat

The most serious content defect in the build, and it is a promise the game makes
and breaks.

`how-to-play.html:286` tells the Community they award 2 Trust tokens every round.
`engine.ts:410` awards both automatically from whoever contributed most happiness
and most green share. Someone noticed and patched `session.ts:356` to say the
opposite, so the printed guide and the phone now contradict each other.

Lived consequence: in four rounds out of six the seat representing 34 million
people decides nothing beyond picking a card. Two vetoes for a whole game is its
entire active agency.

**This is why the system cannot simply be deferred to an advanced mode.** Trust
is not an optional flourish, it is a seat's only per-round agency, and two of the
twelve private goals are denominated in it.

### The fix

At the Reveal, after the four cards flip, the Community's phone shows one screen
for about fifteen seconds:

> **Who looked after people this round?**
> [ Government ] [ Business ] [ Activist ]
> *The country thinks it was the Business. You decide.*

The engine keeps awarding the "did most for the future" token by calculation.
The Community places the "looked after people" token by hand, with the engine's
verdict shown as a recommendation they are free to ignore.

- It is a judgement on what was just revealed, so it needs no forward planning.
- It makes the other three seats perform for the Community every round, which is
  precisely the political dynamic the game is about and which currently does not
  exist.
- Routing the green-share token by calculation halves the balance exposure, so
  trust gates and the Landslide goal cannot be arbitrarily starved.

**Validation:** add two Community policies to the simulation, one that awards
spitefully and one that always awards to the Government, and confirm the
Government's trust gates still open at a reasonable rate.

---

## 6. Interface

### 6.1 Impact chips replace prose hints

Today a card carries a 52-character mood line: "Real money, real pain, real
cuts." Good writing, bad interface. A player has forty seconds, three unfamiliar
cards and no axis on which to compare them. Hiding magnitudes creates judgement;
hiding direction creates guessing.

Every card gets four chips, arrows only, derived from option shape exactly the
way hints are derived today, so no content re-authoring and no value can leak:

```
   CARBON      JOBS & GROWTH     QUALITY OF LIFE     CLEAN ECONOMY
    ▼▼▼             ▲                   ▼                 ▲▲
```

| Band | Emissions | Growth | Happiness | Green |
|---|---|---|---|---|
| Three arrows | ≥ 8 | ≥ 0.6 | ≥ 0.5 | ≥ 8 |
| Two | 4 to 7 | 0.3 to 0.5 | 0.3 to 0.4 | 4 to 7 |
| One | 1 to 3 | 0.1 to 0.2 | 0.1 to 0.2 | 1 to 3 |
| Dash | 0 | 0 | 0 | 0 |

One line of prose survives, for the thing arrows cannot say: "Only half works
unless the Government pays too."

### 6.2 Causality after the lock

The no-numbers rule is right before a choice and wrong after it. Once cards are
face up the information is not private and hiding it teaches nothing.

Each phone, after the Reveal:

> **You chose: Retool for the Green Market**
> Carbon −8 · Clean economy +10 · Cost 3 Company Money
> *The biggest cut anyone made this round.*

The shared screen names the interaction explicitly: *"Because the Government
funded the grid and the Business invested in renewables, both actions became
stronger."*

### 6.3 The phone can currently see nothing

The three national numbers appear on no phone at any point. Any player who
cannot read the projector from where they are sitting is playing blind. Add a
persistent miniature under the header.

### 6.4 The shared screen keeps its scoreboard

The meters vanish during the Reveal, which is the most important 75 seconds of
each round. Add a persistent score bug that never leaves.

### 6.5 Tone rewrite

| Now | New |
|---|---|
| "Pick one. Now." | "Choose your action." |
| "Everyone is waiting for you." | "30 seconds left." |
| "Real money, real pain, real cuts." | "Costs a lot. Cuts a lot." |
| "Halves in value unless someone co-funds it." | "Only half works unless the Government pays too." |
| "A seat at the table costs you credibility." | "You get influence. You lose support." |
| "It cannot be swapped later, and it only pays off if the country hits all three targets too." | "You cannot change this. It only counts if the country reaches all 3 targets." |
| "Doubles if the powerful actually back you." | "Twice as strong if the Government or Business helps." |
| "Four rational actors, one dead country." | *Shared screen only. Keep it there, remove it from phones.* |

Hollow Victory stays exactly as it is. It is the best moment in the product.

---

## 7. Vocabulary

The fictional country is not the problem. Semenanjara, Kota Damai, Ringga and
Sawit Prima land well with a Malaysian room. The problem is abstract English
economic nouns used as currency, and the number of invented proper nouns loaded
during setup.

| Now | New |
|---|---|
| Fiscal Points (FP) | **Budget** |
| Capital (C) | **Company Money** |
| Green Economy Share | **Clean Economy** |
| Mt CO₂e | **Carbon**, unit Mt. Explain CO₂e once in the glossary, never again. |
| Happiness | **Quality of Life** |
| Public Mandate | **The Public Says No** |
| Coalition Bonus | **Moving Together** |
| The Reckoning | **The Reveal** |
| The Table | **The Talk** |
| Private / sealed goal | **Your Secret Win** |
| Trust tokens | **Public Trust** |
| Insider tip | **A Tip Off** |
| Spotlight, Hollow Victory, Nation Builder | unchanged |

**Restrict, do not delete, the proper nouns.** Keep every one in scenario
flavour text. Remove all of them from anything a player must understand in order
to act. A role card that asks a player to memorise "Kuala Jernih, a semi-rural
seat" before their first turn is charging them for atmosphere.

**Bahasa Malaysia is P1, not "not built yet".** It requires string extraction,
which is a prerequisite for the plain-language rewrite anyway, so do both in one
pass and write the plain-language version in both languages at once rather than
translating stiff English later. Language toggle on the join screen, per phone,
so a mixed table can run in two languages simultaneously.

---

## 8. The facilitator, and what the board owes them

**Decided: there is always a facilitator.** Self-run mode is not built. A game
master sets the scene, and the shared board guides them through it.

That settles the open question and reverses one item of earlier scope. It also
raises the bar rather than lowering it, because a required facilitator who is
handed nothing is worse than no facilitator at all.

### What follows from it

**The board carries the cue.** The script lives in a second window today, which
assumes a laptop the facilitator can read while talking. The shared screen knows
what phase the room is in and what happens next, so it should say so: a single
line of direction, sized for the person running it and ignorable by everyone
else. `/facilitator` stays as the full run of show for preparation and for the
person who wants the whole script.

**The acceptance test changes.** It is no longer "leave four people alone in a
room". It is:

> Give one person who has never run this the board and nothing else. Give four
> more the phones. Come back in forty minutes.

If the facilitator had to ask a question, that question is the next ticket.

**Printed role cards stay.** They are not a substitute facilitator, they are what
stops four people reading their phones during the welcome.

**Table mode is dropped.** It existed for a room with no projector, which is a
room that cannot run this game as designed.

## 9. Timing

| Phase | Now | New | Round 1 |
|---|---|---|---|
| The Crisis | 30s | 25s | 35s |
| The Talk | 90s | 90s | 120s |
| The Choice | 45s | 40s | 60s |
| The Reveal | 75s | 45s | 45s |
| Public Trust award | — | 15s | 15s |
| **Round total** | **240s** | **215s** | **275s** |

The Reveal is currently 75 seconds of passive watching, six times over, which is
7.5 minutes of the play budget spent not playing. The flip sequence needs about
15 seconds plus room to react.

**Session:** 6 min onboarding + 21.5 min rounds + 1 min extra in Round 1 + 3 min
results and debrief ≈ **32 minutes**, published as 35.

---

## 10. Outcome grading

Mixed tables win 22% of the time, and this game is played once, not twenty times.
Four in five workshop groups currently leave having simply failed.

Grade the **country**, never the goal:

> **NET ZERO REACHED** — all three targets.
> **CLOSE** — "Carbon reached net zero. Growth averaged 4.7%. You needed 5.0%."
> **MISSED** — with the gap on each target named.

Hollow Victory is untouched. No partial credit on private goals, ever. But
"you missed growth by three tenths of a percent" is a vastly better twenty
minutes of debrief than "you failed".

**Related and currently invisible:** mixed tables miss growth 74% of the time
against 24% for carbon. Growth is the binding constraint by a factor of three
and no player-facing surface says so. Make average growth the danger meter on
the shared screen.

---

## 11. Roadmap

Sequenced so each stage ships something playable and makes the next cheaper.

### Stage 0: the rebase - DONE

| | | |
|---|---|---|
| 0.1 | Config rescale | done, section 2.1 |
| 0.2 | Simulation re-fit and validation | done, section 2.4 |
| 0.3 | Private goal re-measurement | done, all twelve within 3.2 points |
| 0.4 | Interface constants | done, section 2.7 |
| 0.5 | Golden fixtures and `npm test` | done, 68 passed, parity holds |
| 0.6 | Balance report regenerated | `reference/jtnz-balance-report.txt` v2.0 |

### Stage 1: comprehension (1 week, no engine changes)

| | |
|---|---|
| 1.1 | Impact chips on option cards |
| 1.2 | Vocabulary rename across all surfaces |
| 1.3 | Plain-language and tone rewrite, with string extraction |
| 1.4 | Three-line role card |
| 1.5 | National numbers on the phone |
| 1.6 | The eight defects in `DESIGN-REVIEW.md` section 13 |

### Stage 2: the onboarding (1.5 weeks)

| | |
|---|---|
| 2.1 | Steps 0 to 8 as a phase sequence |
| 2.2 | Practice round, step 4 |
| 2.3 | Per-seat power tutorial, step 6 |
| 2.4 | Goal pick relocated to step 7 |
| 2.5 | Round 1 coach strip |

### Stage 3: structure (1 week)

| | |
|---|---|
| 3.1 | SAY IT: merge promise, demand and co-funding, add the conditional |
| 3.2 | Tips cut to one type |
| 3.3 | Retimed phases |
| 3.4 | Causal feedback after the Reveal |
| 3.5 | Outcome grading |

### Stage 4: reach (1.5 weeks)

| | |
|---|---|
| 4.1 | Community awards the care token, plus simulation re-run |
| 4.1b | Facilitator cue on the shared board, section 8 |
| 4.2 | Printed role cards |
| 4.3 | Bahasa Malaysia |
| 4.4 | Per-player debrief |
| 4.5 | Persistent score bug, louder Moving Together |

---

## 12. The acceptance test

One cheap, brutal experiment decides whether any of this worked:

> Give one person who has never run this the board and nothing else. Give four
> more the phones. Come back in forty minutes.

If they played, it works. Every question the facilitator had to ask is a ticket.
Run it four times with four different tables and the result is a better
prioritised backlog than this document.

Run it after Stage 2. Decide Stages 3 and 4 by what the room actually asks for.

---

## 13. Open decisions

1. **34 million people, or fewer?** Shipped on the gross-minus-sink framing in
    section 0, which makes 100 Mt net honest at the current population. If that
    framing is ever rejected, the population has to come down to about 12
    million instead.
2. ~~Should the COMPROMISED flag be made real?~~ **Decided: yes.** Built in
    Stage 2; every Collaborate card now sets it and the Activist's No Compromise
    goal was re-measured against the fixed version.
3. **What is the published session length?** Recommended 35 minutes with a
    29-minute returning-table path. Publishing 30 and running 37 is worse.
4. **Who is the primary audience?** A corporate workshop, a university class and
    a public engagement event want three different difficulty curves. The game is
    tuned for the first and shaped like the third.
5. **Is Bahasa Malaysia a translation or a co-design?** Translating current copy
    produces something stiff. Writing the plain-language pass in both languages
    at once produces something good, at roughly the same cost.
6. ~~Does the facilitator become optional?~~ **Decided: no.** There is always a
    facilitator, and the board guides them. See section 8.
