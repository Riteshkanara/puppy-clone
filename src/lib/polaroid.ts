/** Deterministic per-photo look (tilt, tape colour/position) so the wall never "jumps" between renders. */
function hash(n: number): number {
  let x = (n + 1) * 2654435761
  x ^= x >>> 15
  x = Math.imul(x, 2246822519)
  x ^= x >>> 13
  return (x >>> 0) / 4294967295
}

export const TAPE_COLOURS = ['#f1e0a8', '#f4cfc4', '#c9ddee'] as const

export interface PolaroidLook {
  tilt: number
  tape: string
  tapeLeft: number
  tapeTilt: number
  /** Two diagonal tapes on the top corners instead of one strip (both styles appear on the original wall). */
  corners: boolean
}

export function polaroidLook(index: number): PolaroidLook {
  return {
    tilt: Math.round((hash(index) * 5 - 2.5) * 10) / 10,
    tape: TAPE_COLOURS[index % TAPE_COLOURS.length],
    tapeLeft: Math.round(22 + hash(index + 101) * 36),
    tapeTilt: Math.round((hash(index + 202) * 8 - 4) * 10) / 10,
    corners: hash(index + 303) < 0.35,
  }
}

/** Round-robin split: photo i goes to column i % cols (matches the original wall order). */
export function splitColumns<T>(items: readonly T[], cols: number): { item: T; index: number }[][] {
  const out: { item: T; index: number }[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, index) => out[index % cols].push({ item, index }))
  return out
}
