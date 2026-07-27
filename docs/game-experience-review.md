# Journey to Net Zero: experience redesign

## Executive recommendation

Journey to Net Zero already has the ingredients of a strong facilitated
simulation: four genuinely different seats, simultaneous private decisions, a
shared national score, six recognisable shocks, and a public reveal that turns
choices into conversation. The problem is not a lack of design. It is that too
much of the design is presented to a first-time player at once.

The next version should be designed around one promise:

> **Scan. Pick a role. Learn one action at a time. Make a meaningful decision
> within three minutes.**

Keep the simulation engine and its tested balance for the first redesign. Make
the experience lighter by changing what players must know, when they learn it,
and how the interface explains consequences. Treat promises, transfers,
insider tips, vetoes, spotlights, trust awards, private goals, four resources,
four national measures, legacy flags, and nine phases as a catalogue—not as a
mandatory starting kit.

The recommended product is a **20–25 minute First Game** with a four-step loop:

1. **Crisis** — one headline, one human consequence, one national challenge.
2. **Talk** — players state what they need and may make one structured deal.
3. **Choose** — each player picks one of three actions and confirms it.
4. **Impact** — reveal the four choices together, explain the interaction, and
   show movement toward the three shared outcomes.

An **Advanced Game** can restore insider tips and the more asymmetric powers
after players understand the core loop. This is not “dumbing down” the
simulation. It moves complexity from instructions into consequences, where
strategy games become interesting.

---

## 1. What was reviewed

This review covers the complete game specification, the 18-scenario content
pack (216 role options), phone onboarding and play screens, shared dashboard,
facilitator run-of-show, static player guide, engine/session model, and current
automated test suite.

The current experience is structurally ambitious:

- four player roles with unique resources and powers;
- three mandatory national targets plus Green Economy Share;
- a private goal for every player;
- six rounds selected from 18 scenario variants;
- nine room phases (`lobby`, `briefing`, `crisis`, `table`, `choice`,
  `reckoning`, `summary`, `results`, `ended`);
- public promises and demands, resource offers, insider tips, trust awards,
  Community vetoes, Activist spotlights, Government co-funding, legacy flags,
  coalition bonuses, and two types of ending.

The static “How to Play” guide is approximately 4,180 words. The design
document is approximately 14,200 words. These are useful reference materials,
but a first-time four-player session cannot depend on either.

### Design assets worth protecting

1. **Interdependence is real.** No role owns the whole problem.
2. **Simultaneous choice creates tension.** Negotiation can be sincere or
   strategic because final choices stay private until the reveal.
3. **The shared screen creates theatre.** The Reckoning is the emotional centre
   of the product.
4. **The crises are locally legible.** Floods, haze, energy subsidies, food
   prices, jobs, elections, and industrial policy are relevant in Malaysia.
5. **Private and national success can diverge.** This produces a useful
   governance debrief.
6. **The underlying engine is unusually well tested.** Simplifying the
   presentation need not mean destabilising the model.

---

## 2. The central diagnosis

### 2.1 The game front-loads mastery instead of staging discovery

Before a first meaningful choice, a player may encounter a room code, four
unfamiliar role-character combinations, a long role biography, beliefs, fears,
a special resource, a unique power, suggested dialogue, forbidden dialogue,
and three private goals. A scanned player is also offered the “full rules.”

This creates three predictable behaviours:

- careful readers delay the table;
- fast readers skip important rules and later feel surprised by the system;
- confident players dominate while others are still decoding the interface.

**Recommendation:** onboarding should take no more than 75 seconds. It should
teach identity and motivation, not the full rules.

### 2.2 Complexity comes from the number of systems, not the option cards

Individual option cards are relatively concise. Cognitive load comes from
having to remember several orthogonal systems: personal resource, trust,
private goal, special power, promises, transfers, tips, national targets, green
share, and prior-round effects. Many are interesting independently; together
they compete for attention and obscure causal learning.

**Recommendation:** establish a complexity budget. In a First Game, a player
tracks only:

- one role objective;
- one role resource;
- three shared outcomes;
- one choice per round;
- at most one public deal per round.

Do not introduce a new system unless it replaces another system or clearly
changes how players negotiate.

### 2.3 The language is dramatic but sometimes performs at the player

