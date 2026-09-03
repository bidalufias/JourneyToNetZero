/**
 * The dashboard's remaining moments: the attract screen, the Coalition Bonus,
 * the round summary, and both endings.
 */
import type { Role } from '../engine/types'
import type { DashboardView } from '../game/session'
import { ROLE_LABEL } from '../game/session'
import { STEP_LABEL } from '../game/vocab'
import type { Endgame } from '../game/room'
import { RoleGlyph } from '../ui/primitives'
import { RoleCard } from '../ui/RoleCard'
import { JoinPanel } from './Join'

/**
 * D-01: the code has to be readable from the back of the room.
 *
 * The lobby is the one screen where the facilitator is allowed visible
 * controls: nothing has started, nobody is in character, and the alternative
 * is a room of four people watching someone hunt for a keyboard shortcut. The
 * moment the session starts they are gone, and the keys take over.
 */
export function Attract({
  view,
  onShowQr,
  onOpenScript,
}: {
  view: DashboardView
  onShowQr?: () => void
  onOpenScript?: () => void
}) {
  const s = view.state
  return (
    <div className="dash">
      <header className="dash__masthead">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">SEMENANJARA TONIGHT</span>
        <span className="dash__masthead-right">KOTA DAMAI · 2025</span>
      </header>

      <div className="attract">
        <div className="attract__left">
          <p className="attract__cue">JOIN ON YOUR PHONE</p>
          <p className="attract__code">{view.code}</p>
          <p className="attract__tagline">Four seats. Six crises. Thirty-five minutes.</p>
          <JoinPanel code={view.code} />
          {onShowQr || onOpenScript ? (
            <div className="attract__controls">
              {onShowQr ? (
                <button className="dashbtn" onClick={onShowQr}>
                  SHOW THE QR CODE BIG <span className="dashbtn__key">Q</span>
                </button>
              ) : null}
              {onOpenScript ? (
                <button className="dashbtn" onClick={onOpenScript}>
                  FACILITATOR SCRIPT <span className="dashbtn__key">F</span>
                </button>
              ) : null}
              <span className="attract__hint">SPACE STARTS THE SESSION</span>
            </div>
          ) : null}
        </div>

        <div className="attract__seats">
          <p className="attract__seats-label">
            THE FOUR SEATS · {view.seats.filter((x) => x.name).length} OF 4
          </p>
          {view.seats.map((seat) => (
            <div
              key={seat.role}
              className={`seat${seat.name ? '' : ' seat--empty'}`}
              data-role={seat.role}
            >
              <RoleGlyph role={seat.role} size={22} />
              <div>
                <div className="seat__role">{ROLE_LABEL[seat.role].toUpperCase()}</div>
                <div className="seat__name">{seat.name ?? 'waiting…'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="briefing-strip">
        <span className="briefing-strip__label">BRIEFING</span>
        <span className="briefing-strip__text">
          Carbon {s.emissions.toFixed(0)} million tonnes · Economy {s.growth.toFixed(1)}% · Quality of
          life {s.happiness.toFixed(1)} · Clean Economy {s.greenShare.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

/**
 * D-02: the twenty seconds before the first crisis.
 *
 * Four people who have never played are about to be asked to make a decision
 * with consequences they cannot see. This is the only moment in the session
 * where the room can be told, together, what it is doing and what it takes to
 * win, and until the facilitator's spacebar stopped skipping the phase, it was
 * never on screen at all.
 */
export function Briefing({ view, clock }: { view: DashboardView; clock: string | null }) {
  const s = view.state
  return (
    <div className="dash">
      <header className="dash__masthead">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">SEMENANJARA TONIGHT</span>
        <div className="dash__masthead-right">
          <span>{STEP_LABEL.briefing}</span>
          {clock ? <span className="dash__clock">{clock}</span> : null}
        </div>
      </header>

      <div className="brief">
        <div className="brief__lead">
          <p className="attract__cue">{STEP_LABEL.results} · 2050</p>
          <h1 className="brief__title">
            Three targets.
            <br />
            You must reach all three, or nobody wins.
          </h1>
          <p className="brief__body">
            There are six crises. Each one works the same way. You talk. You each pick a card in
            secret. Then all four cards are shown at once.{' '}
            <strong>Promises are not enforced.</strong>
          </p>
          <p className="brief__body">
            You each have a secret goal too. It only counts if the country reaches all three
            targets.
          </p>
        </div>

        <div className="brief__targets">
          {[
            {
              label: 'CARBON',
              from: `${s.emissions.toFixed(0)} million tonnes today`,
              target: 'DOWN TO NET ZERO',
            },
            { label: 'ECONOMY', from: `${s.growth.toFixed(1)}% today`, target: 'GROWING 5% A YEAR' },
            { label: 'QUALITY OF LIFE', from: `${s.happiness.toFixed(1)} today`, target: 'UP TO 7 OUT OF 10' },
          ].map((t) => (
            <div key={t.label} className="brief__target">
              <span className="brief__target-label">{t.label}</span>
              <span className="brief__target-value">{t.target}</span>
              <span className="brief__target-from">{t.from}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="briefing-strip">
        <span className="briefing-strip__label">ON YOUR PHONE</span>
        <span className="briefing-strip__text">
          Your money is in the top corner. The country’s three numbers are under it. Tap ⋯ to
          see what a word means. Tap ‹ to read this round again.
        </span>
      </div>
    </div>
  )
}

/**
 * The onboarding, on the shared screen.
 *
 * Every step is a single instruction, sized for the back of the room, plus one
 * line of direction for the person running it. There is always a facilitator,
 * and the board's job is to tell them what happens next without making them
 * look away from the table.
 */
export function Onboarding({ view, clock }: { view: DashboardView; clock: string | null }) {
  const steps: Record<string, { step: string; heading: string; body: string; cue: string }> = {
    practiceChoice: {
      step: STEP_LABEL.practiceChoice,
      heading: 'Pick a card.',
      body: 'Tap one card. Then tap LOCK MY CARD. The arrows show what the card does to the country. This does not count.',
      cue: 'Say: this is practice. Tap a card, lock it, then look up here.',
    },
    power: {
      step: STEP_LABEL.power,
      heading: 'Each of you can do one thing the others cannot.',
      body: 'Your phone shows your own card. This screen shows all four.',
      cue: 'Say: read your own phone. Then look up and see what the other three can do to you.',
    },
    goal: {
      step: STEP_LABEL.goal,
      heading: 'Now choose what you want.',
      body: 'Three secret goals on your phone. Choose one. Nobody sees which. It only counts if the country reaches all three targets.',
      cue: 'Say: you have seen how this country works. Now choose what you want from it.',
    },
  }
  const s = steps[view.phase]
  if (!s) return null

  const locked = view.seats.filter((x) => x.locked).length
  const ready = view.phase === 'practiceChoice' ? `${locked} of 4 locked` : null

  return (
    <div className="dash">
      <header className="dash__masthead">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">SEMENANJARA TONIGHT</span>
        <div className="dash__masthead-right">
          <span>{s.step}</span>
          {clock ? <span className="dash__clock">{clock}</span> : null}
        </div>
      </header>

      <div className="onboard">
        <div>
          <p className="onboard__step">BEFORE IT COUNTS</p>
          <h1 className="onboard__heading">{s.heading}</h1>
          <p className="onboard__body">{s.body}</p>
          {ready ? <p className="onboard__ready">{ready}</p> : null}
        </div>
        {view.phase === 'power' ? (
          <div className="onboard__cards">
            {view.seats.map((seat) => (
              <RoleCard key={seat.role} role={seat.role} size="tile" lines="power" name={seat.name} />
            ))}
          </div>
        ) : null}
        <p className="onboard__cue">
          <span className="onboard__cue-label">SAY THIS</span>
          {s.cue}
        </p>
      </div>
    </div>
  )
}

/**
 * D-06: the only celebratory screen in the game before the ending.
 *
 * Fires after the meters have settled, so it reads as consequence rather than
 * decoration. The fourth glyph stays visibly hollow when only three aligned,
 * with the all-four figure printed beside it: the room should feel the better
 * number they didn't get.
 */
export function CoalitionBonus({ view }: { view: DashboardView }) {
  const log = view.lastRound!
  const bonus = log.coalitionBonus!
  const aligned = log.alignedCount
  if (aligned < 3) return null

  const alignedRoles = log.reveals.filter((r) => r.aligned).map((r) => r.role)

  return (
    <div className="coalition">
      <p className="coalition__label">MOVING TOGETHER</p>
      <h1 className="coalition__title">
        {aligned === 4 ? 'All four of you' : 'Three of you'}
        <br />
        moved together.
      </h1>
      <div className="coalition__row">
        <div className="coalition__glyphs">
          {view.seats.map((seat) => (
            <span
              key={seat.role}
              className={`coalition__glyph${alignedRoles.includes(seat.role) ? '' : ' coalition__glyph--hollow'}`}
            >
              <RoleGlyph role={seat.role} size={22} />
            </span>
          ))}
        </div>
        <div>
          <p className="coalition__effect">
            {bonus.emissions} million tonnes of carbon · +{bonus.green}% Clean Economy · +
            {bonus.happiness} quality of life
          </p>
          <p className="coalition__note">
            {aligned === 4
              ? 'No single player can do this alone.'
              : 'No single player can do this alone. With all four it would have been 9.5 million tonnes.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * The Public Trust beat: fifteen seconds saying where the two tokens went.
 *
 * The engine has awarded these every round since the first build and no screen
 * in the product has ever mentioned it. The Community's brief says Public Trust
 * "goes to whoever earned it, so your job is to make them earn it in front of
 * you", which is a fine instruction to give somebody who can then watch it
 * happen, and an empty one otherwise. It also gates three cards, so a table
 * that cannot see the number cannot plan around the doors it opens.
 */
export function TrustAward({ view, clock }: { view: DashboardView; clock: string | null }) {
  const award = view.trustAward
  const log = view.lastRound
  if (!award || !log) return null

  const totals = log.state.trust
  const rows: { label: string; role: Role; why: string }[] = [
    { label: 'LOOKED AFTER PEOPLE', role: award.care, why: 'Most for quality of life this round.' },
    { label: 'BUILT THE FUTURE', role: award.future, why: 'Most for the clean economy this round.' },
  ]

  return (
    <div className="dash">
      <header className="dash__masthead">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">SEMENANJARA TONIGHT</span>
        <div className="dash__masthead-right">
          <span>{STEP_LABEL.trust} · ROUND {log.round}</span>
          {clock ? <span className="dash__clock">{clock}</span> : null}
        </div>
      </header>

      <div className="trust">
        <div className="trust__lead">
          <p className="attract__cue">WHO THE PEOPLE TRUST</p>
          <h1 className="trust__title">
            Two points.
            <br />
            Every round.
          </h1>
          <p className="trust__body">
            Nobody hands these out. The people give them to whoever helped them most. Some cards
            need them.
          </p>
        </div>

        <div className="trust__awards">
          {rows.map((row) => (
            <div key={row.label} className="trust__award" data-role={row.role}>
              <span className="trust__award-label">{row.label}</span>
              <span className="trust__award-who">
                <RoleGlyph role={row.role} size={26} /> {ROLE_LABEL[row.role].toUpperCase()}
              </span>
              <span className="trust__award-why">{row.why}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="briefing-strip">
        <span className="briefing-strip__label">PUBLIC TRUST HELD</span>
        <span className="briefing-strip__text">
          Government {totals.government} · Business {totals.business} · Activist {totals.activist}
        </span>
      </div>
    </div>
  )
}

/** D-07: one sentence per round, written from the actual choices. */
export function RoundSummary({ view }: { view: DashboardView }) {
  const s = view.state
  const shortfalls = [
    {
      label: 'CARBON',
      value: s.emissions.toFixed(0),
      gap: s.emissions - view.targets.emissions,
      unit: 'over',
      decimals: 0,
    },
    {
      label: 'ECONOMY AVERAGE',
      value: s.averageGrowth.toFixed(1),
      gap: view.targets.growth - s.averageGrowth,
      unit: 'short',
      decimals: 1,
    },
    {
      label: 'QUALITY OF LIFE',
      value: s.happiness.toFixed(1),
      gap: view.targets.happiness - s.happiness,
      unit: 'short',
      decimals: 1,
    },
  ]
  const roundsLeft = 6 - s.round

  return (
    <div className="summary">
      <div className="summary__story">
        <h2 className="table__heading">{STEP_LABEL.summary}</h2>
        <ol className="summary__list">
          {view.history.map((h) => (
            <li key={h.round} className="summary__item">
              <span className="summary__round">R{h.round}</span>
              <span className="summary__sentence">{roundSentence(view, h.round)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="summary__standing">
        <h2 className="table__heading">WHERE YOU ARE NOW</h2>
        {shortfalls.map((row) => (
          <div key={row.label} className="standing">
            <span className="standing__label">{row.label}</span>
            <span className="standing__value">{row.value}</span>
            <span className={`standing__gap${row.gap <= 0 ? ' standing__gap--met' : ''}`}>
              {row.gap <= 0 ? 'met' : `${Math.abs(row.gap).toFixed(row.decimals)} ${row.unit}`}
            </span>
          </div>
        ))}
        <div className="standing">
          <span className="standing__label" style={{ color: 'var(--jtnz-meter-green)' }}>
            CLEAN ECONOMY
          </span>
          <span className="standing__value" style={{ color: 'var(--jtnz-meter-green)' }}>
            {s.greenShare.toFixed(0)}
          </span>
          <span className="standing__gap">rising</span>
        </div>
        <p className="summary__verdict">
          {roundsLeft === 0
            ? 'Six rounds gone. This is the country you built.'
            : reachable(view)
              ? `${roundsLeft} round${roundsLeft === 1 ? '' : 's'} left. All three targets can still be reached.`
              : 'Net zero can no longer be reached.'}
        </p>
      </div>
    </div>
  )
}

/** Computed, not decorative. The tone of the session changes when it flips. */
function reachable(view: DashboardView): boolean {
  const roundsLeft = 6 - view.state.round
  if (roundsLeft <= 0) return view.state.emissions <= view.targets.emissions
  return view.state.emissions - view.targets.emissions <= 50 * roundsLeft
}

function roundSentence(view: DashboardView, round: number): string {
  const log = view.history.find((h) => h.round === round)
  if (!log) return ''
  const parts: string[] = []
  const gov = log.reveals.find((r) => r.role === 'government')
  if (gov) parts.push(gov.headline)
  if (log.alignedCount === 4) parts.push('All four moved together')
  else if (log.alignedCount === 3) parts.push('Three moved together')
  if (log.spotlightTarget) parts.push('The Spotlight caught someone')
  return parts.join('. ') + '.'
}

/**
 * How the country is graded, and it is graded in three, not two.
 *
 * A workshop group plays this once. Twenty-two percent of tables reach all
 * three targets, so four in five rooms used to be told nothing except that they
 * had failed, whether they missed growth by three tenths of a percent or never
 * came near anything. "You needed five percent and you averaged four point
 * seven" is a far better twenty minutes of debrief than "you failed", and it
 * is also simply more true.
 */
const GRADE_BANNER: Record<Endgame['grade'], { title: string; note: string }> = {
  REACHED: {
    title: 'NET ZERO REACHED',
    note: 'All three targets. The country made it.',
  },
  CLOSE: {
    title: 'SO CLOSE',
    note: 'You missed by a little. You nearly made it.',
  },
  MISSED: {
    title: 'MISSED',
    note: 'You missed at least one target by a lot. Here is where.',
  },
}

/** D-08/09: targets one at a time, then the titles. */
export function Endgame({ view, endgame }: { view: DashboardView; endgame: Endgame }) {
  // Hollow Victory names a specific cruelty: you got exactly what you wanted
  // and the country still failed. If nobody hit their goal there is nothing
  // hollow to award, and pretending otherwise blunts the card that matters.
  const anyGoalMet = endgame.players.some((p) => p.goalMet)
  const heading = endgame.win ? 'NATION BUILDER' : anyGoalMet ? 'HOLLOW VICTORY' : 'THE COUNTRY MISSED'
  const grade = GRADE_BANNER[endgame.grade]
  const labels: Record<string, { name: string; unit: string; fmt: (v: number) => string }> = {
    emissions: { name: 'CARBON', unit: 'million tonnes', fmt: (v) => v.toFixed(0) },
    growth: { name: 'ECONOMY AVERAGE', unit: '%', fmt: (v) => v.toFixed(1) },
    happiness: { name: 'QUALITY OF LIFE', unit: '/10', fmt: (v) => v.toFixed(1) },
  }

  return (
    <div className="dash">
      <header className="dash__masthead">
        <span className="dash__live">LIVE</span>
        <span className="dash__channel">{STEP_LABEL.results} · 2050</span>
        <span className="dash__masthead-right">
          {endgame.win ? 'THREE TARGETS. ALL THREE.' : 'THREE TARGETS. NOT ALL THREE.'}
        </span>
      </header>

      <div className="results">
        <div className={`grade grade--${endgame.grade.toLowerCase()}`}>
          <span className="grade__title">{grade.title}</span>
          <span className="grade__note">{grade.note}</span>
        </div>

        <div className="results__targets">
          {endgame.targets.map((t) => {
            const l = labels[t.key]
            return (
              <div key={t.key} className={`result-row${t.met ? ' result-row--met' : ''}`}>
                <span className="result-row__label">{l.name}</span>
                <span className="result-row__value">{l.fmt(t.value)}</span>
                <span className="result-row__unit">
                  {l.unit} · target {t.target}
                </span>
                <span className="result-row__verdict">{t.met ? 'MET ✓' : 'MISSED ✕'}</span>
                {/* The gap, in words, because "missed" is a fact and "you
                    needed 5.0 and averaged 4.7" is a conversation. */}
                <span className="result-row__gap">{t.verdict}</span>
              </div>
            )
          })}
        </div>

        <div className={`ending${endgame.win ? ' ending--win' : ' ending--hollow'}`}>
          <p className="ending__kicker">REPUBLIC OF SEMENANJARA · 2050</p>
          <h1 className="ending__title">{heading}</h1>
          <p className="ending__blurb">
            {endgame.win
              ? 'All three targets. 34 million people live in a country that works.'
              : anyGoalMet
                ? 'You reached your own goal. The country did not reach its targets. It is 3.2°C hotter.'
                : 'Nobody reached their goal. The country did not reach its targets. It is 3.2°C hotter.'}
          </p>

          <div className="ending__players">
            {endgame.players.map((p) => (
              <div key={p.role} className="ending__player" data-role={p.role}>
                <div className="ending__player-role">
                  <RoleGlyph role={p.role} size={16} /> {ROLE_LABEL[p.role].toUpperCase()}
                </div>
                <div className="ending__player-name">{p.name}</div>
                <div className="ending__player-goal">
                  {p.goalTitle ?? 'No secret goal'} {p.goalMet ? '✓' : '✕'}
                </div>
                <div className="ending__player-title">{p.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="briefing-strip">
        <span className="briefing-strip__label">DEBRIEF</span>
        <span className="briefing-strip__text">
          Who did you need most? Did you tell them? What did you give up?
        </span>
      </div>
      <span hidden>{view.code}</span>
    </div>
  )
}
