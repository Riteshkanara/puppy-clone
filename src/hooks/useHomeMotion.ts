import { useEffect } from 'react'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * The plane in "Two ways to meet your puppy" flies Korea → Dubai along its dotted route as the section scrolls
 * through the viewport. It banks with the curve (the puppy in the porthole stays upright) and eases toward
 * the scroll position so the flight feels weighty instead of jittery.
 */
function usePlaneFlight() {
  useEffect(() => {
    if (reduced()) return
    const svg = document.querySelector<SVGSVGElement>('[data-section="paths"] .tp-flight svg')
    const route = svg?.querySelector<SVGPathElement>('.tp-flight__route')
    const plane = svg?.querySelector<SVGGElement>('.tp-flight__plane')
    const windowEl = svg?.querySelector<SVGGElement>('.tp-flight__window')
    if (!svg || !route || !plane) return

    const length = route.getTotalLength()
    const FROM = 0.14
    const TO = 0.9
    let target = 0
    let current = -1
    let raf = 0

    const measure = () => {
      const r = svg.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the flight area's top is at 92% of the viewport height, 1 when it reaches 38%
      target = smooth(clamp01((vh * 0.92 - r.top) / (vh * 0.54)))
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const place = (p: number) => {
      const t = FROM + (TO - FROM) * p
      const at = route.getPointAtLength(length * t)
      const a = route.getPointAtLength(length * Math.max(0, t - 0.015))
      const b = route.getPointAtLength(length * Math.min(1, t + 0.015))
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI * 0.7
      plane.setAttribute('transform', `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${angle.toFixed(2)})`)
      windowEl?.setAttribute('transform', `translate(10 2) rotate(${(-angle).toFixed(2)})`)
    }

    const frame = () => {
      raf = 0
      current = current < 0 ? target : current + (target - current) * 0.14
      if (Math.abs(target - current) < 0.0008) current = target
      place(current)
      if (current !== target) raf = requestAnimationFrame(frame)
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
}

/**
 * Browsers without scroll-driven animations (`animation-timeline: view()`): the passport stamps thump in and
 * the home-door swings open when scrolled into view (the CSS side lives in styles/home-motion.css).
 * Where the browser supports scroll timelines, the original CSS does everything and this does nothing.
 */
function useScrollTimelineFallback() {
  useEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')) return
    if (reduced()) return

    const stamps = Array.from(document.querySelectorAll<HTMLElement>('.tp-stamp'))
    const house = document.querySelector<HTMLElement>('.tp-house')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const el = e.target as HTMLElement
          if (el.classList.contains('tp-stamp')) el.dataset.stamped = 'true'
          else el.dataset.opened = 'true'
          io.unobserve(el)
        }
      },
      { threshold: 0.45 },
    )
    stamps.forEach((s) => io.observe(s))
    if (house) io.observe(house)
    return () => io.disconnect()
  }, [])
}

/** Home-page scroll choreography that is not owned by a single scene. */
export function useHomeMotion() {
  usePlaneFlight()
  useScrollTimelineFallback()
}
