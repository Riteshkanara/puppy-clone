import { useEffect, useRef } from 'react'
import { basketPup } from '../data/basketPup'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ACTIONS, spawnHearts, type ActionCtx, type ActionName, type Step } from '../lib/pupActions'
import { POSES, PupRig } from '../lib/pupRig'
import './FooterPup.css'

/**
 * Live Teddy for the footer basket on every page except Home (on Home the page-wide Teddy walks in and takes this seat).
 * It drives the same captured rig as the original: eyes follow the cursor, the head sways a little left/right, the eyes
 * squeeze shut while the cursor is on him (and open again when it leaves), a click plays one of his basket tricks with
 * a speech bubble, and every ~9 s he idly tilts his head or wags. Reduced motion keeps the static snapshot.
 */
const CLICK_ACTIONS: ActionName[] = ['tilt', 'love', 'sneeze', 'woof']
const GAZE_SECS = 3
const IDLE_SECS = 9

export default function FooterPup() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const host = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = host.current
    const bubbleEl = bubble.current
    const svg = el?.querySelector('svg')
    if (reduced || !el || !bubbleEl || !svg) return

    const rig = new PupRig(svg, 'snug', 1)
    rig.sway = 1
    rig.wag(0.6)

    let queue: Step[] = []
    let raf = 0
    let running = false
    let visible = false
    let last = performance.now() / 1000
    let lastActivity = last
    let bubbleUntil = 0
    let hovering = false
    let lastAct: ActionName | null = null
    let mouse: { x: number; y: number; t: number } | null = null

    const say = (text: string, secs = 1.4) => {
      bubbleEl.textContent = text
      bubbleEl.dataset.show = 'true'
      bubbleUntil = performance.now() / 1000 + secs
    }
    const ctx: ActionCtx = {
      d: rig,
      rest: POSES.snug,
      facing: 1,
      say,
      hearts: () => spawnHearts(el, el.clientWidth * 0.7, el.clientHeight * 0.25),
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      const now = performance.now() / 1000
      const dt = Math.min(0.05, now - last)
      last = now
      while (queue.length && queue[0][0] <= now) (queue.shift() as Step)[1](now)
      rig.lookAt(mouse && now - mouse.t < GAZE_SECS ? mouse : null)
      if (!queue.length && now - lastActivity > IDLE_SECS) {
        lastActivity = now
        queue = Math.random() < 0.5 ? ACTIONS.tilt(ctx, now) : [[now, () => rig.wag(1)], [now + 2.2, () => rig.wag(0.6)]]
      }
      if (bubbleEl.dataset.show === 'true' && now > bubbleUntil) bubbleEl.dataset.show = 'false'
      rig.tick(dt, now)
    }
    const sync = () => {
      const go = visible && !document.hidden
      if (go === running) return
      running = go
      if (go) { last = performance.now() / 1000; raf = requestAnimationFrame(frame) } else cancelAnimationFrame(raf)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 }
    }
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      hovering = true
      rig.petting(true)
      rig.wag(1)
    }
    const onLeave = () => {
      hovering = false
      rig.petting(false)
      rig.wag(0.6)
    }
    const onClick = () => {
      const now = performance.now() / 1000
      const pool = CLICK_ACTIONS.filter((a) => a !== lastAct)
      const pick = pool[Math.floor(Math.random() * pool.length)]
      lastAct = pick
      lastActivity = now
      rig.reset()
      const steps = ACTIONS[pick](ctx, now)
      // once the trick is over, close his eyes again if the cursor is still on him
      steps.push([steps[steps.length - 1][0] + 0.5, () => { if (hovering) rig.petting(true) }])
      queue = steps
    }

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    io.observe(el)
    document.addEventListener('visibilitychange', sync)
    addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('click', onClick)
      bubbleEl.dataset.show = 'false'
    }
  }, [reduced])

  return (
    <div data-lane="true" className="pup-stop tp-basket__pup">
      <div ref={host} className="pup-buddy footer-pup" data-facing={basketPup.facing} data-live={reduced ? undefined : ''}>
        <svg
          key={String(reduced)}
          viewBox={basketPup.viewBox}
          style={{ overflow: 'visible' }}
          role="img"
          aria-label="Teddy, sitting snug in his basket"
          focusable="false"
          dangerouslySetInnerHTML={{ __html: basketPup.inner }}
        />
        <span ref={bubble} className="footer-pup__bubble" data-show="false" aria-hidden="true" />
      </div>
    </div>
  )
}
