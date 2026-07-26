import { useEffect, useRef } from 'react'
import {
  ArrowRightLeft,
  Bot,
  EyeOff,
  Landmark,
  Lock,
  Target,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react'
import { ROLES, ROLE_ORDER } from '../game/roles'
import { SITUATIONS, TARGET_YEAR, TOTAL_ROUNDS } from '../game/situations'
import { THRESHOLDS } from '../game/synergies'
import { PHASE_SECONDS } from '../lib/config'
import { RoleBadge } from './Role'

/**
 * The rules, in the order a new player needs them.
 *
 * Every number here is read from the game rather than written down — the round
 * count, the 2050 thresholds, the phase lengths, the roles and their starting
 * currency. Change the game and this changes with it, which is the only way a
 * guide stays true.
 */

const PHASES: { label: string; phase: keyof typeof PHASE_SECONDS; what: string }[] = [
  { label: 'Situation', phase: 'situation', what: 'A real Malaysian scenario appears on every screen.' },
  { label: 'Discussion', phase: 'discussion', what: 'Talk it out. Move currency to strike deals.' },
  { label: 'Lock in', phase: 'locking', what: 'Each player privately picks one of three actions.' },
  { label: 'Reveal', phase: 'reveal', what: 'All four choices flip at once.' },
  { label: 'Resolution', phase: 'resolution', what: 'The meters move and the round is recorded.' },
]

const SHAPES: { title: string; body: string }[] = [
  {
    title: 'Protect your own',
    body: 'Cheap, shields you, and pushes the cost onto everyone else.',
  },
  {
    title: 'Carry the cost',
    body: 'Helps the country, costs you, and usually hurts your private agenda.',
  },
  {
    title: 'Needs a deal',
    body: 'The strongest option on the board, locked until another player funds you this round.',
  },
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
      <div className="flex max-h-[86dvh] w-full flex-col">
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <Block icon={Target} title="What you are trying to do">
            <p>
              Four stakeholders share three national outcomes, and every one of
              you is judged on all three. By {TARGET_YEAR} the table needs:
            </p>
            <ul className="mt-3 space-y-1.5">
              <Target3 label="Economy" op="at least" value={THRESHOLDS.economy} />
              <Target3 label="Emissions" op="at most" value={THRESHOLDS.emissions} />
              <Target3 label="Living standards" op="at least" value={THRESHOLDS.living} />
            </ul>
            <p className="mt-3">
              Emissions start at 100 and are indexed to {firstYear}. Doing
              nothing is not neutral — the world moves every round whether the
              table does or not.
            </p>
          </Block>

          <Block icon={Landmark} title="Who you are">
            <p>
              One role each. Each spends a different kind of currency, and no
              role can move all three outcomes alone.
            </p>
            <ul className="mt-3 space-y-2">
              {ROLE_ORDER.map((r) => (
                <li key={r} className="flex items-center justify-between gap-3">
                  <RoleBadge role={r} size="sm" />
                  <span className="shrink-0 text-[13px] text-muted">
                    {ROLES[r].startingCurrency} {ROLES[r].currency}
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={Timer} title="How a round runs">
            <ol className="space-y-2.5">
              {PHASES.map((p) => (
                <li key={p.label} className="flex gap-3">
                  <span className="tabular w-11 shrink-0 pt-0.5 text-[13px] font-[650] text-brand">
                    {PHASE_SECONDS[p.phase]}s
                  </span>
                  <span>
                    <span className="block font-[650] text-navy">{p.label}</span>
                    <span className="block">{p.what}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3">
              Any player can add time to a discussion. The big screen at{' '}
              <span className="font-[650] text-navy">/board/CODE</span> follows
              along and needs nobody to run it.
            </p>
          </Block>

          <Block icon={Lock} title="Your three options">
            <ul className="space-y-2.5">
              {SHAPES.map((s) => (
                <li key={s.title}>
                  <span className="block font-[650] text-navy">{s.title}</span>
                  <span className="block">{s.body}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={ArrowRightLeft} title="Deals are the engine">
            <p>
              A “needs a deal” action stays locked until a specific other role
              funds you during the discussion. Sending is binding and everyone
              sees it on the board. What the recipient then does with it is not
              binding at all — you can take someone’s budget and still choose
              against them.
            </p>
            <p className="mt-3">
              Currency settles at the end of the round, together with what your
              action costs and what it earns you.
            </p>
          </Block>

          <Block icon={EyeOff} title="Nobody sees your choice">
            <p>
              While a round is open your phone records only that you have locked
              in. All four choices are published together at the reveal, so the
              round is genuinely simultaneous.
            </p>
            <p className="mt-3">
              You also hold a private agenda of your own, which nobody else
              sees until the {TARGET_YEAR} report card.
            </p>
          </Block>

          <Block icon={Bot} title="Short of players">
            <p>
              Any empty seat can be filled by the computer from the lobby, so
              one, two or three people can still play all four stakeholders. A
              computer seat picks at random from what it can afford, and it will
              occasionally fund whoever depends on it — but you cannot negotiate
              with it.
            </p>
          </Block>
        </div>
      </div>
    </dialog>
  )
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 flex items-center gap-2 text-[17px] font-[650] text-navy">
        <Icon size={18} strokeWidth={2} className="shrink-0 text-brand" aria-hidden="true" />
        {title}
      </h3>
      <div className="text-[15px] leading-6 text-body">{children}</div>
    </section>
  )
}

function Target3({ label, op, value }: { label: string; op: string; value: number }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5 last:border-0">
      <span className="font-[650] text-navy">{label}</span>
      <span className="tabular shrink-0 text-[13px] text-muted">
        {op} <span className="font-[650] text-navy">{value}</span>
      </span>
    </li>
  )
}
