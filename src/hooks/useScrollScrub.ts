import { useEffect, type RefObject } from 'react'

/**
 * Scroll-scrubbed progress. Every `[data-scrub]` inside `rootRef` gets a CSS variable `--p` (0 → 1)
 * that follows its position on screen in BOTH directions: scroll down and it plays in, scroll up and
 * it plays back out. `data-scrub-i` staggers siblings. `start`/`end` are the element's top edge as a
 * fraction of the viewport height for p = 0 and p = 1.
 */
export function useScrollScrub(rootRef: RefObject<HTMLElement | null>, { start = 0.96, end = 0.55 } = {}) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-scrub]')) as HTMLElement[]
    if (!els.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.style.setProperty('--p', '1'))
      return
    }

    const target = els.map(() => 0)
    const current = els.map(() => -1)
    let raf = 0
    const measure = () => {
      const vh = window.innerHeight
      els.forEach((el, k) => {
        const i = Number(el.dataset.scrubI ?? 0)
        const t = (vh * start - el.getBoundingClientRect().top) / (vh * (start - end))
        target[k] = Math.min(1, Math.max(0, (t - i * 0.14) / 0.72))
        if (current[k] < 0) current[k] = target[k]
      })
      if (!raf) raf = requestAnimationFrame(step)
    }
    const step = () => {
      let moving = false
      els.forEach((el, k) => {
        current[k] += (target[k] - current[k]) * 0.16
        if (Math.abs(target[k] - current[k]) < 0.001) current[k] = target[k]
        else moving = true
        el.style.setProperty('--p', current[k].toFixed(3))
      })
      raf = moving ? requestAnimationFrame(step) : 0
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [rootRef, start, end])
}
