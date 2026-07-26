import { useState } from 'react'
import { ArrowRightLeft, Send } from 'lucide-react'
import { ROLES } from '../game/roles'
import type { RoleId } from '../game/types'
import { ROLE_IDS } from '../game/types'
import type { SeatRow } from '../lib/supabase'
import { Card, roleTheme } from '../ui'

/**
 * Currency moves the instant it is sent, and everyone sees it on the board.
 * What the recipient then does with it is entirely up to them — that gap is
 * where the game lives.
 */
export function TransferPanel({
  me,
  seats,
  onSend,
}: {
  me: RoleId
  seats: Partial<Record<RoleId, SeatRow>>
  onSend: (to: RoleId, amount: number) => void
}) {
  const mySeat = seats[me]
  const [target, setTarget] = useState<RoleId | null>(null)
  const [amount, setAmount] = useState(2)
  if (!mySeat) return null

  const others = ROLE_IDS.filter((r) => r !== me && seats[r])
  const max = mySeat.currency
  const value = Math.min(amount, Math.max(1, max))

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-[650] text-navy">
          <ArrowRightLeft size={18} strokeWidth={2} className="text-brand" aria-hidden="true" />
          Move {ROLES[me].currency}
        </h2>
        <span className="tabular shrink-0 text-[13px] font-medium text-muted">
          {max} available
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-5 text-body">
        Sending is binding and immediate. What they do with it afterwards is
        not — that is the risk you are taking.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {others.map((r) => {
          const { color, light, icon: Icon } = roleTheme(r)
          const on = target === r
          return (
            <button
              key={r}
              type="button"
              onClick={() => setTarget(on ? null : r)}
              aria-pressed={on}
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[var(--radius-small)] border px-1.5 py-2 text-[12px] font-[650] transition-[background-color,border-color] duration-[var(--t-interaction)] ease-out"
              style={{
                borderColor: on ? color : 'var(--border)',
                background: on ? light : 'var(--surface)',
                color: on ? color : 'var(--body-text)',
              }}
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              <span className="w-full truncate text-center">{ROLES[r].name}</span>
            </button>
          )
        })}
      </div>

      {target && (
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={Math.max(1, max)}
            value={value}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-11 flex-1 accent-[var(--primary-blue)]"
            aria-label={`Amount to send to ${ROLES[target].name}`}
          />
          <span className="tabular w-6 shrink-0 text-center text-[17px] font-bold text-navy">
            {value}
          </span>
          <button
            type="button"
            disabled={max < 1}
            onClick={() => {
              onSend(target, Math.min(amount, max))
              setTarget(null)
            }}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[var(--radius-small)] bg-brand px-4 text-[15px] font-[650] text-white transition-transform duration-[var(--t-interaction)] ease-out active:scale-[0.98] disabled:opacity-40"
          >
            <Send size={16} strokeWidth={2} aria-hidden="true" />
            Send
          </button>
        </div>
      )}
    </Card>
  )
}