Copy such as “Pick one. Now.”, “Everyone is waiting for you,” “Hollow Victory,”
and “one dead country” creates urgency. Used repeatedly, it can feel punitive
in a corporate or public-sector workshop, particularly for participants using
English as an additional language. It also tells players what emotion to have
instead of allowing the result to generate that emotion.

**Recommendation:** retain broadcast drama on the shared screen, but make phone
copy calm, direct, and respectful. Urgency should come from a visible clock and
the table, not scolding.

### 2.4 The interface withholds too much causality

Choices show a “plain-English hint” but conceal effect values. This protects
uncertainty and prevents spreadsheet play; however, if consequences are too
opaque, players cannot build a mental model. A strategy simulation needs
uncertainty, not arbitrariness.

**Recommendation:** show directional, non-numeric effects consistently:

- `Emissions ↓↓`
- `Jobs & growth ↑`
- `Quality of life ↓`
- `Builds clean economy`
- `Needs Government partnership`

After resolution, explicitly connect cause to effect: “Because Government
funded the grid **and** Industry invested in renewables, both actions became
stronger.” Reveal exact national deltas only after choices lock. This preserves
negotiation while making the model learnable.

### 2.5 “Net zero” and the visible win condition do not yet tell the same story

The title promises a journey to net zero by 2050, while the visible mission
moves emissions from 300 Mt to 200 Mt. A sophisticated participant may
reasonably ask why a one-third reduction counts as success. Green Economy Share
acts as the transition mechanism, but the current end state can appear to award
“net zero” without reaching zero.

**Recommendation:** do not casually change the balanced engine. Change the
narrative contract in one of two ways, then validate it with climate experts:

1. **Preferred:** the game ends with “On track / Not on track for net zero,”
   where 200 Mt is an explicit 2050 carbon-budget checkpoint and clean-economy
   capacity represents the credible route to eliminate the remainder; or
2. rename the product promise to “The Net Zero Transition” and state that the
   session covers the decisive first stage rather than the final tonne.

Use one sentence on the opening mission screen: “You will not reach zero in six
turns; you must put the country on a credible path to reach it.”

---

## 3. Recommended game architecture

### 3.1 Two modes, not one compromise

| System | First Game (default) | Advanced Game |
|---|---|---|
| Shared outcomes | Carbon, Prosperity, Quality of Life | Same |
| Green Economy Share | Shown as “Clean Economy”; explained in Round 2 | Same, with more detail |
| Role resource | One per role | One per role |
| Private goals | One simple goal assigned, introduced after Round 1 | Choose one of three before play |
| Deals | One public deal template | Promises, demands, offers, co-funding |
| Insider tips | Off | On |
| Veto / Spotlight | Guided event in Rounds 3/4 | Player-controlled counters |
| Trust awards | One end-of-game award | Per-round tokens |
| Scenario variants | Curated six-scenario journey | Random variants |
| Duration | 20–25 minutes + debrief | 30–40 minutes + debrief |

This gives facilitators an honest choice. “First Game” should be the large
primary button; “Advanced Game” should say “For groups who have played before.”

### 3.2 The four-step round

Target: **3 minutes 15 seconds per round**, with automatic but gentle progress.

| Step | Time | Shared screen | Phone | Player question |
|---|---:|---|---|---|
| Crisis | 20 s | Headline, image/icon, one consequence | Role-specific implication | “What just changed?” |
| Talk | 75 s | One negotiation prompt and three outcomes | Need, resource, actions preview | “What do I need from the others?” |
| Choose | 35 s | Four role tiles show Ready/Choosing | Three comparable cards | “What will I actually do?” |
| Impact | 65 s | Four choices, interaction, meter movement, lesson | Personal result in one sentence | “Why did that happen?” |

Remove `briefing` as a recurring conceptual step. Merge `reckoning` and
`summary` into one Impact sequence. “The Reckoning” can remain as flavour text,
but it should not be another rule players need to understand.

### 3.3 A curated learning arc

The first game should not randomly choose among all 18 variants. Curate one
journey in which each round teaches one strategic idea:

1. **Jobs shock — interdependence.** Everyone can act; aligned investment is
   stronger.
2. **Energy shock — transition versus short-term affordability.** Introduce
   Clean Economy.
3. **Health/haze — distribution.** A national average can hide who bears the
   cost. Introduce the Community power with an in-context prompt.
