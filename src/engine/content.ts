/**
 * Content pack loader.
 *
 * The engine reads content only through this module. Swapping the JSON for a
 * Singapore, corporate or schools pack must require no change to engine code.
 */
import type { Content, Config, Role, Scenario, PrivateGoal, InsiderTips } from './types'
import { ROLES } from './types'

interface RawPack {
  config: Config
  scenarios: Scenario[]
  resilienceFlags: string[]
  privateGoals: Record<Role, PrivateGoal[]>
  insiderTips: InsiderTips
}

export function loadContent(raw: unknown): Content {
  const pack = raw as RawPack
  if (!pack?.config || !Array.isArray(pack.scenarios)) {
    throw new Error('content pack: missing config or scenarios')
  }

  const scenarios: Record<string, Scenario> = {}
  const roundVariants: Record<number, string[]> = {}

  for (const s of pack.scenarios) {
    scenarios[s.id] = s
    ;(roundVariants[s.round] ??= []).push(s.id)
  }
  for (const ids of Object.values(roundVariants)) ids.sort()

  validate(pack, scenarios, roundVariants)

  return {
    config: pack.config,
    scenarios,
    roundVariants,
    resilienceFlags: new Set(pack.resilienceFlags),
    privateGoals: pack.privateGoals,
    insiderTips: pack.insiderTips,
  }
}

/**
 * Fails loudly on a malformed pack rather than producing a quietly wrong game.
 * A content author swapping the JSON should learn about a mistake here.
 */
function validate(
  pack: RawPack,
  scenarios: Record<string, Scenario>,
  roundVariants: Record<number, string[]>,
): void {
  const problems: string[] = []

  for (let r = 1; r <= 6; r++) {
    if (!roundVariants[r]?.length) problems.push(`round ${r} has no scenarios`)
  }

  for (const s of Object.values(scenarios)) {
    for (const role of ROLES) {
      const opts = s.options?.[role]
      if (!opts?.length) {
        problems.push(`${s.id}: role ${role} has no options`)
        continue
      }
      for (const o of opts) {
        if (typeof o.e !== 'number' || typeof o.g !== 'number') {
          problems.push(`${o.id}: non-numeric effects`)
        }
        if (!o.headline) problems.push(`${o.id}: missing headline`)
      }
    }
  }

  const c = pack.config
  for (const key of ['2', '3', '4']) {
    if (!c.coalition?.[key]) problems.push(`config.coalition missing key ${key}`)
  }
  if (!c.driftTable?.length) problems.push('config.driftTable is empty')

  if (problems.length) {
    throw new Error(`content pack invalid:\n  ${problems.join('\n  ')}`)
  }
}
