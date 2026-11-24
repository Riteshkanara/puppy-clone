/** One photo on the Happy Families wall (shape taken from the original site's media payload). */
export interface FamilyPhoto {
  id: string
  /** Site-relative path, e.g. `/media/<id>/<hash>/<file>.webp` — served from `public/media/`. */
  url: string
  width: number
  height: number
  alt: string
  /** Handwritten polaroid caption; empty string when the original has none. */
  caption: string
  /** Dominant colour used as the placeholder while the photo loads. */
  color?: string
}
