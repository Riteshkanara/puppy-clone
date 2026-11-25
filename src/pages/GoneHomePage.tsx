import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import RevealScope from '../components/RevealScope'
import Teddy from '../components/Teddy'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import './StoryPages.css'
import './GoneHomePage.css'

type Origin = 'TEDDYPUPS' | 'DUBAI SHOWROOM'

interface Ticket {
  name: string
  detail: string
  origin: Origin
  /** File in public/gone-home/ (cut from the original page's avatar photos). */
  photo: string
}

/** Order, names, breeds and origins as shown on the original /gone-home page. */
const TICKETS: Ticket[] = [
  { name: 'Ace', detail: 'Pomeranian, boy', origin: 'TEDDYPUPS', photo: '01-ace.jpg' },
  { name: 'Leo', detail: 'Poodle, boy', origin: 'TEDDYPUPS', photo: '02-leo.jpg' },
  { name: 'Mia', detail: 'Maltipoo, girl', origin: 'DUBAI SHOWROOM', photo: '03-mia.jpg' },
  { name: 'Sadie', detail: 'Maltipoo, girl', origin: 'TEDDYPUPS', photo: '04-sadie.jpg' },
  { name: 'Pomeranian', detail: 'Boy', origin: 'TEDDYPUPS', photo: '05-pomeranian.jpg' },
  { name: 'Ollie', detail: 'Pomsky, boy', origin: 'TEDDYPUPS', photo: '06-ollie.jpg' },
  { name: 'Bruno', detail: 'Maltipoo, boy', origin: 'DUBAI SHOWROOM', photo: '07-bruno.jpg' },
  { name: 'Buddy', detail: 'Maltese, boy', origin: 'DUBAI SHOWROOM', photo: '08-buddy.jpg' },
  { name: 'Charlie', detail: 'Maltese, boy', origin: 'TEDDYPUPS', photo: '09-charlie.jpg' },
  { name: 'Daisy', detail: 'Pomeranian, girl', origin: 'DUBAI SHOWROOM', photo: '10-daisy.jpg' },
  { name: 'Bella', detail: 'Pomeranian, girl', origin: 'TEDDYPUPS', photo: '11-bella.jpg' },
  { name: 'Teddy', detail: 'Poodle, boy', origin: 'TEDDYPUPS', photo: '12-teddy.jpg' },
  { name: 'Molly', detail: 'Poodle, girl', origin: 'DUBAI SHOWROOM', photo: '13-molly.jpg' },
  { name: 'Coco', detail: 'Pomsky, girl', origin: 'TEDDYPUPS', photo: '14-coco.jpg' },
  { name: 'Rosie', detail: 'Pomsky, girl', origin: 'DUBAI SHOWROOM', photo: '15-rosie.jpg' },
  { name: 'Leo', detail: 'Pomeranian, boy', origin: 'DUBAI SHOWROOM', photo: '16-leo.jpg' },
  { name: 'Molly', detail: 'Poodle, girl', origin: 'TEDDYPUPS', photo: '17-molly.jpg' },
  { name: 'Rocky', detail: 'Poodle, boy', origin: 'TEDDYPUPS', photo: '18-rocky.jpg' },
  { name: 'Sophie', detail: 'Maltipoo, girl', origin: 'DUBAI SHOWROOM', photo: '19-sophie.jpg' },
  { name: 'Lola', detail: 'Maltipoo, girl', origin: 'DUBAI SHOWROOM', photo: '20-lola.jpg' },
  { name: 'Rex', detail: 'Pomeranian, boy', origin: 'TEDDYPUPS', photo: '21-rex.jpg' },
  { name: 'Finn', detail: 'Pomsky, boy', origin: 'TEDDYPUPS', photo: '22-finn.jpg' },
  { name: 'Zoe', detail: 'Maltipoo, girl', origin: 'TEDDYPUPS', photo: '23-zoe.jpg' },
  { name: 'Mimi', detail: 'Pomeranian, girl', origin: 'DUBAI SHOWROOM', photo: '24-mimi.jpg' },
]

/** Tilt per ticket in degrees, measured from the original desktop screenshot; the pattern repeats every 6 tickets. */
const TILTS = [-1.4, 1.1, -0.6, 1.6, -1.1, 0.8]

export default function GoneHomePage() {
  useDocumentMeta('Gone home | TeddyPups U.A.E.')

  return (
    <div data-page="gone" className="gutter tp-gone">
      <RevealScope className="tp-boothhead">
        <div className="tp-gone__words">
          <h1 className="font-plush text-giant tp-gone__title">
            Gone home
            <svg aria-hidden viewBox="0 0 24 22" className="tp-gone__heart">
              <path d="M12 20C5.5 14.8 2 11.6 2 7.6 2 4.8 4.1 2.8 6.7 2.8c2.1 0 4.2 1.3 5.3 3.4 1.1-2.1 3.2-3.4 5.3-3.4 2.6 0 4.7 2 4.7 4.8 0 4-3.5 7.2-10 12.4z" />
            </svg>
          </h1>
          <p className="text-lede tp-gone__lede">
            Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we'll help you
            find your match.
          </p>
          <Link to="/puppies" className="btn btn-primary tp-gone__cta">
            See available puppies
          </Link>
        </div>

        <div className="tp-booth">
          <span className="font-scrawl tp-booth__bubble" aria-hidden>
            hm?
          </span>
          <Teddy pose="peek" className="tp-booth__teddy" label="Teddy peeking over the tickets-home booth" />
          <div className="tp-booth__counter">
            <span className="font-plush">tickets home</span>
          </div>
        </div>
      </RevealScope>

      <RevealScope>
        <ul className="tp-tickets" aria-label="Puppies who have gone home">
          {TICKETS.map((t, i) => (
            <li
              key={`${t.name}-${i}`}
              className="tp-ticket"
              data-reveal
              style={{ '--tilt': `${TILTS[i % TILTS.length]}deg`, '--i': i % 3 } as CSSProperties}
            >
              <article className="tp-ticket__link">
                <div className="tp-ticket__main">
                  <span className="tp-ticket__photo">
                    <img
                      src={`/gone-home/${t.photo}`}
                      alt=""
                      width={256}
                      height={256}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                  <div className="tp-ticket__body">
                    <span className="font-scrawl tp-ticket__kicker">one ticket home</span>
                    <h2 className="font-plush tp-ticket__name">{t.name}</h2>
                    <p className="tp-ticket__meta">{t.detail}</p>
                    <p className="tp-ticket__route">
                      <span>{t.origin}</span>
                      <svg aria-hidden viewBox="0 0 40 12">
                        <path d="M2 6h30" />
                        <path d="M30 2l6 4-6 4" />
                      </svg>
                      <span>
                        Home <span aria-hidden>♥</span>
                      </span>
                    </p>
                  </div>
                </div>
                <div className="tp-ticket__stub" aria-hidden>
                  <span className="font-scrawl">admit one</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </RevealScope>
    </div>
  )
}
