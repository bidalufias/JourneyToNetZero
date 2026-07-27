# JOURNEY TO NET ZERO
### Complete Game Design Document · v3.0 · build-ready

**A 30-minute, 4-player strategy simulation for climate training.**

This is the single source of truth. It replaces all earlier drafts. Every rule and number here has been verified across roughly 200,000 simulated games; the measured outcomes are in Part 12.

**Companion files**

| File | What it's for |
|---|---|
| `jtnz-content-pack-v2.json` | Machine-readable content — all 18 scenarios, 216 options, config, goals. The build reads this. |
| `jtnz-insider-tips.json` | Insider Tip card library and runtime templates. |
| `engine.py` / `content.py` | Working reference implementation. Port the resolution order from `play_round()`. |
| `how-to-play.html` | The player-facing guide. Tone reference, and shipped as-is — it lives in `public/` and the app links to it at `/how-to-play.html`. |
| `jtnz-balance-report.txt` | Raw playtest output. |

---

## PART 1 — THE BIG IDEA

### The pitch
Four people who don't trust each other have 30 minutes and six crises to save a country — and none of them can do it alone.

### What it's actually about
Everyone already agrees on net zero. That's not the hard part. The hard part is that the Government needs votes, the Business needs profit, the Community needs cheap petrol, and the Activist needs to be able to look at themselves in the mirror. Every one of those needs is legitimate. Every one of them, pushed too hard, sinks the country.

The game doesn't teach "be green." It teaches something harder and more useful: **you will have to give something up, and you will have to trust someone who has every reason to let you down.**

### The design promises
- **No right answers.** Every option is defensible. Every option costs something.
- **Many paths.** State investment, private capital, community power, activist pressure — or, realistically, a messy mix.
- **Early choices haunt you.** What you build in Round 2 decides how badly the flood hurts in Round 6.
- **You cannot win alone.** The maths is built so that four optimal *individual* strategies produce a failed country. This is measured, not asserted: four selfish players win 0.0% of the time.

---

## PART 2 — THE WORLD

### The Republic of Semenanjara

A middle-income tropical nation of 34 million. Monsoon-fed rivers, palm and rubber plantations inland, semiconductor and chemical parks on the west coast, offshore gas, tourist islands east. Thirty years of fast growth. A young population that is impatient and online.

| | |
|---|---|
| **Capital** | Kota Damai |
| **Currency** | the Ringga (RG) |
| **Industrial heartland** | Perindu State — chemical parks, ports, semiconductors |
| **The river** | Sungai Jernih — drinking water for 4 million |
| **National energy company** | NuriTenaga |
| **Largest conglomerate** | Sawit Prima Group — palm, property, power |
| **The news** | *The Damai Herald*; Semenanjara Tonight, anchored by Aida Rahman |
| **Starting position** | 100 Mt CO₂e net (300 gross, ~200 absorbed) · 4.5% growth · Happiness 6.0 · Green Economy 10% |

Fictional, but recognisable to anyone from the region. That recognition is what makes people argue like it's real.

### The four seats

**🏛 THE GOVERNMENT — Datuk Nurul Aziz, 52, Minister for Energy, Environment and Climate**
Holds the budget and the law. Moves faster than anyone. Can also be voted out in an afternoon. Every good decision is paid for by someone who votes.
*Resource: **Fiscal Points**, 4 to start, +2 per round from Round 2 (+1 more if growth ≥5.5%), capped at 8.*

**🏭 THE BUSINESS — Tan Sri Lim Wei Sheng, 58, Group CEO of Sawit Prima**
Owns the emissions. Also owns the jobs, exports and tax base. Will go green the moment it's cheaper than not going green — or the moment someone makes staying dirty more expensive.
*Resource: **Capital**, 5 to start, +1 per round (+1 more if growth ≥5.0%), capped at 12.*

**🏘 THE COMMUNITY — Mak Cik Rohani, 47, stallholder and residents' association chair**
34 million people who want clean air, a job, and petrol under two Ringga a litre. No money, no law. Something better: they decide who is trusted.
*Resource: awards **2 Trust tokens** every round — one for who cared most, one for who did most for the future. Holds **2 Public Mandate vetoes** for the game.*

**✊ THE ACTIVIST — Aisyah Kamal, 26, founder of Bangkit Iklim**
Can't build or fund anything. Can make ignoring her more expensive than listening — three times, and only three, before people stop hearing her.
*Resource: **3 Spotlights** for the whole game, plus finite credibility.*

> **On complexity:** each player tracks exactly one number. The dashboard tracks everything else. Nobody does arithmetic.

---

## PART 3 — WINNING AND LOSING

### The National Mission (shared)
By the end of Round 6, Semenanjara must hit **all three**:

| Target | Start | Goal |
|---|---|---|
| 🌍 Emissions | 100 Mt CO₂e net | **net zero (≤ 0)** |
| 📈 Economy | 4.5% growth | **≥ 5.0% average across the six rounds** |
| 😊 Happiness | 6.0 | **≥ 7.0** |

Two out of three is a failure. That's the point.

### The Private Goal (yours alone)
Before Round 1, each player secretly picks **1 of 3**. Others may see the full list of twelve; what stays hidden is which one you took. Lying about it is legal and expected.

Every threshold below was calibrated against realistic simulated tables to land near 40%.

| Role | Goal | Condition | Measured hit rate |
|---|---|---|---|
| 🏛 | **Landslide** | End holding 6+ Trust | 41.5% |
| 🏛 | **Steady Hand** | Growth never below 4.0% in any round | 47.4% |
| 🏛 | **The Legacy** | Green Economy Share reaches 55% | 28.7% |
| 🏭 | **Market Dominance** | End with 6+ Capital | 39.4% |
| 🏭 | **Green Champion** | Personally deliver 40+ Mt of cuts | 40.9% |
| 🏭 | **Licence to Operate** | End with 2+ Trust and 4+ Capital | 33.8% |
| 🏘 | **A Happy Nation** | Happiness ends at 8.0+ | 38.0% |
| 🏘 | **Nobody Left Behind** | Happiness never drops below 6.3 | 35.8% |
| 🏘 | **Our Own Two Hands** | Land 4+ successful community-led actions | 47.0% |
| ✊ | **No Compromise** | Never collaborate, and still finish ≤175 Mt | 40.9% |
| ✊ | **The Long Game** | Green Economy Share reaches 52% | 44.0% |
| ✊ | **Justice First** | Happiness 7.0+ and at least one Spotlight lands | 22.1% |

*Justice First is the hardest goal in the game. Simulated Activists under-use Spotlights, so expect humans to beat 22%.*

### How results are announced

**Country hits all three:** everyone earns **NATION BUILDER**. Private goals are then revealed one at a time, and those who hit theirs collect a personal title on top. Nobody is embarrassed; everyone takes something home.

**Country misses even one:** every private goal is revealed, including the achieved ones. Anyone who hit theirs receives:

> **🏆 HOLLOW VICTORY** — *"You got exactly what you wanted. The country is 3.2°C warmer. Was it worth it?"*

No partial credit, no consolation. That card does more teaching than an hour of slides. Do not soften it.

---

## PART 4 — THE ROUND

Six rounds, four minutes each. 24 minutes of play, 3 setup, 3 results.

| | Time | What happens |
|---|---|---|
| **1. THE CRISIS** | 0:30 | Dashboard reveals the scenario. Phones buzz with the same news plus one private line each. One player also receives an Insider Tip. |
| **2. THE TABLE** | 1:30 | Open talk. Argue, plead, threaten, trade chips. Nothing is binding. |
| **3. THE CHOICE** | 0:45 | Everyone picks one of three options in secret. Countdown. Locked. |
| **4. THE RECKONING** | 1:15 | Cards flip one at a time on the dashboard, ~3 seconds apart, meters animating between each. Never all four at once. |

**During THE TABLE, phones offer:**

| Action | Effect | Who |
|---|---|---|
| **Offer** | Send a resource chip to another player. They accept or decline; transfer is immediate and permanent. | Everyone |
| **Promise** | A public pledge shown on the dashboard. **Not enforced.** | Everyone |
| **Demand** | A public condition. | Everyone |
| **Spotlight** | Name one player publicly. 3 per game. | ✊ Activist |
| **Public Mandate** | Remove a named player's dirtiest option for this round. 2 per game. | 🏘 Community |

> **Promises are unenforceable on purpose.** The first time somebody breaks one, the room changes. That moment is the whole training course. The dashboard flashes **PROMISE BROKEN** and names them.

---

## PART 5 — THE ENGINE

### 5.1 State

```
emissions   300.0 Mt      fiscal     4   (Government, cap 8)
gdpGrowth   4.5 %         capital    5   (Business, cap 12)
happiness   6.0           spotlights 3   (Activist)
greenShare  10 %          vetoes     2   (Community)
trust       {gov:0, biz:0, act:0}
flags       {}            gdpHistory[]   happinessHistory[]
```

### 5.2 Resolution order — get this exactly right

```
1. Treasury and corporate income (from Round 2)
2. Scenario shock, scaled by legacy flags and Round 6 modifiers
3. Community may spend a Public Mandate veto
4. Four choices, locked simultaneously
5. Resolve option effects, with these multipliers applied in order:
      partner co-funding · self-organise support · regulatory capture
      · flag boosts · spotlight backdown · regulation bite
      · public pressure · credibility decay · volunteer fatigue
6. Regulation forced abatement
7. Coalition Bonus
8. Spotlight accountability effect
9. Apply to meters; happiness reverts to its dynamic baseline
10. Green share depreciates, then grows with diminishing returns
11. Green growth dividend applied to growth
12. Growth–carbon drift added to emissions
13. Community awards 2 Trust tokens
14. Clamp, push history
```

