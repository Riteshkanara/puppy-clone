import { Link } from 'react-router-dom'
import type { Puppy } from '../types/puppy'
import PuppySketch from './PuppySketch'
import RevealScope from './RevealScope'
import './GoneHomeStrip.css'

/** "Already gone home" teaser strip. Links on to the /gone-home archive. */
export default function GoneHomeStrip({ puppies }: { puppies: Puppy[] }) {
  return (
    <section aria-labelledby="gone-title" className="tp-gone-strip">
      <RevealScope className="gutter tp-gone-strip__inner">
        <div className="tp-gone-strip__copy" data-reveal>
          <h2 id="gone-title" className="font-plush text-big">
            Already gone home
          </h2>
          <p>These puppies have found their families.</p>
          <Link to="/gone-home" className="btn btn-primary">
            See the puppies who've gone home
          </Link>
        </div>
        <ul className="tp-gone-strip__row" aria-label="Some puppies who have gone home">
          {puppies.map((p, i) => (
            <li key={p.id}>
              <PuppySketch puppy={p} index={i} small />
            </li>
          ))}
        </ul>
      </RevealScope>
    </section>
  )
}
