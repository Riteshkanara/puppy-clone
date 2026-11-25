import { useCallback, useState } from 'react'
import FamilyWall from '../components/FamilyWall'
import FamilyViewer from '../components/FamilyViewer'
import RevealScope from '../components/RevealScope'
import Teddy from '../components/Teddy'
import { FAMILY_COUNT, familyPhotos } from '../data/families'
import './HappyFamiliesPage.css'

function HeartOutline() {
  return (
    <svg className="hf-heart" viewBox="0 0 48 44" aria-hidden="true">
      <path d="M24 40.5C10 30.2 3 22.8 3 14.5 3 8.4 7.6 4 13.2 4c4.2 0 8 2.4 10.8 6.6C26.8 6.4 30.6 4 34.8 4 40.4 4 45 8.4 45 14.5 45 22.8 38 30.2 24 40.5Z" />
    </svg>
  )
}

function HappyFamiliesPage() {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <div className="hf-page">
      <section className="hf-hero">
        <div className="hf-hero__copy">
          <p className="hf-kicker font-scrawl">our wall of happy endings</p>
          <h1 className="hf-title font-plush">
            Happy families <HeartOutline />
          </h1>
          <p className="hf-lede">
            Nothing makes us happier than seeing our puppies in loving homes! Here are some beautiful moments shared by
            our amazing clients after welcoming their furry friends.
          </p>
          <p className="hf-count font-scrawl">{`${FAMILY_COUNT} moments and counting`}</p>
        </div>

        <figure className="hf-note">
          <span className="hf-note__tape" aria-hidden="true" />
          <blockquote>
            “TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our
            Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process gave
            us complete peace of mind.”
          </blockquote>
          <figcaption className="font-scrawl">Sarah M., Dubai, UAE</figcaption>
        </figure>
      </section>

      <RevealScope className="hf-wall-wrap">
        <FamilyWall photos={familyPhotos} placeholderCount={FAMILY_COUNT} onOpen={setOpen} />
      </RevealScope>

      <div className="hf-signoff">
        <Teddy className="hf-signoff__teddy" />
        <p className="font-scrawl">every one of them was a Teddy Pup once</p>
      </div>

      {open !== null && familyPhotos.length > 0 && (
        <FamilyViewer photos={familyPhotos} index={open} onIndexChange={setOpen} onClose={close} />
      )}
    </div>
  )
}

export default HappyFamiliesPage
