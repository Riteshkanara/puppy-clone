import { useEffect, type RefObject } from 'react'

/**
 * Closing scene: the front door swings open as the house scrolls into view.
 * Chromium/Safari do this in CSS (`animation-timeline: view()`); this is the Firefox fallback, and also sets
 * `data-open` on the section once the door is mostly open so Teddy can greet you.
 */
export function useDoorOpen(sectionRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current
    const door = section?.querySelector<HTMLElement>('.tp-house__door')
    if (!section || !door) return
    const native = CSS.supports('animation-timeline: view()')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const update = () => {
      const r = door.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the door's top edge enters at the bottom of the screen, 1 once it is ~52% up the screen
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.52)))
      if (!native) door.style.transform = `rotateY(${(-102 * (reduce ? 1 : p)).toFixed(1)}deg)`
      section.dataset.open = String(p > 0.85)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [sectionRef])
}
