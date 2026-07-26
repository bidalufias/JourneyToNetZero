import type { ReactNode } from 'react'
import { Check, type LucideIcon } from 'lucide-react'
import type { RoleId } from '../game/types'
import { roleTheme } from './roleTheme'

/** The plain white surface everything else is built from. */
export function Card({
  children,
  className = '',
  tone,
}: {
  children: ReactNode
  className?: string
  /** Optional pale wash and matching border, e.g. a role or status colour. */
  tone?: { border: string; background: string }
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border p-4 ${className}`}
      style={
        tone
          ? { borderColor: tone.border, background: tone.background }
          : {
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-card)',
            }
      }
    >
      {children}
    </div>
  )
}

type Tone = 'neutral' | 'positive' | 'warning' | 'negative' | 'information' | 'role'

const TONES: Record<Exclude<Tone, 'role'>, { fg: string; bg: string }> = {
  neutral: { fg: 'var(--muted-text)', bg: 'var(--surface-secondary)' },
  positive: { fg: 'var(--positive)', bg: '#DCFCE7' },
  warning: { fg: 'var(--warning)', bg: '#FEF3C7' },
  negative: { fg: 'var(--negative)', bg: '#FEE2E2' },
  information: { fg: 'var(--information)', bg: 'var(--primary-blue-light)' },
}

/** A small labelled state marker. Always carries words, never colour alone. */
export function StatusChip({
  children,
  tone = 'neutral',
  role,
  icon: Icon,
}: {
  children: ReactNode
  tone?: Tone
  /** When tone is 'role', which role's colour to wear. */
  role?: RoleId
  icon?: LucideIcon
}) {
  const theme =
    tone === 'role' && role
      ? { fg: roleTheme(role).color, bg: roleTheme(role).light }
      : TONES[tone === 'role' ? 'neutral' : tone]

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ color: theme.fg, background: theme.bg }}
    >
      {Icon && <Icon size={13} strokeWidth={2.25} aria-hidden="true" className="shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  )
}

/**
 * The round's situation: headline first, then the grounding context. No new
 * framing is added here — it renders the situation text the game already has.
 */
export function ScenarioCard({
  headline,
  context,
  large = false,
}: {
  headline: ReactNode
  context: ReactNode
  large?: boolean
}) {
  return (
    <Card className={large ? 'p-6' : ''}>
      <p
        className={`font-[650] text-navy ${
          large ? 'text-[30px] leading-[1.2]' : 'text-[17px] leading-[1.35]'
        }`}
      >
        {headline}
      </p>
      <p
        className={`mt-2.5 text-body ${
          large ? 'text-[19px] leading-[1.55]' : 'text-[15px] leading-6'
        }`}
      >
        {context}
      </p>
    </Card>
  )
}

/**
 * One selectable option. `meta` is the cost line, `note` the reason it is
 * unavailable or the dependency it carries — both come from game data.
 */
export function ChoiceCard({
  role,
  kicker,
  title,
  summary,
  meta,
  note,
  noteTone = 'neutral',
  selected,
  disabled,
  onSelect,
}: {
  role: RoleId
  kicker: ReactNode
  title: ReactNode
  summary: ReactNode
  meta?: ReactNode
  note?: ReactNode
  noteTone?: 'neutral' | 'negative'
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const { color, light } = roleTheme(role)
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      // Once the round is locked every card is disabled — but the one you
      // picked should stay legible, so only the unpicked ones fade back.
      className={`w-full rounded-[var(--radius-card)] border p-4 text-left transition-[transform,background-color,border-color] duration-[var(--t-interaction)] ease-out not-disabled:active:scale-[0.99] ${
        disabled && !selected ? 'opacity-45' : ''
      }`}
      style={{
        borderColor: selected ? color : 'var(--border)',
        background: selected ? light : 'var(--surface)',
        boxShadow: selected ? 'none' : 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[13px] font-medium" style={{ color }}>
          {kicker}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {meta && <span className="tabular text-[12px] font-medium text-muted">{meta}</span>}
          {selected && (
            <span
              className="grid size-5 place-items-center rounded-full text-white"
              style={{ background: color }}
            >
              <Check size={13} strokeWidth={3} aria-hidden="true" />
            </span>
          )}
        </span>
      </div>

      <h3 className="mt-2 text-[17px] leading-[1.3] font-[650] text-navy">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-6 text-body">{summary}</p>

      {note && (
        <p
          className={`mt-2.5 text-[13px] font-medium ${
            noteTone === 'negative' ? 'text-negative' : 'text-muted'
          }`}
        >
          {note}
        </p>
      )}
    </button>
  )
}

/**
 * Round position. Dots plus the written "Round n of total" — the count is
 * readable without seeing the dots at all.
 */
export function ProgressIndicator({
  current,
  total,
  label,
}: {
  current: number
  total: number
  label?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-[background-color,width] duration-[var(--t-interaction)] ${
              i + 1 === current ? 'w-4 bg-brand' : i + 1 < current ? 'w-1.5 bg-brand/40' : 'w-1.5 bg-line-strong'
            }`}
          />
        ))}
      </span>
      {label && <span className="text-[12px] font-medium text-muted">{label}</span>}
    </div>
  )
}

/** A quiet waiting state: one sweep, no spinner, no pulsing. */
export function LoadingState({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[var(--content-max)]">
      <div className="shimmer h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <span className="shimmer-bar" />
      </div>
      <p className="mt-4 text-center text-[15px] text-muted" role="status">
        {children}
      </p>
    </div>
  )
}
