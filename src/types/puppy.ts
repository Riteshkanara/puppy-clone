export type PuppyStatus = 'available' | 'reserved' | 'rehomed'
/** "male-female" = a mixed pair (e.g. "Boy & girl"); it matches either gender filter. */
export type PuppyGender = 'male' | 'female' | 'male-female'

export interface Taxon {
  slug: string
  name: string
}

export type Breed = Taxon

export interface PuppyCover {
  /** Original site path, e.g. /media/<id>/<hash>/<file>. Served from /public/media (see scripts/fetch-media.mjs). */
  url: string
  width?: number
  height?: number
  /** Focal point, 0–1, used as object-position. */
  focalX: number
  focalY: number
  /** Dominant colour — shown while the image loads or if the file is missing. */
  color: string
  /** Tiny base64 webp placeholder from the original. */
  blur?: string
}

export interface Puppy {
  id: string
  slug: string
  /** Given name; empty string when the puppy is listed by breed only. */
  name: string
  displayName: string
  breed: string
  breeds: Taxon[]
  gender: PuppyGender
  genderLabel: string
  age: string
  status: PuppyStatus
  origin: Taxon
  collections: Taxon[]
  cover: PuppyCover | null
  hasVideo: boolean
  mediaCount: number
}
