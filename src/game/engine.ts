import { actionById } from './actions'
import { agendaById } from './agendas'
import { ROLES } from './roles'
import { situationFor, TOTAL_ROUNDS } from './situations'
import { endingFor, synergiesFor, THRESHOLDS } from './synergies'
import type {
  Action,
  Agenda,
  Ending,
  IndicatorDelta,
  Indicators,
  PlayerSeat,
  RoleId,
  RoundResult,
  Transfer,
} from './types'
import { ROLE_IDS } from './types'

export const STARTING_INDICATORS: Indicators = {
  economy: 50,
  emissions: 100,
  living: 50,
}

/**
 * Every role earns this much currency at the end of each round.
 *
 * Tuned against scripts/balance.ts: a table playing every conditional action
 * spends around 15 currency per round between them, so anything below 4 makes
 * sustained bartering unaffordable and quietly collapses the game into the
 * collective-only strategy.
 */
export const BASE_INCOME = 4

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function addDelta(base: Indicators, d: IndicatorDelta): Indicators {
  return {
    economy: base.economy + (d.economy ?? 0),
    emissions: base.emissions + (d.emissions ?? 0),
    living: base.living + (d.living ?? 0),
  }
}

function scale(d: IndicatorDelta, m: number): IndicatorDelta {
  return {
    economy: (d.economy ?? 0) * m,
    emissions: (d.emissions ?? 0) * m,
    living: (d.living ?? 0) * m,
  }
}

/**
 * A conditional action only counts if the required role actually transferred
 * enough currency to the actor this round. Deals are binding at the moment
 * currency moves — but nothing forces the recipient to then play the action
 * they promised. Betrayal is a legal move, and a visible one.
 */
export function isUnlocked(action: Action, transfers: Transfer[]): boolean {
  if (!action.requires) return true
  const received = transfers
    .filter((t) => t.to === action.role && t.from === action.requires!.from)
    .reduce((sum, t) => sum + t.amount, 0)
  return received >= action.requires.amount
}

/** Actions a player can currently afford and has unlocked. */
export function availableActions(
  round: number,
  role: RoleId,
  currency: number,
  transfers: Transfer[],
): { action: Action; playable: boolean; reason?: string }[] {
  return ['self', 'collective', 'conditional']
    .map((shape) => actionById(`r${round}-${shortRole(role)}-${shape}`))
    .map((action) => {
      if (action.cost > currency) {
        return {
          action,
          playable: false,
          reason: `Needs ${action.cost} ${ROLES[role].currency}`,
        }
      }
      if (!isUnlocked(action, transfers)) {
        const req = action.requires!
        return {
          action,
          playable: false,
          reason: `Locked — needs ${req.amount} from ${ROLES[req.from].name}`,
        }
      }
      return { action, playable: true }
    })
}

function shortRole(role: RoleId): string {
  return { government: 'gov', business: 'biz', community: 'com', activist: 'act' }[
    role
  ]
}

export interface ResolveInput {
  round: number
  indicators: Indicators
  seats: Partial<Record<RoleId, PlayerSeat>>
  choices: Partial<Record<RoleId, string>>
  transfers: Transfer[]
}

export interface ResolveOutput {
  result: RoundResult
  indicators: Indicators
  seats: Partial<Record<RoleId, PlayerSeat>>
}

/**
 * The referee. Runs once per round, on the host client, and the outcome is
 * written to the room — never recomputed on another phone.
 */
