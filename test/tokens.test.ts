/**
 * Every `var(--token)` in the stylesheets has to resolve.
 *
 * CSS fails silently here: one undefined custom property invalidates the whole
 * declaration it appears in, and the browser drops it without a word. A
 * shorthand like `padding: var(--space-8) var(--space-10) var(--space-10)` does
 * not fall back to the two values that were fine. It applies no padding at all.
 *
 * Both of the cases this first caught were exactly that, and neither was
 * visible in any test. One was a full-screen layout collapsed against the left
 * edge of a projector; the other had quietly removed a margin from the
 * briefing's body copy.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('../src/', import.meta.url)

function cssFiles(dir: URL): URL[] {
  return sourceFiles(dir, ['.css'])
}

function sourceFiles(dir: URL, ext: string[]): URL[] {
  const out: URL[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir)
    if (entry.isDirectory()) out.push(...sourceFiles(child, ext))
    else if (ext.some((e) => entry.name.endsWith(e))) out.push(child)
  }
  return out
}

const files = cssFiles(root)
const sources = files.map((f) => ({ path: fileURLToPath(f), text: readFileSync(f, 'utf8') }))
const all = sources.map((s) => s.text).join('\n')

// Components set a few properties inline, so the definitions are not all in the
// stylesheets. Meter fills are the main one.
const inline = sourceFiles(root, ['.tsx'])
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

/** Every custom property this codebase defines, in CSS or on an element. */
const defined = new Set([
  ...[...all.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]),
  ...[...inline.matchAll(/'(--[\w-]+)'\s*:/g)].map((m) => m[1]),
])

describe('css custom properties', () => {
  it('finds stylesheets to check', () => {
    expect(files.length).toBeGreaterThan(3)
    expect(defined.size).toBeGreaterThan(20)
  })

  it('never references a token that was never defined', () => {
    const missing: string[] = []
    for (const { path, text } of sources) {
      for (const m of text.matchAll(/var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g)) {
        const token = m[1]
        // A var() with its own fallback is safe by construction.
        if (m[0].includes(',')) continue
        if (!defined.has(token)) {
          const line = text.slice(0, m.index).split('\n').length
          missing.push(`${path.split('/src/')[1]}:${line}  ${token}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})
