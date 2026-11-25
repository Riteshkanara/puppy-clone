import { useEffect, useMemo, useRef } from 'react'
import { pupBuddies } from '../data/pupBuddies'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { PupRig } from '../lib/pupRig'

/**
 * Teddy in the "Unique and high quality puppies" call-to-action (How it works).
 *
 * The original's CTA Teddy is the rig's "bow" pose (the last capture in data/pupBuddies.ts): happy ^ ^ eyes, tongue out,
 * front paws reaching, held still — except for the two things the shared rig does on its own: a lazy tail wag
 * (wag 0.35 → ~2.3 Hz, ~±11°) and a slow breath (head + body, ~0.38 Hz). The page mirrors him with CSS (.hiw-cta__rig).
 * This drives exactly that with the same controller as the footer Teddy; reduced motion keeps the static capture.
 */
const CAPTURE = pupBuddies[pupBuddies.length - 1]

export default function CtaPup({ className }: { className?: string }) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const ref = useRef<SVGSVGElement>(null)
  const markup = useMemo(() => ({ __html: CAPTURE.inner }), [])

  useEffect(() => {
    const svg = ref.current
    if (!svg || reduced) return

    const rig = new PupRig(svg, 'bow', 1)
    rig.wag(0.35)

    let raf = 0
    let running = false
    let visible = false
    let last = performance.now() / 1000

    const frame = () => {
      raf = requestAnimationFrame(frame)
      const now = performance.now() / 1000
      const dt = Math.min(0.05, now - last)
      last = now
      rig.tick(dt, now)
    }
    // only animate while he is on screen and the tab is in front
    const sync = () => {
      const go = visible && !document.hidden
      if (go === running) return
      running = go
      if (go) {
        last = performance.now() / 1000
        raf = requestAnimationFrame(frame)
      } else cancelAnimationFrame(raf)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    io.observe(svg)
    document.addEventListener('visibilitychange', sync)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reduced])

  return (
    <svg
      key={String(reduced)}
      ref={ref}
      className={className}
      viewBox={CAPTURE.viewBox}
      style={{ overflow: 'visible', display: 'block', width: '100%' }}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={markup}
    />
  )
}