4. **Election — legitimacy.** Introduce Civil Society's public-attention power.
5. **Pollution — accountability.** Earlier choices return as one clearly named
   consequence.
6. **Flood — resilience and legacy.** Force a final portfolio decision rather
   than a single “best” option.

After this journey, unlock variant scenarios. Randomness is valuable for
replayability; it is counterproductive while learning.

### 3.4 Make interaction visible and predictable

Every round should contain two or three **declared interaction rules**, shown
above the cards during Talk. Example:

> **This round**
> - Grid funding + renewable investment = stronger carbon reduction.
> - Price support protects quality of life but uses public budget.
> - If nobody protects workers, quality of life will fall.

These are not spoilers. They are the negotiating terrain. The hidden choice is
whether others will follow through.

### 3.5 Replace optimal-choice hunting with portfolios

Three cards per role should use a stable grammar:

- **Act now** — strong immediate outcome, meaningful cost;
- **Build capacity** — weaker today, unlocks or amplifies later action;
- **Protect my constituency** — preserves resource or private interest, creates
  a national trade-off.

Not every card must use these exact labels, but players should learn how to
compare them at a glance. Avoid one option that is plainly “green and good,”
one “dirty and selfish,” and one neutral. A world-class simulation gives every
option a defensible argument and a visible cost.

---

## 4. UI/UX redesign

### 4.1 Joining and role selection

Current role selection asks players to choose before they understand the seats.
Replace it with four one-screen role cards:

| Short label | One-line identity | What you control | What you fear |
|---|---|---|---|
| Government | Keep the country working and retain public support | Public budget and policy | Unaffordable promises |
| Industry | Keep firms competitive while investing for the future | Investment | Moving too early or too late |
| Community | Protect households, workers, and places | Public support | People paying for decisions made above them |
| Civil Society | Keep climate and accountability on the agenda | Public attention | Delay and greenwashing |

Interaction pattern:

1. Scan QR; room code is already accepted.
2. Enter first name.
3. See four role cards and tap an available role.
4. See a 20-second role brief: **Your aim / Your resource / Ask this first**.
5. Tap **I’m ready**.

Do not offer a 4,000-word guide in the critical path. Provide “2-minute rules”
and “Full guide” under a quiet Help link.

### 4.2 The phone during play

Use one persistent information hierarchy:

1. top bar: `Round 2 of 6 · Choose · 0:24`;
2. immediate task in a verb phrase: “Choose your energy response”;
3. three action cards;
4. sticky confirmation button;
5. secondary drawer: role, private aim, history, accessibility/help.

Each action card should have exactly five layers:

1. **Action title** (verb first);
2. one-sentence meaning, maximum 16 words;
3. resource cost (`Costs 2 Budget` or `Gain 1 Investment`);
4. up to three directional outcome chips;
5. dependency, if any (`Stronger with Industry`).

Recommended confirmation copy:

- no selection: `Choose an action`;
- selected: `Confirm: Fund clean power`;
- after confirmation: `Confirmed — you can watch the shared screen`;
- at 8 seconds: `8 seconds — your selected action will be confirmed`.

Avoid “the clock picks for you.” If no action is selected, choose the most
role-consistent safe default and label it in advance: “No choice: Protect the
budget will be used.” Never make default resolution feel random.

### 4.3 The shared screen

The shared display should answer three questions from four metres away:

1. What phase are we in?
2. What should we talk about now?
3. Is the country on track?

Recommended layout:

- **Top:** Round, crisis, phase, large countdown.
- **Centre:** the current focus (headline, negotiation prompt, or reveals).
- **Bottom:** three equally prominent outcome tracks with target zones.
- **Side:** four role tiles with only meaningful status: Talking, Choosing,
  Confirmed.

Display “Clean Economy” as an enabling track below the three outcomes, not as a
mysterious fourth objective. Add a plain-language caption: “Higher clean
capacity makes future prosperity less polluting.”

During Impact, use a fixed causal animation:

1. reveal all four action titles within 6–8 seconds;
2. highlight synergies or conflicts with connecting lines;
3. state one causal sentence;
4. move the three outcomes together;
5. show “On track / At risk / Off track,” not just raw numbers;
6. hold for discussion or facilitator advance.

The current one-card-at-a-time theatre can be retained in Advanced mode, but a
75-second reveal is too much non-participatory time in a 30-minute session.