### 5.3 Tuned constants — **do not adjust these**

Every value was fitted. Rounding them breaks the balance shown in Part 12.

```
e_green            1.15     multiplier on all emissions cuts
e_dirty            0.95     multiplier on all emissions increases
h_scale2           0.62     damping on happiness deltas
green_scale        0.60     damping on green share gains
green_decay        0.97     green share depreciation per round
green_power        1.5      diminishing-returns exponent
green_dividend     95.0     growth bonus = (greenShare − 10) / this
trend              4.5      growth mean-reversion target
persist            0.35     how much of last round's growth deviation carries
h_b0 / h_b_green / h_b_growth   6.15 / 1.5 / 0.25
h_persist          0.72
mac_lo / mac_span / mac_ref / mac_range   0.45 / 0.70 / 150 / 150
regulate_abate     6.0      forced abatement when Government regulates
regulation_bite    0.55     dirty Business option multiplier under regulation
public_pressure    0.50     isolated Government option multiplier
spotlight_backdown 0.50     spotlit dirty option multiplier
accountability_bonus 0.22   national happiness when a Spotlight lands
credibility_decay  0.92     per prior Collaborate, applied to all Activist effects
volunteer_fatigue  0.94     per prior Self-Organise, applied to Community effects
role_e   government 0.80 · business 1.00 · community 1.40 · activist 1.30
```

### 5.4 The core formulas

**Growth–carbon drift.** Growth creates emissions unless you change what kind of growth it is.

```
emissions += growth × K
```

| Green Economy Share | K |
|---|---|
| 0–20% | 2.4 |
| 21–40% | 1.9 |
| 41–60% | 1.5 |
| 61%+ | 1.1 |

At the start, 4.5% growth quietly adds ~11 Mt every round no matter what anyone does. The only way to weaken it is to build a green economy. Note the floor: even a fully green economy still emits when it grows. **Growth is never free.**

**The marginal abatement curve.** Every emissions *cut* is multiplied by:

```
mac = clamp(0.45 + 0.70 × (emissions − 150) / 150, 0.45, 1.15)
```

The last tonnes are the hardest — which is how decarbonisation actually works, and mechanically it keeps Round 6 tense instead of a victory lap. Applies to option cuts, forced abatement and the Coalition Bonus; never to increases.

**Growth.**
```
growth = 4.5 + 0.35 × (previous deviation from 4.5) + shock + Σ(choices) + (greenShare − 10)/95
```
That last term is the **green growth dividend** — a green economy grows faster, and it is the main route to the 5% target.

**Happiness — hedonic adaptation.** Wellbeing reverts toward a baseline set by how the transition is actually going:
```
baseline  = 6.15 + 1.5 × (greenShare/100) + 0.25 × (growth − 4.5)
happiness = baseline + 0.72 × (happiness − baseline) + shock + 0.62 × Σ(choices)
```
This is the most important conceptual rule in the game. **You cannot buy your way to 7.0** — you have to build a country that sustains it.

**Green Economy Share.**
```
greenShare = 0.97 × greenShare + (gains + 1 per EVIDENCE flag) × 0.60 × (1 − greenShare/100)^1.5
```
Assets age and the economy grows under you. Typical endings land at 45–60%.

### 5.5 The four asymmetric mechanics

**THE COALITION BONUS** — the mathematical spine of the training message. Counts every player *not* choosing Expand, Deregulate or Demand Relief. **Holding a defector to account counts as cooperation**; regulating and escalating are constructive acts.

| Aligned | Emissions | Happiness | Green |
|---|---|---|---|
| 2 | −1 | +0.05 | +0.5 |
| 3 | −7 | +0.20 | +3.0 |
| **4** | **−9.5** | **+0.36** | **+4.5** |

Things become possible when the table pulls together that no player can produce alone. All-selfish tables never trigger it once.

