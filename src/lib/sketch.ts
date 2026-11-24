/**
 * Deterministic "hand-drawn" sketch generator for puppy cards.
 *
 * Ported 1:1 from the original site's card code so every puppy gets the exact same
 * wobbly outline, photo mask, colour wash, tilt and doodles as the original.
 * The seed is the puppy slug — do NOT change the order of the rng() calls.
 */

export type Pt = [number, number]
export type DoodleKind = 'sparkle' | 'heart' | 'dashes' | 'swirl' | 'dots' | 'paw'

export interface Doodle {
  kind: DoodleKind
  x: number
  y: number
  rot: number
  size: number
  ink: string
}

export interface Sketch {
  mask: string
  outline: string
  retrace: string
  wash: { d: string; dx: number; dy: number; color: string }
  tilt: number
  doodles: Doodle[]
}

const WASHES = ['#f2be6b', '#f9cdbf', '#bfddf5', '#fbe3b4', '#e8c39a']
const INKS = ['#c2622b', '#a24a1a', '#2a170e', '#d4893f']
const KINDS: DoodleKind[] = ['sparkle', 'heart', 'dashes', 'swirl', 'dots', 'paw']

const f2 = (n: number) => n.toFixed(2)

/** FNV-1a hash → mulberry32 PRNG, seeded by a string. */
function seeded(seed: string) {
  let h = 0x811c9dc5
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x1000193)
  let a = h >>> 0
  return () => {
    let t = (a = (a + 0x6d2b79f5) >>> 0)
    t = Math.imul(t ^ (t >>> 15), 1 | t)
    return (((t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

/** Points on a wobbly closed (or partial) blob around (50,50). */
function blob(rng: () => number, base: number, wobble: number, steps = 40, start = 0, sweep = Math.PI * 2): Pt[] {
  const phase = [6.28 * rng(), 6.28 * rng(), 6.28 * rng()]
  const squash = 1 + (rng() - 0.5) * 0.05
  const pts: Pt[] = []
  for (let i = 0; i < steps; i++) {
    const a = start + (i / (sweep >= Math.PI * 2 ? steps : steps - 1)) * sweep
    const r =
      base +
      wobble *
        (0.55 * Math.sin(2 * a + phase[0]) + 0.3 * Math.sin(3 * a + phase[1]) + 0.15 * Math.sin(5 * a + phase[2]))
    pts.push([50 + Math.cos(a) * r * squash, 50 + (Math.sin(a) * r) / squash])
  }
  return pts
}

/** Catmull-Rom → cubic Bézier path through the points. */
function smooth(pts: Pt[], closed: boolean): string {
  const n = pts.length
  const at = (i: number) => pts[closed ? (i + n) % n : Math.min(n - 1, Math.max(0, i))]
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`
  }
  return closed ? `${d}Z` : d
}

/** CSS `url(...)` of an SVG blob, used as a mask-image for the photo. */
export function maskUrl(path: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" fill="#000"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const cache = new Map<string, Sketch>()

export function sketchFor(slug: string): Sketch {
  const hit = cache.get(slug)
  if (hit) return hit

  const rng = seeded(slug)
  const mask = smooth(blob(rng, 45.5, 2.6), true)
  const outline = smooth(blob(rng, 47.8, 3.1), true)
  const arcStart = rng() * Math.PI * 2
  const retrace = smooth(blob(rng, 49, 3.4, 30, arcStart, Math.PI * (1.15 + 0.5 * rng())), false)
  const wash = {
    d: smooth(blob(rng, 46.5, 3.6), true),
    dx: (rng() - 0.5) * 9,
    dy: 3 + 4 * rng(),
    color: WASHES[Math.floor(rng() * WASHES.length)],
  }
  const tilt = (rng() - 0.5) * 5

  // Doodles orbit the frame in three arcs (right, bottom-left, top-left), shuffled.
  const zones = ([[0.86, 1.08], [1.16, 1.42], [-0.08, 0.16]] as [number, number][])
    .map((z) => ({ z, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.z)

  const count = 2 + Math.floor(2 * rng())
  const used = new Set<DoodleKind>()
  const doodles: Doodle[] = []
  for (let i = 0; i < count; i++) {
    let kind = KINDS[Math.floor(rng() * KINDS.length)]
    if (used.has(kind)) kind = KINDS.find((k) => !used.has(k)) as DoodleKind
    used.add(kind)
    const [lo, hi] = zones[i]
    const ang = Math.PI * (lo + rng() * (hi - lo))
    const dist = 55 + 4 * rng()
    doodles.push({
      kind,
      x: 50 + Math.cos(ang) * dist,
      y: 50 + Math.sin(ang) * dist,
      rot: (rng() - 0.5) * 50,
      size: 0.85 + 0.35 * rng(),
      ink: INKS[Math.floor(rng() * INKS.length)],
    })
  }

  const sketch: Sketch = { mask, outline, retrace, wash, tilt, doodles }
  cache.set(slug, sketch)
  return sketch
}
