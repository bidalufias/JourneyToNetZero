import { THRESHOLDS } from '../game/synergies'
import type { IndicatorId } from '../game/types'

const META: Record<
  IndicatorId,
  {
    label: string
    short: string
    sub: string
    colour: string
    max: number
    lowerIsBetter: boolean
  }
> = {
  economy: {
    label: 'Economy',
    short: 'Economy',
    sub: 'growth, investment, jobs',
    colour: 'var(--color-economy)',
    max: 100,
    lowerIsBetter: false,
  },
  emissions: {
    label: 'Emissions',
    short: 'Emissions',
    sub: '2026 = 100',
    colour: 'var(--color-emissions)',
    max: 150,
    lowerIsBetter: true,
  },
  living: {
    label: 'Living Standards',
    short: 'Living',
    sub: 'cost of living, health, trust',
    colour: 'var(--color-living)',
    max: 100,
    lowerIsBetter: false,
  },
}

export function Meter({
  id,
  value,
  delta,
  big = false,
}: {
  id: IndicatorId
  value: number
  delta?: number
  big?: boolean
}) {
  const m = META[id]
  const pct = Math.max(0, Math.min(100, (value / m.max) * 100))
  const target = (THRESHOLDS[id] / m.max) * 100
  const met = m.lowerIsBetter ? value <= THRESHOLDS[id] : value >= THRESHOLDS[id]

  const deltaEl = delta !== undefined && delta !== 0 && (
    <span
      className={`tabular text-sm font-medium ${
        (delta < 0) === m.lowerIsBetter ? 'text-living' : 'text-emissions'
      }`}
    >
      {delta > 0 ? '+' : ''}
      {Math.round(delta)}
    </span>
  )

  // Compact meters sit three-across on a 390px phone, so the label goes above
  // the number rather than beside it — "Living Standards" will not fit inline.
  if (!big) {
    return (
      <div>
        <div className="truncate text-[11px] font-medium text-mist-300">
          {m.short}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="tabular text-xl font-semibold" style={{ color: m.colour }}>
            {Math.round(value)}
          </span>
          {deltaEl}
        </div>
        <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%`, background: m.colour }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-mist-100/70"
            style={{ left: `${target}%` }}
            aria-hidden
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-2xl font-semibold tracking-tight">{m.label}</div>
          <div className="text-xs text-mist-400">{m.sub}</div>
        </div>
        <div className="flex items-baseline gap-2">
          {deltaEl}
          <span className="tabular text-4xl font-semibold" style={{ color: m.colour }}>
            {Math.round(value)}
          </span>
        </div>
      </div>

      <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, background: m.colour }}
        />
        {/* The 2050 threshold, so the gap is always visible. */}
        <div
          className="absolute top-0 h-full w-0.5 bg-mist-100/70"
          style={{ left: `${target}%` }}
          aria-hidden
        />
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-mist-400">
          <span>
            2050 target {m.lowerIsBetter ? '≤' : '≥'} {THRESHOLDS[id]}
          </span>
        <span className={met ? 'text-living' : 'text-mist-400'}>
          {met ? 'on track' : 'off track'}
        </span>
      </div>
    </div>
  )
}
