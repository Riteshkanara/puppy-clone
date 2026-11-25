import { PUPPIES, BREEDS } from '../data/puppies'
import PuppyBrowser from '../components/PuppyBrowser'
import GoneHomeStrip from '../components/GoneHomeStrip'
import RevealScope from '../components/RevealScope'
import Teddy from '../components/Teddy'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import './PuppiesPage.css'

/**
 * Where "Ask on WhatsApp" points. Deliberately internal until the correct WhatsApp destination is confirmed.
 * NOTE: the original payload's href belongs to a different business (Insta Biz Web) — never copy it.
 */
const ASK_HREF = '/contact'

const AVAILABLE = PUPPIES.filter((p) => p.status !== 'rehomed')
const GONE_HOME = PUPPIES.filter((p) => p.status === 'rehomed')

export default function PuppiesPage() {
  useDocumentMeta(
    'Available puppies | TeddyPups U.A.E.',
    'Teacup and teddy bear puppies available now in Dubai and imported from trusted breeders — every listing shows real photos of the puppy.',
  )

  return (
    <div data-page="pups" className="tp-page">
      <section aria-labelledby="pups-title" className="tp-sketchbook">
        <div className="gutter tp-sketchbook__inner">
          <RevealScope className="tp-sketchbook__head">
            <div className="tp-sketchbook__words">
              <p className="font-scrawl tp-sketchbook__kicker" data-reveal>
                from Teddy's sketchbook
              </p>
              <h1 id="pups-title" className="font-plush text-giant tp-sketchbook__title" data-reveal>
                Available puppies
                <svg aria-hidden viewBox="0 0 400 24" preserveAspectRatio="none" className="tp-sketchbook__underline">
                  <path d="M4 15c40-9 70 5 112-2s70-9 112 0 74 8 116-1 38-4 52 1" pathLength={1} />
                </svg>
              </h1>
              <p className="text-lede tp-sketchbook__lede" data-reveal>
                Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about
                them on WhatsApp.
              </p>
            </div>
            <div className="tp-sketchbook__self" data-reveal>
              <Teddy facing="left" label="Teddy, the TeddyPups puppy" />
              <span className="font-scrawl tp-sketchbook__caption">self-portrait</span>
            </div>
          </RevealScope>

          <div className="tp-sketchbook__browser">
            <PuppyBrowser puppies={AVAILABLE} breeds={BREEDS} askHref={ASK_HREF} />
          </div>
        </div>
      </section>

      <GoneHomeStrip puppies={GONE_HOME} />
    </div>
  )
}
