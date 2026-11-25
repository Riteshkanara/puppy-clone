import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CtaPup from '../components/CtaPup'
import TeddyRig from '../components/TeddyRig'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useReveal } from '../hooks/useReveal'
import { useScrollPlane } from '../hooks/useScrollPlane'
import { useScrollScrub } from '../hooks/useScrollScrub'
import { CONTACT, whatsappHref } from '../data/contactDetails'
import './HowItWorksPage.css'

/* ---------- Content ---------- */

type Way = 'dubai' | 'imported'
type IconName =
  | 'search' | 'heart' | 'bear' | 'truck'
  | 'calendar' | 'chat' | 'plane' | 'house' | 'pulse'

type Step = { title: string; text: string; icon: IconName; tint: string }

const LEDE =
  'Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make the experience unforgettable.'

const SECTIONS = [
  { id: 'two-ways', n: 1, label: 'Two ways home' },
  { id: 'promise', n: 2, label: 'Our premium puppy promise' },
  { id: 'delivery', n: 3, label: 'Delivery & collection' },
  { id: 'why-us', n: 4, label: 'Why choose us' },
] as const

const WAYS: Record<Way, { tab: string; sub: string; heading: string; text: string; accent?: string; steps: Step[] }> = {
  dubai: {
    tab: 'In Dubai',
    sub: 'meet in person',
    heading: 'Meet your puppy in person',
    text:
      "Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face. We source healthy, well-socialized puppies from trusted local breeders, ensuring they're raised with care, proper nutrition, and veterinary checks.",
    steps: [
      { title: 'Explore our puppies', icon: 'search', tint: 'var(--color-honey-soft, #fbe3b4)', text: 'Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.' },
      { title: 'Choose your puppy', icon: 'heart', tint: 'var(--color-blush, #f9cdbf)', text: 'Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.' },
      { title: 'Meet before you choose', icon: 'bear', tint: 'var(--color-sky, #bfddf5)', text: 'Spend time bonding before making your decision.' },
      { title: 'Pick-up or delivery', icon: 'truck', tint: '#d9ecd3', text: 'Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.' },
    ],
  },
  imported: {
    tab: 'Imported',
    sub: 'order upon request',
    heading: 'Order upon request',
    text:
      "Looking for a truly exceptional companion? Our Order Upon Request service gives you access to some of the world's most sought-after teacup breeds — ethically sourced from the most reputable, certified breeders across Europe, Korea, and beyond.",
    accent:
      "From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines, we bring the world's finest puppies to Dubai, just for you.",
    steps: [
      { title: 'Reserve your puppy', icon: 'calendar', tint: 'var(--color-honey-soft, #fbe3b4)', text: 'Browse our selection of available breeds and place a reservation for the teacup puppy that captures your heart. Our reservation-only model ensures that each puppy is specifically sourced to meet your preferences.' },
      { title: 'Personalized consultation', icon: 'chat', tint: 'var(--color-blush, #f9cdbf)', text: "Once your reservation is confirmed, we will work closely with you to finalize details and provide updates on your puppy's journey." },
      { title: 'Import and arrival', icon: 'plane', tint: 'var(--color-sky, #bfddf5)', text: 'We manage all aspects of the import process, including health checks, travel arrangements, and necessary documentation. Your puppy will be carefully transported and will arrive ready to join your family.' },
      { title: 'Welcome home', icon: 'house', tint: '#d9ecd3', text: 'Upon arrival, we provide support to help your new puppy acclimate to their new environment. Our team is available for any additional assistance and to ensure a smooth transition into your home.' },
    ],
  },
}

const STAMPS: { title: string; text: string; icon: IconName; kind: 'round' | 'ticket' | 'scallop'; ink: string; tilt: string }[] = [
  { title: 'Hand-selected breeders', icon: 'pulse', kind: 'round', ink: '#a65a30', tilt: '-8deg', text: 'We work only with breeders who uphold the highest ethical and health standards.' },
  { title: 'Full transparency', icon: 'plane', kind: 'ticket', ink: '#3f7d58', tilt: '-4deg', text: 'Photos, videos, and health certificates are shared before your puppy travels.' },
  { title: 'Safe, stress-free delivery', icon: 'chat', kind: 'scallop', ink: '#7a5a48', tilt: '7deg', text: 'We handle every detail of the import process, so your puppy arrives happy, healthy, and ready to love you.' },
]

