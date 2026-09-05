# Journey to Net Zero

A 35-minute, 4-player climate strategy simulation for training workshops. Four
players join on their phones; a fifth screen shows a shared broadcast on a TV or
projector. Six crises, about four minutes each. A table that has played before
can skip the onboarding and finish in about 29.

> Four people who don't trust each other have six crises to save a country.

`JOURNEY-TO-NET-ZERO-design.md` is the authority on rules and numbers.
`design/Journey-to-Net-Zero-UI.dc.html` is the authority on how it looks.

## Running it

```bash
npm install
npm run dev
```

Open `/dashboard` on the big screen and `/play?room=CODE&seat=government` on a
phone, or just open `/` and pick a surface.

| Route | What it is |
|---|---|
| `/` | Pick a surface, or join with a four-letter code |
| `/dashboard` | The broadcast — TV or projector |
| `/play?room=CODE` | The join page with the code filled in (where the QR points) |
| `/play?room=CODE&seat=ROLE` | A phone in that chair |
| `/facilitator?room=CODE` | The run of show, live with the big screen — reached from the big screen only, never from the join page |
| `/how-to-play.html` | The written player guide, about 800 words — static, no app around it |

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` (what Netlify publishes) |
| `npm test` | Engine parity, session, and QR encoder tests |
| `npm run fixtures` | Regenerate golden fixtures from the reference engine |
| `npm run build:function` | Bundle the Supabase edge function |
| `npm run deploy:function` | Bundle and deploy it (needs `SUPABASE_ACCESS_TOKEN`) |

## How it is put together

```
content/     the game, as data - 18 scenarios, 216 options, config, secret goals, practice round
reference/   engine.py and content.py, the balance-tested implementation
src/engine/  the engine, ported from reference/engine.py
src/game/    the room: phases, timers, negotiation, tips, views
src/net/     transports — local (one browser) and Supabase (real sessions)
src/dashboard/ the broadcast surface
src/phone/   the player surface
src/facilitator/ the run of show, and its link to the big screen
src/ui/      shared primitives, and the QR encoder
public/      the static player guide, fonts, manifest
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

**The two content packs cannot drift.** The pack exists twice, as JSON for the
game and as Python for the reference engine. `test/content.test.ts` compares
them field for field across all 216 options; it found six places they had
already diverged the first time it ran.

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

### Deploying the edge function

`supabase/functions/room/index.ts` is **generated** — it is `_src/room.ts`
bundled together with `src/engine` and `src/game`, because Deno cannot resolve
those modules' extensionless imports and a hand-copied reducer would let the
deployed game drift from the tested one. It is committed so it can be deployed
without any local tooling. Pick whichever route suits:

**GitHub Actions (recommended).** `.github/workflows/deploy-function.yml`
deploys on every push to `main` that touches the engine, the room, the content
pack or the function. It runs the parity tests first, and fails if the committed
bundle is stale. Add one repository secret:

```
SUPABASE_ACCESS_TOKEN   # supabase.com/dashboard/account/tokens
```

**The Supabase dashboard.** Edge Functions → *Deploy a new function* → *Via
Editor*, name it `room`, and paste **both** `supabase/functions/room/index.ts`
and `supabase/functions/room/content.gen.ts` (copy them straight from GitHub —
no checkout needed). Leave JWT verification on.

