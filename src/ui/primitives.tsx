/**
 * Shared primitives for both surfaces.
 *
 * The four roles are told apart by glyph and ink, never by typeface — Archivo
 * is the law of the system. The glyphs are the four "private objects" from the
 * brief, reduced to marks that survive being 12px on a phone and 200px on a
 * projector.
 */
import type { CSSProperties } from 'react'
import type { Role } from '../engine/types'

export const ROLE_GLYPH: Record<Role, 'bar' | 'square' | 'dot' | 'triangle'> = {
  government: 'bar',
  business: 'square',
  community: 'dot',
  activist: 'triangle',
}

export function RoleGlyph({
  role,
  size = 16,
  className,
}: {
  role: Role
  size?: number
  className?: string
}) {
  const shape = ROLE_GLYPH[role]
  const c = 'currentColor'
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {shape === 'bar' && <rect x="2" y="7" width="12" height="2.5" fill={c} />}
      {shape === 'square' && <rect x="4.5" y="4.5" width="7" height="7" fill={c} />}
      {shape === 'dot' && <circle cx="8" cy="8" r="3.6" fill={c} />}
      {shape === 'triangle' && <path d="M8 3.6 L13 12.4 L3 12.4 Z" fill={c} />}
    </svg>
  )
}

/** mm:ss from a server deadline. Returns null when the phase does not tick. */
export function formatClock(msRemaining: number | null): string | null {
  if (msRemaining === null) return null
  const total = Math.max(0, Math.ceil(msRemaining / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export interface MeterSpec {
  label: string
  value: number
  /** Rendered value, e.g. "248" or "4.8". */
  display: string
  unit: string
  /** Where the bar starts filling from. */
  from: number
  target: number
  /** True when lower is better, as for emissions. */
  inverted?: boolean
  ink: string
  status: { text: string; tone: 'good' | 'warn' | 'bad' }
  footLeft: string
}

const SEGMENTS = 10

export function Meter({ spec }: { spec: MeterSpec }) {
  const span = spec.target - spec.from
  const raw = span === 0 ? 0 : (spec.value - spec.from) / span
  const fill = Math.max(0, Math.min(1, raw))
  const lit = Math.round(fill * SEGMENTS)

  return (
    <div className="meter" style={{ '--meter-ink': spec.ink } as CSSProperties}>
      <div className="meter__head">
        <span className="meter__label">{spec.label}</span>
        <span className="meter__status" data-tone={spec.status.tone}>
          {spec.status.text}
        </span>
      </div>
      <div className="meter__value">
        <span className="meter__number">{spec.display}</span>
        <span className="meter__unit">{spec.unit}</span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-label={spec.label}
        aria-valuenow={Number(spec.display)}
        aria-valuemin={spec.from}
        aria-valuemax={spec.target}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={`meter__seg${i < lit ? ' meter__seg--on' : ''}`}
            // Stagger so three bars never move as one block.
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
      <div className="meter__foot">
        <span>{spec.footLeft}</span>
        <span className="meter__target">
          TARGET {spec.target}
        </span>
      </div>
    </div>
  )
}

/** The 2050 line: the most motivating element on the screen. */
export function Sparkline({
  values,
  target,
  width = 220,
  height = 56,
}: {
  values: number[]
  target: number
  width?: number
  height?: number
}) {
  if (values.length < 2) return null
  const all = [...values, target]
  const min = Math.min(...all)
  const max = Math.max(...all)
  const span = max - min || 1
  const x = (i: number) => (i / (values.length - 1)) * (width - 2) + 1
  const y = (v: number) => height - 2 - ((v - min) / span) * (height - 4)
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <svg className="proj__spark" width={width} height={height} aria-hidden="true">
      <line
        x1="0"
        x2={width}
        y1={y(target)}
        y2={y(target)}
        stroke="var(--jtnz-com-warm)"
        strokeWidth="2"
        strokeDasharray="8 6"
      />
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="3" />
    </svg>
  )
}
