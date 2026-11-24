import * as puppyData from '../data/puppies'

export interface PuppyOption {
  value: string
  label: string
}

/**
 * Builds the "I'm curious about…" options from src/data/puppies.ts.
 * Written defensively because this patch was authored without seeing that file:
 * it takes the first exported array of objects that have a `slug`, keeps the ones
 * that are still available, and labels them "Name (Breed)" like the original
 * enquiry form. Replace with a direct import once the export is confirmed.
 */
export function getPuppyOptions(): PuppyOption[] {
  const mod = puppyData as Record<string, unknown>
  const list = Object.values(mod).find(
    (x): x is Record<string, unknown>[] =>
      Array.isArray(x) && x.length > 0 && typeof x[0] === 'object' && x[0] !== null && 'slug' in x[0],
  )
  if (!list) return []
  const seen = new Map<string, number>()
  return list
    .filter((p) => {
      const status = typeof p.status === 'string' ? p.status : 'available'
      return status === 'available' && p.published !== false
    })
    .map((p) => {
      const slug = String(p.slug)
      const named = typeof p.name === 'string' && p.name.trim() !== ''
      const breed = typeof p.breed === 'string' ? p.breed : ''
      const gender = typeof p.genderLabel === 'string' ? p.genderLabel : ''
      const display = typeof p.displayName === 'string' ? p.displayName : slug
      // Named pup → "Max (Maltipoo)" (original). Unnamed → "Maltipoo (Girl)" (assumption).
      let label = named
        ? `${String(p.name)}${breed ? ` (${breed})` : ''}`
        : breed
          ? `${breed}${gender ? ` (${gender})` : ''}`
          : display
      const n = (seen.get(label) ?? 0) + 1
      seen.set(label, n)
      if (n > 1) label = `${label} – ${n}`
      return { value: slug, label }
    })
}
