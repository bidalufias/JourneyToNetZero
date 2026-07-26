/**
 * Balance check. Runs archetypal tables through all eight rounds and reports
 * where each lands against the 2050 thresholds.
 *
 *   npx tsx scripts/balance.ts
 *
 * What we want to see:
 *   - a table that never cooperates loses on all three counts
 *   - a table that plays every collective option does well but not perfectly
 *   - a table that barters properly can pass all three, and only just
 */
import { actionById } from '../src/game/actions'
import { BASE_INCOME, resolveRound, STARTING_INDICATORS } from '../src/game/engine'
import { ROLES } from '../src/game/roles'
import { TOTAL_ROUNDS } from '../src/game/situations'
import { THRESHOLDS } from '../src/game/synergies'
import type {
  ActionShape,
  Indicators,
  PlayerSeat,
  RoleId,
  RoundResult,
  Transfer,
} from '../src/game/types'
import { ROLE_IDS } from '../src/game/types'

const SHORT: Record<RoleId, string> = {
  government: 'gov',
  business: 'biz',
  community: 'com',
  activist: 'act',
}

function freshSeats(): Partial<Record<RoleId, PlayerSeat>> {
  const seats: Partial<Record<RoleId, PlayerSeat>> = {}
  for (const role of ROLE_IDS) {
    seats[role] = {
      id: role,
      role,
      name: ROLES[role].name,
      currency: ROLES[role].startingCurrency,
      agendaId: '',
      connected: true,
    }
  }
  return seats
}

type Strategy = (round: number, role: RoleId) => ActionShape

/**
 * A cooperative table works out who can fund whom. Transfers settle net, so a
 * mutual pair (each unlocking the other) costs neither of them anything —
 * which is exactly the deal real players find within a round or two.
 */
function transfersFor(
  round: number,
  strategy: Strategy,
  seats: Partial<Record<RoleId, PlayerSeat>>,
): Transfer[] {
  const wanted: Transfer[] = []
  for (const role of ROLE_IDS) {
    if (strategy(round, role) !== 'conditional') continue
    const req = actionById(`r${round}-${SHORT[role]}-conditional`).requires
    if (req) wanted.push({ round, from: req.from, to: role, amount: req.amount })
  }

  // Drop transfers the funder cannot cover once incoming money and their own
  // action cost are accounted for. Repeat until stable, since dropping one
  // transfer can make another unaffordable.
  let kept = [...wanted]
  for (;;) {
    const affordable = kept.filter((t) => {
      const seat = seats[t.from]
      if (!seat) return false
      const out = kept
        .filter((x) => x.from === t.from)
        .reduce((s, x) => s + x.amount, 0)
      const inc = kept
        .filter((x) => x.to === t.from)
        .reduce((s, x) => s + x.amount, 0)
      const unlocked = kept.some((x) => x.to === t.from)
      const shape = unlocked ? strategy(round, t.from) : 'collective'
      const ownCost = actionById(`r${round}-${SHORT[t.from]}-${shape}`).cost
      return seat.currency + inc - out >= ownCost
    })
    if (affordable.length === kept.length) return kept
    kept = affordable
    if (kept.length === 0) return kept
  }
}