const DELIVERY = [
  { title: 'Take your puppy home the same day', text: 'Local puppies are available immediately — visit, fall in love, and go home together.' },
  { title: 'Delivery within Dubai', text: 'Prefer to stay home? We deliver your puppy to your door within Dubai, safely and comfortably.' },
  { title: 'Safe international cargo', text: 'We handle all the paperwork and ensure comfortable travel so your puppy arrives happy and stress-free.' },
  { title: 'Worldwide delivery', text: 'We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.' },
]

const WHY: { title: string; text: string; icon: IconName }[] = [
  { title: 'International cargo', icon: 'plane', text: 'We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.' },
  { title: 'Support 24/7', icon: 'chat', text: "Our team is available 24/7 to answer your questions and assist you through every step of the adoption process. From choosing your puppy to post-delivery support — we're just a message away." },
  { title: 'Health guarantee', icon: 'pulse', text: 'All our puppies come with a verified health certificate from licensed vets. We ensure every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.' },
]

/* ---------- Small helpers ---------- */

/** WhatsApp button: opens a real chat once a number is configured, otherwise falls back to /contact. */
function WhatsAppLink({ className, children }: { className: string; children: ReactNode }) {
  const href = whatsappHref()
  return href ? (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link className={className} to="/contact">{children}</Link>
  )
}

/** Search-engine friendly description of both journeys (schema.org HowTo). */
function HowToSchema() {
  const graph = (Object.keys(WAYS) as Way[]).map((k) => ({
    '@type': 'HowTo',
    name: k === 'dubai' ? 'How to choose and collect a puppy in Dubai' : 'How to order an imported puppy',
    description: WAYS[k].text,
    step: WAYS[k].steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
  }))
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  )
}

/* ---------- Inline SVG pieces ---------- */

const ICON_PATHS: Record<IconName, ReactNode> = {
  search: <><circle cx="28" cy="28" r="14" /><path d="M38 38l14 14M22 28h12M28 22v12" /></>,
  heart: <path d="M32 52C14 40 10 28 16 20c5-6 13-4 16 3 3-7 11-9 16-3 6 8 2 20-16 32z" />,
  bear: <><circle cx="32" cy="36" r="16" /><circle cx="18" cy="20" r="6" /><circle cx="46" cy="20" r="6" /><path d="M26 34h0M38 34h0M29 42c2 2 4 2 6 0" /></>,
  truck: <><path d="M6 20h30v22H6zM36 28h12l8 8v6H36z" /><circle cx="18" cy="46" r="4" /><circle cx="46" cy="46" r="4" /></>,
  calendar: <><rect x="8" y="14" width="48" height="40" rx="6" /><path d="M8 26h48M20 8v10M44 8v10M24 40l6 6 12-12" /></>,
  chat: <><path d="M10 14h44v28H30l-12 10v-10h-8z" /><path d="M22 28h0M32 28h0M42 28h0" strokeWidth="5" /></>,
  plane: <><path d="M6 36l22-3 12-17h6l-6 17 12-1 6-7h3l-2 10 2 10h-3l-6-7-12-1 6 17h-6L28 37 6 36z" /><path d="M8 50c10 4 20 4 30 0" strokeDasharray="2 7" /></>,
  house: <><path d="M8 30L32 10l24 20" /><path d="M14 26v26h36V26" /><path d="M32 52V38M26 34c0-4 12-4 12 0" /></>,
  pulse: <><path d="M32 54C16 43 8 34 8 24c0-7 5.4-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 6.6 0 12 5 12 12 0 10-8 19-24 30z" /><path d="M22 30h7l3-7 4 13 3-6h7" /></>,
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  )
}

const SKYLINE_PATH =
  'M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28'