**One command, no CLI.** Needs only a token from
[supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens):

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npm run deploy:function
```

It rebuilds first, so what ships is what the source says.

**The Supabase CLI**, if you already have it:

```bash
npm run build:function
supabase functions deploy room --project-ref dsibzzchpokqwscjrbif
```

Whichever you use, rebuild first if you changed the engine, the room or the
content pack — the bundle is the deployable unit, not the source.

Then point the front end at it:

```bash
# .env.local, or Netlify environment variables
VITE_SUPABASE_URL=https://dsibzzchpokqwscjrbif.supabase.co
VITE_SUPABASE_ANON_KEY=<legacy anon key>
```

Use the **legacy anon key**, which is a JWT. The newer `sb_publishable_*` keys
are not JWTs and the function verifies one, so they are rejected.

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

Which makes every deadline a timestamp from the *server's* clock, read by a
browser holding its own. Those are two clocks and nothing makes them agree, so
each response carries the server's `now` and the client keeps a running offset
(`src/net/clock.ts`); anything comparing against a deadline reads `serverNow()`
rather than `Date.now()`. Without that, a projector laptop an hour out of date
runs a countdown an hour long — and used to sit through the Reckoning on a
blank screen, because every card was due at a time that never arrived. The
Reckoning no longer trusts the subtraction on its own: it runs on a local
stopwatch and defers to the deadline only when the deadline says the room is
further in, which is how a dashboard opened mid-round still catches up.

A deployed function older than this change simply omits `now`, the offset stays
at zero, and everything behaves as it did before — so redeploy it after
pulling, or the countdown keeps whatever error the projector's clock has.

## Running a session

**There is always a facilitator.** The board's job is to tell them what happens
next without making them look away from the room, so every onboarding step
carries the line to say. `/facilitator` is the full run of show for preparation.

The session opens with about five minutes of onboarding before anything counts.
In order: the lobby, the briefing, a practice Talk, a practice Choice, a
practice Reveal, each seat's own power, and then the secret goal. Then six
rounds of Crisis, Talk, Choice, Reveal, Public Trust and the story so far, the
country's result, and an end screen that holds. Every onboarding step teaches
one verb and makes the room use it. Nothing from the practice reaches the
engine. Every step the room can finish, the room finishes: the crisis on four
GOT ITs, the Talk on four I AM DONEs, the practice Reveal on four GOT ITs once
the cards have turned, the power and goal steps on four confirmations, and a
Choice on four locks. The clock is only the fallback, so a room that is ready
never waits for it, and nobody waits for the laptop.

The Reveal holds four seconds of ALL FOUR LOCKED · LOOK UP with a countdown
before the first card turns, and every phone mirrors the cards as the big
screen turns them, with the same two lines under each: the promise verdict
and what another seat did to the card.

The seat list is the only thing a scanned phone sees. Nothing on the join path
points at the written guide; it is under the ⋯ menu once a player has sat
down, and it is short enough to read in the lobby.

35 minutes end to end. The facilitator drives it from
the dashboard, which carries exactly two buttons — PAUSE and NEXT — in the
bottom corner of every screen. They behave like a video player's: a few seconds
of no mouse movement and they fade out, and the first twitch brings them back,
so four people at four metres never see a control room and the one person with
a hand on the trackpad always has one. They stay put in the lobby, where
nothing has started, and while the room is paused, which is the way back out.
Everything they do is also a key:

| Key | What it does |
|---|---|
| `Space` · `N` | Start the session, then go straight to the next step. After the end screen, open a new session |
| `P` | Stop the clock anywhere in the session, and start it again with the seconds it had left |
| `Q` | The join code and its QR, full screen, for a latecomer |
| `F` | The facilitator's script, in a window of its own |
| `Esc` | Close whatever is over the broadcast |

After the end screen the control bar offers NEW SESSION, which opens a fresh
room with a new code. Everybody joins the new code on their phone. Reloading
the big screen does not do this: the address remembers the old room and goes
straight back into it.

Pausing is a fact about the room, not about the big screen: the server stops
expiring the phase, every phone freezes its countdown and says why, and nothing
that moves the round — locking, promising, spending a veto — is accepted until
it restarts. The deadline is kept rather than recomputed and pushed forward by
however long the pause lasted, so a room stopped with nine seconds of THE
CHOICE left restarts with nine seconds. Taking a seat and choosing a goal still
work while it is stopped, because a latecomer arriving is one of the two
reasons anybody presses it. Stepping on with NEXT works too, and the phase you
land in gets its full length when the clock starts again.

Players join by typing the four letters or by scanning the QR beside them,
which lands on the same join page with the code already in the box.

`F` opens `/facilitator` as a separate window — meant for the laptop screen
rather than the projector. It carries the whole run of show, marks the phase
the room is actually in, and can start and advance the session itself, so the
person talking never has to reach across to the machine driving the projector.
It talks to the big screen over a `BroadcastChannel`, so that half works when
both are the same browser; opened anywhere else it is still the script, minus
the live marker. Pop-up blocked, it falls back to an overlay on the dashboard.

The big screen is the only way in. Nothing on the join page links to it: that
page is what four players see, and handing them the host's lines spoils a game
that works because nobody has read it first.

The script is written to be **said**, not skimmed — full sentences in the voice
of somebody hosting a broadcast, because that is what the dashboard already is,
and in plain English, because the room may not be reading in its first
language. Lines a room only needs explained once are marked `FIRST ROUND ONLY`
and drop out of the live script from round two. The four character backstories,
the notes on playing in character and the strategy the old guide taught all
live on the facilitator page now, not on anything a player reads.

Four moments worth catching, all of them in the script:

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
  apart. The gap is where the drama lives — and the cards that have not turned
  yet are face-down on the screen, not missing from it, so the pause never
  reads as a dashboard that has crashed.
- **Growth is never free.** Even a fully green economy still emits when it
  grows. That is the point of the drift table.

## Not built yet

- The rest of the facilitator console — custom shocks and timer control. The
  script window covers reading, advancing and pausing.
- Session analytics: which options get picked, which promises break, win rates
  by cohort.
- Bahasa Malaysia localisation, and the 45-minute workshop variant.
