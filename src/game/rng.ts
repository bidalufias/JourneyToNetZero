/**
 * Deterministic PRNG for room-level randomness — scenario path, tip dealing,
 * and the UNVERIFIED truth roll.
 *
 * Seeded and cursor-based so a room can be replayed exactly from its seed when
 * a facilitator reports something odd. This is not the game engine's maths;
 * the engine takes no randomness at all.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Advances `cursor` so every draw is reproducible from (seed, cursor). */
export function draw(seed: number, cursor: number): { value: number; cursor: number } {
  const rand = mulberry32(seed + cursor * 0x9e3779b9)
  return { value: rand(), cursor: cursor + 1 }
}

export function pick<T>(items: readonly T[], seed: number, cursor: number): { value: T; cursor: number } {
  const d = draw(seed, cursor)
  return { value: items[Math.floor(d.value * items.length)], cursor: d.cursor }
}

export function shuffle<T>(items: readonly T[], seed: number, cursor: number): { value: T[]; cursor: number } {
  const out = [...items]
  let c = cursor
  for (let i = out.length - 1; i > 0; i--) {
    const d = draw(seed, c)
    c = d.cursor
    const j = Math.floor(d.value * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return { value: out, cursor: c }
}

/** A 4-letter room code, readable from the back of a training room. */
export function roomCode(seed: number): string {
  // No vowels-only words, no I/O/0/1 — read aloud across a room without ambiguity.
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  let c = 0
  let out = ''
  for (let i = 0; i < 4; i++) {
    const d = draw(seed, c)
    c = d.cursor
    out += letters[Math.floor(d.value * letters.length)]
  }
  return out
}
