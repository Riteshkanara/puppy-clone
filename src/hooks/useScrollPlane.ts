import { useEffect, type RefObject } from 'react'

/**
 * Scroll-scrubbed plane. The plane's position along `route` IS the scroll position:
 * scroll down and it flies Korea → Dubai, scroll back up and it flies home again.
 * `start`/`end` are the host's top edge as a fraction of the viewport height for progress 0 and 1.
 * Eased with a light lerp so it glides instead of snapping to the scrollbar.
 */
export function useScrollPlane(
  hostRef: RefObject<HTMLElement | null>,
  routeRef: RefObject<SVGPathElement | null>,
  planeRef: RefObject<SVGGElement | null>,
  { start = 0.9, end = 0.15, tilt = 0.8 }: { start?: number; end?: number; tilt?: number } = {},
) {
  useEffect(() => {
    const host = hostRef.current
    const route = routeRef.current
    const plane = planeRef.current
    if (!host || !route || !plane) return

    const len = route.getTotalLength()
    const place = (p: number) => {
      const d = len * p
      const a = route.getPointAtLength(d)
      const b = route.getPointAtLength(Math.min(len, d + 3))
      const c = route.getPointAtLength(Math.max(0, d - 3))
      const angle = (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI
      plane.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${(angle * tilt).toFixed(1)})`)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      place(0.5)
      return
    }

    let target = 0
    let current = -1
    let raf = 0
    const measure = () => {
      const r = host.getBoundingClientRect()
      const vh = window.innerHeight
      target = Math.min(1, Math.max(0, (vh * start - r.top) / (vh * (start - end))))
      if (current < 0) current = target // first paint: no glide from nowhere
      if (!raf) raf = requestAnimationFrame(step)
    }
    const step = () => {
      current += (target - current) * 0.14
      if (Math.abs(target - current) < 0.0004) current = target
      place(current)
      raf = current === target ? 0 : requestAnimationFrame(step)
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [hostRef, routeRef, planeRef, start, end, tilt])
}