### 4.4 Accessible and Malaysian-friendly presentation

- Default to plain international English; offer **Bahasa Melayu** as a complete
  language toggle rather than mixing unexplained Malay terms into English.
- Use familiar institutional nouns. “Industry” is clearer than “The Business.”
- Avoid invented names that sound like tests of local knowledge. One or two
  fictional place names create flavour; several currencies, rivers, districts,
  and institutions create memory work.
- Never use colour as the only state indicator. Pair it with an arrow, icon,
  pattern, and label.
- Provide reduced-motion mode; Impact must remain understandable with all
  animations disabled.
- Use minimum 16 px phone body text, 44 px tap targets, persistent focus states,
  semantic headings, and live-region announcements for timer/confirmation.
- Test on older Android devices and constrained venue Wi-Fi, not only current
  iPhones and laptops.
- Let the facilitator enlarge dashboard type without browser zoom breaking the
  layout.

---

## 5. Content and terminology

### 5.1 Recommended term system

| Current term | Recommended player-facing term | Why |
|---|---|---|
| The Business | Industry | Natural collective stakeholder label |
| Activist | Civil Society | Broader, less adversarial in mixed workshops |
| Happiness | Quality of Life | More credible policy measure; includes wellbeing |
| Green Economy Share | Clean Economy | Shorter; explain what it enables |
| Fiscal Points | Public Budget | Meaning is evident without a glossary |
| Capital | Investment | Makes spending and replenishment intuitive |
| Trust awards/tokens | Public Support | Connects directly to legitimacy |
| Spotlights | Public Attention | Explains the power rather than its metaphor |
| Public Mandate veto | Community Mandate | Shorter and role-linked |
| Coalition Bonus | Joint Action Bonus | Says why it happened |
| Reckoning | Impact | Says what the screen does |
| sealed goal | private goal | Familiar and sufficient |
| lock it in | confirm action | Conventional and accessible |
| Mt | million tonnes CO₂e | Expand on first use; keep Mt CO₂e thereafter |

All four stakeholder labels need equivalent grammatical weight. “Government,
Industry, Community, Civil Society” reads as a system; “The Government, The
Business, The Community, The Activist” mixes institutions and individuals.

### 5.2 Plain-language editorial rules

1. Use sentences under 20 words for timed screens.
2. Put the action and affected group first: “Subsidise household electricity
   bills,” not “Relief Package.”
3. Expand every abbreviation on first use.
4. Use one name for each concept everywhere.
5. Avoid idioms such as “hold the line,” “belt-tightening,” “take the seat,” or
   “right side” unless the meaning is also stated.
6. Separate flavour from instruction. Flavour may be vivid; buttons and rules
   must be literal.
7. Describe trade-offs neutrally. Do not pre-judge a choice as heroic, dirty,
   cowardly, or cruel.
8. Give consequences a subject and cause: “Food prices fell because Government
   funded relief,” not “Happiness +0.4.”
9. Translate meaning, not word order, in Bahasa Melayu. Review with Malaysian
   policy practitioners and professional game localisers.
10. Read every timed screen aloud. If it cannot be understood once at normal
    speed, shorten it.

### 5.3 Example rewrite

**Before**

> Green Stimulus Package  
> RG 3bn into rooftop solar, rail and building retrofits.  
> Costs 2 Fiscal.

**After**

> **Fund clean jobs and transport**  
> Invest in rooftop solar, rail, and energy-efficient buildings.  
> `Costs 2 Budget` · `Carbon ↓↓` · `Prosperity ↑` · `Quality of life ↑`  
> *Stronger if Industry invests in clean manufacturing.*

**Before**

> Pick one. Now.

**After**

> Choose your response.

**Before**

> Everyone is waiting for you. Then the clock picks for you.

**After**

> 8 seconds left. Your selected action will be confirmed.

### 5.4 Scenario writing template

Every crisis should fit one schema:

- **Headline:** maximum 8 words.
- **What happened:** maximum 25 words.
- **Who feels it:** one concrete human consequence.
- **Decision:** one question addressed to the table.
- **Role implication:** maximum 18 words, private.
- **Interaction rules:** maximum three bullets.
- **Action:** verb-first title, 16-word description, cost, three impact chips,
  optional dependency.
- **Impact explanation:** one system sentence plus one human sentence.

Example:

