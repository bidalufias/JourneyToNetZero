/**
 * The single most valuable test in this project.
 *
 * Replays 240 games recorded from `reference/engine.py`, the balance-tested
 * implementation, and asserts the TypeScript port reproduces every round's
 * state. Regenerate the fixtures with `npm run fixtures`.
 *
 * Everything discrete is compared with `toBe`: flags, trust, fiscal, capital,
 * spotlights, vetoes, every counter, and the win/loss and private-goal
 * verdicts. Those match exactly across all 1,440 recorded rounds, and a
 * resolution step moved out of order or a "tidied" constant shows up here as a
 * hard failure rather than a slow drift in win rates.
 *
 * The continuous meters are compared to a relative tolerance of 1e-12 for one
 * specific reason. The green-share term raises a base to `green_power` (1.5),
 * and V8's `Math.pow` is a fast approximation while CPython's is the
 * correctly-rounded glibc `pow`. They disagree on roughly 10% of inputs by a
 * single unit in the last place. Measured over these fixtures, 97.3% of rounds
 * are bit-identical anyway and the worst deviation anywhere is 5.2e-16,
 * about two ULP, on `growth` and `greenShare` only; emissions, happiness and
 * per-role emissions are bit-exact everywhere. The tolerance is therefore some
 * four orders of magnitude tighter than any genuine logic error could hide in,
 * and four orders looser than the float noise it exists to absorb.
 *
 * Integer exponents, credibility decay and volunteer fatigue, use repeated
 * multiplication in the port precisely so they stay bit-exact.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { loadContent } from '../src/engine/content'
import { createGame, goalMet, playRound, result } from '../src/engine/engine'
import { ROLES, type Role } from '../src/engine/types'

const read = (p: string) => JSON.parse(readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8'))

const content = loadContent(read('../content/jtnz-content-pack-v2.json'))
const golden = read('./fixtures/golden.json') as Golden

interface GoldenState {
  e: number
  g: number
  h: number
  gr: number
  fiscal: number
  capital: number
  spot: number
  vetoes: number
  trust: Record<string, number>
  flags: string[]
  role_e: Record<Role, number>
  spot_hits: number
  vetoes_used: number
  coalition_rounds: number
  collabs: number
  selforg: number
  self_org_ok: number
  last_dirty: string[]
  g_hist: number[]
  h_hist: number[]
}

interface Golden {
  games: {
    path: string[]
    mix: Record<Role, string>
    rounds: {
      round: number
      scenario: string
      choices: Record<Role, string>
      veto_target: Role | null
      cofund: boolean
      state: GoldenState
    }[]
    result: Record<string, unknown>
    goals: Record<string, boolean>
  }[]
}

/** Float noise from the `^green_power` term only. See the header. */
const TOLERANCE = 1e-12

function expectClose(actual: number, expected: number, label: string): number {
  const deviation = actual === expected ? 0 : Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-9)
  if (deviation > TOLERANCE) {
    expect.fail(`${label}: ${actual} vs reference ${expected} (relative ${deviation.toExponential(2)})`)
  }
  return deviation
}