**REGULATION FORCES ABATEMENT.** If Government chooses Regulate: an extra **−6 Mt** lands whether the polluter wanted it or not (×0.45 if Business wasn't being dirty), Business's dirty option is cut to 55%, and Business loses 1 Capital. This is the coalition's main lever against a defecting Business.

**PUBLIC PRESSURE.** If Government chooses Deregulate while all three others are aligned, the Government's effects are **halved** and it loses 1 Trust. An isolated government cannot deliver its promises. This is the lever against a defecting Government.

**THE PUBLIC MANDATE.** Community spends one of two vetoes to take a named player's dirtiest option off the table for a round. This single mechanic moved "three cooperate, Business defects" from 0.0% to 23.8%.

**Plus two anti-dominance rules.** Each Collaborate costs the Activist 8% of all future effectiveness (spent credibility). Each Self-Organise costs Community 6% (volunteer burnout). Together these cut dominant options from 27 to 5 and dead options from 17 to 3.

**Spotlight, in full.** Targets whoever made the dirtiest choice. Cuts their option to 50%, costs them 1 Trust, boosts the Activist's own effect by 40%, and **raises national happiness by 0.22** — because catching a wrongdoer is not the same as letting one go.

### 5.6 The twelve option archetypes

Every one of the 216 options is one of twelve shapes in scenario-specific clothing. Values below are the baseline before role scaling and the global multipliers in §5.3; scenarios vary them by roughly ±30%.

**🏛 GOVERNMENT**

| Archetype | Cost | E | G | H | Green |
|---|---|---|---|---|---|
| **SPEND & STEER** — public money into the transition | −2 Fiscal | −10 | +0.3 | +0.4 | +8 |
| **REGULATE & ENFORCE** — make the polluter pay | −1 Fiscal | −12 | −0.5 | −0.2 | +5 |
| **DEREGULATE & DELAY** — protect growth, protect votes | +1 Fiscal | +4 | +0.6 | +0.1 | −3 |

**🏭 BUSINESS**

| Archetype | Cost | E | G | H | Green |
|---|---|---|---|---|---|
| **TRANSITION** — real capex, real pain, now | −3 Capital | −14 | −0.3 | +0.2 | +10 |
| **EXPAND** — business as usual, faster | +2 Capital | +6 | +0.8 | −0.2 | −2 |
| **PARTNER** — conditional; needs a co-funder | −1 Capital | −7 | +0.2 | +0.3 | +5 |

**🏘 COMMUNITY**

| Archetype | Cost | E | G | H | Green |
|---|---|---|---|---|---|
| **ADAPT & COMPLY** — absorb the cost quietly | — | −5 | −0.1 | −0.3 | +3 |
| **DEMAND RELIEF** — make the government pay | Gov −1 Fiscal *or* −1 Trust | +2 | +0.2 | +0.5 | −1 |
| **SELF-ORGANISE** — do it ourselves | — | −4 | +0.1 | +0.4 | +4 |

**✊ ACTIVIST**

| Archetype | Cost | E | G | H | Green |
|---|---|---|---|---|---|
| **ESCALATE** — protest, blockade, expose | optional Spotlight | −2 | −0.4 | −0.2 | +2 |
| **COLLABORATE** — take the seat at the table | sets COMPROMISED | −3 | +0.2 | +0.3 | +4 |
| **EDUCATE** — evidence now, payoff later | — | −1 | 0 | +0.2 | +3 |

**Three rules that make them interesting:**
1. **Partner fails without a partner.** No co-funder during THE TABLE → halve everything.
2. **Self-Organise doubles only with real backing** — from Government or Business, not applause.
3. **Educate sets an EVIDENCE flag.** Each adds +1 green share every subsequent round, and two or more double certain late-game options.

### 5.7 Legacy flags — why early rounds matter

| Flag | Set by | Later effect |
|---|---|---|
| `BUILT_COAL` | Business, R2 | R5 pollution shock ×1.6; R6 disaster ×1.5 |
| `GRID_UPGRADED` | Government, R2 | All later green options cost 1 less; counts as resilience |
| `SUBSIDY_LOCK` | Government, R2 | −1 Fiscal at the start of R4 and R5 |
| `REGULATORY_CAPTURE` | Business, R4 | Halves every Regulate option from R5; worsens the R5 shock |
| `GREEN_MANDATE` | Government, R4 | Unlocks the R6 climate law and makes it 50% stronger |
| `POPULIST_PLEDGE` | Government, R4 | Blocks the R5 pollution law — they promised no new burdens |
| `LAYOFFS` | Business, R1 | Business is penalised in every later Trust award |
| `MUTUAL_AID` | Community, R3 | Self-Organise always counts as supported afterwards |
| `TRANSPARENT` | Business, R4 | Immune to one Spotlight |
| `EVIDENCE_1/2/3` | Activist, R1–3 | +1 green share per round each; two or more double certain options |
| *Resilience set* | various | Each cuts the R6 disaster shock by 25%, to a 60% maximum |

**Resilience flags:** `GREEN_STIMULUS`, `GRID_UPGRADED`, `WATER_LAW`, `RIVER_WATCH`, `WASTE_LAW`, `MARINE_LAW`, `MONITORING_LAW`, `CITIZEN_MONITORING`, `CITIZEN_SCIENCE`, `PEAT_RESTORED`, `CANOPY`, `HEAT_PLAN`, `TRANSIT_BUILT`, `RECYCLING_BUILT`, `INDUSTRY_PACT`, `LOCAL_SUPPLY`, `URBAN_COOLING`, `CLEAN_AIR_SHELTERS`, `GREEN_PARK`, `JUST_TRANSITION`.

**Round 6 scaling.** Base shock ×2.0 if emissions are above 260. ×1.5 if `BUILT_COAL`. Then reduced 25% per resilience flag, capped at 60% total. Two tables that played identically for five rounds can experience completely different sixth rounds.

---

## PART 6 — THE INSIDER TIP MODULE

Every round, exactly one player receives a private tip. Nobody is told a tip was dealt, or to whom. This is what makes THE TABLE phase loud.

**Dealing.** One tip per round, one recipient. Deal so every player gets at least one across six rounds and two players get two. Randomise order each game. The tip lands the moment the crisis is revealed, before THE TABLE opens.

**Reliability.** Each card is labelled **CONFIRMED** (always true, ~75% of cards) or **UNVERIFIED** (true 50% of the time, rolled server-side at deal time, ~25% of cards).

**Four kinds:**

| Kind | Reliability | What it tells you |
|---|---|---|
| **Forecast** | CONFIRMED | What type of crisis is coming next round |
| **Dossier** | CONFIRMED | The category of another player's private goal |
| **Memo** | CONFIRMED | A consequence an active legacy flag is about to produce |
| **Rumour** | UNVERIFIED | A pre-written claim that may or may not be true |

**Publishing.** The holder may tap **PUBLISH TO THE NATION** during THE TABLE. It appears on the dashboard with their name on it.

| | Government / Business / Activist | Community |
|---|---|---|
| Published, and true | +1 Trust | +1 Public Mandate veto (max 3) |
| Published, and false | −1 Trust | −1 veto (min 0) |

A CONFIRMED tip is always safe to publish. An UNVERIFIED tip is a gamble. Keeping a true warning private costs nothing in the rules and quite a lot socially. The dashboard reveals truth or falsehood only for published tips, at the end of the round; unpublished tips are never revealed to anyone.

**Balance note.** Tips carry no direct effect on emissions, growth, happiness or green share. The only mechanical hook is Publish, worth at most one Trust or one veto per round. This module was **not** included in the balance run — impact should be small, but watch it in live playtesting.

The full card library, runtime fill templates and phone card layout spec are in `jtnz-insider-tips.json`.

---

## PART 7 — THE SCENARIOS

Six rounds, three variations each. **3⁶ = 729 possible games**, so the same room can play four times and never repeat.

Effect columns are raw content values, before the role scaling and global multipliers in §5.3. The engine applies those; the design values below are what you edit when writing new content.

**Reading the columns:** `E` emissions in Mt · `G` growth in percentage points · `H` happiness points · `🌱` green economy share points.


---

### ROUND 1 · GLOBAL FINANCIAL CRISIS

#### R1A — “The Great Contraction”

> Semiconductor orders from the Northern markets collapse 30% overnight. Three factories in Perindu announce layoffs before lunch. The Ringga slides.

**Shock:** growth -1.45 · happiness -0.29 · Business -1 Capital

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Green Stimulus Package** | RG 3bn into rooftop solar, rail and building retrofits. | 2F | -10 | +0.8 | +0.4 | +8 | `GREEN_STIMULUS` |
| **Bail Out the Big Exporters** | Rescue the giants. Cut everything else. | 1F | +2 | +0.9 | -0.4 | -2 | grants Business +2 Capital<br>`BAILOUT_BIG` |
| **Hold the Line** | No new spending. Protect the reserves. | +1F | — | +0.2 | -0.3 | — | `FISCAL_HAWK` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Retool for the Green Market** | Convert lines to EV and solar components. Retrain everyone. | 3C | -8 | +0.3 | +0.3 | +10 | `RETOOLED` |
| **Cut Costs, Cut Jobs** | Twelve thousand redundancies. Offshore the rest. | +2C | -4 | -0.5 | -0.6 | -2 | `LAYOFFS` |
| **Ask for a Lifeline** | State support in exchange for guaranteeing the jobs. | 0 | -3 | +0.6 | +0.3 | +3 | `OWES_GOV` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Tighten Belts, Buy Local** | Spend less, spend closer to home, wait it out. | — | -4 | -0.2 | -0.2 | +3 | `LOCAL_ECON` |
| **March for Jobs** | Demand the government spend, and spend now. | — | +2 | +0.4 | +0.4 | -1 | — |
| **Community Skills Fund** | Neighbourhood retraining cooperatives. | — | -2 | +0.1 | +0.5 | +4 | `COMMUNITY_FUND` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **No Bailouts for Polluters** | Green conditions on every rescue Ringga. | — | -4 | -0.3 | -0.1 | +4 | — |
| **Join the Recovery Taskforce** | Take the seat. Shape it from inside. | — | -3 | +0.3 | +0.3 | +5 | `AT_THE_TABLE` |
| **Publish the Green Jobs Report** | Independent modelling of a clean recovery. | — | -1 | — | +0.2 | +3 | `EVIDENCE_1` |

**Sample headlines:** *Government bets recovery on clean jobs* · *Rescue for the giants, belt-tightening for the rest* · *Minister urges patience as reserves hold* · *Sawit Prima retools for the green economy* · *12,000 jobs gone as Perindu plants shut* · *Industry seeks state support, pledges to save jobs*

#### R1B — “Currency Shock”

> The Ringga loses 22% in eleven days. Imported food, medicine and machinery become brutally expensive. Exporters are quietly delighted.

**Shock:** growth -1.11 · happiness -0.47

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Import Substitution Drive** | Build what we keep buying: panels, batteries, food. | 2F | -9 | +0.6 | +0.3 | +9 | `LOCAL_SUPPLY` |
| **Defend the Currency** | Burn reserves and raise rates to hold the line. | 2F | — | -0.4 | +0.3 | — | `RESERVES_SPENT` |
| **Let It Float** | Stop intervening. Let the market decide. | +1F | +3 | +0.7 | -0.6 | -2 | `FLOATED` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Localise the Supply Chain** | Bring inputs home. Expensive now, resilient later. | 3C | -13 | +0.2 | +0.4 | +11 | `LOCAL_SUPPLY` |
| **Reprice for the Export Boom** | A cheap Ringga makes us the cheapest supplier alive. | +2C | +7 | +0.9 | -0.3 | -3 | `EXPORT_SURGE` |
| **Co-Fund a Local Components Plant** | Split the cost of building it here. | 1C | -7 | +0.3 | +0.3 | +6 | `LOCAL_SUPPLY` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Switch to Local Food** | Cheaper, closer, and a lot less choice. | — | -5 | -0.1 | -0.2 | +4 | `FOOD_LOCAL` |
| **Demand Price Controls** | Cap the price of the forty things that matter. | — | +2 | +0.1 | +0.6 | -1 | `PRICE_CONTROLS` |
| **Neighbourhood Buying Groups** | Buy in bulk, cut out the middle. | — | -4 | +0.2 | +0.4 | +4 | `BUYING_GROUPS` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Expose the Speculators** | Name the funds betting against the country. | — | -2 | -0.5 | +0.1 | +2 | — |
| **Join the Economic Council** | Argue for a green industrial policy from inside. | — | -3 | +0.3 | +0.3 | +5 | — |
| **Map the Import Dependency** | Show exactly where the country is exposed. | — | -1 | — | +0.2 | +3 | `EVIDENCE_1` |

**Sample headlines:** *Minister launches drive to make it here* · *Central bank burns reserves defending the Ringga* · *Ringga left to find its own level* · *Manufacturer brings its supply chain home* · *Exporters post record margins as Ringga slides* · *Joint venture to build components at home*

#### R1C — “The Downgrade”

> A ratings agency drops Semenanjara two notches. Borrowing costs jump. A lender of last resort offers a facility, and every condition attached is a headline waiting to happen.

**Shock:** growth -1.39 · happiness -0.32 · Government -1 Fiscal

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Raise Taxes on Carbon and Wealth** | Fix the revenue base. Take the political damage now. | +2F | -6 | -0.7 | -0.5 | +4 | `TAX_REFORM` |
| **Accept the Facility** | Take the money. Accept the austerity conditions. | +1F | +3 | +0.6 | -0.6 | -2 | `IMF_CONDITIONS` |
| **Sell State Assets** | Sell the stake in NuriTenaga and plug the hole. | +2F | +4 | +0.5 | -0.2 | -4 | `ASSETS_SOLD` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Issue a Green Bond** | Raise cheap money by promising to actually spend it green. | 2C | -12 | +0.4 | +0.2 | +10 | `GREEN_BOND` |
| **Move Capital Offshore** | Protect the balance sheet. Somewhere else. | +3C | +2 | -0.7 | -0.5 | -3 | `CAPITAL_FLIGHT` |
| **Co-Invest in Public Infrastructure** | Build the rail line with the state, share the risk. | 1C | -8 | +0.4 | +0.4 | +6 | `PPP` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Accept the Austerity** | Leaner years. Nobody likes it, everyone survives it. | — | -5 | -0.2 | -0.5 | +2 | — |
| **General Strike** | Shut the ports and the rail until they listen. | — | +1 | -0.5 | +0.5 | — | `STRIKE` |
| **Community Credit Unions** | If the banks won't lend, we will. | — | -3 | +0.3 | +0.4 | +4 | `CREDIT_UNIONS` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Reject the Conditions** | Austerity by another name. Fight it publicly. | — | -2 | -0.5 | +0.2 | +2 | — |
| **Negotiate Green Conditionality** | Rewrite the loan conditions around clean investment. | — | -4 | +0.2 | +0.3 | +6 | `GREEN_CONDITIONS` |
| **Publish the Debt Audit** | Show the public what the debt actually bought. | — | -1 | +0.1 | +0.2 | +3 | `EVIDENCE_1` |

**Sample headlines:** *Carbon and wealth taxes announced* · *Government accepts facility, austerity begins* · *State stake in NuriTenaga put up for sale* · *RG 4bn green bond oversubscribed* · *Capital leaves as confidence falls* · *Public-private rail deal signed*


---

### ROUND 2 · GLOBAL ENERGY CRISIS

#### R2A — “The Gas Shock”

> Global LNG prices triple. Semenanjara exports gas and subsidises it at home, so the country is somehow both richer and broker. The subsidy bill hits RG 52 billion.

**Shock:** growth -0.55 · happiness -0.44 · Government -1 Fiscal

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Fast-Track Renewables and the Grid** | 5 GW of solar plus the transmission to carry it. | 2F | -12 | +0.2 | +0.2 | +10 | `GRID_UPGRADED` |
| **Freeze Fuel Prices** | The pump price does not move. Full stop. | 2F | +5 | +0.5 | +0.6 | -4 | `SUBSIDY_LOCK` |
| **Float Prices, Targeted Cash Aid** | Painful, honest, correct. | 1F | -6 | -0.3 | -0.5 | +4 | `SUBSIDY_REFORM` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Solar and Storage on Every Roof** | Generate our own. Never take this call again. | 3C | -13 | -0.2 | +0.2 | +11 | `SELF_GEN` |
| **Switch to Cheap Coal** | Available, legal, filthy. | +2C | +8 | +0.7 | -0.3 | -5 | `BUILT_COAL` |
| **Corporate Power Purchase Agreement** | Twenty-year clean power deal - needs the state to sign. | 1C | -8 | +0.3 | +0.1 | +7 | `PPA` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **National Energy Saving Pact** | Everyone uses less. Nobody enjoys it. | — | -5 | -0.1 | -0.2 | +3 | — |
| **Protest the Tariff Hike** | Electricity is not a luxury. | — | +3 | +0.3 | +0.5 | -2 | `TARIFF_REVOLT` |
| **Village Solar Cooperatives** | Own the panels, own the savings. | — | -4 | +0.1 | +0.4 | +5 | `ENERGY_COOP` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Blockade the Coal Terminal** | Make the cheap option expensive. | — | -3 | -0.5 | -0.2 | +3 | — |
| **Co-Design the Energy Roadmap** | Write the plan instead of shouting at it. | — | -4 | +0.2 | +0.3 | +6 | — |
| **Expose the Subsidy Bill** | Show the public where the subsidy really goes. | — | -1 | +0.1 | -0.1 | +3 | `EVIDENCE_2` |

**Sample headlines:** *Five gigawatts of solar fast-tracked* · *Pump prices frozen as global costs soar* · *Fuel prices float; cash aid for the bottom half* · *Factories go off-grid with solar and storage* · *Industry switches to coal as gas prices bite* · *Landmark corporate clean power deal signed*

#### R2B — “Blackout Season”

> Peak demand beats supply six evenings running. Rolling blackouts across three states. A data centre boom nobody planned for is eating 9% of the grid.

**Shock:** growth -0.48 · happiness -0.48

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Emergency Solar and Battery Rollout** | Three gigawatts and storage, in eighteen months. | 2F | -11 | +0.3 | +0.4 | +10 | `GRID_UPGRADED` |
| **Fire Up the Old Coal Plants** | They still work. Turn them on tonight. | +1F | +9 | +0.6 | +0.4 | -5 | `BUILT_COAL` |
| **Ration Industrial Power** | Industry cuts load 20%. Households keep the lights on. | 1F | -13 | -0.8 | -0.1 | +5 | `POWER_RATIONING` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Build Behind-the-Meter Renewables** | Our own generation, our own certainty. | 3C | -14 | -0.1 | +0.3 | +11 | `SELF_GEN` |
| **Buy Diesel Generators** | Loud, dirty, available on Tuesday. | +2C | +7 | +0.6 | -0.3 | -4 | `DIESEL_FLEET` |
| **Demand Response Agreement** | Shift our load off peak in exchange for a tariff deal. | 1C | -8 | +0.2 | +0.2 | +7 | `DEMAND_RESPONSE` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Voluntary Load Shedding** | Everything off at seven. It works. | — | -6 | -0.1 | -0.3 | +3 | — |
| **Demand Compensation** | A rebate for every blackout hour. | — | +2 | +0.2 | +0.5 | -1 | — |
| **Neighbourhood Microgrids** | One street, one battery, no blackouts. | — | -5 | +0.1 | +0.5 | +5 | `ENERGY_COOP` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Occupy the Utility HQ** | Sit in the lobby until someone explains the plan. | — | -3 | -0.5 | -0.1 | +3 | — |
| **Join the Grid Taskforce** | Help fix it rather than film it. | — | -4 | +0.2 | +0.3 | +6 | — |
| **Publish the Data Centre Audit** | Who is actually using all this power? | — | -1 | — | +0.2 | +3 | `EVIDENCE_2` |

**Sample headlines:** *Emergency solar and storage programme launched* · *Mothballed coal plants restarted* · *Industry ordered to cut load by a fifth* · *Factories go off-grid with solar* · *Diesel imports surge as firms self-supply* · *Industry agrees to shift load off peak*

#### R2C — “The Subsidy Cliff”

> The fuel subsidy now costs more than health and education combined. The Treasury says it ends this year. Every taxi driver in Kota Damai disagrees.

**Shock:** growth -0.33 · happiness -0.55 · Government -1 Fiscal

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Targeted Subsidy with Digital ID** | Help reaches only those who need it. Everyone else pays. | 2F | -8 | — | -0.1 | +6 | `SUBSIDY_REFORM` |
| **Keep the Blanket Subsidy** | Another year. Another RG 52 billion. | 2F | +6 | +0.5 | +0.7 | -5 | `SUBSIDY_LOCK` |
| **Redirect Subsidy into Public Transport** | Stop subsidising the fuel. Subsidise the alternative. | 2F | -13 | +0.3 | +0.2 | +11 | `TRANSIT_BUILT` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Electrify the Fleet** | Nine thousand vehicles. All of them. | 3C | -13 | -0.2 | +0.3 | +10 | `FLEET_EV` |
| **Pass Costs to Consumers** | Every price rises. Not our problem. | +2C | +4 | +0.7 | -0.6 | -2 | `PRICE_PASS` |
| **Fund a Transition Voucher Scheme** | Help the drivers we depend on to switch. | 1C | -7 | +0.2 | +0.5 | +6 | `VOUCHERS` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Switch to Public Transport** | Slower. Cheaper. Actually fine. | — | -6 | -0.1 | -0.3 | +4 | `TRANSIT_USE` |
| **Convoy Protest** | Two thousand lorries, one ring road. | — | +3 | -0.2 | +0.5 | -2 | `TARIFF_REVOLT` |
| **Ride-Share Cooperatives** | Four to a car, run by the neighbourhood. | — | -5 | +0.2 | +0.4 | +5 | `RIDESHARE_COOP` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Name the Biggest Beneficiaries** | Publish the list. Let people see it. | — | -3 | -0.3 | +0.2 | +3 | — |
| **Co-Design the Targeting System** | Make sure it doesn't miss the people it's for. | — | -4 | +0.3 | +0.4 | +6 | — |
| **Publish the Distributional Study** | Who really gains from cheap fuel? | — | -1 | — | +0.2 | +3 | `EVIDENCE_2` |

**Sample headlines:** *Fuel aid to reach only those who need it* · *Pump prices frozen for another year* · *Subsidy billions shifted to rail and buses* · *Nation's largest logistics fleet goes electric* · *Delivery and food prices climb* · *Industry co-funds transport vouchers*


---

### ROUND 3 · GLOBAL HEALTH CRISIS

#### R3A — “Wabak-24”

> A new respiratory virus reaches Semenanjara in nine days. Hospitals hit capacity. Borders close. The economy stops.

**Shock:** growth -1.38 · happiness -0.42 · emissions -8

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Green Strings on Every Recovery Ringga** | Aid, but only to those who cut emissions. | 2F | -9 | +0.4 | +0.3 | +8 | `GREEN_RECOVERY` |
| **Cash for Everyone, Immediately** | Money in accounts by Friday. No conditions. | 3F | +3 | +0.9 | +0.8 | -2 | `BIG_HANDOUT` |
| **Hard Lockdown, Health First** | Everything stops. Lives over ledgers. | 1F | -10 | -1.0 | -0.2 | +2 | `HARD_LOCKDOWN` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Keep Everyone on Payroll** | Nobody loses a job on our watch. | 3C | -5 | -0.4 | +0.7 | +3 | `LOYAL_EMPLOYER` |
| **Pivot to Essentials, Raise Prices** | Demand is inelastic. So is our pricing. | +3C | +2 | +0.6 | -0.6 | -2 | `PRICE_GOUGE` |
| **Convert Plants to Medical Supplies** | Masks, oxygen, ventilators. At cost. | 1C | -4 | +0.4 | +0.5 | +2 | `NATIONAL_SERVICE` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Full Compliance, Stay Home** | Everyone indoors. For months. | — | -7 | -0.4 | -0.3 | +2 | — |
| **Demand Reopening** | We cannot eat a lockdown. | — | +4 | +0.6 | +0.4 | -2 | `REOPEN_PRESSURE` |
| **Mutual Aid Networks** | A white flag on the gate, and a neighbour who answers. | — | -3 | +0.1 | +0.7 | +3 | `MUTUAL_AID` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Name the Price Gougers** | Publish every doubled price. | — | -2 | -0.2 | +0.2 | +2 | — |
| **Join the National Recovery Council** | Fight for a green recovery from inside the room. | — | -3 | +0.3 | +0.4 | +5 | — |
| **Map Clean Air and Health Data** | Prove what clean air is worth in lives. | — | -1 | — | +0.2 | +3 | `EVIDENCE_3` |

**Sample headlines:** *Recovery aid tied to emissions cuts* · *Cash lands in every account by Friday* · *Nationwide lockdown declared* · *Group pledges no layoffs through the crisis* · *Essential goods prices double* · *Factories retooled for medical supplies*

#### R3B — “The Long Haze”

> Peat and plantation fires push the air pollution index past 300 for eleven straight days. Schools shut. Respiratory admissions triple. Half the smoke comes from across the border and half of it does not.

**Shock:** growth -0.66 · happiness -0.77 · emissions -3

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Transboundary Haze Act** | Our companies, liable for fires anywhere. | 1F | -12 | -0.4 | +0.5 | +6 | `HAZE_ACT` |
| **Diplomatic Protest Only** | A strongly worded note. Nothing else. | +1F | +2 | +0.3 | -0.5 | -2 | `DIPLOMACY_ONLY` |
| **Ban Open Burning and Enforce It** | Satellites, inspectors, and real prosecutions. | 2F | -10 | -0.1 | +0.5 | +8 | `BURN_BAN` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Audit the Whole Supply Chain** | Every concession, every supplier, published. | 3C | -13 | -0.3 | +0.5 | +10 | `SUPPLY_AUDIT` |
| **Deny Any Link** | Our concessions are clean. Prove otherwise. | +2C | +5 | +0.4 | -0.7 | -3 | `DENIAL` |
| **Fund Peatland Restoration** | Rewet the peat. It stops burning when it's wet. | 2C | -10 | +0.1 | +0.5 | +8 | `PEAT_RESTORED` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Buy Purifiers and Cope** | Seal the windows and wait for the wind. | — | -2 | +0.2 | -0.4 | — | — |
| **Demand School Compensation** | Eleven days of lost schooling has a price. | — | +1 | +0.1 | +0.5 | -1 | — |
| **Neighbourhood Clean Air Shelters** | Community halls, filters, open to everyone. | — | -3 | +0.1 | +0.6 | +4 | `CLEAN_AIR_SHELTERS` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Publish the Concession Maps** | Overlay the fires on the ownership records. | — | -4 | -0.3 | +0.3 | +4 | — |
| **Join the Regional Haze Panel** | Slow, diplomatic, and the only thing that crosses borders. | — | -4 | +0.2 | +0.4 | +6 | — |
| **Citizen Air Sensor Network** | Two thousand sensors nobody can argue with. | — | -1 | — | +0.3 | +3 | `EVIDENCE_3`<br>`CITIZEN_SCIENCE` |

**Sample headlines:** *Companies made liable for fires abroad* · *Foreign ministry issues strongly worded note* · *Satellite enforcement of burning ban begins* · *Group publishes concession-level audit* · *Plantation giant denies fire link* · *RG 800m peatland restoration fund launched*

#### R3C — “Fever Season”

> A record dengue and heat-illness year. Hospitals overwhelmed in the same weeks as a 38-degree heatwave. Outdoor workers are dying and nobody is counting them properly.

**Shock:** growth -0.65 · happiness -0.78

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **National Heat and Health Plan** | Cooling centres, warning system, hospital surge capacity. | 2F | -9 | +0.2 | +0.6 | +8 | `HEAT_PLAN` |
| **Emergency Hospital Funding Only** | Treat the sick. Leave the causes for later. | 1F | +1 | +0.3 | +0.2 | -1 | — |
| **Mandatory Outdoor Work Rules** | No outdoor work above 36 degrees. Enforced. | 1F | -11 | -0.6 | +0.4 | +5 | `WORK_RULES` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Shade, Water and Shifted Hours** | Rebuild every site around the heat. | 2C | -8 | -0.2 | +0.7 | +6 | `WORKER_CARE` |
| **Push Back on Work Rules** | Warn that the rules will cost jobs. | +2C | +5 | +0.6 | -0.6 | -3 | `LOBBIED_RULES` |
| **Fund the Urban Cooling Programme** | Trees, white roofs, shaded walkways. | 2C | -11 | +0.1 | +0.5 | +8 | `URBAN_COOLING` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Community Fogging and Clean-Up** | Every weekend, every drain. | — | -4 | -0.1 | -0.1 | +2 | — |
| **Demand Free Healthcare Expansion** | Nobody should pay to survive a heatwave. | — | +2 | +0.1 | +0.6 | -1 | — |
| **Plant the Neighbourhood Canopy** | Three hundred thousand trees, street by street. | — | -5 | +0.1 | +0.5 | +5 | `CANOPY` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Publish the Heat Death Count** | Six hundred deaths nobody recorded. | — | -3 | -0.3 | +0.2 | +3 | — |
| **Join the Health Adaptation Board** | Write the standards instead of protesting them. | — | -4 | +0.2 | +0.4 | +6 | — |
| **Train Community Health Volunteers** | Five thousand people who know the warning signs. | — | -1 | +0.1 | +0.3 | +3 | `EVIDENCE_3`<br>`CITIZEN_SCIENCE` |

**Sample headlines:** *First national heat-health plan launched* · *Extra beds funded, causes left untouched* · *Outdoor work banned above 36 degrees* · *Group shifts outdoor work to dawn* · *Industry warns work rules will cost jobs* · *Corporate fund to cool the city centre*


---

### ROUND 4 · THE ELECTION

#### R4A — “The General Election”

> Parliament dissolves. Eleven days of campaigning. Every choice made in the last three rounds is now a poster, a meme, or a scandal.

**Shock:** growth -0.09 · happiness -0.17

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Run on the Green Manifesto** | Stake the whole campaign on the transition. | 2F | -12 | +0.3 | +0.5 | +12 | needs 3+ Trust<br>`GREEN_MANDATE` |
| **Promise Cheap Everything** | Fuel, food, electricity. Frozen. Guaranteed. | 3F | +6 | +0.7 | +0.9 | -5 | `POPULIST_PLEDGE` |
| **Quiet Campaign, Keep the Lights On** | Promise nothing. Survive. | 1F | -3 | +0.2 | — | +2 | — |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Fund the Green Coalition** | Put our money behind the transition candidates. | 2C | -6 | +0.2 | +0.2 | +6 | `POLITICAL_ALLY` |
| **Fund Whoever Protects Us** | Buy the policy environment we need. | +2C | +4 | +0.5 | -0.3 | -4 | `REGULATORY_CAPTURE` |
| **Stay Neutral, Publish the Transition Plan** | No donations. Just a credible plan, in public. | 1C | -7 | +0.1 | +0.3 | +6 | `TRANSPARENT` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Vote for the Long Term** | Accept short-term cost for a liveable country. | — | -5 | -0.2 | — | +5 | `LONGTERM_MANDATE` |
| **Vote for My Wallet** | The bills are due now. The sea level is not. | — | +3 | +0.5 | +0.6 | -3 | `WALLET_MANDATE` |
| **Field Independent Local Candidates** | If none of them represent us, we'll stand ourselves. | — | -3 | — | +0.5 | +4 | `LOCAL_POWER` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Score Every Candidate, Name and Shame** | A climate scorecard for all 222 seats. | — | -3 | -0.2 | +0.1 | +4 | — |
| **Negotiate Manifesto Commitments** | Trade our endorsement for binding pledges. | — | -5 | +0.2 | +0.3 | +7 | `MANIFESTO_DEAL` |
| **Get Out the Youth Vote** | Register everyone under thirty. | — | -2 | +0.1 | +0.4 | +4 | `YOUTH_WAVE` |

**Sample headlines:** *Minister stakes election on green manifesto* · *Government promises to freeze the cost of living* · *A quiet campaign, and a quiet result* · *Business backs the green coalition* · *Donations flow to the anti-regulation bloc* · *Group publishes its full transition plan*

#### R4B — “The Perindu By-Election”

> One industrial seat. A refinery town where 8,000 jobs depend on the thing everyone says must close. The whole country is watching a constituency of 41,000 people.

**Shock:** growth -0.09 · happiness -0.17

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Announce a Just Transition Fund** | RG 2bn. No worker left behind, in writing. | 2F | -11 | +0.3 | +0.6 | +11 | needs 3+ Trust<br>`GREEN_MANDATE`<br>`JUST_TRANSITION` |
| **Guarantee the Refinery Stays Open** | Say the words the town wants to hear. | 2F | +6 | +0.6 | +0.7 | -5 | `POPULIST_PLEDGE` |
| **Say Nothing and Hope** | Let the local candidate carry it. | +1F | — | +0.1 | -0.3 | — | — |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Commit to Retraining Every Worker** | Eight thousand people, guaranteed a next job. | 3C | -10 | +0.2 | +0.7 | +9 | `RETRAIN_PLEDGE` |
| **Threaten Closure If Regulated** | Make the cost of regulating us politically fatal. | +2C | +4 | +0.4 | -0.6 | -4 | `REGULATORY_CAPTURE` |
| **Announce a Green Industrial Park** | Same site, same workers, different century. | 2C | -9 | +0.4 | +0.5 | +8 | `GREEN_PARK`<br>`TRANSPARENT` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Vote on the Climate Issue** | The refinery poisoned this town for forty years. | — | -5 | -0.2 | — | +5 | `LONGTERM_MANDATE` |
| **Vote on Jobs** | Eight thousand paycheques beat any manifesto. | — | +3 | +0.5 | +0.6 | -3 | `WALLET_MANDATE` |
| **Organise a Workers' Assembly** | The workers write the transition plan themselves. | — | -3 | +0.1 | +0.5 | +4 | `WORKER_POWER`<br>`LOCAL_POWER` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Campaign on the Ground** | Twenty thousand doors in eleven days. | — | -3 | -0.2 | +0.1 | +4 | — |
| **Broker a Worker-Green Alliance** | Unions and greens, in one room, finally. | — | -6 | +0.2 | +0.5 | +8 | `MANIFESTO_DEAL` |
| **Publish the Just Transition Costing** | Show that keeping it open costs more. | — | -2 | +0.1 | +0.3 | +4 | `YOUTH_WAVE` |

**Sample headlines:** *RG 2bn fund promises no worker left behind* · *Minister: 'The refinery is not closing'* · *Government silent as Perindu votes* · *Every refinery worker guaranteed a new job* · *Group warns: regulate us and we leave* · *Perindu to host the region's first green park*

#### R4C — “The Coalition Wobble”

> Four MPs cross the floor at 11pm. The government survives by two votes. Nothing can pass without buying somebody, and everyone knows it.

**Shock:** growth -0.14 · happiness -0.14

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Buy Support with Green Investment** | Win the rebels back with clean projects in their seats. | 3F | -12 | +0.2 | +0.4 | +12 | needs 3+ Trust<br>`GREEN_MANDATE` |
| **Buy Support with Contracts** | The old way. It works. | 3F | +6 | +0.6 | -0.2 | -5 | `POPULIST_PLEDGE`<br>`PATRONAGE` |
| **Call a Confidence Vote** | Gamble everything on one afternoon. | +1F | — | -0.3 | +0.2 | +1 | — |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Publicly Demand Policy Certainty** | Tell them plainly: we cannot invest in chaos. | 1C | -8 | +0.3 | +0.3 | +7 | `TRANSPARENT` |
| **Back Stability at Any Price** | Whoever governs, we fund. | +2C | +4 | +0.6 | -0.2 | -3 | `REGULATORY_CAPTURE` |
| **Lobby the Defectors** | Four people. Four conversations. | +1C | +3 | +0.3 | -0.5 | -3 | `LOBBY_SCANDAL` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Accept the Deal for Stability** | Just let them govern. | — | -4 | +0.3 | -0.2 | +3 | — |
| **Demand a Fresh Election** | A million signatures in nine days. | — | +1 | -0.3 | +0.4 | — | — |
| **Petition for a Fixed Climate Law** | Something no coalition can undo. | — | -5 | — | +0.5 | +6 | `LOCAL_POWER`<br>`CLIMATE_LAW_PUSH` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Occupy Parliament Square** | Tents until they commit. | — | -3 | -0.4 | — | +4 | — |
| **Extract Cross-Party Commitments** | Every faction signs, or none of them govern. | — | -6 | +0.2 | +0.4 | +8 | `MANIFESTO_DEAL` |
| **Publish the Lobbying Register** | Who met whom, and when. | — | -2 | — | +0.3 | +4 | `YOUTH_WAVE` |

**Sample headlines:** *Rebels won over with clean investment* · *Contracts flow to the seats that mattered* · *Minister gambles on a confidence vote* · *CEOs demand a climate law they can plan around* · *Business backs whoever can govern* · *Leaked messages show lobbying of defectors*


---

### ROUND 5 · THE POLLUTION CRISIS

#### R5A — “The Poisoned Reservoir”

> At 3am a tanker discharges solvent waste into Sungai Jernih. By dawn the treatment plants are shut. Four million people have no water for six days.

**Shock:** growth -0.34 · happiness -0.59

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Emergency Clean-Up plus a New Water Act** | Fix the river and change the law in the same week. | 2F | -8 | -0.2 | +0.6 | +7 | blocked by `POPULIST_PLEDGE`<br>`WATER_LAW` |
| **Blame, Fine, Move On** | Name a company. Issue a fine. Change the subject. | 0 | +1 | +0.2 | -0.2 | — | `COVER_UP` |
| **Nationalise the Water Utility** | Water is not a business. | 3F | -5 | -0.4 | +0.7 | +5 | `WATER_PUBLIC`<br>`WATER_LAW` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Own It - Pay for Full Restoration** | Before anyone asks. Every Ringga of it. | 3C | -9 | -0.5 | +0.8 | +8 | `ACCOUNTABLE` |
| **Deny and Litigate** | Our discharge was within permit. See you in court. | +1C | +3 | +0.3 | -0.8 | -3 | `DENIAL` |
| **Lead an Industry-Wide Discharge Standard** | Every plant on the river, one standard, monitored. | 2C | -10 | -0.1 | +0.4 | +8 | `INDUSTRY_PACT` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Ration and Endure** | Buckets, tankers, and six days of queueing. | — | -3 | -0.1 | -0.4 | +1 | — |
| **Class Action and Street Protest** | Four million plaintiffs. | — | -1 | -0.3 | +0.3 | +3 | `LAWSUIT` |
| **Citizen River Watch** | Two thousand volunteers. Every outfall photographed. | — | -4 | — | +0.6 | +5 | `RIVER_WATCH` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Leak the Discharge Records** | Eight years of records nobody was meant to see. | — | -5 | -0.4 | +0.2 | +5 | ×1.5 with `EVIDENCE_3` |
| **Broker the Clean Water Accord** | Get everyone in a room and don't leave until it's signed. | — | -6 | +0.1 | +0.5 | +7 | — |
| **Train Citizen Scientists** | Give people the kit to test their own water. | — | -2 | — | +0.3 | +4 | `CITIZEN_SCIENCE` |

**Sample headlines:** *Emergency clean-up and landmark Water Act* · *Operator fined RG 2m, case closed* · *State takes back the water utility* · *Company pays before it is asked to* · *Firm denies liability, heads to court* · *Industry adopts a shared discharge standard*

#### R5B — “The Landfill Fire”

> An illegal plastic and e-waste dump burns for nine days. Dioxin readings beside a primary school. The containers were imported legally, under a code nobody bothered to read.

**Shock:** growth -0.31 · happiness -0.61

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Ban Waste Imports and Enforce** | Close the border to other countries' rubbish. | 1F | -11 | -0.4 | +0.6 | +7 | blocked by `POPULIST_PLEDGE`<br>`WASTE_LAW` |
| **Fine the Operator Only** | One company, one fine, done. | 0 | +1 | +0.2 | -0.3 | — | `COVER_UP` |
| **National Recycling Infrastructure** | Twelve regional plants. Build the thing we lack. | 2F | -9 | +0.2 | +0.5 | +9 | `RECYCLING_BUILT` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Take Back Our Own Packaging** | We made it. We collect it. | 3C | -10 | -0.3 | +0.7 | +9 | `ACCOUNTABLE` |
| **Blame the Importers** | Not our waste. Not our problem. | +1C | +3 | +0.3 | -0.7 | -3 | `DENIAL` |
| **Build a Domestic Recycling Plant** | Turn the problem into a business. | 2C | -11 | +0.1 | +0.4 | +8 | `INDUSTRY_PACT` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Separate Waste at Source** | Three bins in every kitchen. | — | -4 | -0.1 | -0.2 | +3 | — |
| **Blockade the Landfill Road** | Not one more lorry. | — | -1 | -0.3 | +0.4 | +3 | `LAWSUIT` |
| **Neighbourhood Zero-Waste Scheme** | Cut what we send, by seventy percent. | — | -5 | — | +0.6 | +5 | `CITIZEN_MONITORING` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Trace the Containers** | Follow every container back to its port of origin. | — | -5 | -0.4 | +0.3 | +5 | ×1.5 with `EVIDENCE_3` |
| **Join the Waste Policy Review** | Co-chair the review that rewrites the code. | — | -6 | +0.1 | +0.5 | +7 | — |
| **Run School Air Quality Testing** | Children's data is hard to ignore. | — | -2 | — | +0.3 | +4 | `CITIZEN_SCIENCE` |

**Sample headlines:** *Border closed to foreign plastic waste* · *Operator fined, case closed* · *Twelve regional recycling plants announced* · *Producer take-back scheme launched* · *Industry: 'Not our waste, not our problem'* · *First large-scale domestic recycler breaks ground*

#### R5C — “The Dead Coast”

> An effluent plume kills the fisheries off Pulau Manis. Twelve resorts cancel their season. Three thousand fishing families have no income and no proof of who did it.

**Shock:** growth -0.40 · happiness -0.56

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Marine Protection Zone and Compensation** | A new marine park and RG 400m for the families. | 2F | -8 | -0.2 | +0.7 | +7 | blocked by `POPULIST_PLEDGE`<br>`MARINE_LAW` |
| **Reopen the Beaches Quickly** | The season is worth more than the argument. | +1F | +2 | +0.4 | -0.4 | -2 | `COVER_UP` |
| **Mandatory Effluent Monitoring for All** | Every coastal outfall, live, public. | 1F | -12 | -0.4 | +0.5 | +7 | `MONITORING_LAW` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Fund the Fishermen and Fix the Outfall** | Pay first, argue never. | 3C | -9 | -0.4 | +0.8 | +8 | `ACCOUNTABLE` |
| **Dispute the Science** | Our experts disagree with their experts. | +1C | +3 | +0.3 | -0.8 | -3 | `DENIAL` |
| **Finance a Coastal Restoration Bond** | RG 1bn, repaid by the tourism that comes back. | 2C | -11 | +0.1 | +0.5 | +8 | `INDUSTRY_PACT` |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Accept Compensation and Move On** | Take the payout. Find other work. | — | -3 | +0.1 | -0.3 | +1 | — |
| **Occupy the Jetty** | Three hundred boats across the shipping lane. | — | -1 | -0.4 | +0.4 | +3 | `LAWSUIT` |
| **Community-Run Marine Monitoring** | The fishermen become the early warning system. | — | -4 | — | +0.6 | +5 | `CITIZEN_MONITORING` |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Publish the Plume Modelling** | Independent science, pinpointing the outfall. | — | -5 | -0.4 | +0.2 | +5 | ×1.5 with `EVIDENCE_3` |
| **Negotiate the Coastal Accord** | Industry, villages, and the state, on one page. | — | -6 | +0.1 | +0.5 | +7 | — |
| **Train the Fishing Communities** | Teach three thousand people to test their own water. | — | -2 | — | +0.4 | +4 | `CITIZEN_SCIENCE` |

**Sample headlines:** *New marine park and RG 400m in compensation* · *Beaches declared safe; scientists disagree* · *Every coastal outfall to be monitored live* · *Company pays fishing families within a week* · *Firm's experts dispute the plume findings* · *RG 1bn coastal restoration bond issued*


---

### ROUND 6 · THE NATURAL DISASTER

#### R6A — “The Great Monsoon Flood”

> Four days of continuous rain. Eight states under water. 90,000 displaced, 43 dead, RG 12 billion in damage. The rescue boats are mostly private, mostly volunteer, mostly late.

**Shock:** growth -1.16 · happiness -0.77

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **National Resilience Plan** | Flood defences, early warning, rebuilt drainage. | 2F | -10 | +0.4 | +0.8 | +9 | — |
| **Emergency Payouts Only** | Money now. Questions never. | 2F | +2 | +0.5 | +0.5 | -2 | — |
| **Declare a Climate Emergency** | A binding 2050 law, passed in a week. | 3F | -16 | -0.3 | +0.3 | +14 | needs 2+ Trust<br>×1.5 with `GREEN_MANDATE`<br>`CLIMATE_LAW` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Fund the Rebuild - Build Back Green** | Rebuild it better than it was. | 3C | -12 | +0.3 | +0.8 | +10 | — |
| **Claim the Insurance and Relocate** | This country is becoming uninsurable. | +2C | +3 | -0.6 | -0.7 | -4 | — |
| **Restore the Mangroves and Catchment** | Nature does flood defence cheaper than concrete. | 2C | -9 | +0.1 | +0.6 | +8 | — |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Rebuild Exactly Where We Were** | This is home. It has always flooded. | — | +2 | +0.3 | +0.2 | -1 | — |
| **Managed Relocation to Safer Ground** | Leave the floodplain. It will not stop. | — | -5 | -0.3 | -0.2 | +5 | — |
| **The Community Flood Corps** | Trained volunteers, boats, radios, in every district. | — | -4 | +0.2 | +0.8 | +5 | — |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Sue the State for Climate Negligence** | Make the failure legally binding. | — | -6 | -0.5 | -0.1 | +6 | — |
| **Sign the 2050 National Accord** | Everyone at one table, one signature. | — | -8 | +0.3 | +0.6 | +9 | — |
| **Hand Over the Roadmap** | Ten years of work, given away for free. | — | -4 | +0.2 | +0.4 | +7 | ×2 with 2+ EVIDENCE |

**Sample headlines:** *National resilience plan announced* · *Emergency payouts reach flood victims* · *Parliament declares a climate emergency* · *Industry funds a green rebuild* · *Major employer announces offshore move* · *Mangrove and catchment restoration funded*

#### R6B — “The Long Dry”

> Nine months without meaningful rain. Reservoirs at 21%. Rationing in four states, hydro output halved, and a rice harvest that simply did not happen.

**Shock:** growth -1.16 · happiness -0.77

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **National Water Security Programme** | Pipes, storage, leak repair, and a plan that lasts. | 2F | -10 | +0.4 | +0.8 | +9 | — |
| **Cloud Seeding and Emergency Imports** | Fly the planes. Buy the rice. | 2F | +2 | +0.4 | +0.5 | -2 | — |
| **Permanent Water Pricing Reform** | Price water like it matters. Because it does. | 3F | -16 | -0.4 | +0.3 | +14 | needs 2+ Trust<br>×1.5 with `GREEN_MANDATE`<br>`CLIMATE_LAW` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Cut Industrial Water Use by Half** | Nine weeks. Every plant. | 3C | -12 | +0.2 | +0.8 | +10 | — |
| **Buy Priority Water Access** | We can outbid a rice farmer. | +2C | +3 | -0.5 | -0.8 | -4 | — |
| **Fund Catchment Reforestation** | Half a million hectares. It rains where forests are. | 2C | -9 | +0.1 | +0.6 | +8 | — |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Strict Household Rationing** | Two hours of water a day, and no complaints. | — | -4 | -0.3 | -0.2 | +4 | — |
| **Protest the Industrial Allocation** | Why do they have water and we don't? | — | +1 | -0.3 | +0.4 | +2 | — |
| **Rainwater Harvesting Everywhere** | A tank on every roof in ninety days. | — | -4 | +0.2 | +0.8 | +5 | — |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Expose Who Gets the Water** | Forty percent goes to twelve companies. | — | -6 | -0.5 | -0.1 | +6 | — |
| **Join the Water Allocation Council** | Rewrite the rules from inside. | — | -8 | +0.3 | +0.6 | +9 | — |
| **Publish the Basin Recovery Plan** | A way back, costed and ready. | — | -4 | +0.2 | +0.4 | +7 | ×2 with 2+ EVIDENCE |

**Sample headlines:** *Nationwide water security programme begins* · *Planes seed clouds as reservoirs fall* · *Water priced properly for the first time* · *Industry halves its water draw in nine weeks* · *Firms outbid farmers for what's left* · *Half a million hectares to be replanted*

#### R6C — “The Hillside”

> After three days of rain a hillside above a new township gives way. Thirty-one dead. The development approval was signed four years ago by someone who is in this room.

**Shock:** growth -1.16 · happiness -0.77

| 🏛 GOVERNMENT | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Halt Hillside Development and Review** | Every approval frozen. Every slope re-surveyed. | 2F | -10 | +0.4 | +0.8 | +9 | — |
| **Compensate Victims and Continue** | Pay the families. Keep building. | 2F | +2 | +0.5 | +0.5 | -2 | — |
| **National Land Use and Slope Law** | The law we should have passed a decade ago. | 3F | -16 | -0.3 | +0.3 | +14 | needs 2+ Trust<br>×1.5 with `GREEN_MANDATE`<br>`CLIMATE_LAW` |

| 🏭 BUSINESS | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Full Compensation and Independent Audit** | Open the books. All of them. | 3C | -12 | +0.3 | +0.8 | +10 | — |
| **Defend the Approval Process** | Every approval was lawful. | +2C | +3 | -0.6 | -0.7 | -4 | — |
| **Fund Nationwide Slope Stabilisation** | Fix the eight hundred slopes like this one. | 2C | -9 | +0.1 | +0.6 | +8 | — |

| 🏘 COMMUNITY | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Accept Resettlement** | New homes, flat ground, no view. | — | -5 | -0.3 | -0.2 | +5 | — |
| **Occupy the Development Site** | Nobody builds above us again. | — | +1 | -0.3 | +0.4 | +1 | — |
| **Community Hazard Mapping** | Map every dangerous slope in the country. | — | -4 | +0.2 | +0.8 | +5 | — |

| ✊ ACTIVIST | What it is | Cost | E | G | H | 🌱 | Sets / gates |
|---|---|---|---|---|---|---|---|
| **Publish the Approval Documents** | Every signature, every date. | — | -6 | -0.5 | -0.1 | +6 | — |
| **Co-Write the New Planning Code** | Build the rules that stop the next one. | — | -8 | +0.3 | +0.6 | +9 | — |
| **Train Community Slope Monitors** | People who can see it coming. | — | -4 | +0.2 | +0.4 | +7 | ×2 with 2+ EVIDENCE |

**Sample headlines:** *Every hillside approval frozen* · *Compensation paid, projects continue* · *Landmark land use act passes in a week* · *Developer opens its books to independent audit* · *'Every approval was lawful,' says developer* · *Industry funds slope works across eight states*

---

## PART 8 — THE SCREENS

### The Dashboard — TV or projector, seen by everyone

```
┌──────────────────────────────────────────────────────────────┐
│  JOURNEY TO NET ZERO          ROUND 4 of 6      ⏱ 01:29      │
├──────────────────────────────────────────────────────────────┤
│    🌍 EMISSIONS      📈 GROWTH       😊 HAPPINESS            │
│      248 Mt            4.8%             6.4                  │
│    ▓▓▓▓▓▓▓░░░       ▓▓▓▓▓▓▓▓░░       ▓▓▓▓▓▓░░░░              │
│    target 200        avg 4.6         target 7.0              │
│                                                              │
│    🌱 GREEN ECONOMY SHARE   38%   ▓▓▓▓░░░░░░                 │
│    Every 1% of growth now adds 1.9 Mt of carbon.             │
├──────────────────────────────────────────────────────────────┤
│  🏛 ● locked   🏭 ○ thinking   🏘 ● locked   ✊ ○ thinking    │
├──────────────────────────────────────────────────────────────┤
│  📰 "Minister pledges landmark green manifesto"              │
│     "Sawit Prima stays silent on political funding"          │
├──────────────────────────────────────────────────────────────┤
│  📉 ON CURRENT PATH, SEMENANJARA REACHES 2050 AT: 231 Mt     │
└──────────────────────────────────────────────────────────────┘
```

- **Lock indicators** create visible social pressure. The last person to lock should feel three people looking at them.
- **The 2050 projection** updates live and is the most motivating element on screen — watching it crawl from 260 toward 200 is genuinely thrilling.
- **The Reckoning:** cards flip one at a time, ~3 seconds apart, meters animating between each. Never reveal all four at once. The gap is where the drama lives.
- **News ticker:** every option carries a pre-written headline string. Cheap to build, enormous for atmosphere.
- **Promise board:** public pledges stay on screen all round. When one breaks, the dashboard flashes **PROMISE BROKEN**. Let the room react.
- **Coalition Bonus** needs its own moment. It is the game's core message made visible.

The dashboard is a **broadcast**, not an admin panel. If it ends up looking like a control room, the session dies.

### The Phone — progressive web app, 4-letter room code

**Setup:** join → role card → private goal selection (three cards, sealed) → four primer cards maximum.

**Each round:** crisis brief with one private line → Insider Tip overlay if dealt → THE TABLE with Offer / Promise / Demand / Spotlight / Public Mandate → three option cards → locked, look up → brief round result.

Option cards show title, one line, cost, and a plain-English trade-off hint — *"Expensive. The public will love you. The Activist will not."* **Never show raw numbers.** Players should be making judgement calls, not spreadsheet calls.

Design so every second on the phone is a second not spent negotiating. The phone is a control surface; the game happens in the room.

---

## PART 9 — RUNNING IT AS A TRAINING SESSION

**30-minute version:** 3 setup · 24 play · 3 results. Fast, loud, slightly chaotic. Good conference session.

**45-minute workshop version (recommended):** 5 setup and role briefing · 30 play with 5-minute rounds · 10 structured debrief.

### The facilitator's four moments
1. **After Round 1 reveal** — "Did anyone make a promise? Did anyone keep it?"
2. **After the health crisis** — in R3A emissions fall 8 Mt for free while everything else collapses. "Is that success?" The cheapest, clearest lesson in the game.
3. **Before Round 4 choices** — read the Government's Trust total aloud. "This number was decided three rounds ago."
4. **After the final reveal** — five seconds of silence before the debrief. Let it land.

### The debrief — 10 minutes, five questions
1. **Who did you need most, and did you tell them?**
2. **What's the one thing you gave up?**
3. **Which promise mattered more — the one kept or the one broken?**
4. **Round 6 was easier or harder because of something you did in Round 2. What was it?**
5. **In your real job, which of these four are you? And who do you never talk to?**

### Learning outcomes
- Systems thinking: growth, carbon and wellbeing are one system, not three
- Stakeholder empathy: every position is rational from inside it
- Negotiation and coalition-building under time pressure
- Path dependency and lock-in — why "we'll deal with it later" is expensive
- Decoupling: it isn't about growing less, it's about growing differently

---

## PART 10 — BUILD NOTES

### Architecture
- **Dashboard:** web app, big screen, WebSocket
- **Phones:** PWA, 4-letter room code. No app store, no login, no install.
- **Server:** authoritative room state. Clients are thin renderers. All logic server-side so nobody can inspect the numbers.
- **Content:** JSON, strictly separate from engine code. This is what makes Singapore, corporate and schools variants cheap later.
- **Resilience:** every client must survive a disconnect and rejoin mid-round. If a player fails to choose before the timer expires, auto-lock a default and continue. The session must never stall.

### Build order
1. Engine, state machine, one scenario. Play it on paper first.
2. Dashboard meters and the Reckoning animation. Get the drama right before anything else.
3. Phone choice flow.
4. Negotiation actions.
5. Legacy flags and Round 6 scaling.
6. Remaining scenarios.
7. Insider Tips.
8. Results, titles and Hollow Victory.

**Implement the Coalition Bonus early.** It carries the training message and it is the mechanic players notice discovering.

### The single most valuable test
Replay `engine.py` against a set of fixed seeds and assert the ported engine produces identical state. The resolution order is subtle and already correct.

### Playtesting checklist
- Does anyone finish a round with nothing to do? *That role is under-designed.*
- Does the room go quiet during THE TABLE? *The crisis isn't sharp enough.*
- Does everyone hit their private goal? *Tighten thresholds 20%.*
- Does anyone say "wait, can we do that?" *Good. That's a working negotiation game.*

### Expansion hooks
- **Facilitator console** — custom shocks and timer control. Pause, resume and step-to-next are built: `P` and `N` on the big screen, or the two buttons that fade in and out of its bottom corner, on every screen. What is left is the ability to reach into a round rather than only to stop it.
- **Session analytics** — which options get picked, which promises break, win rates by cohort. For a training business this is the second act: it lets you tell a client *"here is what your leadership team actually did."*
- **The Fifth Seat** — a Youth or Media player for larger groups
- **Corporate mode** — Board / Operations / Employees / Investors
- **Regional mode** — four countries instead of four stakeholders

---

## PART 11 — WHAT THE PLAYTESTING FOUND

The engine was implemented in Python, six agent policies written — Selfish, Cooperator, Balanced, Populist, Ideologue, Random — and roughly 200,000 games run across the scenario paths. The original rules **did not work**. Nine faults, worst first:

| # | Fault | Evidence |
|---|---|---|
| 1 | Government went bankrupt in Round 2 | 89.5% of games ended on zero Fiscal. It picked the do-nothing option for four straight rounds, silently disabling regulation, the trust gates and the climate law. |
| 2 | Happiness ran away to 10.0 by Round 4 | Miss rate 0.0%. It stopped being a target. |
| 3 | Green Share hit 75%+ mid-game | Carbon coupling fell to its floor, switching off the decoupling tension the game is built around. |
| 4 | Growth compounded unchecked | No mean reversion; a good Round 1 snowballed. |
| 5 | One defector made it unwinnable | Business alone could swing 57% of the carbon target. Three cooperators vs one defector won **0.0%**. |
| 6 | "Market Dominance" rewarded doing nothing | Optimal play was to hoard capital and never engage. |
| 7 | Activist had one real choice | Collaborate picked ~88% of the time in every scenario. |
| 8 | Community had one real choice | Same pattern. |
| 9 | Variants weren't equally hard | R3A was 23 points harder than R3C. |

Two of these were invisible to paper playtesting: the bankruptcy cascade, and the fact that **confronting a defector excluded you from the cooperation bonus** — the game was quietly punishing enforcement.

Every fix is documented in Part 5. The four that mattered most: the Treasury, hedonic adaptation, the marginal abatement curve, and the Public Mandate veto.

---

## PART 12 — MEASURED OUTCOMES

| How the table plays | Win rate | What it means |
|---|---|---|
| Everyone selfish | **0.0%** | Four rational actors, one dead country |
| Everyone populist | **8.9%** | Keeping people happy today isn't the same as keeping them alive |
| Four different agendas | **1.3%** | The most realistic table, and the hardest lesson |
| Three cooperate, Business defects | **23.8%** | Hard, and recoverable — with regulation and a veto |
| Three cooperate, Government defects | **14.2%** | Harder. Nobody can substitute for public investment |
| Everyone cooperates | **83.9%** | It works |
| Mixed tables overall | **22.0%** | The realistic baseline for a training room |

**All three targets bind.** Mixed tables miss carbon 24% of the time, growth 74%, happiness 23%. Growth is tightest — you cannot shrink your way to net zero, which is the point.

**Variant fairness:** win rates sit within 13 points across variants of a round, and within 1.6 points in Round 6.

### Two findings worth putting in your debrief

**Pragmatists beat zealots.** All-Balanced tables (97.1%) outperform All-Cooperator (83.9%), and All-Ideologue — who optimise carbon above everything — win **0.1%**, because they destroy growth to reach 138 Mt. Perfect environmental play loses the game.

**Defection is asymmetric.** A defecting Community (66.7%) or Activist (37.8%) is survivable. A defecting Government (14.2%) or Business (23.8%) is close to fatal. The two actors who control money and emissions hold disproportionate power. Say that out loud in the room.

---

## PART 13 — KNOWN ISSUES

Honest list of what is not fully solved:

1. **All-Balanced wins 97.1%** — high. A table of four sensible players almost always succeeds. Arguably the right lesson; tighten by moving the emissions target to 190 Mt if you want more tension.
2. **Community's Self-Organise remains dominant** (85–89% in five scenarios) despite volunteer fatigue. Widen the numbers on Adapt and Demand Relief in those five.
3. **Three variants sit 5–10 points off pace** — R1C, R2A and R5A are the hardest. Playable, not perfect.
4. **Insider Tips are untested in simulation.** Low mechanical impact by design, but verify in live play.
5. **The agents are cruder than humans.** They cannot bluff, form conditional deals, or break promises — the three things that make this game worth playing. Real win rates will differ. The negotiation layer needs human playtesting that no simulation can substitute for.

**Before commissioning the build, run one paper session with four humans.** `how-to-play.html` is sufficient to do that without writing any code.

---

*The most important number in this game is not zero. It's the number of times someone at that table says "okay — what if we both did it?" Build for that sentence, and the rest works.*
