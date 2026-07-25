# Journey to Net Zero — Game Design Document

**Version:** 0.2 (for review — not yet implemented)
**Format:** 4 players, one shared big screen, ~30 minutes, in person
**Setting:** Malaysia, 2026 → 2050
**Content basis:** every scenario is anchored to a verified fact in
[`RESEARCH.md`](./RESEARCH.md)

---

## 1. The premise

Four stakeholders share one country and three national outcomes they are all
judged on. None of them can move all three alone. Each also carries a private
pressure that pulls against the collective good.

The game is won or lost together on the national scorecard — but every player
also walks away knowing whether they personally survived. That gap is the
lesson.

> **There is no optimal path.** Every action trades one national indicator
> against another. The game is designed so that a table which never argues
> will score badly.

---

## 2. The three national indicators

All three must move in the right direction by 2050. They are shown at all
times on the dashboard and on every phone.

| Indicator | Starts | Direction | What it represents |
|---|---|---|---|
| **Economy** | 50 | must grow | GDP growth, investment, export competitiveness, fiscal health |
| **Emissions** | 100 | must fall | National GHG output, indexed to 2026 = 100. Net zero = 0 |
| **Living Standards** | 50 | must rise | Cost of living, jobs, health, energy access, public trust |

**2050 thresholds:**

- Economy ≥ 60 — the economy grew
- Emissions ≤ 30 — a ~70% cut in gross emissions, small enough for land sinks
  and removals to close the gap. That is what net zero means in practice.
- Living Standards ≥ 60 — citizens are better off

**These are calibrated, not guessed.** `scripts/balance.ts` runs archetypal
tables through all eight rounds; `npx tsx scripts/balance.ts` reproduces this:

| Table | Economy | Emissions | Living | Result |
|---|---|---|---|---|
| Everyone self-interested | 47 | 142 | 53 | **0/3** — rich in nothing, burning |
| Everyone collective | 38 | 15 | 52 | **1/3** — *Clean, But Poorer* |
| Everyone barters | 93 | 0 | 91 | **3/3** — the only route to all three |
| Business defects | 64 | 77 | 35 | 1/3 |
| Coast, then act from round 5 | 92 | 34 | 85 | 2/3 — too late on emissions |
| Act early, then coast | 61 | 39 | 69 | 2/3 — momentum lost |

Realistic mixed tables average 0.33 (cautious), 0.67 (cooperative) and 1.83
(deal-making) out of three. **Trading is what separates them** — a table that
only sacrifices lands the clean-but-poorer ending, and a table that only
defends its corner takes nothing at all. That result is the entire argument of
the game, and it falls out of the numbers rather than being asserted.

Emissions added early are weighted to be harder to remove later, so coasting
through the opening rounds and bartering hard from round five cannot win.

---

## 3. The four roles

Each role holds one **influence currency**. Currency is the bartering
instrument — it can be spent on your own actions or transferred to another
player to unlock theirs.

| Role | Currency | Starts | Earns by | Naturally wants |
|---|---|---|---|---|
| **Government** | Budget | 6 | Economic growth, taxes | Fiscal stability, staying elected |
| **Business** | Capital | 6 | Profitable rounds | Returns, policy certainty, cheap energy |
| **Community** | Mandate | 5 | Living standards rising | Affordable living, jobs, health |
| **Activist** | Pressure | 5 | Emissions falling, crises | Speed, accountability, no backsliding |

**Asymmetric powers** — each role can do one thing no one else can:

- **Government** — sets the rule for the round. Can *mandate* (force an
  outcome) once per game, overriding one other player's action.
- **Business** — the only role that can deploy capital at scale. Its actions
  have the largest raw effect on both Economy and Emissions.
- **Community** — grants **legitimacy**. Government actions that raise costs
  fail or are diluted without Community backing.
- **Activist** — can **escalate** once per game: forces a situation to
  reappear next round and doubles its stakes.

---

## 4. Hidden agendas

At setup each player privately draws **1 of 3** agendas for their role. Only
they see it. It is revealed at the end and scored separately.

Examples (each role has three; drawn at random for replayability):

- **Government** — *Re-election*: Living Standards must never fall two rounds
  in a row. / *Fiscal hawk*: never end a round with Budget at 0. / *Legacy*:
  personally deliver the single largest emissions cut of the game.
