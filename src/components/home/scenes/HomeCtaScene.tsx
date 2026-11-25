import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import TeddyRig from '../../TeddyRig'
import { useDoorOpen } from '../../../hooks/useDoorOpen'
import Photo from '../Photo'

export default function HomeCtaScene() {
  const sectionRef = useRef<HTMLElement>(null)
  useDoorOpen(sectionRef)
  return (
    <section
      ref={sectionRef}
      data-pup-scene="true"
      data-tone="dark"
      className="tp-scene tp-home"
      style={{ '--sky-top': '#2f1a10', '--sky-bottom': '#24130b' } as CSSProperties}
      aria-labelledby="cta-title"
    >
      <div className="tp-home__copy gutter">
        <h2 id="cta-title" className="font-plush text-huge">
          Ready to meet your new best friend?
        </h2>
        <p className="tp-home__lede">
          Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you
          find the right match and ensure a smooth, safe delivery across the UAE.
        </p>
      </div>
      <div className="tp-house">
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--left"></span>
        <span aria-hidden="true" className="tp-house__lamp"></span>
        <div className="tp-house__doorway">
          <span className="tp-house__inside">
            <Photo
              src="/media/Z0ToauDx7Eve/5fffe4d022/b942a5_4b8cfb8204d24eadaf524332aba1dc15-mv2.webp"
              alt="Max, waiting inside"
              pos="53.8% 44.3%"
              color="#785838"
            />
          </span>
          <span aria-hidden="true" className="tp-house__door">
            <span className="tp-house__peep"></span>
            <span className="tp-house__knob"></span>
          </span>
        </div>
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--right"></span>
        <span aria-hidden="true" className="tp-house__mat font-scrawl">
          welcome home
        </span>
        <div data-pup-stop="true" data-pose="bow" data-facing="right" className="pup-stop tp-house__teddy">
          <TeddyRig mode="idle" />
        </div>
      </div>
      <div className="tp-home__actions gutter">
        <Link to="/contact" className="btn btn-whatsapp">
          Enquire on WhatsApp
        </Link>
        <Link to="/contact" className="btn btn-ghost tp-home__ghost">
          {'Visit & contact'}
        </Link>
      </div>
    </section>
  )
}
