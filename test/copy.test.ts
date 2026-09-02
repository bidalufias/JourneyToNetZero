/**
 * Every sentence a player reads follows the plain English standard.
 *
 * `LANGUAGE-REVIEW.md` section 4 sets ten rules, and three of them a machine
 * can check: one name per thing (3.4), no idiom from the list in section 3,
 * and twelve words or fewer on a phone sentence, fifteen on a projector
 * sentence. This test walks every string literal and every piece of JSX text
 * under `src/`, and every text field in the content pack, and fails on any of
 * those. Dashes are checked too, because the repository removed them on
 * purpose and a second-language reader does not know what one means.
 *
 * The facilitator's script is spoken, not read off a screen, so it is not
 * held to the phone limit; the written guide in `public/` is a reference and
 * is not scanned. The engine and the transports carry no player-facing copy.
 *
 * The content pack is held to the same list, but through a ratchet: the count
 * of sentences that fail today may not grow, and WP5 of the implementation
 * plan takes both counts to zero and turns the ratchets into hard limits.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(root, 'src')

/** Phone strings get twelve words a sentence; the projector, fifteen. */
const PHONE_WORDS = 12
const PROJECTOR_WORDS = 15

/**
 * Second names for things that have one name (3.4), verbs a child does not
 * know (4.6), and the idioms quoted in section 3. Matched inside strings that
 * contain a space, so an id such as `'reckoning'` or `'fiscal'` in code is
 * not a hit; only a sentence is.
 */
const BANNED: { term: string; re: RegExp }[] = [
  { term: 'Reckoning (say The Reveal)', re: /\breckoning\b/i },
  { term: 'The Table (say The Talk)', re: /\bthe table\b/i },
  { term: 'tip off (say tip)', re: /\btip[ -]?off/i },
  { term: 'insider tip (say tip)', re: /\binsider tip/i },
  { term: 'sealed brief (say tip)', re: /\bsealed brief/i },
  { term: 'secret win (say secret goal)', re: /\bsecret win/i },
  { term: 'private goal (say secret goal)', re: /\bprivate goal/i },
  { term: 'sealed goal (say secret goal)', re: /\bsealed goal/i },
  { term: 'lock it in / locked in (say lock / locked)', re: /\block(ed)?\s+(it\s+)?in\b/i },
  { term: 'seal (say choose)', re: /\bseal(ed|s|ing)?\b/i },
  { term: 'fiscal (say Budget)', re: /\bfiscal\b/i },
  {
    term: 'capital (say Company Money)',
    re: /\bcapital (leaves|flees|offshore|money|points?|spending|costs?)\b|\b(move|raise|spend|your|our|company) capital\b/i,
  },
  { term: 'coalition (say moving together)', re: /\bcoalition\b/i },
  { term: 'Public Mandate (say veto)', re: /\bpublic mandate\b/i },
  { term: 'green share / green economy (say Clean Economy)', re: /\bgreen (share|economy)\b/i },
  { term: 'happiness (say quality of life)', re: /\bhappiness\b/i },
  { term: 'Mt (say million tonnes)', re: /\bMt\b/ },
  { term: 'escalate', re: /\bescalat/i },
  { term: 'co-fund', re: /\bco-fund/i },
  { term: 'pledge', re: /\bpledg/i },
  { term: 'land (as in "the card landed")', re: /\bland(ed|s)\b/i },
  { term: 'bite', re: /\bbites?\b/i },
  { term: 'fire (as in "the Spotlight fires")', re: /\b(it|spotlight|veto|promise|card) (only )?fires\b|\bfires (if|when|only)\b/i },
  { term: 'hold the line', re: /\bhold the line\b/i },
  { term: 'belt-tightening', re: /belt[ -]tight/i },
  { term: 'cross the floor', re: /\bcross(es|ed)? the floor\b/i },
  { term: 'middleman', re: /\bmiddlem[ae]n\b/i },
  { term: 'on our watch', re: /\bon our watch\b/i },
  { term: 'head start', re: /\bhead start\b/i },
  { term: 'money is no object', re: /\bno object\b/i },
  { term: 'ledgers', re: /\bledgers?\b/i },
  { term: 'on the record', re: /\bon the record\b/i },
  { term: 'white flag', re: /\bwhite flag\b/i },
  { term: 'plug the hole', re: /\bplug the hole\b/i },
  { term: 'quietly delighted', re: /\bquietly delighted\b/i },
  { term: 'any resemblance', re: /\bany resemblance\b/i },
  { term: 'give yourselves a hand', re: /\bgive yourselves a hand\b/i },
  { term: 'actually fine', re: /\bactually fine\b/i },
  { term: 'not our problem', re: /\bnot our problem\b/i },
  { term: 'get out the vote', re: /\bget out the (youth )?vote\b/i },
  { term: 'cross the floor', re: /\bcross the floor\b/i },
]

const DASHES = /[–—]/

// ── Walking the source ────────────────────────────────────────────────────

function files(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...files(p))
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

