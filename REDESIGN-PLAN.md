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

## 2. The emissions rebase: full specification

The cut required is unchanged at 100 Mt, and the option effect values are raw
absolute deltas, so **the 216 option cards need no change**. What must change is
everything that references an emissions *level* rather than a *delta*.

### 2.1 Config changes

| Constant | Now | New | Why |
|---|---|---|---|
| `start.e` | 300 | **100** | The rebase. |
| `tgt_e` | 200 | **0** | Net zero. |
| `mac_ref` | 150 | **50** | Midpoint of the new state space. |
| `mac_range` | 150 | **50** | Preserves the curve's shape. |
| `driftTable` k | 2.4 / 1.9 / 1.5 / ... | **divide by 3** | See 2.3. This is the highest risk item. |
| `r6_high_e` | 260 | **87** | "Still high in Round 6", proportionally. |

### 2.2 The marginal abatement curve, and a decision worth taking deliberately

`mac(e) = clamp(0.45, 0.45 + 0.7 × (e − ref) / range, 1.15)`

Cuts are most effective when emissions are high and least effective when they
are low, which is correct: the cheap abatement goes first.

Today the required 100 Mt of cutting happens between 300 and 200, where the
multiplier runs 1.15 down to 0.68. Most of the game is spent in the *easy* part
of the curve.

After the rebase, the same 100 Mt of cutting happens between 100 and 0, where the
multiplier runs 1.15 down to the 0.45 floor and then stays there. **Most of the
game is now spent in the hard part of the curve, and the endgame is brutal.**

That is not a bug to be tuned away. It is the truest thing the rebase buys you:

> The last 20 Mt costs more than the first 60.

That is what net zero actually means, it is why every real net zero plan has a
residual-emissions problem, and no other game in this space teaches it.

**Recommendation: keep the harsher curve. Do not raise `mac_lo` to compensate.**
Restore the win rate by softening drift and, if still needed, a modest uplift on
green-share-dependent options, which rewards building the clean economy early
and therefore reinforces the same lesson.

### 2.3 Drift is the real risk

`drift = growth × k`, added to emissions every round.

At 4.5% growth and k = 2.4, that is 10.8 Mt added per round. Against a 300 Mt
base that is 3.6%. Against a 100 Mt base it is **10.8%**. Unadjusted, six rounds
of drift alone would add roughly 65 Mt to a 100 Mt country, and the game becomes
unwinnable.

Dividing the k values by 3 restores the proportional pressure exactly. This is
the one change that must be verified by simulation before anything else ships.

### 2.4 Private goals denominated in Mt

| Goal | Now | Action |
|---|---|---|
| Business, Green Champion | deliver 40+ Mt of cuts | Re-measure. Not a simple divide by three, because delivered cuts shrink under the harsher MAC. Expect roughly 25 to 30. |
| Activist, No Compromise | never collaborate and finish ≤ 175 Mt | Restate as **"Never collaborate, and still get the country to net zero."** The difficulty now comes from the constraint, not from a threshold that has to be re-derived. |

The two green-share goals (The Legacy at 55%, The Long Game at 52%) are
unaffected.

### 2.5 Hardcoded values in the interface

| File | Line | Now | New |
|---|---|---|---|
| `src/dashboard/meters.ts` | 17 | `START_EMISSIONS = 300` | `100` |
| `src/dashboard/meters.ts` | 109 | "Emissions can no longer reach 200." | "Net zero is no longer reachable." |
| `src/dashboard/Reckoning.tsx` | 184 | `(300 - emissions) / 100` | `(100 - emissions) / 100` |
| `src/dashboard/screens.tsx` | 133 | "DOWN TO 200 Mt" | "DOWN TO NET ZERO" |
| `src/dashboard/screens.tsx` | 274 | "Emissions can no longer reach 200." | as above |
| `src/dashboard/screens.tsx` | 286 | `reachable()`: `<= 45 * roundsLeft` | `<= 15 * roundsLeft` |
| `src/dashboard/Dashboard.tsx` | 156 | sparkline trail seeded `[300, ...]` | `[100, ...]` |

