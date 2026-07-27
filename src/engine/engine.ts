/**
 * Journey to Net Zero: the engine.
 *
 * A direct port of `play_round()` in `reference/engine.py`, which is the
 * authoritative implementation: roughly 200,000 simulated games were run
 * against it and every constant in the content pack was fitted to it.
 *
 * The resolution order below is subtle and already correct. Do not reorder it,
 * and do not adjust a constant to make a number look rounder. `test/parity.test.ts`
 * replays the reference implementation and will fail if you do.
 *
 * Two things differ from the reference, both because the reference drove those
 * decisions from agent policies and the real game drives them from humans:
 *
 *   1. The Public Mandate veto target arrives as `RoundInput.vetoTarget`
 *      instead of being derived from `Policy.coop`.
 *   2. Government co-funding of a Partner option arrives as `RoundInput.coFund`
 *      instead of `Policy.cofund()`.
 *
 * Both are inputs to the same code path, so parity holds when the fixtures
 * replay what the reference decided.
 */
import {
  ROLES,
  TRUST_ROLES,
  DIRTY,
  SUPPORTIVE,
  type Content,
  type GameState,
  type GameResult,
  type Option,
  type PublicState,
  type Role,
  type RoundInput,
  type RoundLog,
  type RoundReveal,
  type TrustRole,
  type Scenario,
} from './types'

/**
 * Integer power by repeated multiplication.
 *
 * `Math.pow` in V8 is a fast approximation and disagrees with CPython's
 * correctly-rounded `pow` on some inputs. Repeated multiplication is exact for
 * the small integer exponents used by credibility decay and volunteer fatigue,
 * so the port stays bit-identical to the reference on those terms.
 */
function powInt(base: number, n: number): number {
  let out = 1
  for (let i = 0; i < n; i++) out *= base
  return out
}

/** Growth-carbon drift coefficient for the current green economy share. */
export function driftK(greenShare: number, content: Content): number {
  for (const band of content.config.driftTable) {
    if (greenShare <= band.greenShareMax) return band.k
  }
  return content.config.driftTable[content.config.driftTable.length - 1].k
}

/**
 * The marginal abatement curve. The last tonnes are the hardest.
 * Applies to every emissions *cut*, meaning option effects, forced abatement
 * and the Coalition Bonus alike, and never to an increase.
 */
export function mac(emissions: number, content: Content): number {
  const c = content.config
  return Math.max(
    c.mac_lo,
    Math.min(c.mac_lo + c.mac_span, c.mac_lo + (c.mac_span * (emissions - c.mac_ref)) / c.mac_range),
  )
}

export function createGame(path: string[], content: Content): GameState {
  const s = content.config.start
  return {
    path: [...path],
    round: 0,
    emissions: s.e,
    growth: s.g,
    happiness: s.h,
    greenShare: s.gr,
    fiscal: s.fiscal,
    capital: s.capital,
    spotlights: s.spot,
    vetoes: content.config.vetoes,
    trust: { government: 0, business: 0, activist: 0 },
    flags: new Set<string>(),
    gdpHistory: [],
    happinessHistory: [],
    picks: [],
    roleEmissions: { government: 0, business: 0, community: 0, activist: 0 },
    spotlightHits: 0,
    vetoesUsed: 0,
    coalitionRounds: 0,
    collabs: 0,
    selforg: 0,
    selfOrganiseSucceeded: 0,
    lastDirty: [],
  }
}

/**
 * The three options a role may choose this round.
 *
 * Filters on affordability, the Government Trust gate and legacy blocking
 * flags. Falls back to the first authored option when everything is filtered
 * out, so a bankrupt table can still act and the session never stalls.
 */
export function availableOptions(
  state: GameState,
  scenario: Scenario,
  role: Role,
  _content: Content,
): Option[] {
  const out: Option[] = []
  for (const o of scenario.options[role]) {
    const cost = o.cost ?? {}
    const discount = state.flags.has('GRID_UPGRADED') && SUPPORTIVE.has(o.arch) ? 1 : 0

    if (cost.fiscal !== undefined && cost.fiscal > 0) {
      if (state.fiscal < Math.max(cost.fiscal - discount, 0)) continue
    }
    if (cost.capital !== undefined && cost.capital > 0) {
      if (state.capital < Math.max(cost.capital - discount, 0)) continue
    }
    if (o.gate_trust && state.trust.government < o.gate_trust) continue
    if (o.block_flag && state.flags.has(String(o.block_flag))) continue
    out.push(o)
  }
  return out.length ? out : scenario.options[role].slice(0, 1)
}