export function resolveRound(input: ResolveInput): ResolveOutput {
  const { round, choices, transfers } = input
  const situation = situationFor(round)
  const before = { ...input.indicators }

  // 1. Business as usual moves first. The world does not wait for the table.
  let indicators = addDelta(before, situation.drift)

  // 2. Which synergies fired this round.
  const chosenIds = new Set(Object.values(choices).filter(Boolean) as string[])
  const fired = synergiesFor(round).filter((s) =>
    s.requires.every((id) => chosenIds.has(id)),
  )

  // 3. Each player's action, modified by any synergy affecting them.
  const emissionsBy: Partial<Record<RoleId, number>> = {}
  const seats = { ...input.seats }

  for (const role of ROLE_IDS) {
    const actionId = choices[role]
    if (!actionId) continue
    const action = actionById(actionId)

    // A conditional action played without the required transfer does nothing.
    if (!isUnlocked(action, transfers)) {
      emissionsBy[role] = 0
      continue
    }

    let effects: IndicatorDelta = { ...action.effects }
    for (const syn of fired) {
      if (syn.affects.includes(role)) effects = scale(effects, syn.multiplier)
    }

    indicators = addDelta(indicators, effects)
    emissionsBy[role] = effects.emissions ?? 0
  }

  // 4. Currency: transfers, action costs, income.
  for (const t of transfers) {
    const from = seats[t.from]
    const to = seats[t.to]
    if (from) seats[t.from] = { ...from, currency: from.currency - t.amount }
    if (to) seats[t.to] = { ...to, currency: to.currency + t.amount }
  }

  for (const role of ROLE_IDS) {
    const seat = seats[role]
    if (!seat) continue
    const actionId = choices[role]
    const action = actionId ? actionById(actionId) : null
    const spend = action ? action.cost : 0
    const earn = (action?.income ?? 0) + BASE_INCOME
    seats[role] = {
      ...seat,
      currency: Math.max(0, seat.currency - spend + earn),
    }
  }

  // 5. Bound the indicators.
  indicators = {
    economy: clamp(Math.round(indicators.economy), 0, 100),
    emissions: clamp(Math.round(indicators.emissions), 0, 150),
    living: clamp(Math.round(indicators.living), 0, 100),
  }

  return {
    indicators,
    seats,
    result: {
      round,
      choices,
      transfers,
      before,
      after: indicators,
      firedSynergies: fired.map((f) => f.id),
      emissionsBy,
    },
  }
}

/* ------------------------------------------------------------- agendas */

export interface AgendaOutcome {
  role: RoleId
  agenda: Agenda
  met: boolean
  detail: string
}

