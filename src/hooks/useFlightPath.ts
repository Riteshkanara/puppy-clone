import { useEffect, type RefObject } from 'react'

/**
 * Scroll-linked plane: as the "Imported for you" scene crosses the screen the plane flies from
 * Korea to Dubai along the dotted route, turning to follow the curve.
 * Eased with a critically-damped-ish lerp so it glides instead of tracking the scrollbar 1:1.
 */
export function useFlightPath(
  hostRef: RefObject<HTMLElement | null>,
  routeRef: RefObject<SVGPathElement | null>,
  planeRef: RefObject<SVGGElement | null>,
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
      plane.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${(angle * 0.55).toFixed(1)})`)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      place(0.5)
      return
    }

    let target = 0
    let current = 0
    let raf = 0
    const measure = () => {
      const r = host.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the scene's top is at 88% of the screen, 1 when its top reaches 18%
      const t = (vh * 0.88 - r.top) / (vh * 0.7)
      target = Math.min(1, Math.max(0, t))
      if (!raf) raf = requestAnimationFrame(step)
    }
    const step = () => {
      current += (target - current) * 0.12
      if (Math.abs(target - current) < 0.0005) current = target
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
  }, [hostRef, routeRef, planeRef])
}
