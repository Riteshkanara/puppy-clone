import { useEffect, useMemo, useRef } from 'react'
import type { SVGProps } from 'react'
import { pupBuddies } from '../data/pupBuddies'
import { PupRig, type PoseName } from '../lib/pupRig'

/**
 * The live Teddy — behaves like the original:
 *  • his eyes follow the mouse pointer (for ~3 s after it last moved),
 *  • while the pointer is over him the eyes squeeze shut (happy) and the tail wags faster,
 *  • the tail keeps wagging gently the whole time, he blinks at random and his head tilts toward what he's looking at.
 * Drawn from the captured original rig markup and driven by lib/pupRig.ts (a port of the original controller).
 */
interface Props extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  pose?: PoseName
  facing?: 'left' | 'right'
  label?: string
  /** CSS selector of an ancestor that should count as "hovering Teddy" (defaults to the svg itself). */
  hoverIn?: string
}

export default function PupMascot({ pose = 'sit', facing = 'right', label, hoverIn, ...svgProps }: Props) {
  const ref = useRef<SVGSVGElement>(null)
  // the first captured snapshot has every part (body, legs, haunch, ledge, eyes…); the rig sets the pose on top of it
  const markup = useMemo(() => ({ __html: pupBuddies[0].inner }), [])

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const rig = new PupRig(svg, pose, facing === 'left' ? -1 : 1)
    rig.wag(0.6)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let seen: { x: number; y: number; t: number } | null = null
    let raf = 0
    let visible = true
    let last = performance.now() / 1000
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const now = performance.now() / 1000
      const dt = Math.min(0.05, now - last)
      last = now
      rig.lookAt(seen && now - seen.t < 3 ? seen : null)
      rig.tick(dt, now)
    }
    const start = () => { if (!raf) { last = performance.now() / 1000; raf = requestAnimationFrame(frame) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }

    rig.tick(0.016, last) // paint the resting pose straight away
    if (reduce) return

    const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting
        if (visible) start()
        else stop()
      })
    io.observe(svg)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') seen = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 }
    }
    const host = (hoverIn ? svg.closest(hoverIn) : null) ?? svg
    const onEnter = (e: Event) => {
      if ((e as PointerEvent).pointerType === 'mouse') { rig.petting(true); rig.wag(1) }
    }
    const onLeave = () => { rig.petting(false); rig.wag(0.6) }
    window.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [pose, facing, hoverIn])

  return (
    <svg
      viewBox="0 0 300 240"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...svgProps}
      ref={ref}
      style={{ overflow: 'visible', ...svgProps.style }}
      dangerouslySetInnerHTML={markup}
    />
  )
}
