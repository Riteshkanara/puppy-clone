import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { peepholePath, type HomeDoor } from '../../data/homeDoors'
import Photo from './Photo'

/** One puppy "door" in the Meet the pups hall. */
export default function Door({ d }: { d: HomeDoor }) {
  return (
    <li className="tp-door" data-open="true">
      <Link className="tp-door__link" style={{ '--door': d.door } as CSSProperties} to={`/puppies/${d.slug}`}>
        <span className="tp-door__plate">
          <span className="font-plush tp-door__name">{d.name}</span>
          <span className="tp-door__meta">{d.meta}</span>
        </span>
        <span className="tp-door__frame">
          <span className="tp-door__room">
            <Photo src={d.src} alt={d.alt} pos={d.pos} color={d.color} />
          </span>
          <span aria-hidden="true" className="tp-door__way">
            <span className="tp-door__leaf">
              <svg viewBox="0 0 64 64" className="tp-door__peephole" aria-hidden="true" fill="currentColor">
                <path d={peepholePath} />
              </svg>
              <span className="tp-door__knob"></span>
            </span>
          </span>
          <span className="tp-door__tag font-scrawl">{d.status}</span>
        </span>
      </Link>
    </li>
  )
}