> **Factory orders collapse**  
> Overseas orders fell 30%. Three factories may close, putting 12,000 jobs at
> risk.  
> **Table question:** Who should pay to protect jobs—and what should the country
> build next?

This retains the Malaysian context without requiring players to remember the
Northern markets, Perindu, Ringga, and several institutions in the same beat.

---

## 6. Private goals and role powers

### 6.1 Private goals should sharpen negotiation, not add arithmetic

The current private goals are another win-condition layer before players have
learned the shared mission. In First Game, assign one simple role goal after
Round 1 and express it behaviourally:

- Government: “Finish with Budget remaining and keep Quality of Life on track.”
- Industry: “Make at least two clean investments without losing all Investment.”
- Community: “Prevent Quality of Life from falling in any two rounds.”
- Civil Society: “Secure three joint climate actions.”

Players should not have to evaluate thresholds involving several unfamiliar
units during onboarding. Advanced mode can retain choice among goals, but show
a small progress tracker and explain exactly when it updates.

At the end, use three statuses rather than winner titles:

- **Shared mission achieved / missed**;
- **Your private goal achieved / missed**;
- **The choice that mattered most**, supported by the event log.

Avoid automatically calling a participant’s outcome “Hollow Victory.” Ask the
question in the debrief instead: “Your private goal succeeded while the shared
mission failed. What incentive produced that result?” This is more neutral and
more useful in professional settings.

### 6.2 Teach powers exactly when they become usable

Do not explain all asymmetric powers on the role-reveal screen. When a power
first matters, pause the personal timer and show a three-line coach mark:

> **Your Community Mandate is ready**  
> Block one Industry or Government action this round.  
> Use it only if negotiation fails. You have two for the game.

The shared screen should simultaneously say “Community can use its mandate this
round,” so the power becomes negotiation material rather than a surprise.

### 6.3 Structured deals need mechanical clarity

Free social promises are excellent debrief material but poor rules if players
cannot distinguish enforceable transfers from non-binding statements. Use two
visually distinct deal types:

- **Joint action** — mechanical, both participants confirm, resources transfer
  or synergy activates;
- **Public promise** — non-binding, recorded, revealed as kept/broken.

In First Game, allow only Joint action. Introduce Public promise in Advanced
mode with explicit text: “This is not enforced by the game.”

---

## 7. Facilitator experience and debrief

“Self-explanatory” should mean no rules lecture, not no facilitator. The
facilitator protects pace, psychological safety, and learning.

### 7.1 Before play

The dashboard should provide a setup checklist:

- four players connected;
- each has chosen a different role;
- shared screen is visible;
- sound is on/off (do not rely on it);
- language and accessibility settings confirmed;
- mode and estimated finish time shown.

Replace keyboard-only knowledge with labelled facilitator controls. Shortcuts
may remain, but every action must be discoverable. `Next` should preview the
destination: `Start crisis`, `Open choices`, `Show impact`.

### 7.2 During play

Give the facilitator one optional prompt per Talk phase and one diagnostic:

- prompt: “Government, what support do you need from Industry?”
- diagnostic: “Civil Society has not spoken this round.”

Never publicly label a player as slow. Show `3 of 4 confirmed` and privately
nudge the remaining phone. The facilitator may see who needs technical help,
but the shared display should not shame them.

### 7.3 Debrief as part of the product

Reserve 10–15 minutes. Generate a debrief screen from the actual event log:

1. **Outcome:** Which shared target was hardest, and why?
2. **Turning point:** Show the round with the largest positive and negative
   trajectory change.
3. **Coordination:** Which joint action worked? Which opportunity was missed?
4. **Incentives:** Where did a private objective conflict with the country?
5. **Power:** Whose voice or resource shaped the result?
6. **Transfer:** What resembles Malaysia or the participants’ organisation?
7. **Commitment:** What one real-world decision would change after this game?

Provide a QR code to a one-page session report: final tracks, four key choices,
one missed opportunity, and discussion questions. Do not rank individual
players; the simulation is about systems, not personal climate virtue.

---

## 8. Priority roadmap

### Now: two-week comprehension sprint

1. Replace the join flow with role summary cards and a 75-second maximum
   onboarding target.
2. Reduce the role reveal to **Aim / Resource / First question**; move biography
   and suggested lines to the menu.
