# Journey to Net Zero

A 30-minute strategy simulation for four players, about the road to net zero in
Malaysia between 2026 and 2050.

Four stakeholders — **Government**, **Business**, **Community**, **Activist** —
share three national outcomes they are all judged on. The economy must grow,
emissions must fall, and living standards must improve. No role can move all
three alone, and each carries a private agenda that pulls against the common
good.

There is no right answer. There is only what you are willing to trade, and who
you are willing to trust.

---

## How it plays

Everyone joins on their own phone with a four-letter code. A fifth screen — a
TV or projector — shows the shared board. **No facilitator is needed**; the four
players run the session themselves.

Each of the eight rounds compresses roughly three years and runs about three
minutes:

| | | |
|---|---|---|
| **Situation** | 20s | A real Malaysian scenario appears on every screen |
| **Discussion** | 90s | Talk across the table. Move currency to strike deals |
| **Lock in** | 50s | Each player privately picks one of three actions |
| **Reveal** | 20s | All four flip at once on the board |
| **Resolution** | 30s | Meters move, synergies and clashes fire |

Any player can add 45 seconds to a discussion. The board carries no controls at
all, so it can sit unattended.

### The three shapes

Every role gets the same three kinds of action each round, so the grammar is
learned once and the rest of the game is about substance:

- **Protect your own** — cheap, shields you, pushes the cost onto everyone else
- **Carry the cost** — helps the country, costs you, usually hurts your agenda
- **Needs a deal** — the strongest option, **locked until another player funds you**

That third one is the engine of the game. **Currency transfers are binding the
moment they are sent; action choices are not.** You can take someone's budget
and still betray them — and the board shows everyone that you did.

### The eight rounds

| Year | Situation |
|---|---|
| 2026 | **The Tax That Keeps Slipping** — the carbon tax, shelved in April over the Middle East conflict |
| 2027 | **Election Year** — GE16 looms and every subsidy is a campaign promise |
| 2029 | **The Data-Centre Reckoning** — Johor has approved more computing than its grid can carry |
| 2031 | **Peak Or Bust** — 7 GW of coal is scheduled to retire, and the peaking promise is due |
| 2034 | **Smoke And The Trade Wall** — haze closes the schools while EU rules close the market |
| 2038 | **The Petroleum Squeeze** — the dividend that quietly balanced every budget is shrinking |
| 2043 | **The Water Rises** — the modelled worst case: a one-in-twenty-year flood after a heatwave |
| 2048 | **The Last Mile** — nuclear, carbon capture, and everything expensive that is left |

Every scenario is anchored to a verified fact, with sources, in
[`RESEARCH.md`](./RESEARCH.md). Each round ends with a "the real story"
footnote linking the game to what actually happened — that is where most of the
learning lands during the debrief.

---

## Running it

```bash
npm install
npm run dev
```

Open `/` on each phone, and `/board/CODE` on the big screen.

### Useful URL flags

| Flag | Effect |
|---|---|
| `?local=1` | Keep rooms in this browser only, synced across tabs. Plays with **no network at all** — useful for a classroom with bad wifi, or for walking through it solo |
| `?fast=1` | Compress every timer 10×, so a full eight-round game runs in about three minutes |

Both persist for the tab once set, and can be combined.

### Commands

```bash
npm run dev         # development server
npm run build       # typecheck and production build
npm run balance     # replay archetypal tables through all eight rounds
npm run playthrough # drive a real four-player game in a browser
```

---

## Balance

The numbers are calibrated, not guessed. `npm run balance` replays archetypal
tables through all eight rounds:

| Table | Economy | Emissions | Living | Result |
|---|---|---|---|---|
| Everyone self-interested | 47 | 142 | 53 | **0/3** |
| Everyone collective | 38 | 15 | 52 | **1/3** |
| Everyone barters | 93 | 0 | 91 | **3/3** |
| Coast, then act from round 5 | 92 | 34 | 85 | 2/3 |

Realistic mixed tables average 0.33 (cautious), 0.67 (cooperative) and 1.83
(deal-making) out of three. **Trading is what separates them.** A table that
only sacrifices ends up clean and poor; a table that only defends its own
corner gets nothing. That conclusion falls out of the arithmetic rather than
being asserted, which is the whole point.

Emissions added in the early rounds are weighted to be harder to remove later,
so coasting through the 2020s and bartering hard from 2034 cannot win.

---

## How it is built

React 19 · TypeScript · Vite · Tailwind v4 · Zustand · Supabase Realtime ·
Lucide icons. No animation library, no UI framework.

```
src/game/        rules, content and the resolution engine — no React
src/lib/         transport (Supabase or local), config
src/store/       room state and the phase machine
src/screens/     Home, Play (phone), Board (big screen)
src/components/  meters, timer, action cards, report card
src/ui/          Clean Horizon design system — tokens, buttons, cards,
                 role badges, progress, illustrations
scripts/         balance simulation, tuning table, end-to-end playthrough
```

**Clean Horizon** is the visual system: a bright, mobile-first Malaysian
climate palette built on CSS variables in `src/index.css` (blue for the
interface, green for sustainability, one fixed colour per role), a 20px card
radius, restrained 180/240ms transitions and a `prefers-reduced-motion`
opt-out. The artwork in `src/ui/Illustrations.tsx` is inline SVG drawing
rooftop and utility-scale solar, electrified transit, efficient buildings,
rivers and forests — the technologies that actually carry Malaysia's
transition. There are no wind turbines anywhere in the interface.

`src/game/` is deliberately free of UI: the engine is a pure function from
`(indicators, choices, transfers)` to a resolved round, which is what makes the
balance simulation possible.

### Hidden information

A player's selection is never written to the shared room while the round is
open. Each phone records only that its player has **locked**, keeping the choice
in memory; all four choices are published a moment later, once nobody can change
their mind. That is what makes the reveal genuinely simultaneous rather than
simply hidden by the interface.

### Data and privacy

One row per room, keyed by the four-letter code. The only personal data is the
display name a player types in. Rooms delete themselves after **seven days**.
The Supabase publishable key ships in the client bundle by design; Row Level
Security is the actual protection, and the room code is the credential.

---

## Documents

- [`DESIGN.md`](./DESIGN.md) — the game system, roles, agendas and balance
- [`RESEARCH.md`](./RESEARCH.md) — every fact behind every scenario, with sources
