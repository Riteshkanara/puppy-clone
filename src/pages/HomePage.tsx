import RevealScope from '../components/RevealScope'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import HeroScene from '../components/home/scenes/HeroScene'
import MeetScene from '../components/home/scenes/MeetScene'
import PathsScene from '../components/home/scenes/PathsScene'
import ChatScene from '../components/home/scenes/ChatScene'
import PassportScene from '../components/home/scenes/PassportScene'
import DuskScene from '../components/home/scenes/DuskScene'
import NightScene from '../components/home/scenes/NightScene'
import HomeCtaScene from '../components/home/scenes/HomeCtaScene'
import { useHomeMotion } from '../hooks/useHomeMotion'
import '../styles/home.css'
import '../styles/home-motion.css'
import '../styles/meet-run.css'
import '../styles/chat-run.css'

/**
 * Home `/` — eight "scenes" that run from morning to night, then the shared Footer (from MainLayout).
 * Section wrapper names (data-section) are the original's.
 */
export default function HomePage() {
  useHomeMotion()
  useDocumentMeta(
    'TeddyPups U.A.E. — Premium teacup puppies in Dubai',
    'Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.',
  )

  return (
    <RevealScope>
      <div data-section="hero">
        <HeroScene />
      </div>
      <div data-section="meet">
        <MeetScene />
      </div>
      <div data-section="paths">
        <PathsScene />
      </div>
      <div data-section="journey">
        <ChatScene />
      </div>
      <div data-section="trust">
        <PassportScene />
      </div>
      <div data-section="families">
        <DuskScene />
      </div>
      <div data-section="questions">
        <NightScene />
      </div>
      <div data-section="cta">
        <HomeCtaScene />
      </div>
    </RevealScope>
  )
}