function play(strategy: Strategy, label: string) {
  let indicators: Indicators = { ...STARTING_INDICATORS }
  let seats = freshSeats()
  const history: RoundResult[] = []
  let skipped = 0

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    const transfers = transfersFor(round, strategy, seats)
    const choices: Partial<Record<RoleId, string>> = {}

    for (const role of ROLE_IDS) {
      let want = strategy(round, role)
      // Nobody knowingly plays a conditional they failed to get funded — the
      // real UI will not let them. They fall back to the collective option.
      if (want === 'conditional' && !transfers.some((t) => t.to === role)) {
        want = 'collective'
      }
      const action = actionById(`r${round}-${SHORT[role]}-${want}`)
      const seat = seats[role]!
      const incoming = transfers
        .filter((t) => t.to === role)
        .reduce((s, t) => s + t.amount, 0)
      const outgoing = transfers
        .filter((t) => t.from === role)
        .reduce((s, t) => s + t.amount, 0)
      const spendable = seat.currency + incoming - outgoing

      if (action.cost > spendable) {
        // Fall back to the cheapest thing they can afford.
        const fallback = (['self', 'collective', 'conditional'] as ActionShape[])
          .map((s) => actionById(`r${round}-${SHORT[role]}-${s}`))
          .filter((a) => a.cost <= spendable && !a.requires)
          .sort((a, b) => a.cost - b.cost)[0]
        if (!fallback) {
          skipped++
          continue
        }
        choices[role] = fallback.id
      } else {
        choices[role] = action.id
      }
    }

    const out = resolveRound({ round, indicators, seats, choices, transfers })
    indicators = out.indicators
    seats = out.seats
    history.push(out.result)
  }

  const pass = {
    economy: indicators.economy >= THRESHOLDS.economy,
    emissions: indicators.emissions <= THRESHOLDS.emissions,
    living: indicators.living >= THRESHOLDS.living,
  }
  const count = Object.values(pass).filter(Boolean).length
  const mark = (ok: boolean) => (ok ? '✓' : '✗')

  if (process.env.DIAG && label.startsWith('Everyone barters')) {
    const conditionals = history.flatMap((h) =>
      Object.values(h.choices).filter((id) => id?.endsWith('conditional')),
    ).length
    console.log(
      `  [diag] ${conditionals}/32 conditional actions actually played; ` +
        `end currency ${ROLE_IDS.map((r) => `${SHORT[r]}:${seats[r]!.currency}`).join(' ')}`,
    )
  }

  console.log(
    `${label.padEnd(30)} ` +
      `ECO ${String(indicators.economy).padStart(3)} ${mark(pass.economy)}  ` +
      `EMI ${String(indicators.emissions).padStart(3)} ${mark(pass.emissions)}  ` +
      `LIV ${String(indicators.living).padStart(3)} ${mark(pass.living)}  ` +
      `→ ${count}/3` +
      (skipped ? `  (${skipped} skipped)` : ''),
  )
  return count
}

console.log(
  `\nThresholds: Economy ≥${THRESHOLDS.economy}, Emissions ≤${THRESHOLDS.emissions}, Living ≥${THRESHOLDS.living}`,
)
console.log(`Start: ${JSON.stringify(STARTING_INDICATORS)}, base income ${BASE_INCOME}/round\n`)

play(() => 'self', 'Everyone self-interested')
play(() => 'collective', 'Everyone collective')
play(() => 'conditional', 'Everyone barters (ideal)')
play((_, role) => (role === 'business' ? 'self' : 'collective'), 'Business defects')
play((_, role) => (role === 'community' ? 'self' : 'collective'), 'Community defects')
play((r) => (r <= 4 ? 'self' : 'conditional'), 'Late awakening (r5+)')
play((r) => (r <= 4 ? 'conditional' : 'self'), 'Early effort, then coast')
play((r, role) => (ROLE_IDS.indexOf(role) + r) % 2 ? 'collective' : 'self', 'Half-hearted alternating')

// Deterministic pseudo-random tables, so the check is reproducible.
let seed = 12345
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31

/** Weighted draw, since real tables do not choose uniformly at random. */
function weighted(self: number, collective: number): Strategy {
  return () => {
    const r = rnd()
    if (r < self) return 'self'
    if (r < self + collective) return 'collective'
    return 'conditional'
  }
}

const PROFILES: [string, Strategy][] = [
  ['Cautious table', weighted(0.35, 0.5)],
  ['Cooperative table', weighted(0.15, 0.6)],
  ['Deal-making table', weighted(0.2, 0.3)],
  ['Chaotic table', weighted(0.34, 0.33)],
]

console.log('')
const RUNS = 6
for (const [name, strat] of PROFILES) {
  let total = 0
  for (let i = 0; i < RUNS; i++) {
    total += play(strat, `${name} ${i + 1}`)
  }
  console.log(`  ${name}: ${(total / RUNS).toFixed(2)} / 3 average\n`)
}