/**
 * Options left after the Community spends a Public Mandate veto on `role`.
 *
 * The reference removes every dirty option, not merely the dirtiest, and falls
 * back to the unfiltered list when a role has nothing clean to pick. That is
 * stronger than the design document's wording and it is what the balance run
 * measured, so it is what ships.
 */
export function applyVeto(options: Option[]): Option[] {
  const clean = options.filter((o) => !DIRTY.has(o.arch))
  return clean.length ? clean : options
}

function countEvidence(flags: Set<string>): number {
  let n = 0
  for (const f of flags) if (f.startsWith('EVIDENCE')) n++
  return n
}

/** Resolve one round. Mutates `state` and returns everything needed to narrate it. */
export function playRound(state: GameState, input: RoundInput, content: Content): RoundLog {
  const cfg = content.config
  const i = state.round
  const scenario = content.scenarios[state.path[i]]
  if (!scenario) throw new Error(`unknown scenario ${state.path[i]} for round ${i + 1}`)
  const rnd = i + 1

  // 1. Treasury and corporate income. The economy pays for the transition.
  if (rnd >= 2) {
    state.fiscal += cfg.fiscal_income
    if (state.growth >= cfg.fiscal_bonus_at) state.fiscal += 1
    state.capital += 1
    if (state.growth >= cfg.capital_income_at) state.capital += 1
  }

  // Legacy: a frozen pump price drains the treasury in Rounds 4 and 5.
  if (state.flags.has('SUBSIDY_LOCK') && (rnd === 4 || rnd === 5)) {
    state.fiscal = Math.max(0, state.fiscal - 1)
  }

  // 2. Scenario shock, scaled by legacy flags and Round 6 modifiers.
  const sh = scenario.shock
  let mult = 1.0
  if (rnd === 5 && (state.flags.has('BUILT_COAL') || state.flags.has('REGULATORY_CAPTURE'))) {
    mult = 1.6
  }
  if (rnd === 6) {
    if (state.emissions > cfg.r6_high_e) mult *= cfg.r6_high_mult
    if (state.flags.has('BUILT_COAL')) mult *= 1.5
    let nres = 0
    for (const f of state.flags) if (content.resilienceFlags.has(f)) nres++
    mult *= Math.max(1 - Math.min(nres * cfg.r6_flag_reduce, cfg.r6_flag_cap), 0.0)
  }
  const shG = sh.g * mult
  const shH = sh.h * mult
  // The emissions component of a shock is never scaled.
  const shE = sh.e ?? 0

  state.fiscal = Math.max(0, state.fiscal + (sh.fiscal ?? 0))
  state.capital = Math.max(0, state.capital + (sh.capital ?? 0))
  state.fiscal = Math.min(state.fiscal, cfg.fiscal_cap)
  state.capital = Math.min(state.capital, cfg.capital_cap)

  // 3. The Community may spend a Public Mandate veto.
  let vetoTarget: Role | null = null
  if (input.vetoTarget && state.vetoes > 0) {
    vetoTarget = input.vetoTarget
    state.vetoes -= 1
    state.vetoesUsed += 1
  }

  // 4. Four choices, locked simultaneously.
  const chosen = {} as Record<Role, Option>
  const vetoBlocked: string[] = []
  for (const r of ROLES) {
    let opts = availableOptions(state, scenario, r, content)
    if (r === vetoTarget) {
      const after = applyVeto(opts)
      for (const o of opts) if (!after.includes(o)) vetoBlocked.push(o.id)
      opts = after
    }
    const pick = opts.find((o) => o.id === input.choices[r])
    if (!pick) {
      throw new Error(
        `${r} chose ${input.choices[r]}, which is not available this round ` +
          `(available: ${opts.map((o) => o.id).join(', ')})`,
      )
    }
    chosen[r] = pick
  }

  const govRegulates = chosen.government.arch === 'REGULATE'
  const govIsolated =
    chosen.government.arch === 'DEREGULATE' &&
    ROLES.filter((r) => r !== 'government').every(
      (r) => !DIRTY.has(chosen[r].arch) && chosen[r].arch !== 'DEMAND_RELIEF',
    )

  // The Spotlight targets whoever made the dirtiest choice.
  let spotTarget: Role | null = null
  if (chosen.activist.arch === 'ESCALATE' && state.spotlights > 0) {
    const cand = (['business', 'government'] as const).filter((r) => DIRTY.has(chosen[r].arch))
    if (cand.length) {
      spotTarget = cand.reduce((a, b) => (chosen[b].e > chosen[a].e ? b : a))
      state.spotlights -= 1
    }
  }

  // 5. Resolve option effects. `state.emissions` does not move inside this
  // loop, so the abatement curve is fixed for the whole round.
  const macNow = mac(state.emissions, content)
  let de = 0
  let dg = 0
  let dh = 0
  let dgr = 0
  const reveals: RoundReveal[] = []

  for (const r of ROLES) {
    const o = chosen[r]
    let m = 1.0
    let partnerUnfunded = false
    let selfOrganiseSupported = false

    if (o.arch === 'PARTNER') {
      const cofunded = (input.coFund ?? false) && state.fiscal >= 1
      if (cofunded) {
        state.fiscal -= 1
      } else {
        m *= cfg.partner_unfunded
        partnerUnfunded = true
      }
    }
    if (o.arch === 'SELF_ORGANISE') {
      // Applause is not backing. Only real support from Government or Business
      // or a standing Mutual Aid network, doubles a community action.
      const supported =
        state.flags.has('MUTUAL_AID') ||
        (['government', 'business'] as const).some((x) => SUPPORTIVE.has(chosen[x].arch))
      if (supported) {
        m *= cfg.self_org_mult
        state.selfOrganiseSucceeded += 1
        selfOrganiseSupported = true
      }
    }
    if (o.arch === 'REGULATE' && state.flags.has('REGULATORY_CAPTURE') && rnd >= 5) {
      m *= 0.5
    }
    if (o.boost_flag && state.flags.has(o.boost_flag)) m *= 1.5
    if (o.boost_evidence && countEvidence(state.flags) >= 2) m *= 2.0
    // Each prior Collaborate costs the Activist 8% of all future effect;
    // each prior Self-Organise costs the Community 6%.
    if (r === 'activist') m *= powInt(cfg.credibility_decay, state.collabs)
    if (r === 'community' && o.arch === 'SELF_ORGANISE') {
      m *= powInt(cfg.volunteer_fatigue, state.selforg)
    }
    if (r === 'activist' && o.arch === 'ESCALATE' && spotTarget) m *= 1.4
    if (r === spotTarget) m *= cfg.spotlight_backdown
    if (r === 'business' && DIRTY.has(o.arch) && govRegulates) m *= cfg.regulation_bite
    if (r === 'government' && govIsolated) m *= cfg.public_pressure

    const em = o.e < 0 ? cfg.e_green * macNow : cfg.e_dirty
    const e = o.e * em * cfg.role_e[r]

    de += e * m
    dg += o.g * m
    dh += o.h * m * cfg.h_scale2
    dgr += o.gr * m
    state.roleEmissions[r] += e * m

    // Costs, with the Grid Upgrade discount on supportive options.
    const c: Record<string, number> = { ...(o.cost ?? {}) }
    if (state.flags.has('GRID_UPGRADED') && SUPPORTIVE.has(o.arch)) {
      for (const k of Object.keys(c)) {
        if (c[k] > 0) c[k] = Math.max(0, c[k] - 1)
      }
    }
    state.fiscal = Math.max(0, state.fiscal - (c.fiscal ?? 0))
    state.capital = Math.max(0, state.capital - (c.capital ?? 0))

    if (o.grants) {
      const [, resource, amount] = o.grants
      if (resource === 'capital') state.capital += amount
    }
    if (o.arch === 'DEMAND_RELIEF') {
      // The Government pays, or loses standing for failing to.
      if (state.fiscal >= 2) state.fiscal -= 1
      else state.trust.government = Math.max(0, state.trust.government - 1)
    }

    const flagsSet = o.flags ?? []
    for (const f of flagsSet) state.flags.add(f)
    if (o.arch === 'COLLABORATE') state.collabs += 1
    if (o.arch === 'SELF_ORGANISE') state.selforg += 1

    reveals.push({
      role: r,
      optionId: o.id,
      arch: o.arch,
      title: o.title,
      desc: o.desc,
      headline: o.headline,
      aligned: !DIRTY.has(o.arch) && o.arch !== 'DEMAND_RELIEF',
      multiplier: m,
      emissions: e * m,
      partnerUnfunded,
      selfOrganiseSupported,
      spotlit: r === spotTarget,
      flagsSet: [...flagsSet],
    })
  }

  // 7. The Coalition Bonus: things only possible when the table pulls
  // together. Holding a defector to account is cooperation too, so regulating
  // and escalating both count as aligned.
  let aligned = 0
  for (const r of ROLES) {
    if (!DIRTY.has(chosen[r].arch) && chosen[r].arch !== 'DEMAND_RELIEF') aligned++
  }
  const coalition = cfg.coalition[String(aligned)] ?? null
  if (coalition) {
    de += coalition.emissions * cfg.coal_scale * macNow
    dh += coalition.happiness * cfg.coal_scale
    dgr += coalition.green * cfg.coal_scale
    state.coalitionRounds += 1
  }

  // 6. Regulation forces abatement: the polluter cuts whether they meant to or not.
  let forcedAbatement = 0
  if (govRegulates) {
    forcedAbatement = cfg.regulate_abate * macNow * (DIRTY.has(chosen.business.arch) ? 1.0 : 0.45)
    de -= forcedAbatement
    state.roleEmissions.government -= forcedAbatement
    state.capital = Math.max(0, state.capital - 1)
  }

  if (govIsolated) {
    state.trust.government = Math.max(0, state.trust.government - 1)
  }

  // 8. Spotlight accountability. Being caught is not the same as being unpunished.
  if (spotTarget) {
    dh += cfg.accountability_bonus
    state.trust[spotTarget as TrustRole] = Math.max(0, state.trust[spotTarget as TrustRole] - 1)
    state.spotlightHits += 1
  }

  // 9. Apply to meters. Happiness reverts toward a dynamic baseline,
  // you cannot buy your way to 7.0, you have to build a country that sustains it.
  state.emissions += shE + de

  const prevDev = state.growth - cfg.trend
  state.growth = cfg.trend + cfg.persist * prevDev + shG + dg
  state.growth = Math.max(-5.0, Math.min(9.0, state.growth))

  const hb =
    cfg.h_b0 + cfg.h_b_green * (state.greenShare / 100.0) + cfg.h_b_growth * (state.growth - 4.5)
  state.happiness = hb + cfg.h_persist * (state.happiness - hb) + shH + dh * cfg.h_scale
  state.happiness = Math.max(0.0, Math.min(10.0, state.happiness))

  // 10. Green share depreciates, then grows with diminishing returns.
  const nev = countEvidence(state.flags)
  let add = (dgr + nev * cfg.evidence_green) * cfg.green_scale
  add *= Math.pow(1 - state.greenShare / 100.0, cfg.green_power)
  state.greenShare = Math.max(0, Math.min(100, state.greenShare * cfg.green_decay + add))

  // 11. The green economy is itself a growth sector.
  state.growth += (state.greenShare - 10) / cfg.green_dividend
  state.growth = Math.max(-5.0, Math.min(9.0, state.growth))

  // 12. Growth-carbon drift. Growth is never free.
  const k = driftK(state.greenShare, content)
  const drift = state.growth * k
  state.emissions += drift

  // 13. The Community awards two Trust tokens: one for who cared most,
  // one for who did most for the future.
  const awarded = {} as { care: TrustRole; future: TrustRole }
  for (const key of ['h', 'gr'] as const) {
    let best: TrustRole | null = null
    let bv = -99
    for (const r of TRUST_ROLES) {
      const penalty = r === 'business' && state.flags.has('LAYOFFS') ? 1.0 : 0
      const v = chosen[r][key] - penalty
      if (v > bv) {
        best = r
        bv = v
      }
    }
    if (best) {
      state.trust[best] += 1
      if (key === 'h') awarded.care = best
      else awarded.future = best
    }
  }

  // 14. Push history.
  state.lastDirty = ROLES.filter((r) => DIRTY.has(chosen[r].arch))
  state.gdpHistory.push(state.growth)
  state.happinessHistory.push(state.happiness)
  state.picks.push(Object.fromEntries(ROLES.map((r) => [r, chosen[r].id])) as Record<Role, string>)
  state.round += 1

  return {
    round: rnd,
    scenarioId: scenario.id,
    shock: { g: shG, h: shH, e: shE },
    shockMultiplier: mult,
    vetoTarget,
    vetoBlocked,
    spotlightTarget: spotTarget,
    govRegulates,
    govIsolated,
    reveals,
    alignedCount: aligned,
    coalitionBonus: coalition,
    forcedAbatement,
    deltas: { e: shE + de, g: dg, h: dh, gr: dgr },
    trustAwarded: awarded,
    drift,
    driftK: k,
    state: publicState(state, content),
  }
}

