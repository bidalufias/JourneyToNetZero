# Journey to Net Zero

A 30-minute, 4-player climate strategy simulation for training workshops. Four
players join on their phones; a fifth screen shows a shared broadcast on a TV or
projector. Six crises, four minutes each.

> Four people who don't trust each other have thirty minutes to save a country.

`JOURNEY-TO-NET-ZERO-design.md` is the authority on rules and numbers.
`design/Journey-to-Net-Zero-UI.dc.html` is the authority on how it looks.

## Running it

```bash
npm install
npm run dev
```

Open `/dashboard` on the big screen and `/play?room=CODE&seat=government` on a
phone, or just open `/` and pick a surface.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` (what Netlify publishes) |
| `npm test` | Engine parity + session tests |
| `npm run fixtures` | Regenerate golden fixtures from the reference engine |
| `npm run build:function` | Bundle the Supabase edge function |

## How it is put together

```
content/     the game, as data — 18 scenarios, 216 options, config, goals
reference/   engine.py and content.py, the balance-tested implementation
src/engine/  the engine, ported from reference/engine.py
src/game/    the room: phases, timers, negotiation, insider tips, views
src/net/     transports — local (one browser) and Supabase (real sessions)
src/dashboard/ the broadcast surface
src/phone/   the player surface
supabase/    schema and the edge function that runs the room server-side
```

Three rules hold the design together, and each has a test rather than a comment.

**Content is data, not code.** The engine reads only the JSON pack, so the
Singapore, corporate and schools variants are a file swap, not a fork.

**All game logic is server-side.** `src/game/room.ts` is a pure reducer with no
React, DOM or transport imports, so the same module runs in the Supabase edge
function and in the local host. A phone receives a `PhoneView` and nothing else:
option cards carry a title, a line, a cost chip and a derived plain-English
hint, never an effect value. `test/room.test.ts` serialises a whole phone view
and asserts none of the round's numbers appear anywhere in it.

**The session never stalls.** Every timed phase has a server deadline. If a
player stops choosing, the clock locks a default and the round resolves. A test
drives all six rounds with nobody ever touching a phone.

## The engine

`reference/engine.py` is the authority: every constant in the content pack was
fitted against it across roughly 200,000 simulated games. **Do not adjust a
constant to make a number look rounder.** `e_green = 1.15` is not a typo.

`npm run fixtures` replays the reference across 240 games covering all 18
scenarios and both endings, recording each round's inputs and full state.
`npm test` feeds those same inputs to the TypeScript port and compares.

Everything discrete matches exactly across all 1,440 recorded rounds — flags,
trust, resources, spotlights, vetoes, counters, and every win/loss and
private-goal verdict. The continuous meters use a 1e-12 relative tolerance for
one reason: the green-share term raises a base to `green_power` (1.5), and V8's
`Math.pow` is a fast approximation where CPython's is correctly-rounded glibc
`pow`. 97.3% of rounds come out bit-identical anyway and the worst deviation
anywhere is 5.1e-16. Integer exponents use repeated multiplication precisely so
they stay bit-exact.

If you change the engine, run `npm test` before you believe anything.

## Deployment

**Front end — Netlify.** Publishes `dist/` from `npm run build`. `public/_redirects`
sends every path to `index.html` so `/dashboard` and `/play` resolve.

**Back end — Supabase** (project `journey-to-net-zero`, `dsibzzchpokqwscjrbif`,
`ap-southeast-1`). The schema is applied: `rooms` and `room_seats`, both with RLS
enabled and **no policies at all**, because room state holds every option's
effects, every sealed private goal and every insider tip. Only the edge
function's service role touches them.

Deploy the function:

```bash
npm run build:function
supabase functions deploy room --project-ref dsibzzchpokqwscjrbif
```

Then point the front end at it:

```bash
# .env.local, or Netlify environment variables
VITE_SUPABASE_URL=https://dsibzzchpokqwscjrbif.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>
```

With those unset the app falls back to the local one-browser transport, which is
what makes `npm run dev` useful and lets a facilitator rehearse on a laptop.

### How sync works

Realtime carries a revision number and nothing else. A channel that carried
room state would hand every phone every other phone's secrets, so on a revision
bump each client asks the edge function for *its own* view and the function
decides what that client may know. A seat token proves which seat you hold; the
function rewrites the role on every command rather than trusting the wire, so
naming somebody else's seat achieves nothing.

Nothing runs server-side between requests, so the dashboard asks the server to
look at its clock twice a second. It cannot say what time it is — the function
uses `Date.now()`, and nothing advances before its own deadline.

## Running a session

30-minute version: 3 setup, 24 play, 3 results. The facilitator advances with
the space bar on the dashboard; there are no other controls, because a dashboard
that looks like a control room kills the session.

Four moments worth catching:

1. **After Round 1** — "Did anyone make a promise? Did anyone keep it?"
2. **After the health crisis** — in R3A emissions fall 8 Mt for free while
   everything else collapses. "Is that success?"
3. **Before Round 4 choices** — read the Government's Trust total aloud. "This
   number was decided three rounds ago."
4. **After the final reveal** — five seconds of silence. Let it land.

## Things that will look like bugs and are not

- **Hollow Victory is not a bug.** If the country misses even one target,
  everyone who hit their private goal gets it, with no partial credit. That card
  does more teaching than an hour of slides. Do not soften it.
- **Promises are never enforced.** Chip transfers execute on acceptance;
  verbal commitments are unenforceable by design. The first broken promise is
  the whole training course.
- **Never all four cards at once.** The Reckoning flips them three seconds
  apart. The gap is where the drama lives.
- **Growth is never free.** Even a fully green economy still emits when it
  grows. That is the point of the drift table.

## Not built yet

- The facilitator console — pause, resume, custom shocks, timer control. Every
  real workshop wants this within three sessions.
- Session analytics: which options get picked, which promises break, win rates
  by cohort.
- Bahasa Malaysia localisation, and the 45-minute workshop variant.
