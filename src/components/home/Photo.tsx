import type { CSSProperties } from 'react'

interface Props {
  src: string
  alt: string
  /** object-position, e.g. "53.8% 44.3%" (the original's focal point). */
  pos?: string
  /** Dominant colour shown until the photo loads or if the file is missing. */
  color?: string
  eager?: boolean
}

/** Fills its (positioned) parent — same behaviour as the original's next/image `fill`. */
export default function Photo({ src, alt, pos, color, eager = false }: Props) {
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: pos,
    color: 'transparent',
    backgroundColor: color,
    backgroundSize: 'cover',
    backgroundPosition: pos,
    backgroundRepeat: 'no-repeat',
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      style={style}
    />
  )
}
