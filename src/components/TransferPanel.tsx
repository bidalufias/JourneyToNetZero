import { useState } from 'react'
import { ROLES } from '../game/roles'
import type { RoleId } from '../game/types'
import { ROLE_IDS } from '../game/types'
import type { SeatRow } from '../lib/supabase'

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

  return (
    <section className="card p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Move {ROLES[me].currency}</h2>
        <span className="tabular text-sm text-mist-400">{max} available</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-mist-400">
        Sending is binding and immediate. What they do with it afterwards is
        not — that is the risk you are taking.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {others.map((r) => (
          <button
            key={r}
            onClick={() => setTarget(target === r ? null : r)}
            className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
              target === r
                ? 'border-mist-100 bg-ink-600'
                : 'border-mist-400/20 bg-ink-800'
            }`}
            style={target === r ? { color: ROLES[r].accent } : undefined}
          >
            {ROLES[r].name}
          </button>
        ))}
      </div>

      {target && (
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={Math.max(1, max)}
            value={Math.min(amount, Math.max(1, max))}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 accent-mist-100"
            aria-label="Amount to send"
          />
          <span className="tabular w-6 text-center text-lg font-semibold">
            {Math.min(amount, Math.max(1, max))}
          </span>
          <button
            disabled={max < 1}
            onClick={() => {
              onSend(target, Math.min(amount, max))
              setTarget(null)
            }}
            className="rounded-xl bg-mist-100 px-4 py-2 text-sm font-semibold text-ink-900 disabled:opacity-30"
          >
            Send
          </button>
        </div>
      )}
    </section>
  )
}