function DubaiScene() {
  return (
    <div className="hiw-scene hiw-scene--dubai" role="img" aria-label="Illustration of the Downtown Dubai skyline at sunrise">
      <span className="hiw-scene__label" aria-hidden="true">Downtown Dubai</span>
      <span className="hiw-scene__sun" aria-hidden="true" />
      <svg viewBox="0 0 300 120" className="hiw-scene__skyline" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
        <path d={SKYLINE_PATH} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/** Jet icon for the "Imported" card, traced from the original: swept wings, dark tapered nose, nose along +x. */
const PLANE_LINE =
  'M24.0 -0.6 L7.0 -1.8 L-2.8 -13.5 L-8.8 -13.0 L-2.2 -1.5 L-14.5 -2.0 L-20.0 -8.0 L-23.8 -7.5 L-21.5 0.4 L-23.8 7.5 L-20.0 8.4 L-14.5 2.7 L-2.2 1.8 L-8.2 13.8 L-2.8 14.4 L7.0 2.2 L24.0 0.4 Z'


/** Big cartoon plane for the delivery arc: white fuselage, toffee wings and tail, nose along +x. Position/rotation come from useScrollPlane. */
function CartoonPlane({ planeRef, scale = 0.9 }: { planeRef: RefObject<SVGGElement | null>; scale?: number }) {
  const ink = '#2a170e'
  const wing = '#b4683f'
  const wingDeep = '#9a4f26'
  const sw = { stroke: ink, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  return (
    <g ref={planeRef} className="hiw-plane">
      <g transform={`scale(${scale})`}>
        <animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur="2.6s" repeatCount="indefinite" additive="sum" />
        <path d="M-6 -8 L16 -50 L38 -47 L24 -8 Z" fill={wingDeep} {...sw} />
        <path d="M-58 -8 L-70 -32 L-50 -32 L-34 -8 Z" fill={wing} {...sw} />
        <path d="M-64 0 C-64 -15 -42 -22 0 -22 C40 -22 60 -14 66 -2 C60 11 42 17 0 17 C-42 17 -64 13 -64 0 Z" fill="#fffdf8" {...sw} />
        <path d="M46 -11 Q58 -9 61 -2" fill="none" {...sw} strokeWidth={3.4} />
        <path d="M-6 10 L14 46 L38 44 L22 10 Z" fill={wing} {...sw} />
      </g>
    </g>
  )
}

function FlightScene() {
  const svgRef = useRef<SVGSVGElement>(null)
  // The jet hovers above the arc's peak (a slow wave, no travel); reduced-motion freezes it.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) svgRef.current?.pauseAnimations()
  }, [])
  return (
    <div className="hiw-scene hiw-scene--flight" role="img" aria-label="A flight path from Europe and Korea to Dubai">
      <svg ref={svgRef} viewBox="0 0 300 160" className="hiw-scene__arc" aria-hidden="true">
        <path d="M44 128 Q150 -10 262 112" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
        <circle cx="44" cy="128" r="5" fill="currentColor" />
        <circle cx="262" cy="112" r="5" fill="currentColor" />
        <g transform="translate(151 43)">
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;3 -4;0 0;-3 4;0 0" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1" dur="5.5s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" values="-3;3;-3" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="5.5s" repeatCount="indefinite" additive="sum" />
            <path d={PLANE_LINE} fill="#fffdf8" stroke="#2a170e" strokeWidth="2.3" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        </g>
      </svg>
      <span className="hiw-scene__label hiw-scene__label--from">Europe · Korea</span>
      <span className="hiw-scene__label hiw-scene__label--to">Dubai</span>
    </div>
  )
}

function DeliveryArc() {
  const hostRef = useRef<HTMLDivElement>(null)
  const routeRef = useRef<SVGPathElement>(null)
  const planeRef = useRef<SVGGElement>(null)
  useScrollPlane(hostRef, routeRef, planeRef, { start: 0.95, end: 0.1, tilt: 0.75 })
  return (
    <div ref={hostRef}>
    <svg viewBox="0 0 400 200" className="hiw-arc" role="img" aria-label="A flight path from Korea to Dubai over the Dubai skyline">
      <path d="M0 192h400" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <g transform="translate(70 70) scale(1.1)" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d={SKYLINE_PATH.replace('M4 116h292', '')} />
      </g>
      <path ref={routeRef} d="M52 150 Q200 -20 372 62" fill="none" stroke="#a24a1a" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 8" />
      <circle cx="52" cy="150" r="5" fill="#a24a1a" />
      <circle cx="372" cy="62" r="5" fill="#a24a1a" />
      <CartoonPlane planeRef={planeRef} />
      <text x="40" y="178" className="hiw-arc__label">Korea</text>
      <text x="340" y="96" className="hiw-arc__label">Dubai</text>
    </svg>
    </div>
  )
}

/* ---------- Page ---------- */

function HowItWorksPage() {
  useDocumentMeta('How it works | TeddyPups U.A.E.', LEDE)

  const rootRef = useReveal<HTMLDivElement>()
  useScrollScrub(rootRef)
  const [way, setWay] = useState<Way>('dubai')
  const [active, setActive] = useState<string>(SECTIONS[0].id)
  const [dockHidden, setDockHidden] = useState(true)
  const tabRefs = useRef<Partial<Record<Way, HTMLButtonElement | null>>>({})
  const ctaRef = useRef<HTMLElement>(null)
  const { hash } = useLocation()

  // Deep links: /how-it-works#delivery scrolls there; #imported also opens the Imported tab.
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const frame = requestAnimationFrame(() => {
      if (id === 'imported') setWay('imported')
      document.getElementById(id === 'imported' ? 'two-ways' : id)?.scrollIntoView()
    })
    return () => cancelAnimationFrame(frame)
  }, [hash])

  // Highlight the chip of the section currently in view.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Mobile action dock: shown while scrolling, tucked away when the page's own CTA or the footer is on screen.
  useEffect(() => {
    const targets = [ctaRef.current, document.querySelector('.site-footer')].filter((e): e is Element => !!e)
    const visible = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target)
          else visible.delete(e.target)
        }
      setDockHidden(visible.size > 0 || window.scrollY < 240)
    })
    targets.forEach((t) => io.observe(t))
    const onScroll = () => setDockHidden(visible.size > 0 || window.scrollY < 240)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const next: Way = e.key === 'Home' ? 'dubai' : e.key === 'End' ? 'imported' : way === 'dubai' ? 'imported' : 'dubai'
    setWay(next)
    tabRefs.current[next]?.focus()
  }

  const current = WAYS[way]

  return (
    <div className="hiw" ref={rootRef}>
      <HowToSchema />

      {/* Intro */}
      <header className="hiw-intro hiw-shell">
        <h1 className="hiw-plush hiw-intro__title">How it works</h1>
        <p className="hiw-intro__lede">{LEDE}</p>
        <nav className="hiw-chips" aria-label="On this page">
          {SECTIONS.map((c) => (
            <a key={c.id} className="hiw-chip" href={`#${c.id}`} aria-current={active === c.id ? 'true' : undefined}>
              <span className="hiw-chip__n">{c.n}</span> {c.label}
            </a>
          ))}
        </nav>
      </header>

      {/* 1. Two ways home */}
      <section id="two-ways" className="hiw-ways hiw-shell" aria-labelledby="hiw-ways-title">
        <div className="hiw-ways__head">
          <div className="hiw-ways__title">
            <p className="hiw-scrawl hiw-kicker">choose your way</p>
            <h2 id="hiw-ways-title" className="hiw-plush hiw-h2">Two ways home</h2>
          </div>
          <div className="hiw-toggle" role="tablist" aria-label="Choose how you get your puppy">
            {(Object.keys(WAYS) as Way[]).map((key) => (
              <button
                key={key}
                ref={(el: HTMLButtonElement | null) => { tabRefs.current[key] = el }}
                id={`hiw-tab-${key}`}
                role="tab"
                type="button"
                aria-selected={way === key}
                aria-controls="hiw-panel"
                tabIndex={way === key ? 0 : -1}
                className={`hiw-toggle__btn ${way === key ? 'is-active' : ''}`}
                onClick={() => setWay(key)}
                onKeyDown={onTabKey}
              >
                <span className="hiw-plush hiw-toggle__name">{WAYS[key].tab}</span>
                <small>{WAYS[key].sub}</small>
              </button>
            ))}
          </div>
          <div className="hiw-mascot" aria-hidden="true">
            <TeddyRig mode="sit" />
          </div>
        </div>

        <div key={way} id="hiw-panel" role="tabpanel" aria-labelledby={`hiw-tab-${way}`} className="hiw-panel">
          <div className="hiw-panel__top">
            <div className="hiw-panel__copy">
              <h3 className="hiw-plush hiw-h3">{current.heading}</h3>
              <p className="hiw-lede">{current.text}</p>
              {current.accent && <p className="hiw-scrawl hiw-accent">{current.accent}</p>}
            </div>
            {way === 'dubai' ? <DubaiScene /> : <FlightScene />}
          </div>

          <ol className="hiw-steps">
            {current.steps.map((s, i) => (
              <li key={s.title} className="hiw-step" style={{ '--tint': s.tint, '--i': i } as CSSProperties}>
                <span className="hiw-step__icon"><Icon name={s.icon} /></span>
                <span className="hiw-step__num">Step {i + 1}</span>
                <h4 className="hiw-plush hiw-step__title">{s.title}</h4>
                <p className="hiw-step__text">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 2. Premium puppy promise */}
      <section id="promise" className="hiw-shell" aria-labelledby="hiw-promise-title">
        <div className="hiw-book" data-reveal>
          <p className="hiw-scrawl hiw-kicker" aria-hidden="true">puppy passport</p>
          <h2 id="hiw-promise-title" className="hiw-plush hiw-book__title">Our premium<br />puppy promise</h2>
          <ul className="hiw-stamps">
            {STAMPS.map((s, i) => (
              <li key={s.title} className="hiw-stamp-item" data-scrub data-scrub-i={i}>
                <span className={`hiw-stamp hiw-stamp--${s.kind}`} style={{ '--ink': s.ink, '--tilt': s.tilt } as CSSProperties}>
                  <Icon name={s.icon} className="hiw-stamp__icon" />
                  <span className="hiw-plush hiw-stamp__title">{s.title}</span>
                </span>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Delivery & collection */}
      <section id="delivery" className="hiw-delivery hiw-shell" aria-labelledby="hiw-delivery-title">
        <div className="hiw-delivery__copy" data-reveal>
          <h2 id="hiw-delivery-title" className="hiw-plush hiw-h2 hiw-h2--big">Delivery &amp;<br />collection</h2>
          <p className="hiw-lede">From a same-day visit in Downtown Dubai to a flight from Korea, every puppy travels comfortably and arrives safely.</p>
          <div className="hiw-delivery__grid">
            {DELIVERY.map((d) => (
              <div key={d.title}>
                <h3 className="hiw-plush hiw-h4">{d.title}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div data-reveal><DeliveryArc /></div>
      </section>

      {/* 4. Why choose us */}
      <section id="why-us" className="hiw-why hiw-shell" aria-labelledby="hiw-why-title">
        <div className="hiw-why__copy" data-reveal>
          <h2 id="hiw-why-title" className="hiw-plush hiw-h2 hiw-h2--big">Why<br />choose us</h2>
          <p className="hiw-lede">We're here to help you find a new family member. From the moment you visit our site to the joyful day your puppy arrives at your door, we're with you every step of the way. Our mission is to make the entire adoption process smooth, transparent, and full of love.</p>
        </div>
        <ul className="hiw-why__list">
          {WHY.map((w, i) => (
            <li key={w.title} data-reveal style={{ '--i': i } as CSSProperties}>
              <Icon name={w.icon} className="hiw-why__icon" />
              <div>
                <h3 className="hiw-plush hiw-h4">{w.title}</h3>
                <p>{w.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="hiw-shell hiw-cta-wrap" aria-labelledby="hiw-cta-title">
        <div className="hiw-cta" data-reveal>
          <div className="hiw-cta__copy">
            <h2 id="hiw-cta-title" className="hiw-plush hiw-cta__title">Unique and high quality puppies</h2>
            <p className="hiw-lede">When you choose TeddyPups, you can trust that you're getting a puppy of the highest quality. We also provide guidance and support to new pet owners, offering advice on training, nutrition, and general care to ensure a smooth transition for you and your new furry friend.</p>
            <div className="hiw-cta__actions">
              <WhatsAppLink className="hiw-btn hiw-btn--whatsapp">Ask us on WhatsApp</WhatsAppLink>
              <Link className="hiw-btn hiw-btn--ghost" to="/puppies">See available puppies</Link>
            </div>
          </div>
          <div className="hiw-cta__pup" aria-hidden="true">
            <div className="hiw-cta__rig"><CtaPup /></div>
          </div>
        </div>
      </section>

      {/* Mobile action dock */}
      <div className="hiw-dock" data-hidden={dockHidden} inert={dockHidden}>
        <WhatsAppLink className="hiw-btn hiw-btn--whatsapp">WhatsApp us</WhatsAppLink>
        <a className="hiw-btn hiw-btn--ghost" href={`tel:${CONTACT.phone.tel}`}>Call</a>
      </div>
    </div>
  )
}

export default HowItWorksPage
