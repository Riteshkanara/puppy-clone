import { CONTACT, mapsHref } from '../../data/contactDetails'

/** Photo path from the recon (the only showroom photo captured). Same path scripts/fetch-media.mjs writes to. */
const PHOTO = '/media/FHyoHcIosLZE/60f6e7e00a/27b888_323008bb0f6a41d4bde2a0da7206cd98f000.jpg'

const PAW =
  'M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z'

export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="currentColor">
      <path d={PAW} />
    </svg>
  )
}

/** Line-art Downtown skyline behind the card. ⚠ Approximation drawn from the screenshot (original SVG not in recon). */
function Skyline() {
  return (
    <svg className="tp-shopfront__city" viewBox="0 0 420 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M2 146 H418" />
        <path d="M18 146 V108 H62 V146 M30 146 V118 M44 146 V118" />
        <path d="M78 146 V88 H118 V146 M90 146 V98 M104 146 V98" />
        <path d="M140 146 V96 H148 V70 H154 V40 H158 L160 6 L162 40 H166 V70 H172 V96 H180 V146" />
        <path d="M204 146 V72 L232 54 V146 M214 146 V80 M224 146 V68" />
        <path d="M254 146 V94 H292 V146 M264 146 V104 M274 146 V104 M284 146 V104" />
        <path d="M312 146 V112 H346 V146 M322 146 V120 M334 146 V120" />
        <path d="M366 146 V84 H402 V146 M376 146 V94 M390 146 V94" />
      </g>
    </svg>
  )
}

export default function ShowroomCard({ className = '' }: { className?: string }) {
  return (
    <section className={`tp-shopfront tp-contact__visit ${className}`.trim()} aria-labelledby="visit-heading">
      <Skyline />
      <div className="tp-contact__visit-inner">
        <div className="tp-visit">
          <div className="tp-visit__text">
            <h2 id="visit-heading" className="font-plush tp-visit__title">
              Visit us in Downtown Dubai
            </h2>
            <p className="tp-visit__lede">
              Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face.
            </p>
            <p className="tp-visit__where">
              <PawIcon className="tp-visit__paw" />
              <span>{CONTACT.address}</span>
            </p>
            <a className="btn btn-ghost tp-visit__map" href={mapsHref()} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </div>
          <div className="tp-visit__photo">
            <img
              src={PHOTO}
              width={1080}
              height={1920}
              loading="lazy"
              decoding="async"
              alt="A tiny apricot teddy bear puppy held up in the TeddyPups showroom"
              style={{ objectPosition: '54.3% 48.3%' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
