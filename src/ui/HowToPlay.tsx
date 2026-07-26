import { useEffect, useRef } from 'react'
import {
  ArrowRightLeft,
  Bot,
  CircleAlert,
  CircleCheckBig,
  EyeOff,
  Flag,
  Landmark,
  LayoutTemplate,
  Lock,
  Target,
  Timer as TimerIcon,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Meter } from '../components/Meter'
import { TimerRing } from '../components/Timer'
import { actionById } from '../game/actions'
import { STARTING_INDICATORS } from '../game/engine'
import { ROLES, ROLE_ORDER } from '../game/roles'
import { SITUATIONS, TARGET_YEAR, TOTAL_ROUNDS } from '../game/situations'
import { THRESHOLDS } from '../game/synergies'
import { PHASE_SECONDS } from '../lib/config'
import { ChoiceCard, ProgressIndicator, StatusChip } from './Cards'
import { RoleBadge } from './Role'

/**
 * The rules, written for somebody who has never seen the game, in the order
 * they need them: what this is, what the country needs, what happens in a
 * round, what every part of the screen means, and only then the detail.
 *
 * Two rules for this file.
 *
 * Every number is read from the game rather than written down — the round
 * count, the thresholds, the phase lengths, the roles, their currency, the
 * starting indicators. Change the game and this changes with it.
 *
 * Every piece of interface in the legend is the real component, rendered
 * inert. A legend drawn as a picture of the UI is a legend that quietly stops
 * matching it.
 */

const PHASES: {
  phase: keyof typeof PHASE_SECONDS
  label: string
  you: string
}[] = [
  {
    phase: 'situation',
    label: 'Situation',
    you: 'Read what has happened to Malaysia this round. Everyone sees the same thing.',
  },
  {
    phase: 'discussion',
    label: 'Discussion',
    you: 'Talk, argue, promise things. This is also the only moment you can send currency to somebody else.',
  },
  {
    phase: 'locking',
    label: 'Lock in',
    you: 'Privately pick one of your three actions. Nobody can see it, and you cannot change it once locked.',
  },
  {
    phase: 'reveal',
    label: 'Reveal',
    you: 'All four choices appear at once. Now you find out who kept their word.',
  },
  {
    phase: 'resolution',
    label: 'Resolution',
    you: 'The three national meters move, and the round is recorded.',
  },
]

/** Keep in step with the <Block id=…> calls below. */
const SECTIONS: { id: string; label: string }[] = [
  { id: 'htp-what', label: 'What this is' },
  { id: 'htp-goal', label: 'The goal' },
  { id: 'htp-roles', label: 'Roles' },
  { id: 'htp-round', label: 'A round' },
  { id: 'htp-screen', label: 'Your screen' },
  { id: 'htp-options', label: 'Options' },
  { id: 'htp-deals', label: 'Deals' },
  { id: 'htp-hidden', label: 'Hidden' },
  { id: 'htp-ending', label: 'Ending' },
  { id: 'htp-solo', label: 'Short of players' },
]