describe('engine parity with reference/engine.py', () => {
  it('has fixtures covering every scenario and both endings', () => {
    const scenarios = new Set(golden.games.flatMap((g) => g.rounds.map((r) => r.scenario)))
    expect(scenarios.size).toBe(18)
    const wins = golden.games.filter((g) => g.result.win).length
    expect(wins).toBeGreaterThan(0)
    expect(wins).toBeLessThan(golden.games.length)
  })

  it('reproduces every round of every recorded game', () => {
    let roundsChecked = 0
    let bitExactRounds = 0
    let worstDeviation = 0

    for (const [gi, game] of golden.games.entries()) {
      const state = createGame(game.path, content)
      const where = (r: number) => `game ${gi} (${game.path.join(',')}) round ${r}`

      for (const rec of game.rounds) {
        playRound(
          state,
          {
            choices: rec.choices,
            vetoTarget: rec.veto_target,
            coFund: rec.cofund,
          },
          content,
        )

        const g = rec.state
        const at = where(rec.round)

        // Meters: the three the country is judged on, plus the green economy.
        let deviation = 0
        deviation = Math.max(deviation, expectClose(state.emissions, g.e, `${at} emissions`))
        deviation = Math.max(deviation, expectClose(state.growth, g.g, `${at} growth`))
        deviation = Math.max(deviation, expectClose(state.happiness, g.h, `${at} happiness`))
        deviation = Math.max(deviation, expectClose(state.greenShare, g.gr, `${at} greenShare`))

        // Resources. Discrete, so exact.
        expect(state.fiscal, `${at} fiscal`).toBe(g.fiscal)
        expect(state.capital, `${at} capital`).toBe(g.capital)
        expect(state.spotlights, `${at} spotlights`).toBe(g.spot)
        expect(state.vetoes, `${at} vetoes`).toBe(g.vetoes)

        // Trust, and the legacy flags that gate later rounds.
        expect(state.trust, `${at} trust`).toEqual(g.trust)
        expect([...state.flags].sort(), `${at} flags`).toEqual(g.flags)

        // Per-role emissions drive the Business private goal.
        for (const r of ROLES) {
          deviation = Math.max(
            deviation,
            expectClose(state.roleEmissions[r], g.role_e[r], `${at} roleEmissions.${r}`),
          )
        }

        // Counters behind the private goals and the anti-dominance rules.
        expect(state.spotlightHits, `${at} spotlightHits`).toBe(g.spot_hits)
        expect(state.vetoesUsed, `${at} vetoesUsed`).toBe(g.vetoes_used)
        expect(state.coalitionRounds, `${at} coalitionRounds`).toBe(g.coalition_rounds)
        expect(state.collabs, `${at} collabs`).toBe(g.collabs)
        expect(state.selforg, `${at} selforg`).toBe(g.selforg)
        expect(state.selfOrganiseSucceeded, `${at} selfOrganiseSucceeded`).toBe(g.self_org_ok)
        expect([...state.lastDirty].sort(), `${at} lastDirty`).toEqual(g.last_dirty)

        expect(state.gdpHistory.length, `${at} gdpHistory length`).toBe(g.g_hist.length)
        state.gdpHistory.forEach((v, k) =>
          expectClose(v, g.g_hist[k], `${at} gdpHistory[${k}]`),
        )
        state.happinessHistory.forEach((v, k) =>
          expectClose(v, g.h_hist[k], `${at} happinessHistory[${k}]`),
        )

        roundsChecked++
        if (deviation === 0) bitExactRounds++
        worstDeviation = Math.max(worstDeviation, deviation)
      }

      // Final result and every private goal verdict.
      const res = result(state, content)
      const exp = game.result
      expect(res.win, `game ${gi} win`).toBe(exp.win)
      expect(res.pe, `game ${gi} pe`).toBe(exp.pe)
      expect(res.pg, `game ${gi} pg`).toBe(exp.pg)
      expect(res.ph, `game ${gi} ph`).toBe(exp.ph)
      expectClose(res.g, exp.g as number, `game ${gi} average growth`)

      for (const [goalId, met] of Object.entries(game.goals)) {
        expect(goalMet(goalId, res), `game ${gi} goal ${goalId}`).toBe(met)
      }
    }

    expect(roundsChecked).toBe(golden.games.length * 6)

    // Guard the tolerance itself: if a future change starts leaning on it,
    // these numbers move and the failure names the real cause.
    const exactShare = bitExactRounds / roundsChecked
    console.log(
      `parity: ${bitExactRounds}/${roundsChecked} rounds bit-exact ` +
        `(${(exactShare * 100).toFixed(1)}%), worst deviation ${worstDeviation.toExponential(2)}`,
    )
    expect(exactShare, 'share of bit-exact rounds').toBeGreaterThan(0.95)
    expect(worstDeviation, 'worst relative deviation').toBeLessThan(1e-14)
  })
})