- **Business** — *Shareholders*: end with Capital ≥ 10. / *Pivot*: at least 4
  of your 8 actions must be low-carbon. / *Market share*: Economy must end
  above 70.
- **Community** — *Cost of living*: Living Standards must never drop below 40.
  / *Just transition*: no round where Economy rises while Living Standards
  falls. / *Voice*: successfully influence 3 deals.
- **Activist** — *Credibility*: never accept currency from Business. /
  *Urgency*: Emissions must be below 60 by round 5. / *Coalition*: complete 3
  deals with Community.

Agendas are the reason a player argues for something that looks irrational.
They create the bartering pressure that pure cooperation lacks.

---

## 5. Round structure

Eight rounds. Each round is roughly **3 minutes**, compressing three years.

Eight rounds. Each is roughly **3 minutes**. Round 1 opens on the situation
Malaysia is *actually in* as of July 2026 — not a hypothetical.

| Round | Year | Situation | Real anchor |
|---|---|---|---|
| 1 | 2026 | **The tax that keeps slipping** — the carbon tax on iron, steel and energy was shelved in April over the Middle East conflict and the Hormuz oil spike. The Climate Change Bill is on the table. Legislate now, or protect industry through the shock? | Carbon tax deferred Apr 2026; Climate Change Bill tabled 2026 |
| 2 | 2027 | **Election year** — GE16 must be called by early 2028 and Sarawak polls by April. BUDI95 holds RON95 at RM1.99 while the quota has already been cut to 200 litres. Excluding the T20 would save RM1.5bn a month — and cost votes. | GE16 due by Feb 2028; BUDI95 quota cut Apr 2026 |
| 3 | 2029 | **The data-centre reckoning** — Johor's pipeline is heading for 7,000 MW and could take 40% of the state's power by 2035, drawing 200× the water of ordinary industry. The grid can't deliver fast enough. Take the investment or set the limit? | 51 projects, USD44.3bn approved; grid delivery bottleneck |
| 4 | 2031 | **Peak or bust** — Malaysia promised the world its emissions would peak by 2030. 7 GW of coal is scheduled to retire by 2033. Hold the line, or keep the plants running for reliability and price? | NDC 3.0 peaking window 2029–2034; ~7 GW coal retiring |
| 5 | 2034 | **Smoke and the trade wall** — a severe haze season closes schools while EU deforestation rules lock out untraceable palm oil. Health, smallholders and exports pull three ways. | SIIA red haze outlook 2026; EUDR enforcement Dec 2026 |
| 6 | 2038 | **The petroleum cliff** — the dividend that padded every budget has been shrinking for a decade. Diversification worked on paper; now the gap is real. Who absorbs it? | PETRONAS dividend RM20bn 2026, −38%, lowest since 2017 |
| 7 | 2043 | **The water rises** — the modelled worst case arrives: a one-in-20-year flood on the back of a heatwave. Adaptation spending competes directly with mitigation momentum. | World Bank: >20% GDP hit in the modelled worst case |
| 8 | 2048 | **The last mile** — the cheap cuts are gone. Nuclear, carbon capture, hard-to-abate industry and land sinks. Everything left is expensive, slow or contested. | Nuclear in 13MP; unabated coal out by 2044; RE 70% by 2050 |

**A correction worth carrying into the design:** petroleum is a smaller share
of federal revenue than most people assume — 17.5% in 2025, down from 41.3% in
2009, with PETRONAS dividends specifically only 5–6% of 2026 revenue. Round 6
plays the *pressure* honestly rather than as a collapse. Getting this right
matters more than making the round dramatic.

### Phase timing within a round

```
  0:00  SITUATION      Card appears on dashboard + all phones          20s
  0:20  DISCUSSION     Table talks. Currency can be offered/moved.     90s
  1:50  LOCK IN        Each player privately selects 1 of 3 actions.   50s
  2:40  REVEAL         Dashboard flips all four simultaneously.        20s
  3:00  RESOLUTION     Meters animate. Synergies and clashes fire.     30s
```

**No facilitator required.** The four players run the session themselves. The
phase clock advances automatically, and any player can tap to extend the
discussion phase — real conversation should never be cut off mid-sentence. The
player who created the room can pause. That is the entire set of controls, and
nobody has to sit out to operate them.

---

## 6. Actions — the bartering engine

Every role gets **exactly 3 actions** per round, always in the same three
shapes. This is deliberate: players learn the grammar in round 1 and spend the
rest of the game on the substance.

