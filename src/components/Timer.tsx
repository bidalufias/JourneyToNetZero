import { useEffect, useState } from 'react'

/** Seconds remaining until an ISO timestamp, ticking once a second. */
export function useCountdown(endsAt: string | null, paused: boolean): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt || paused) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [endsAt, paused])

  if (!endsAt) return null
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000))
}

export function TimerRing({
  seconds,
  total,
  size = 56,
  label,
}: {
  seconds: number
  total: number
  size?: number
  label?: string
}) {
  const r = size / 2 - 4
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0
  const urgent = seconds <= 10

  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} className="-rotate-90 shrink-0" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="3.5"
          stroke="var(--border)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          stroke={urgent ? 'var(--warning)' : 'var(--primary-blue)'}
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>
      <div>
        <div
          className={`tabular text-[20px] leading-none font-bold ${
            urgent ? 'text-warning' : 'text-navy'
          }`}
          role="timer"
          aria-live="off"
        >
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </div>
        {label && (
          <div className="mt-1 text-[12px] font-medium text-muted">{label}</div>
        )}
      </div>
    </div>
  )
}
