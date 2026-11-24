import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import type { Puppy, PuppyStatus } from '../types/puppy'
import { maskUrl, sketchFor, type Doodle } from '../lib/sketch'
import './PuppySketch.css'

const PAW_PATH =
  'M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z'

const STATUS_LABEL: Record<PuppyStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  rehomed: 'Gone home',
}

function DoodleMark({ d }: { d: Doodle }) {
  const stroke = {
    fill: 'none',
    stroke: d.ink,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <g transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) rotate(${d.rot.toFixed(0)}) scale(${d.size.toFixed(2)})`}>
      <g className="tp-sketch__doodle">
        {d.kind === 'sparkle' && (
          <path d="M0 -6c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6z" fill={d.ink} />
        )}
        {d.kind === 'heart' && (
          <path
            d="M0 5C-4.6 1.8-6.4-.8-6.4-3.2c0-1.9 1.5-3.3 3.3-3.3 1.3 0 2.4.7 3.1 1.9.7-1.2 1.8-1.9 3.1-1.9 1.8 0 3.3 1.4 3.3 3.3C6.4-.8 4.6 1.8 0 5z"
            {...stroke}
          />
        )}
        {d.kind === 'dashes' && <path d="M-5 -5l4 2M-6 0h5M-5 5l4 -2" {...stroke} />}
        {d.kind === 'swirl' && (
          <path d="M0 0c1.6-.6 2.4 1.4.8 2.6-2 1.4-4.6-.4-4-3 .7-3 4.8-3.8 6.8-1.2 2.4 3-0.2 7.4-3.8 7.2" {...stroke} />
        )}
        {d.kind === 'dots' && (
          <g fill={d.ink}>
            <circle cx="-4" cy="1" r="1.2" />
            <circle cx="0" cy="-2" r="1.2" />
            <circle cx="4" cy="1" r="1.2" />
          </g>
        )}
        {d.kind === 'paw' && (
          <path d={PAW_PATH} transform="scale(.17) translate(-32 -34)" fill={d.ink} opacity={0.85} />
        )}
      </g>
    </g>
  )
}

interface Props {
  puppy: Puppy
  /** Position in the grid — drives the staggered draw-in delay (index % 8 × 70ms). */
  index?: number
  /** Compact variant used in the "gone home" strip. */
  small?: boolean
}

/** One hand-drawn "sketchbook" puppy card. The whole card is a link to /puppies/:slug. */
export default function PuppySketch({ puppy, index = 0, small = false }: Props) {
  const sk = sketchFor(puppy.slug)
  const mask = maskUrl(sk.mask)
  const status = STATUS_LABEL[puppy.status]
  const cover = puppy.cover

  const aria = [
    puppy.displayName + (puppy.name ? `, ${puppy.breed}` : ''),
    puppy.genderLabel.toLowerCase() + (puppy.age ? `, ${puppy.age}` : ''),
    status.toLowerCase(),
  ].join(', ')

  const style = {
    '--tilt': `${sk.tilt.toFixed(2)}deg`,
    '--d': `${(index % 8) * 70}ms`,
    '--wash': sk.wash.color,
  } as CSSProperties

  return (
    <Link
      to={`/puppies/${puppy.slug}`}
      className={`tp-sketch${small ? ' tp-sketch--small' : ''}`}
      data-reveal
      style={style}
      aria-label={aria}
    >
      <span className="tp-sketch__frame">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="tp-sketch__wash"
          style={{ translate: `${sk.wash.dx.toFixed(1)}% ${sk.wash.dy.toFixed(1)}%` }}
        >
          <path d={sk.wash.d} />
        </svg>

        <span className="tp-sketch__photo" style={{ maskImage: mask, WebkitMaskImage: mask }}>
          {cover && (
            <img
              src={cover.url}
              alt=""
              loading={index < 3 && !small ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              style={{
                objectPosition: `${(cover.focalX * 100).toFixed(1)}% ${(cover.focalY * 100).toFixed(1)}%`,
                backgroundColor: cover.color,
                backgroundImage: cover.blur ? `url(${cover.blur})` : undefined,
              }}
            />
          )}
        </span>

        <svg aria-hidden viewBox="0 0 100 100" className="tp-sketch__ink">
          <path d={sk.outline} pathLength={1} className="tp-sketch__line" />
          <path d={sk.retrace} pathLength={1} className="tp-sketch__line tp-sketch__line--retrace" />
          {sk.doodles.map((d, i) => (
            <DoodleMark key={i} d={d} />
          ))}
        </svg>

        {!small && <span className="tp-sketch__sticker font-scrawl">{status}</span>}
        {!small && puppy.hasVideo && <span className="tp-sketch__video">▶ video</span>}
        {small && <span className="tp-sketch__sticker tp-sketch__sticker--home font-scrawl">gone home ♥</span>}
      </span>

      <span className="tp-sketch__name font-plush">{puppy.displayName}</span>
      {!small && (
        <span className="tp-sketch__meta">
          {puppy.name ? `${puppy.breed} · ` : ''}
          {puppy.genderLabel.toLowerCase()}
          {puppy.age ? ` · ${puppy.age}` : ''}
        </span>
      )}
    </Link>
  )
}
