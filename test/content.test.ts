/**
 * The content pack exists twice.
 *
 * `content/jtnz-content-pack-v2.json` is what the game reads.
 * `reference/content.py` is what the reference engine reads, and therefore what
 * the golden fixtures are generated from.
 *
 * Nothing held the two together. The parity test would eventually catch a
 * divergence that changed a number, but only if a fixture happened to exercise
 * it, and it would report the failure as an engine mismatch rather than the
 * content drift it actually was. Making COMPROMISED real meant editing eighteen
 * cards in both files by hand, which is the same shape as the bug that sat in
 * the Community's veto trigger for as long as it did.
 *
 * So this compares them directly, field by field, across all 216 options.
 */
import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const pack = JSON.parse(
  readFileSync(fileURLToPath(new URL('content/jtnz-content-pack-v2.json', root)), 'utf8'),
)

/** The reference content, as the reference engine sees it. */
function referenceContent(): { scen: Record<string, any>; resilience: string[] } {
  const out = execFileSync(
    'python3',
    [
      '-c',
      'import json,sys; sys.path.insert(0,"reference"); import content;' +
        ' print(json.dumps({"scen": content.SCEN, "resilience": sorted(content.RESILIENCE)}))',
    ],
    { cwd: fileURLToPath(root), encoding: 'utf8' },
  )
  return JSON.parse(out)
}

const ref = referenceContent()

describe('the two content packs agree', () => {
  it('holds the same scenarios', () => {
    expect(Object.keys(ref.scen).sort()).toEqual(pack.scenarios.map((s: any) => s.id).sort())
  })

  it('holds the same 216 options, field for field', () => {
    let checked = 0
    for (const scenario of pack.scenarios) {
      const r = ref.scen[scenario.id]
      expect(r, `${scenario.id} missing from reference/content.py`).toBeDefined()
      expect(r.shock, scenario.id).toEqual(scenario.shock)

      for (const role of Object.keys(scenario.options)) {
        const jsonOpts = scenario.options[role]
        const refOpts = r.options[role]
        expect(refOpts.map((o: any) => o.id)).toEqual(jsonOpts.map((o: any) => o.id))

        for (let i = 0; i < jsonOpts.length; i++) {
          const a = jsonOpts[i]
          const b = refOpts[i]
          const where = a.id
          expect(b.arch, where).toBe(a.arch)
          expect(b.title, where).toBe(a.title)
          expect(b.e, where).toBe(a.e)
          expect(b.g, where).toBe(a.g)
          expect(b.h, where).toBe(a.h)
          expect(b.gr, where).toBe(a.gr)
          expect(b.cost ?? {}, where).toEqual(a.cost ?? {})
          // Flags are the field that drifted: COMPROMISED had to be added to
          // eighteen Collaborate cards in both files at once.
          expect([...(b.flags ?? [])].sort(), where).toEqual([...(a.flags ?? [])].sort())
          expect(b.gate_trust ?? null, where).toBe(a.gate_trust ?? null)
          expect(b.block_flag ?? null, where).toBe(a.block_flag ?? null)
          checked++
        }
      }
    }
    expect(checked).toBe(216)
  })

  it('holds the same resilience set', () => {
    expect(ref.resilience).toEqual([...pack.resilienceFlags].sort())
  })

  it('sets COMPROMISED on every Collaborate card and on nothing else', () => {
    const withFlag: string[] = []
    const collaborates: string[] = []
    for (const scenario of pack.scenarios) {
      for (const options of Object.values<any>(scenario.options)) {
        for (const o of options) {
          if (o.arch === 'COLLABORATE') collaborates.push(o.id)
          if ((o.flags ?? []).includes('COMPROMISED')) withFlag.push(o.id)
        }
      }
    }
    // One per scenario. The Activist's No Compromise goal is only a real
    // constraint while this holds.
    expect(collaborates).toHaveLength(18)
    expect(withFlag.sort()).toEqual(collaborates.sort())
  })
})
