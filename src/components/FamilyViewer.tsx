import { useEffect, useRef } from 'react'
import type { FamilyPhoto } from '../types/family'
import './FamilyViewer.css'

interface Props {
  photos: readonly FamilyPhoto[]
  index: number
  onIndexChange: (next: number) => void
  onClose: () => void
}

/** Full-screen photo viewer: "n / total" counter, Close, Previous / Next (wraps), Esc and ←/→ keys. */
export default function FamilyViewer({ photos, index, onIndexChange, onClose }: Props) {
  const total = photos.length
  const closeRef = useRef<HTMLButtonElement>(null)
  const photo = photos[index]

  const go = (delta: number) => onIndexChange((index + delta + total) % total)

  // Lock page scroll and restore focus to the card that opened the viewer.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      opener?.focus?.()
    }
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft') onIndexChange((index - 1 + total) % total)
      else if (event.key === 'ArrowRight') onIndexChange((index + 1) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, onClose, onIndexChange])

  // Warm the cache for the neighbours.
  useEffect(() => {
    for (const offset of [-1, 1]) {
      const neighbour = photos[(index + offset + total) % total]
      if (neighbour) new Image().src = neighbour.url
    }
  }, [index, photos, total])

  if (!photo) return null

  return (
    <div className="fv" role="dialog" aria-modal="true" aria-label="Happy families photo viewer">
      <div className="fv__bar">
        <span className="fv__count" aria-live="polite">
          {index + 1} / {total}
        </span>
        <button type="button" className="fv__close" ref={closeRef} onClick={onClose}>
          Close
        </button>
      </div>

      <div className="fv__stage">
        <img key={photo.id} className="fv__img" src={photo.url} alt={photo.alt} />
      </div>

      <div className="fv__controls">
        <button type="button" className="fv__btn fv__btn--prev" onClick={() => go(-1)}>
          Previous
        </button>
        <button type="button" className="fv__btn fv__btn--next" onClick={() => go(1)}>
          Next
        </button>
      </div>
    </div>
  )
}