/** Average growth across the rounds played so far. */
export function averageGrowth(state: GameState): number {
  if (!state.gdpHistory.length) return state.growth
  return state.gdpHistory.reduce((a, b) => a + b, 0) / state.gdpHistory.length
}

/**
 * Where emissions land if nothing changes: the remaining rounds at the current
 * growth and drift. Display only: it feeds the dashboard's 2050 line and has
 * no effect on any meter or outcome.
 */
export function projection2050(state: GameState, content: Content): number {
  const remaining = Math.max(0, 6 - state.round)
  return state.emissions + remaining * state.growth * driftK(state.greenShare, content)
}

export function publicState(state: GameState, content: Content): PublicState {
  return {
    round: state.round,
    emissions: state.emissions,
    growth: state.growth,
    averageGrowth: averageGrowth(state),
    happiness: state.happiness,
    greenShare: state.greenShare,
    fiscal: state.fiscal,
    capital: state.capital,
    spotlights: state.spotlights,
    vetoes: state.vetoes,
    trust: { ...state.trust },
    flags: [...state.flags].sort(),
    projection2050: projection2050(state, content),
  }
}

export function result(state: GameState, content: Content): GameResult {
  const c = content.config
  const avgG = averageGrowth(state)
  const pe = state.emissions <= c.tgt_e
  const pg = avgG >= c.tgt_g
  const ph = state.happiness >= c.tgt_h
  return {
    win: pe && pg && ph,
    pe,
    pg,
    ph,
    e: state.emissions,
    g: avgG,
    h: state.happiness,
    gr: state.greenShare,
    fiscal: state.fiscal,
    capital: state.capital,
    trust: { ...state.trust },
    flags: new Set(state.flags),
    roleEmissions: { ...state.roleEmissions },
    spotlightHits: state.spotlightHits,
    vetoesUsed: state.vetoesUsed,
    coalitionRounds: state.coalitionRounds,
    selfOrganiseSucceeded: state.selfOrganiseSucceeded,
    gdpHistory: [...state.gdpHistory],
    happinessHistory: [...state.happinessHistory],
    picks: state.picks.map((p) => ({ ...p })),
  }
}

/** Whether a private goal was met. Mirrors `goal_met()` in the reference. */
export function goalMet(goalId: string, res: GameResult): boolean {
  switch (goalId) {
    case 'G-a':
      return res.trust.government >= 6
    case 'G-b':
      return Math.min(...res.gdpHistory) >= 4.0
    case 'G-c':
      return res.gr >= 55
    case 'B-a':
      return res.capital >= 6
    case 'B-b':
      return res.roleEmissions.business <= -40
    case 'B-c':
      return res.trust.business >= 2 && res.capital >= 4
    case 'C-a':
      return res.h >= 8.0
    case 'C-b':
      return Math.min(...res.happinessHistory) >= 6.3
    case 'C-c':
      return res.selfOrganiseSucceeded >= 4
    case 'A-a':
      return !res.flags.has('COMPROMISED') && res.e <= 175
    case 'A-b':
      return res.gr >= 52
    case 'A-c':
      return res.h >= 7.0 && res.spotlightHits >= 1
    default:
      throw new Error(`unknown goal ${goalId}`)
  }
}
