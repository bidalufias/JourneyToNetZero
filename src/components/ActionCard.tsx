import { ROLES } from '../game/roles'
import type { Action } from '../game/types'

const SHAPE_LABEL = {
  self: 'Protect your own',
  collective: 'Carry the cost',
  conditional: 'Needs a deal',
} as const

export function ActionCard({
  action,
  playable,
  reason,
  selected,
  onSelect,
}: {
  action: Action
  playable: boolean
  reason?: string
  selected: boolean
  onSelect: () => void
}) {
  const accent = ROLES[action.role].accent

  return (
    <button
      onClick={onSelect}
      disabled={!playable}
      aria-pressed={selected}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-mist-100 bg-ink-600'
          : 'border-mist-400/20 bg-ink-800 active:scale-[0.99]'
      } ${playable ? '' : 'opacity-45'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[10px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: accent }}
        >
          {SHAPE_LABEL[action.shape]}
        </span>
        <span className="tabular text-xs text-mist-400">
          {action.cost > 0 ? `−${action.cost}` : 'free'}
          {action.income ? ` · +${action.income}` : ''}
        </span>
      </div>

      <h3 className="mt-2 text-lg leading-snug font-semibold tracking-tight">
        {action.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-mist-300">{action.summary}</p>

      {!playable && reason && (
        <p className="mt-2 text-xs font-medium text-emissions">{reason}</p>
      )}

      {action.requires && playable && (
        <p className="mt-2 text-xs text-mist-400">
          Unlocked by {ROLES[action.requires.from].name}
        </p>
      )}
    </button>
  )
}

/** Compact version for the reveal, where all four are shown at once. */
export function RevealCard({ action, name }: { action: Action; name: string }) {
  const role = ROLES[action.role]
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: role.accent }}>
          {role.name}
        </span>
        <span className="truncate text-xs text-mist-400">{name}</span>
      </div>
      <h3 className="mt-1.5 leading-snug font-semibold">{action.title}</h3>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <Effect label="Eco" value={action.effects.economy ?? 0} good={(v) => v > 0} />
        <Effect label="Emi" value={action.effects.emissions ?? 0} good={(v) => v < 0} />
        <Effect label="Liv" value={action.effects.living ?? 0} good={(v) => v > 0} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-mist-400">
        {action.rationale}
      </p>
    </div>
  )
}

function Effect({
  label,
  value,
  good,
}: {
  label: string
  value: number
  good: (v: number) => boolean
}) {
  if (value === 0) return null
  return (
    <span className={good(value) ? 'text-living' : 'text-emissions'}>
      {label} {value > 0 ? '+' : ''}
      {value}
    </span>
  )
}
