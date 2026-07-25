/**
 * Rewrites the `effects` of every action in src/game/actions.ts against a
 * designed balance table, leaving all authored text untouched.
 *
 *   npx tsx scripts/tune.ts
 *
 * The design intent, in one line each:
 *   self         you get richer, the country gets dirtier
 *   collective   emissions fall and you pay for it in growth
 *   conditional  the only shape that moves all three at once
 *
 * Which produces the three archetypal outcomes:
 *   everyone self-interested  -> rich, burning, people no better off
 *   everyone collective       -> clean and poorer
 *   everyone bartering        -> all three thresholds, and only just
 */
import { readFileSync, writeFileSync } from 'node:fs'
import type { ActionShape, RoleId } from '../src/game/types'

type Triple = { economy: number; emissions: number; living: number }

/** Per-round-per-player means the whole balance is built on. */
const BASE: Record<ActionShape, Record<RoleId, Triple>> = {
  self: {
    government: { economy: 2, emissions: 3, living: 1 },
    business: { economy: 4, emissions: 4, living: -1 },
    community: { economy: -1, emissions: 2, living: 3 },
    activist: { economy: -2, emissions: -2, living: 0 },
  },
  collective: {
    government: { economy: -1, emissions: -3, living: 0 },
    business: { economy: 1, emissions: -3, living: 1 },
    community: { economy: 0, emissions: -2, living: 2 },
    activist: { economy: -2, emissions: -3, living: 0 },
  },
  conditional: {
    government: { economy: 1, emissions: -4, living: 1 },
    business: { economy: 2, emissions: -5, living: 2 },
    community: { economy: 0, emissions: -4, living: 2 },
    activist: { economy: -1, emissions: -4, living: 0 },
  },
}

/**
 * Per-round character, added on top of the base. Sums to roughly zero down
 * each column so the overall balance holds, while giving each round its own
 * texture — round 7 is about people, round 8 is about carbon.
 */
const ROUND_FLAVOUR: Record<number, Partial<Record<ActionShape, Triple>>> = {
  // Emissions added early are the hardest to remove later: a round of delay in
  // the 2020s costs more than the same delay in the 2040s. This is why coasting
  // through the opening rounds and bartering hard from round five cannot win.
  1: { self: { economy: 0, emissions: 1, living: 1 }, collective: { economy: 0, emissions: 2, living: -1 }, conditional: { economy: 0, emissions: 2, living: 0 } },
  2: { self: { economy: -1, emissions: 1, living: 1 }, collective: { economy: 0, emissions: 2, living: 0 }, conditional: { economy: 1, emissions: 2, living: 0 } },
  3: { self: { economy: 2, emissions: 1, living: -2 }, collective: { economy: -1, emissions: 1, living: 1 }, conditional: { economy: 1, emissions: 1, living: 0 } },
  4: { self: { economy: 0, emissions: 1, living: 0 }, collective: { economy: -1, emissions: 0, living: -1 }, conditional: { economy: 0, emissions: 0, living: 0 } },
  5: { self: { economy: 0, emissions: 1, living: -1 }, collective: { economy: 1, emissions: -1, living: 1 }, conditional: { economy: 1, emissions: -1, living: 1 } },
  6: { self: { economy: 1, emissions: 1, living: 0 }, collective: { economy: 0, emissions: -1, living: -1 }, conditional: { economy: 1, emissions: -1, living: 0 } },
  7: { self: { economy: -1, emissions: 2, living: 1 }, collective: { economy: -1, emissions: -2, living: 1 }, conditional: { economy: 0, emissions: -2, living: 2 } },
  8: { self: { economy: -1, emissions: 2, living: -1 }, collective: { economy: 1, emissions: -3, living: 0 }, conditional: { economy: 1, emissions: -3, living: 0 } },
}

/** A few hand-set overrides where the authored text demands a specific shape. */
const OVERRIDES: Record<string, Partial<Triple>> = {
  // "Blame the neighbours" — doing nothing about a health emergency.
  'r5-gov-self': { living: -4 },
  // "Not in our state" — blocking the last-mile infrastructure outright.
  'r8-com-self': { emissions: 4, economy: -3 },
  // "Buy offsets and declare victory" — cheap, and it does move the number.
  'r8-gov-self': { emissions: -3, economy: 1 },
  // "Relocate the hard-to-abate" — carbon leakage: local books improve, jobs go.
  'r8-biz-self': { emissions: -2, living: -3 },
  // "Refuse the raid on mitigation" — the unpopular but correct call.
  'r7-act-collective': { living: -2, emissions: -5 },
  // "Emergency relief from the transition budget" — humane, and it costs carbon.
  'r7-gov-self': { living: 5, emissions: 4 },
}

const ROLE_OF: Record<string, RoleId> = {
  gov: 'government',
  biz: 'business',
  com: 'community',
  act: 'activist',
}

const path = new URL('../src/game/actions.ts', import.meta.url)
let src = readFileSync(path, 'utf8')

const idRe = /id: '(r(\d)-(gov|biz|com|act)-(self|collective|conditional))'/g
let count = 0
const ids: string[] = []
for (const m of src.matchAll(idRe)) ids.push(m[1])

for (const id of ids) {
  const [, roundStr, roleShort, shape] = id.match(/r(\d)-(\w+)-(\w+)/)!
  const round = Number(roundStr)
  const role = ROLE_OF[roleShort]
  const base = BASE[shape as ActionShape][role]
  const flav = ROUND_FLAVOUR[round]?.[shape as ActionShape] ?? {
    economy: 0,
    emissions: 0,
    living: 0,
  }

  const next: Triple = {
    economy: base.economy + flav.economy,
    emissions: base.emissions + flav.emissions,
    living: base.living + flav.living,
  }
  Object.assign(next, OVERRIDES[id] ?? {})

  // Replace the effects object that follows this id.
  const block = new RegExp(
    `(id: '${id}',[\\s\\S]*?effects: \\{)[^}]*(\\})`,
    'm',
  )
  const replacement = `$1 economy: ${next.economy}, emissions: ${next.emissions}, living: ${next.living} $2`
  const before = src
  src = src.replace(block, replacement)
  if (src !== before) count++
}

writeFileSync(path, src)
console.log(`Retuned ${count} of ${ids.length} actions.`)
