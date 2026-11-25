import { useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import type { FamilyPhoto } from '../types/family'
import { polaroidLook, splitColumns } from '../lib/polaroid'
import './FamilyWall.css'

/** Column count by viewport. Assumed breakpoints (see docs): ≥1024px → 4, ≥640px → 3, below → 2. */
const QUERIES = [
  { query: '(min-width: 1024px)', cols: 4 },
  { query: '(min-width: 640px)', cols: 3 },
] as const

function readColumns(): number {
  for (const { query, cols } of QUERIES) if (window.matchMedia(query).matches) return cols
  return 2
}

function subscribe(onChange: () => void) {
  const lists = QUERIES.map(({ query }) => window.matchMedia(query))
  lists.forEach((l) => l.addEventListener('change', onChange))
  return () => lists.forEach((l) => l.removeEventListener('change', onChange))
}

function useColumns(): number {
  return useSyncExternalStore(subscribe, readColumns, () => 4)
}

function lookStyle(index: number, cols: number): CSSProperties {
  const look = polaroidLook(index)
  return {
    // small left-to-right stagger within a row when a card scrolls into view
    '--fw-delay': `${(index % cols) * 70}ms`,
    '--tilt': `${look.tilt}deg`,
    '--tape': look.tape,
    '--tape-left': `${look.tapeLeft}%`,
    '--tape-tilt': `${look.tapeTilt}deg`,
  } as CSSProperties
}

/** Photo that fades in over its placeholder colour once loaded (no blank-frame pop while scrolling). */
function WallImage({ photo }: { photo: FamilyPhoto }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setLoaded(true) // already cached
      }}
      className={loaded ? 'is-loaded' : undefined}
      src={photo.url}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
    />
  )
}

interface Props {
  photos: readonly FamilyPhoto[]
  /** Total frames to show as plain placeholders when `photos` is empty (photos not generated yet). */
  placeholderCount: number
  onOpen: (index: number) => void
}

const PLACEHOLDER_RATIOS = [0.8, 0.75, 1.33, 0.8, 0.75, 1, 0.8, 1.33]

export default function FamilyWall({ photos, placeholderCount, onOpen }: Props) {
  const cols = useColumns()
  const hasPhotos = photos.length > 0
  const items: FamilyPhoto[] = hasPhotos
    ? [...photos]
    : Array.from({ length: placeholderCount }, (_, i) => ({
        id: `placeholder-${i}`,
        url: '',
        width: 1000 * PLACEHOLDER_RATIOS[i % PLACEHOLDER_RATIOS.length],
        height: 1000,
        alt: '',
        caption: '',
        color: '#e9d6b4',
      }))

  return (
    <div className="fw-wall" style={{ '--fw-cols': cols } as CSSProperties}>
      {splitColumns(items, cols).map((column, c) => (
        <div className="fw-col" key={c}>
          {column.map(({ item, index }) => {
            const inner = (
              <>
                {polaroidLook(index).corners ? (
                  <>
                    <span className="fw-tape fw-tape--corner fw-tape--tl" aria-hidden="true" />
                    <span className="fw-tape fw-tape--corner fw-tape--tr" aria-hidden="true" />
                  </>
                ) : (
                  <span className="fw-tape" aria-hidden="true" />
                )}
                <span className="fw-photo" style={{ aspectRatio: `${item.width} / ${item.height}`, background: item.color }}>
                  {item.url && <WallImage photo={item} />}
                </span>
                <span className="fw-caption">{item.caption}</span>
              </>
            )
            return hasPhotos ? (
              <button
                type="button"
                className="fw-card"
                style={lookStyle(index, cols)}
                key={item.id}
                data-reveal
                aria-label={`Open photo ${index + 1} of ${items.length}${item.caption ? `: ${item.caption}` : ''}`}
                onClick={() => onOpen(index)}
              >
                {inner}
              </button>
            ) : (
              <div className="fw-card fw-card--placeholder" style={lookStyle(index, cols)} key={item.id} aria-hidden="true">
                {inner}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