3. Rename player-facing terms using the terminology table.
4. Add consistent directional impact chips and dependency text to option cards.
5. Rewrite deadline, confirmation, default, and ending copy in neutral language.
6. Add one opening sentence explaining that success means being credibly on
   track for net zero.
7. Produce a two-minute visual guide; keep the current guide as “Full rules.”

These are primarily presentation changes. Do not retune engine constants during
this sprint.

### Next: four-to-six-week First Game

1. Add First/Advanced mode selection.
2. Curate a fixed six-scenario learning journey.
3. Implement the four-step round and 20–25 minute pacing.
4. Move private goals after Round 1 and simplify the default set.
5. Remove tips, promises, per-round trust awards, and free use of special powers
   from First Game.
6. Add round-specific interaction rules and causal Impact explanations.
7. Add on-track/at-risk/off-track forecasting and an event-driven debrief.
8. Instrument the funnel and run structured Malaysian playtests.

### Later: depth and replayability

1. Restore advanced systems as individually selectable modules.
2. Add Bahasa Melayu localisation after English terminology stabilises.
3. Add sector or state-specific scenario packs.
4. Add facilitator-created scenario playlists.
5. Add replay comparison without exposing an “optimal” answer.
6. Commission climate-policy review of the 2050 pathway narrative.

### Do not prioritise yet

- more scenario variants;
- more role biography;
- more meters;
- a tutorial video longer than two minutes;
- photorealistic art;
- competitive leaderboards;
- engine retuning before comprehension tests show a balance problem.

---

## 9. Playtest and measurement plan

### 9.1 Research design

Run at least 12 first-time tables in three cohorts:

- Malaysian university/public participants;
- corporate sustainability and non-sustainability staff;
- government/NGO practitioners.

Include a range of English proficiency, seniority, ages, and Android devices.
Do not explain the rules unless a participant explicitly asks. Observe where
the product fails to teach itself.

For half the tables, use the current experience; for half, use First Game.
Rotate facilitators to avoid measuring only facilitator skill.

### 9.2 Success criteria

| Measure | World-class target |
|---|---:|
| Scan to all four ready | median under 3 minutes |
| Facilitator rule explanation | under 60 seconds total |
| First meaningful player statement | under 4 minutes from scan |
| Correctly explain the three shared outcomes after R1 | at least 90% |
| Correctly explain own resource after R1 | at least 90% |
| Correctly predict direction of selected action | at least 80% |
| Round completed without facilitator rescue | at least 95% |
| Participants who speak during every Talk phase | at least 3.5 of 4 average |
| “I understood why the result happened” | at least 4/5 average |
| “I would play again” | at least 4/5 average |
| Full game completion | at least 95% |

### 9.3 Instrumentation events

Capture anonymous, room-level events:

- join started/completed, role viewed/chosen, onboarding screen dwell;
- phase start/end, first action preview, selection changes, confirm/default;
- help opened and term definition opened;
- deal proposed/accepted;
- facilitator pause/advance/override;
- disconnection/reconnection;
- debrief question shown and report opened.

Do not infer confusion only from time. Pair telemetry with observation and a
post-round question: “What did you expect your action to change?”

### 9.4 Five decisive usability tasks

1. Join a room and choose a role without verbal help.
2. Explain, in the participant’s own words, what the group must achieve.
3. Compare two action cards and describe the trade-off.
4. Create a joint action with another role.
5. After Impact, explain which combination caused the result.

A design is not ready because players can tap through it. It is ready when
players can explain the strategy model it is teaching.

---

## 10. Definition of done for the redesign

The First Game is ready to launch when:

- four first-time players can begin without reading the full guide;
- no timed screen requires a glossary;
- every action card is understandable in five seconds;
- every outcome movement has a visible causal explanation;
- each round presents one dominant learning question;
- no player must remember more than one private resource and one private aim;
- the phrase “on track for net zero” is scientifically and mechanically
  defensible;
- the game works with reduced motion, colour-vision differences, older Android
  hardware, and intermittent connections;
- the debrief uses actual decisions from the session;
- Malaysian participants recognise the policy tensions without feeling that
  local flavour is being used as decoration.

The central design move is subtraction with intent. Preserve the difficult
decisions, asymmetric incentives, public negotiation, and dramatic reveal.
Remove the need to understand every system before those decisions become
interesting. A world-class simulation feels simple to operate and difficult to
master—not difficult to enter.