export function HowToPlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  // Native <dialog> gives focus trapping, Escape and inertness for free, so
  // there is no bespoke focus management to get wrong.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const firstYear = SITUATIONS[0].year
  // A real action, so the anatomy below matches what actually appears.
  const example = actionById('r1-gov-collective')

  function jumpTo(id: string) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop — anywhere outside the panel — dismisses.
        if (e.target === ref.current) onClose()
      }}
      aria-labelledby="how-to-play-title"
      className="ch-sheet"
    >
      <div className="flex max-h-[88dvh] w-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2
              id="how-to-play-title"
              className="text-[20px] leading-tight font-[650] text-navy"
            >
              How to play
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Malaysia, {firstYear} to {TARGET_YEAR} · {TOTAL_ROUNDS} rounds
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 grid size-12 shrink-0 place-items-center rounded-full text-muted transition-colors duration-[var(--t-interaction)] hover:bg-surface-2 hover:text-navy"
          >
            <X size={20} strokeWidth={2.25} aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </header>

        {/* Contained horizontal scroller — the page itself never scrolls sideways. */}
        <nav
          aria-label="Sections of this guide"
          className="shrink-0 overflow-x-auto border-b border-line px-5 py-2"
        >
          <ul className="flex w-max gap-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => jumpTo(s.id)}
                  className="h-11 rounded-full border border-line bg-surface-2 px-3.5 text-[13px] font-medium whitespace-nowrap text-body transition-colors duration-[var(--t-interaction)] hover:border-brand hover:text-navy"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <Block id="htp-what" icon={Flag} title="What this is">
            <p>
              Four people share responsibility for one country. You are
              Malaysia’s government, its businesses, its communities and its
              activists, steering from {firstYear} to {TARGET_YEAR} across{' '}
              {TOTAL_ROUNDS} rounds.
            </p>
            <p className="mt-3">
              Each round puts a real situation in front of you — a shelved
              carbon tax, an election, a flood — and each of you privately picks
              one response. The four choices resolve together.
            </p>
            <Callout>
              There is no winner. There is a country that either got there or
              did not, and four people who each know what they gave up.
            </Callout>
          </Block>

          <Block id="htp-goal" icon={Target} title="What the country needs">
            <p>
              Three national outcomes, and all four of you are judged on all
              three. By {TARGET_YEAR}:
            </p>
            <ul className="mt-3 space-y-1.5">
              <TargetRow label="Economy" op="at least" value={THRESHOLDS.economy} />
              <TargetRow label="Emissions" op="at most" value={THRESHOLDS.emissions} />
              <TargetRow label="Living standards" op="at least" value={THRESHOLDS.living} />
            </ul>
            <p className="mt-3">You start here, a long way from all three:</p>
            <Demo>
              <div className="grid grid-cols-3 gap-2">
                <Meter id="economy" value={STARTING_INDICATORS.economy} />
                <Meter id="emissions" value={STARTING_INDICATORS.emissions} />
                <Meter id="living" value={STARTING_INDICATORS.living} />
              </div>
            </Demo>
            <p className="mt-3">
              Emissions are indexed so {firstYear} = 100, and lower is better.
              Doing nothing is not neutral: the world drifts every round whether
              the table acts or not, and it drifts the wrong way.
            </p>
          </Block>

          <Block id="htp-roles" icon={Landmark} title="Who you are">
            <p>
              One role each. Each spends a different kind of currency, and none
              of you can move all three outcomes alone — that is the whole
              design.
            </p>
            <ul className="mt-4 space-y-4">
              {ROLE_ORDER.map((r) => (
                <li key={r}>
                  <div className="flex items-center justify-between gap-3">
                    <RoleBadge role={r} size="sm" />
                    <span className="shrink-0 text-[12px] text-muted">
                      starts with {ROLES[r].startingCurrency} {ROLES[r].currency}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] leading-[1.5] text-body">
                    {ROLES[r].blurb}
                  </p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="htp-round" icon={TimerIcon} title="A round, step by step">
            <ol className="space-y-3.5">
              {PHASES.map((p, i) => (
                <li key={p.label} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-light text-[12px] font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-[650] text-navy">{p.label}</span>
                      <span className="tabular text-[12px] font-medium text-muted">
                        {PHASE_SECONDS[p.phase]} seconds
                      </span>
                    </span>
                    <span className="block text-[14px] leading-[1.5]">{p.you}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3">
              Any player can add time to a discussion. Then the next round
              begins, a few years later.
            </p>
          </Block>

          <Block id="htp-screen" icon={LayoutTemplate} title="Reading your screen">
            <p>
              Everything below is the real interface, shown here so none of it
              is a surprise mid-round.
            </p>

            <Part
              title="Who you are, and how far along"
              demo={
                <div className="flex items-center justify-between gap-3">
                  <RoleBadge role="government" size="sm" />
                  <ProgressIndicator current={3} total={TOTAL_ROUNDS} />
                </div>
              }
            >
              Your role sits under the round title, and a thin band in your
              role’s colour runs across the very top of every screen. The dots
              count the rounds — the wide one is the round you are in.
            </Part>

            <Part
              title="The timer"
              demo={
                <div className="flex justify-center">
                  <TimerRing
                    seconds={Math.round(PHASE_SECONDS.discussion / 2)}
                    total={PHASE_SECONDS.discussion}
                    label="discuss"
                  />
                </div>
              }
            >
              Top right of the screen. The word underneath says which part of
              the round you are in — read, discuss, choose, reveal, results. It
              turns amber for the last ten seconds, and when it runs out the
              round moves on with whatever you have chosen.
            </Part>

            <Part
              title="The three meters"
              demo={
                <div className="grid grid-cols-3 gap-2">
                  <Meter id="economy" value={STARTING_INDICATORS.economy} />
                  <Meter id="emissions" value={STARTING_INDICATORS.emissions} />
                  <Meter id="living" value={STARTING_INDICATORS.living} />
                </div>
              }
            >
              The country’s state, always on screen. The upright notch on each
              bar is the {TARGET_YEAR} target, so the gap you still have to
              close is visible at a glance. Once a round resolves, each meter
              also shows what just changed.
            </Part>

            <Part
              title="An action"
              demo={
                <ChoiceCard
                  preview
                  role="government"
                  kicker="Carry the cost"
                  title={example.title}
                  summary={example.summary}
                  meta={
                    <>
                      {example.cost > 0 ? `−${example.cost}` : 'free'}
                      {example.income ? ` · +${example.income}` : ''}
                    </>
                  }
                  selected
                />
              }
            >
              You get three of these each round. The small coloured line at the
              top says which of the three kinds it is. On the right is the
              price: <Chip>−{example.cost}</Chip> means it costs you{' '}
              {example.cost} of your currency, and a <Chip>+</Chip> figure is
              what comes back to you. Tapping selects it — the tick and the
              coloured border are your pick, shown above. A faded card cannot be
              played yet, and says why.
            </Part>

            <Part
              title="Status chips"
              demo={
                <div className="flex flex-wrap gap-2">
                  <StatusChip tone="positive" icon={CircleCheckBig}>
                    Locked in
                  </StatusChip>
                  <StatusChip tone="role" role="business">
                    Business
                  </StatusChip>
                  <StatusChip tone="information" icon={Bot}>
                    Computer
                  </StatusChip>
                </div>
              }
            >
              Small labels for state. Once you lock in, chips show who the table
              is still waiting for — never what they picked.
            </Part>

            <Part
              title="Effects, at the reveal"
              demo={
                <div className="flex flex-wrap gap-2">
                  <StatusChip tone="positive" icon={CircleCheckBig}>
                    Economy +2
                  </StatusChip>
                  <StatusChip tone="negative" icon={CircleAlert}>
                    Emissions +4
                  </StatusChip>
                </div>
              }
            >
              When the choices flip, each shows what it did to the three
              outcomes. A tick means it helped the country, a warning means it
              hurt. Read the icon, not the sign — <Chip>+4 emissions</Chip> is
              bad news while <Chip>+2 economy</Chip> is good.
            </Part>
          </Block>

          <Block id="htp-options" icon={Lock} title="Your three options">
            <p>
              Every role gets the same three kinds of action each round, so you
              learn the shape once and spend the rest of the game on substance.
            </p>
            <ul className="mt-3 space-y-3">
              <Option title="Protect your own">
                Cheap, sometimes free, and it shields you. Somebody else absorbs
                the cost — usually the country.
              </Option>
              <Option title="Carry the cost">
                Helps the country, costs you currency, and often works against
                your own private agenda.
              </Option>
              <Option title="Needs a deal">
                The strongest thing on the board, and it starts locked. One
                specific other role has to send you currency this round before
                you can play it at all.
              </Option>
            </ul>
          </Block>

          <Block id="htp-deals" icon={ArrowRightLeft} title="Deals are the engine">
            <p>
              During the discussion you can send currency to any other player.
              Sending is binding, immediate, and everybody sees it.
            </p>
            <p className="mt-3">
              What they do with it afterwards is not binding at all. You can
              take somebody’s budget and still choose against them — and at the
              reveal, everybody watches you do it.
            </p>
            <Callout>
              A table that never trades cannot reach all three targets. That
              falls out of the arithmetic, not out of anybody’s opinion.
            </Callout>
            <p className="mt-3">
              Currency settles at the end of the round, together with what your
              action cost and what it earned.
            </p>
          </Block>

          <Block id="htp-hidden" icon={EyeOff} title="What stays hidden">
            <p>
              While a round is open, your phone tells the table only that you
              have locked in. All four choices publish together at the reveal,
              so nobody can hang back and react to somebody else.
            </p>
            <p className="mt-3">
              You also hold a private agenda — your own definition of a good{' '}
              {TARGET_YEAR}, which pulls against the national one. Nobody sees
              it, or whether you met it, until the end.
            </p>
          </Block>

          <Block id="htp-ending" icon={CircleCheckBig} title="How it ends">
            <p>
              After the last round comes the {TARGET_YEAR} report card: which of
              the three national targets the country met, what each of you was
              privately playing for and whether you got it, and the three rounds
              where the trajectory actually turned.
            </p>
            <p className="mt-3">That last part is the conversation. Start there.</p>
          </Block>

          <Block id="htp-solo" icon={Bot} title="Short of players">
            <p>
              Any empty seat can be filled by the computer from the lobby, so
              one, two or three people can still run all four stakeholders.
            </p>
            <p className="mt-3">
              A computer seat picks at random from whatever it can afford, and
              occasionally funds whoever depends on it. You cannot negotiate
              with it, which is rather the point.
            </p>
          </Block>
        </div>
      </div>
    </dialog>
  )
}

function Block({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-7 scroll-mt-2 last:mb-0">
      <h3 className="mb-2.5 flex items-center gap-2 text-[17px] font-[650] text-navy">
        <Icon size={18} strokeWidth={2} className="shrink-0 text-brand" aria-hidden="true" />
        {title}
      </h3>
      <div className="text-[15px] leading-6 text-body">{children}</div>
    </section>
  )
}

/** One entry in the screen legend: the real component, then what it means. */
function Part({
  demo,
  title,
  children,
}: {
  demo: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-4 border-t border-line pt-4">
      <Demo>{demo}</Demo>
      <h4 className="mt-3 text-[15px] font-[650] text-navy">{title}</h4>
      <p className="mt-1 text-[14px] leading-[1.5] text-body">{children}</p>
    </div>
  )
}

/** A tray, so a live component reads as an example rather than a control. */
function Demo({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-[var(--radius-small)] bg-surface-2 p-3">{children}</div>
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 border-l-[3px] border-leaf pl-3 text-[14px] leading-[1.5] text-body italic">
      {children}
    </p>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="tabular font-[650] text-navy">{children}</span>
}

function Option({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li>
      <span className="block font-[650] text-navy">{title}</span>
      <span className="block">{children}</span>
    </li>
  )
}

function TargetRow({ label, op, value }: { label: string; op: string; value: number }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5 last:border-0">
      <span className="font-[650] text-navy">{label}</span>
      <span className="tabular shrink-0 text-[13px] text-muted">
        {op} <span className="font-[650] text-navy">{value}</span>
      </span>
    </li>
  )
}