### 2.6 Below zero

Net zero is a floor players can cross. Removals are real and the engine should
let emissions go negative rather than clamping at zero, because "we went net
negative" is a genuine and earned ending. Check every `Math.max(0, ...)` on the
emissions path. The MAC floor already makes the last tonnes expensive, so this
does not become a runaway.

### 2.7 Validation gate

Nothing in this section ships on assumption. `reference/engine.py` and
`tools/gen_golden.py` already exist, so the re-fit is mechanical:

1. Apply the config changes.
2. Re-run the full policy sweep, 2,000 games per archetype.
3. Land the win rates back on the published targets: all-selfish 0.0%, mixed
   tables about 22%, all-cooperator about 84%, all-balanced about 97%, three
   cooperators plus a defecting Business about 24%.
4. Re-check dead and dominant option counts, currently 3 and 5.
5. Re-measure all twelve private goals back to roughly 40%.
6. Regenerate golden fixtures and run `npm test` for parity.

**Do not ship the rebase without step 3 passing.** If the win rate lands low,
the lever is drift and the green-share dividend, not the MAC floor.

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

## 8. Running it without a facilitator

Today four people cannot play. Somebody must drive the shared screen by keyboard
while reading a 285-line host script. The facilitator is a dependency, not an
option.

1. **Self-run mode.** The shared screen advances itself and renders the host line
   as on-screen text. The script already contains every word; it needs to be
   renderable, not only readable. Toggle in the lobby: `WITH A HOST` / `ON OUR OWN`.
2. **Four printed role cards, one A5 page each.** The artefact that actually
   makes a game pick-up-and-play, and it does not exist. Job, resource, one
   power, three lines you might say, three national targets on the back.
3. **Table mode.** One phone or laptop as the shared screen, laid out for 300mm
   rather than 3m.
4. **Per-player debrief at the end.** Six choices, what each did, the moment that
   mattered. The thing a participant photographs and takes back to their desk.

---

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

### Stage 0: the rebase (1 week, must go first)

Everything downstream references the new numbers, so doing this later means
rewriting copy twice.

| | |
|---|---|
| 0.1 | Config rescale per section 2.1 |
| 0.2 | Simulation re-fit and win-rate validation gate, section 2.7 |
| 0.3 | Private goal re-measurement |
| 0.4 | Hardcoded interface values, section 2.5 |
| 0.5 | Golden fixtures regenerated, `npm test` green |

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
| 4.2 | Self-run mode, printed role cards, table mode |
| 4.3 | Bahasa Malaysia |
| 4.4 | Per-player debrief |
| 4.5 | Persistent score bug, louder Moving Together |

---

## 12. The acceptance test

One cheap, brutal experiment decides whether any of this worked:

> Sit four people who have never seen the game in a room. Give them nothing but
> four role cards and a screen. Leave. Come back in forty minutes.

If they played, it works. Every question they had to ask somebody is a ticket.
Run it four times with four different tables and the result is a better
prioritised backlog than this document.

Run it after Stage 2. Decide Stages 3 and 4 by what the room actually asks for.

---

## 13. Open decisions

1. **34 million people, or fewer?** The gross-minus-sink framing in section 0
    makes 100 Mt net honest at the current population. If that framing is
    rejected, the population has to come down to about 12 million instead.
2. **Does the game allow net negative?** Recommended yes, section 2.6. It is a
    real and earnable ending.
3. **What is the published session length?** Recommended 35 minutes with a
    29-minute returning-table path. Publishing 30 and running 37 is worse.
4. **Who is the primary audience?** A corporate workshop, a university class and
    a public engagement event want three different difficulty curves. The game is
    tuned for the first and shaped like the third.
5. **Is Bahasa Malaysia a translation or a co-design?** Translating current copy
    produces something stiff. Writing the plain-language pass in both languages
    at once produces something good, at roughly the same cost.
6. **Does the facilitator become optional, or is the game designed to have
    none?** Self-run mode is cheap. Designing so a facilitator adds value but is
    never required is a larger and different job.
