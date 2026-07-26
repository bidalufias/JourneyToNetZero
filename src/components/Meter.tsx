import {
  CircleAlert,
  CircleCheckBig,
  Factory,
  HeartPulse,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TARGET_YEAR } from '../game/situations'
import { THRESHOLDS } from '../game/synergies'
import type { IndicatorId } from '../game/types'

const META: Record<
  IndicatorId,
  {
    label: string
    short: string
    sub: string
    colour: string
    icon: LucideIcon
    max: number
    lowerIsBetter: boolean
  }
> = {
  economy: {
    label: 'Economy',
    short: 'Economy',
    sub: 'growth, investment, jobs',
    colour: 'var(--color-economy)',
    icon: TrendingUp,
    max: 100,
    lowerIsBetter: false,
  },
  emissions: {
    label: 'Emissions',
    short: 'Emissions',
    sub: '2026 = 100',
    colour: 'var(--color-emissions)',
    icon: Factory,
    max: 150,
    lowerIsBetter: true,
  },
  living: {
    label: 'Living Standards',
    short: 'Living',
    sub: 'cost of living, health, trust',
    colour: 'var(--color-living)',
    icon: HeartPulse,
    max: 100,
    lowerIsBetter: false,
  },
}

/**
 * MetricDisplay — one national indicator, its 2050 threshold marker and,
 * during resolution, the change this round. Direction is carried by an arrow
 * and a sign as well as the colour.
 */
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
  const Icon = m.icon
  const pct = Math.max(0, Math.min(100, (value / m.max) * 100))
  const target = (THRESHOLDS[id] / m.max) * 100
  const met = m.lowerIsBetter ? value <= THRESHOLDS[id] : value >= THRESHOLDS[id]

  // The sign alone does not say whether a round went well — falling emissions
  // are good, falling living standards are not — so the icon marks the
  // valence and the number keeps the direction. Neither depends on colour.
  const good = delta !== undefined ? (delta < 0) === m.lowerIsBetter : false
  const DeltaIcon = good ? CircleCheckBig : CircleAlert
  const deltaEl = delta !== undefined && delta !== 0 && (
    <span
      className={`tabular inline-flex items-center gap-1 text-[13px] font-[650] ${
        good ? 'text-positive' : 'text-negative'
      }`}
    >
      <DeltaIcon size={13} strokeWidth={2.5} aria-hidden="true" />
      {delta > 0 ? '+' : ''}
      {Math.round(delta)}
    </span>
  )

  const track = (height: string) => (
    <div className={`relative mt-2 w-full overflow-hidden rounded-full bg-surface-2 ${height}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: m.colour }}
      />
      {/* The 2050 threshold, so the gap is always visible. */}
      <div
        className="absolute top-0 h-full w-0.5 bg-navy/45"
        style={{ left: `${target}%` }}
        aria-hidden="true"
      />
    </div>
  )

  // Compact meters sit three-across on a 390px phone, so the label goes above
  // the number rather than beside it — "Living Standards" will not fit inline.
  if (!big) {
    return (
      <div className="rounded-[var(--radius-small)] border border-line bg-surface p-2.5">
        <div className="flex items-center gap-1.5">
          <Icon size={13} strokeWidth={2.25} style={{ color: m.colour }} aria-hidden="true" />
          <span className="truncate text-[12px] font-medium text-muted">{m.short}</span>
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="tabular text-[22px] leading-none font-bold text-navy">
            {Math.round(value)}
          </span>
          {deltaEl}
        </div>
        {track('h-1.5')}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={18} strokeWidth={2} style={{ color: m.colour }} aria-hidden="true" />
            <span className="truncate text-[20px] font-[650] text-navy">{m.label}</span>
          </div>
          <div className="mt-0.5 text-[12px] font-medium text-muted">{m.sub}</div>
        </div>
        <div className="flex shrink-0 items-baseline gap-2">
          {deltaEl}
          <span className="tabular text-[34px] leading-none font-bold text-navy">
            {Math.round(value)}
          </span>
        </div>
      </div>

      {track('h-2.5')}

      <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-[12px] font-medium">
        <span className="text-muted">
          {TARGET_YEAR} target {m.lowerIsBetter ? '≤' : '≥'} {THRESHOLDS[id]}
        </span>
        <span className={met ? 'text-positive' : 'text-warning'}>
          {met ? 'on track' : 'off track'}
        </span>
      </div>
    </div>
  )
}
