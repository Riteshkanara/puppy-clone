import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import PupBuddy from '../PupBuddy'
import Photo from '../Photo'
import { useHeroLineup, lineupPool } from '../../../hooks/useHeroLineup'

/** Seat geometry from the original (position, width, how far the arch rises, tilt). */
const SEATS = [
  { x: '9%', w: '8.6rem', peek: '0.62', tilt: '-5deg' },
  { x: '22.5%', w: '10.4rem', peek: '0.8', tilt: '3deg' },
  { x: '35%', w: '9.2rem', peek: '0.7', tilt: '-2deg' },
  { x: '65%', w: '9.4rem', peek: '0.74', tilt: '3deg' },
  { x: '77.5%', w: '10.6rem', peek: '0.82', tilt: '-3deg' },
  { x: '91%', w: '8.4rem', peek: '0.6', tilt: '4deg' },
]
const INITIAL = [0, 1, 2, 3, 4, 5]
const seatStyle = (s: (typeof SEATS)[number], i: number) =>
  ({ '--x': s.x, '--w': s.w, '--peek': s.peek, '--tilt': s.tilt, '--i': String(i) }) as CSSProperties

export default function HeroScene() {
  const ref = useRef<HTMLElement>(null)
  const view = useHeroLineup(ref, INITIAL)
  return (
    <section
      ref={ref}
      data-pup-scene="true"
      data-tone="light"
      className="tp-scene tp-hero"
      style={{ '--sky-top': '#fffdf8', '--sky-bottom': '#fff1d8', '--quilt': '#fff1d8' } as CSSProperties}
      aria-labelledby="hero-title"
    >
      <span aria-hidden="true" className="tp-hero__sun"></span>
      <div className="tp-hero__copy gutter">
        <p className="tp-hero__note font-scrawl">
          every puppy is family
          <svg
            viewBox="0 0 220 24"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full text-toffee"
            aria-hidden="true"
          >
            <path
              d="M4 14c18-10 30 8 48-1s28-9 46 0 30 8 48-1 30-9 48 0 18 2 22 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
        <h1 id="hero-title" className="tp-hero__title font-plush">
          <span className="tp-hero__line">Premium teacup</span>
          <span className="tp-hero__line tp-hero__line--2">puppies in Dubai</span>
        </h1>
        <p className="tp-hero__lede">
          Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders
          worldwide.
        </p>
        <div className="tp-hero__actions">
          <Link to="/puppies" className="btn btn-primary">
            View available puppies
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            Enquire on WhatsApp
          </Link>
        </div>
      </div>
      <div className="tp-hero__stage">
        <ul className="tp-lineup" aria-label="Some of the puppies in our showroom">
          {SEATS.map((seat, i) => {
            const pup = lineupPool[view.slots[i]]
            return (
              <li key={i} className="tp-lineup__seat" style={seatStyle(seat, i)}>
                <Link
                  to={`/puppies/${pup.slug}`}
                  className="tp-lineup__pup"
                  data-pup-friend="true"
                  data-state={view.state[i]}
                  aria-label={`Meet ${pup.name}`}
                >
                  <span className="tp-lineup__photo">
                    <Photo key={pup.slug} src={pup.src} alt={pup.alt} pos={pup.pos} color={pup.color} eager />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
          {SEATS.map((seat, i) => (
            <li key={i} className="tp-lineup__seat" style={seatStyle(seat, i)}>
              <span className="tp-lineup__ghost" data-tag={view.tag[i] ? 'show' : undefined}>
                <span className="tp-lineup__name font-scrawl">{lineupPool[view.slots[i]].name}</span>
              </span>
            </li>
          ))}
        </ul>
        <span aria-hidden="true" className="tp-lineup__wings" data-for="6">
          <Photo
            src="/media/3yOfnmoyPooH/81e0c7e00c/b942a5_556841b9a73942e5a9d782a683f3bc68-mv2.jpg"
            alt=""
            pos="40.3% 44.3%"
            color="#080808"
            eager
          />
        </span>
        <div
          data-pup-stop="true"
          data-pose="peek"
          data-facing="right"
          data-act="peekaboo"
          data-behind="true"
          data-lane="true"
          className="pup-stop tp-hero__teddy"
        >
          <PupBuddy n={0} />
        </div>
        <div aria-hidden="true" className="tp-quilt">
          <svg className="tp-quilt__edge" width="100%" height="40" preserveAspectRatio="none">
            <defs>
              <pattern id="tp-scallop" width="76" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V27A38 25 0 0 1 76 27V40Z" style={{ fill: 'var(--quilt)' }} />
                <path d="M0 27A38 25 0 0 1 76 27" fill="none" stroke="#2a170e" strokeWidth="3" />
                <path
                  d="M11 33A27 19 0 0 1 65 33"
                  fill="none"
                  stroke="#2a170e"
                  strokeWidth="1.6"
                  strokeDasharray="3.5 5.5"
                  strokeLinecap="round"
                  opacity=".42"
                />
              </pattern>
            </defs>
            <rect width="100%" height="40" fill="url(#tp-scallop)" />
          </svg>
        </div>
      </div>
    </section>
  )
}