1. **Self-serving** — cheap, protects your currency and your agenda, pushes
   cost onto the other three.
2. **Collective** — helps the national indicators, costs you currency and
   usually hurts your private agenda.
3. **Conditional** — the strongest option on the board, but **locked** until
   another player transfers you currency this round.

The conditional action is where the game lives. It cannot be taken alone. It
forces a conversation, a price, and a promise that may or may not be kept —
because currency transfers are binding but *action choices are not*. You can
take someone's Budget and still betray them. The dashboard will show everyone
that you did.

### Synergies and clashes

Certain combinations resolve non-linearly:

- **Aligned** (e.g. Government funds + Business deploys + Community backs) —
  effects amplified ~1.5×.
- **Cancelled** (e.g. Government mandates while Community withholds
  legitimacy) — the action is diluted or fails outright.
- **Backfire** (e.g. Activist escalates against a policy the public already
  supports) — reversed effect.

These are authored per round, not generic, so they teach the specific politics
of that situation.

---

## 7. Endgame

**The 2050 Report Card:**

1. The three indicators against their thresholds — one of several national
   outcomes, e.g. *Green Advanced Economy*, *Prosperous but Overheating*,
   *Clean but Poorer*, *Stalled Transition*.
2. Every hidden agenda revealed and scored — who quietly won, who sacrificed
   themselves.
3. **Turning points** — the 3 rounds where the trajectory changed most, with
   what each player chose. This is the facilitator's debrief material.

---

## 8. Technical design

**Stack**

- React 19 + TypeScript + Vite
- Tailwind CSS v4 — small, fast, consistent
- Zustand for client state
- Supabase (new dedicated project) — Postgres + Realtime for room sync
- Motion for animation, used sparingly on reveals and meters
- Netlify for hosting

**Sync model**

One `rooms` row keyed by a 4-letter code, one `players` row per seat, one
`rounds` row per round with the four locked actions. All clients subscribe to
Realtime changes on the room. The server is the referee: resolution is computed
once and written to the room, never computed on a phone. No player can see
another's selection until all four are locked.

**Routes**

- `/` — create or join a room
- `/play/:code` — the phone view (portrait, thumb-reachable, private info)
- `/board/:code` — the big-screen dashboard (landscape, read-only, no controls)

**Dashboard**

Dark, high-contrast, legible from across a room. Live meters, the round timer,
who has locked in, currency flows drawn as they happen, and the reveal moment.
It is the shared source of truth and the thing people point at while arguing.
Read-only — it carries no controls, so it can run on any screen with nobody
attending it.

**Retention**

Finished games are kept for **7 days** so a group can revisit the debrief,
then deleted automatically.

**Performance targets**

- Under 200 KB gzipped JS on the phone route
- First interaction under 2s on 4G
- Every state change under 150 ms end to end

---

## 9. Content integrity

Every situation is anchored to a verified fact recorded in
[`RESEARCH.md`](./RESEARCH.md), with a source link for each. That research pass
is **done** — it corrected several assumptions in v0.1 of this document:

- It is the **13th** Malaysia Plan (2026–2030), not the 12th
- The NDC is now an **absolute** emissions target (NDC 3.0, Oct 2025), not the
  old carbon-intensity-per-GDP target
- The carbon tax **has already been deferred**, in April 2026 — a live policy
  delay, better than any invented one
- **Nuclear is back** on the table via 13MP, which changes the endgame
- Petroleum is a **much smaller** share of federal revenue than commonly
  assumed, so the "oil cliff" round had to be rewritten honestly
- The 2026 haze risk is rated **red** — round 5 is a live forecast, not history

Each round's card will carry a small "the real story" footnote linking the
scenario to what actually happened, which is where most of the educational
value lands during the debrief.

---

## 10. Settled

- **No facilitator.** Four players run it themselves; the dashboard is
  read-only and unattended.
- **4 players required.** No 3-player mode with an automated role — the
  tension needs all four.
- **7-day retention** on finished games.

## 11. Still open

1. **Language** — English only, or English with a Bahasa Malaysia toggle?
   Default: English first, structured so BM can be added without rework.
2. **Round 5 scope** — haze and the EU trade wall are currently one round.
   They could be split into two, dropping the 2038 petroleum round. Default:
   keep them combined; the collision is the point.