/** Which limit a file's strings answer to, or null if it carries no copy. */
function surface(file: string): 'phone' | 'projector' | null {
  const rel = relative(root, file).replace(/\\/g, '/')
  if (rel.startsWith('src/facilitator/')) return null
  if (rel.startsWith('src/engine/')) return null
  if (rel.startsWith('src/net/')) return null
  if (rel.startsWith('src/dashboard/')) return 'projector'
  return 'phone'
}

/** Comments are prose for a future developer, not copy for a player. */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')
}

/**
 * Every quoted string, template literal and run of JSX text. A template's
 * `${...}` becomes one word, which is what a name or a number is when read.
 */
function strings(code: string): string[] {
  const out: string[] = []
  const src = stripComments(code)
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const raw = m[1] ?? m[2] ?? m[3] ?? ''
    out.push(raw.replace(/\$\{[^}]*\}/g, 'X'))
  }
  // JSX text: between a closing `>` and the next `<`, with no expression in it.
  // Code between two comparison operators can match too, so anything with the
  // shape of code (an assignment, a call, a statement end) is not text.
  for (const m of src.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) {
    if (!/[=;()]/.test(m[1])) out.push(m[1])
  }
  return out
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s) && /\s/.test(s))
    // A list of CSS classes is not a sentence.
    .filter((s) => !s.split(/\s+/).some((w) => w.includes('__') || w.includes('--')))
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function words(sentence: string): number {
  return sentence.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length
}

function tooLong(text: string, limit: number): string[] {
  return sentences(text).filter((s) => words(s) > limit)
}

function banned(text: string): string[] {
  return BANNED.filter((b) => b.re.test(text)).map((b) => b.term)
}

// ── The source ────────────────────────────────────────────────────────────

describe('the words on every screen', () => {
  const scanned = files(SRC).filter((f) => surface(f) !== null)

  it('scans the surfaces that carry copy', () => {
    const rels = scanned.map((f) => relative(root, f).replace(/\\/g, '/'))
    expect(rels).toContain('src/phone/screens.tsx')
    expect(rels).toContain('src/dashboard/screens.tsx')
    expect(rels).toContain('src/game/room.ts')
    expect(rels).not.toContain('src/facilitator/script.ts')
  })

  it('has no em or en dashes anywhere in the source', () => {
    const hits = files(SRC)
      .filter((f) => DASHES.test(readFileSync(f, 'utf8')))
      .map((f) => relative(root, f))
    expect(hits).toEqual([])
  })

  it('uses one name per thing, and no idiom from the review', () => {
    const hits: string[] = []
    for (const file of scanned) {
      for (const s of strings(readFileSync(file, 'utf8'))) {
        for (const term of banned(s)) hits.push(`${relative(root, file)}: "${s}" (${term})`)
      }
    }
    expect(hits).toEqual([])
  })

  it('keeps phone sentences to twelve words and projector sentences to fifteen', () => {
    const hits: string[] = []
    for (const file of scanned) {
      const limit = surface(file) === 'projector' ? PROJECTOR_WORDS : PHONE_WORDS
      for (const s of strings(readFileSync(file, 'utf8'))) {
        for (const long of tooLong(s, limit)) {
          hits.push(`${relative(root, file)}: "${long}" (${words(long)} words)`)
        }
      }
    }
    expect(hits).toEqual([])
  })
})

// ── The content pack ──────────────────────────────────────────────────────

/**
 * Fields that hold ids, formulas or rules rather than sentences. Everything
 * else with a space in it is read by a player.
 */
const PACK_SKIP = new Set(['_meta', 'id', 'arch', 'check', 'rule', 'rotation', 'flags', 'type', 'variant'])

function packStrings(node: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof node === 'string') {
    if (/[A-Za-z]/.test(node) && /\s/.test(node)) out.push({ path, text: node })
    return
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => packStrings(v, `${path}[${i}]`, out))
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (PACK_SKIP.has(k)) continue
      packStrings(v, path ? `${path}.${k}` : k, out)
    }
  }
}

describe('the words in the content pack', () => {
  const raw = readFileSync(join(root, 'content/jtnz-content-pack-v2.json'), 'utf8')
  const texts: { path: string; text: string }[] = []
  packStrings(JSON.parse(raw), '', texts)

  it('reads the pack', () => {
    expect(texts.length).toBeGreaterThan(500)
  })

  it('has no em or en dashes', () => {
    expect(DASHES.test(raw)).toBe(false)
  })

  /**
   * Ratchets. The numbers are what the pack scores today; each rewrite in
   * WP5 lowers them and the final pass sets both to zero. A change that
   * raises either is a change that added an idiom or a long sentence.
   */
  const BANNED_TODAY = 44
  const LONG_TODAY = 40

  it('uses no more banned words than it did', () => {
    const hits = texts.flatMap((t) => banned(t.text).map((term) => `${t.path}: "${t.text}" (${term})`))
    expect(hits.length, hits.join('\n')).toBeLessThanOrEqual(BANNED_TODAY)
  })

  it('has no more sentences over twelve words than it did', () => {
    const hits = texts.flatMap((t) =>
      tooLong(t.text, PHONE_WORDS).map((s) => `${t.path}: "${s}" (${words(s)} words)`),
    )
    expect(hits.length, hits.join('\n')).toBeLessThanOrEqual(LONG_TODAY)
  })
})
