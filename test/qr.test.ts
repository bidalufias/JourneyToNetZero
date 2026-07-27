/**
 * The QR encoder, pinned against a reference implementation.
 *
 * `src/ui/qr.ts` is written out rather than installed, so the tables in it —
 * block structure, alignment centres, the BCH constants, the mask penalties —
 * are only as good as something independent that agrees with them. Every
 * matrix here was produced by the `qrcode` package at error correction level M
 * and compared module for module, which also pins the mask choice: get the
 * penalty scoring wrong and the symbol still scans, but it stops matching.
 *
 * The samples cover versions 1, 3, 4, 6 and 10 — the join URL sits at 3 or 4,
 * and the outer two are there so a table edited for the common case cannot
 * quietly break the ends of the supported range.
 *
 * Regenerate with a scratch script if the samples ever change:
 *   npm i --no-save qrcode
 *   QRCode.create([{ data: text, mode: 'byte' }], { errorCorrectionLevel: 'M' })
 *
 * The explicit byte segment matters. Left to itself the reference splits a
 * payload into numeric and alphanumeric runs where it can, which is a smaller
 * symbol and a different matrix; this encoder is byte-mode throughout, which
 * costs a version on a very numeric URL and removes a whole class of encoding
 * bug from a file nobody is going to reread.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { QUIET, encodeQr, qrPath } from '../src/ui/qr'

interface Golden {
  text: string
  version: number
  size: number
  rows: string[]
}

const golden: Golden[] = JSON.parse(
  readFileSync(fileURLToPath(new URL('./fixtures/qr-golden.json', import.meta.url)), 'utf8'),
)

const render = (m: { size: number; modules: boolean[][] }) =>
  m.modules.map((row) => row.map((d) => (d ? '1' : '0')).join(''))

describe('QR encoding', () => {
  for (const sample of golden) {
    it(`matches the reference for version ${sample.version} (${sample.text.slice(0, 32)}…)`, () => {
      const matrix = encodeQr(sample.text)
      expect(matrix.size).toBe(sample.size)
      expect(render(matrix)).toEqual(sample.rows)
    })
  }

  it('picks the smallest version that holds the payload', () => {
    // Version 1-M holds 16 bytes of data, two of which the header takes.
    expect(encodeQr('x'.repeat(14)).size).toBe(21)
    expect(encodeQr('x'.repeat(15)).size).toBe(25)
  })

  it('refuses a payload past version 10 rather than truncating it', () => {
    expect(() => encodeQr('x'.repeat(300))).toThrow(/more than version 10/)
  })

  it('draws one unit square per dark module, inside the quiet zone', () => {
    const matrix = encodeQr('https://jtnz.example/play?room=ABCD')
    const dark = matrix.modules.flat().filter(Boolean).length
    const path = qrPath(matrix)
    expect(path.match(/M/g)!.length).toBe(dark)
    // Nothing may be drawn outside the quiet zone.
    expect(path.startsWith(`M${QUIET} `) || path.includes(`M${QUIET} ${QUIET}h1v1h-1z`)).toBe(true)
  })
})
