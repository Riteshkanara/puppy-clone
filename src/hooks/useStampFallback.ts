import { useEffect, type RefObject } from 'react'

/**
 * Passport stamps. Chromium/Safari drive the thump from scroll via CSS `animation-timeline: view()`.
 * Where that is unsupported (Firefox), this marks each `.tp-entry` with data-stamped as it scrolls in,
 * and home-motion.css plays the same keyframes with a stagger.
 */
export function useStampFallback(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root || CSS.supports('animation-timeline: view()')) return
    const entries = Array.from(root.querySelectorAll<HTMLElement>('.tp-entry'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      entries.forEach((el) => (el.dataset.stamped = 'true'))
      return
    }
    root.dataset.stampFallback = 'true'
    const io = new IntersectionObserver(
      (list) => {
        for (const e of list) {
          if (!e.isIntersecting) continue
          ;(e.target as HTMLElement).dataset.stamped = 'true'
          io.unobserve(e.target)
        }
      },
      { threshold: 0.45 },
    )
    entries.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ref])
}