export function evaluateAgenda(
  role: RoleId,
  agendaId: string,
  history: RoundResult[],
  seat: PlayerSeat | undefined,
): AgendaOutcome {
  const agenda = agendaById(agendaId)
  const check = agenda.check
  const final = history.at(-1)?.after ?? STARTING_INDICATORS
  const allTransfers = history.flatMap((h) => h.transfers)
  const myDeals = allTransfers.filter((t) => t.from === role || t.to === role)

  let met = false
  let detail = ''

  switch (check.type) {
    case 'never_below': {
      const worst = Math.min(...history.map((h) => h.after[check.indicator]))
      met = worst >= check.value
      detail = `Lowest reached: ${worst} (needed ${check.value} or above)`
      break
    }
    case 'never_above': {
      const peak = Math.max(...history.map((h) => h.after[check.indicator]))
      met = peak <= check.value
      detail = `Highest reached: ${peak} (needed ${check.value} or below)`
      break
    }
    case 'final': {
      const v = final[check.indicator]
      met = check.op === 'gte' ? v >= check.value : v <= check.value
      detail = `Finished at ${v} (needed ${check.op === 'gte' ? '≥' : '≤'} ${check.value})`
      break
    }
    case 'by_round': {
      const at = history.find((h) => h.round === check.round)?.after
      const v = at?.[check.indicator]
      met = v === undefined ? false : check.op === 'gte' ? v >= check.value : v <= check.value
      detail = `Round ${check.round} ended at ${v ?? '—'} (needed ${check.op === 'gte' ? '≥' : '≤'} ${check.value})`
      break
    }
    case 'currency_final': {
      const v = seat?.currency ?? 0
      met = check.op === 'gte' ? v >= check.value : v <= check.value
      detail = `Finished with ${v} (needed ${check.op === 'gte' ? '≥' : '≤'} ${check.value})`
      break
    }
    case 'never_broke': {
      // Reconstructed from the record: a round is "broke" if the player could
      // not afford anything and sat it out having spent everything.
      const brokeRounds = history.filter((h) => !h.choices[role]).length
      met = brokeRounds === 0
      detail = met
        ? 'Never ran dry'
        : `Sat out ${brokeRounds} round${brokeRounds === 1 ? '' : 's'} unable to act`
      break
    }
    case 'shape_count': {
      const count = history.filter((h) => {
        const id = h.choices[role]
        return id ? actionById(id).shape === check.shape : false
      }).length
      met = count >= check.min
      detail = `Played ${count} of ${check.min} required`
      break
    }
    case 'deals': {
      met = myDeals.length >= check.min
      detail = `Completed ${myDeals.length} of ${check.min} required`
      break
    }
    case 'deals_with': {
      const n = myDeals.filter(
        (t) => t.from === check.role || t.to === check.role,
      ).length
      met = n >= check.min
      detail = `${n} of ${check.min} required with ${ROLES[check.role].name}`
      break
    }
    case 'never_take_from': {
      const taken = allTransfers.filter(
        (t) => t.to === role && t.from === check.role,
      )
      met = taken.length === 0
      detail = met
        ? `Never took a ringgit from ${ROLES[check.role].name}`
        : `Accepted ${taken.length} transfer${taken.length === 1 ? '' : 's'} from ${ROLES[check.role].name}`
      break
    }
    case 'no_growth_without_people': {
      const bad = history.filter(
        (h) => h.after.economy > h.before.economy && h.after.living < h.before.living,
      )
      met = bad.length === 0
      detail = met
        ? 'Growth never came at the public’s expense'
        : `${bad.length} round${bad.length === 1 ? '' : 's'} where the economy rose as living standards fell`
      break
    }
    case 'biggest_cut': {
      let bestRole: RoleId | null = null
      let bestCut = 0
      for (const h of history) {
        for (const r of ROLE_IDS) {
          const cut = h.emissionsBy[r] ?? 0
          if (cut < bestCut) {
            bestCut = cut
            bestRole = r
          }
        }
      }
      met = bestRole === role
      detail = bestRole
        ? `Largest single cut was ${Math.abs(Math.round(bestCut))} by ${ROLES[bestRole].name}`
        : 'No emissions were cut all game'
      break
    }
  }

  return { role, agenda, met, detail }
}

/* -------------------------------------------------------------- endgame */

export interface FinalReport {
  indicators: Indicators
  ending: Ending
  passed: { economy: boolean; emissions: boolean; living: boolean }
  agendas: AgendaOutcome[]
  /** The three rounds where the trajectory moved most — the debrief material. */
  turningPoints: { round: number; year: number; title: string; swing: number }[]
}

export function buildReport(
  indicators: Indicators,
  seats: Partial<Record<RoleId, PlayerSeat>>,
  history: RoundResult[],
): FinalReport {
  const passed = {
    economy: indicators.economy >= THRESHOLDS.economy,
    emissions: indicators.emissions <= THRESHOLDS.emissions,
    living: indicators.living >= THRESHOLDS.living,
  }

  const agendas = ROLE_IDS.flatMap((role) => {
    const seat = seats[role]
    if (!seat) return []
    return [evaluateAgenda(role, seat.agendaId, history, seat)]
  })

  const turningPoints = history
    .map((h) => {
      const swing =
        Math.abs(h.after.economy - h.before.economy) +
        Math.abs(h.after.emissions - h.before.emissions) +
        Math.abs(h.after.living - h.before.living)
      const s = situationFor(h.round)
      return { round: h.round, year: s.year, title: s.title, swing }
    })
    .sort((a, b) => b.swing - a.swing)
    .slice(0, 3)
    .sort((a, b) => a.round - b.round)

  return {
    indicators,
    ending: endingFor(passed.economy, passed.emissions, passed.living),
    passed,
    agendas,
    turningPoints,
  }
}

export { TOTAL_ROUNDS, THRESHOLDS }
