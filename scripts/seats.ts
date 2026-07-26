/**
 * What happens when the table is not full.
 *
 *   npx tsx scripts/seats.ts
 *
 * Empty seats are played by the computer: it picks at random from whatever it
 * can afford, and it funds the player who depends on it only sometimes and
 * never on request. This replays that against a coordinated human table to
 * show what an unrepresented stakeholder actually costs.
 *
 * The claim being tested is narrow: a table that cannot negotiate with every
 * stakeholder does measurably worse. Not that it always fails.
 *
 * Read the absolute numbers as a ceiling, not a forecast. The humans here play
 * greedily — always the strongest option open to them — which real tables do
 * not, so a full table scores 3/3 every time where `scripts/balance.ts` puts a
 * realistic deal-making table nearer 1.83. The gradient between lineups is the
 * finding; the levels are not.
 */
import { actionById } from '../src/game/actions'
import { availableActions, resolveRound, spendable, STARTING_INDICATORS } from '../src/game/engine'
import { ROLES } from '../src/game/roles'
import { TOTAL_ROUNDS } from '../src/game/situations'
import { THRESHOLDS } from '../src/game/synergies'
import type { Indicators, PlayerSeat, RoleId, Transfer } from '../src/game/types'
import { ROLE_IDS } from '../src/game/types'

/** Mirrors BOT_DEAL_CHANCE in src/store/useRoom.ts. */
const BOT_DEAL_CHANCE = 0.45
const TRIALS = 2000

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

/** Who must fund `role` for its conditional action this round. */
function funderFor(round: number, role: RoleId): RoleId | null {
  return actionById(`r${round}-${SHORT[role]}-conditional`).requires?.from ?? null
}

function playRound(
  round: number,
  indicators: Indicators,
  seats: Partial<Record<RoleId, PlayerSeat>>,
  humans: Set<RoleId>,
) {
  const transfers: Transfer[] = []
  const purse = (r: RoleId) => spendable(seats[r]?.currency ?? 0, r, transfers)

  // Humans coordinate: they fund each other's conditionals where they can.
  for (const role of ROLE_IDS) {
    if (!humans.has(role)) continue
    const from = funderFor(round, role)
    if (!from || !humans.has(from)) continue
    const need = actionById(`r${round}-${SHORT[role]}-conditional`).requires!.amount
    if (purse(from) >= need) transfers.push({ round, from, to: role, amount: need })
  }

  // Computer seats take one chance each, and cannot be asked.
  for (const from of ROLE_IDS) {
    if (humans.has(from)) continue
    if (Math.random() > BOT_DEAL_CHANCE) continue
    const target = ROLE_IDS.find((to) => to !== from && funderFor(round, to) === from)
    if (!target) continue
    const need = actionById(`r${round}-${SHORT[target]}-conditional`).requires!.amount
    if (purse(from) >= need) transfers.push({ round, from, to: target, amount: need })
  }

  const choices: Partial<Record<RoleId, string>> = {}
  for (const role of ROLE_IDS) {
    const options = availableActions(round, role, purse(role), transfers).filter(
      (o) => o.playable,
    )
    if (options.length === 0) continue

    if (humans.has(role)) {
      // A human plays the strongest thing open to them: conditional if it is
      // unlocked, otherwise the collective option.
      const want =
        options.find((o) => o.action.shape === 'conditional') ??
        options.find((o) => o.action.shape === 'collective') ??
        options[0]
      choices[role] = want.action.id
    } else {
      choices[role] = options[Math.floor(Math.random() * options.length)].action.id
    }
  }

  return resolveRound({ round, indicators, seats, choices, transfers })
}

function trial(humans: Set<RoleId>): number {
  let indicators: Indicators = { ...STARTING_INDICATORS }
  let seats = freshSeats()
  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    const out = playRound(round, indicators, seats, humans)
    indicators = out.indicators
    seats = out.seats
  }
  return [
    indicators.economy >= THRESHOLDS.economy,
    indicators.emissions <= THRESHOLDS.emissions,
    indicators.living >= THRESHOLDS.living,
  ].filter(Boolean).length
}

const LINEUPS: { label: string; humans: RoleId[] }[] = [
  { label: '4 players (full table)', humans: [...ROLE_IDS] },
  { label: '3 players, 1 computer', humans: ['government', 'business', 'community'] },
  { label: '2 players, 2 computers', humans: ['government', 'business'] },
  { label: '1 player, 3 computers', humans: ['government'] },
]

console.log(`Targets met out of 3, over ${TRIALS} tables each.\n`)
console.log('Lineup                     avg    0/3    1/3    2/3    3/3')
for (const { label, humans } of LINEUPS) {
  const set = new Set(humans)
  const dist = [0, 0, 0, 0]
  let total = 0
  for (let i = 0; i < TRIALS; i++) {
    const met = trial(set)
    dist[met]++
    total += met
  }
  const pct = (n: number) => `${((n / TRIALS) * 100).toFixed(0)}%`.padStart(6)
  console.log(
    `${label.padEnd(25)} ${(total / TRIALS).toFixed(2)} ` +
      dist.map(pct).join(' '),
  )
}
