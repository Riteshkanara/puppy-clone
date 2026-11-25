import { basketPup } from '../data/basketPup'
import FooterPup from './FooterPup'
import './FooterBasket.css'

/**
 * Footer basket — same markup as the original, on every page. Three layers:
 *   back (hollow + back rim)  <  the stop where Teddy lands  <  front (basket body + front rim).
 * With `live` (Home) the stop is Teddy's last place on the page (`data-act="basket"`, pose "snug"): the page-wide Teddy
 * (components/PupJourney.tsx) walks down, hops in and settles *behind* the front lip; until he arrives the basket is
 * empty (the static snapshot is hidden while he is live, see FooterBasket.css). Without `live` (every other page) it is
 * not a stop, and the original's static Teddy simply sits in the basket.
 */
export default function FooterBasket({ live = false }: { live?: boolean }) {
  return (
    <div className="tp-basket">
      <svg aria-hidden="true" viewBox="0 0 300 240" className="tp-basket__back">
        <ellipse cx="212" cy="145" rx="96" ry="12" className="tp-basket__hollow" />
        <path d="M116 145 A96 12 0 0 1 308 145" className="tp-basket__rim-line" />
        <path d="M116 145 A96 12 0 0 1 308 145" className="tp-basket__rim" />
      </svg>
      {live ? (
        <div
          data-pup-stop="true"
          data-pose="snug"
          data-facing={basketPup.facing}
          data-act="basket"
          data-behind="true"
          data-lane="true"
          className="pup-stop tp-basket__pup"
        >
          <div className="pup-buddy" data-facing={basketPup.facing}>
            <svg
              viewBox={basketPup.viewBox}
              style={{ overflow: 'visible' }}
              role="img"
              aria-label="Teddy, sitting snug in his basket"
              focusable="false"
              dangerouslySetInnerHTML={{ __html: basketPup.inner }}
            />
          </div>
        </div>
      ) : (
        <FooterPup />
      )}
      <svg aria-hidden="true" viewBox="0 0 300 240" className="tp-basket__front">
        <path
          d="M116 145 C118 180 126 214 138 232 L286 232 C298 214 306 180 308 145 A96 12 0 0 1 116 145 Z"
          className="tp-basket__body"
        />
        <path d="M121 178 Q212 197 303 178 M127 206 Q212 223 297 206" className="tp-basket__weave" />
        <path
          d="M150 164 L158 230 M182 168 L185 232 M212 169 V232 M242 168 L239 232 M274 164 L266 230"
          className="tp-basket__weave tp-basket__weave--stakes"
        />
        <path d="M116 145 A96 12 0 0 0 308 145" className="tp-basket__rim-line" />
        <path d="M116 145 A96 12 0 0 0 308 145" className="tp-basket__rim" />
      </svg>
    </div>
  )
}
