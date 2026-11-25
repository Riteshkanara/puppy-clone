import { useEffect, useMemo, useRef } from 'react'
import { pupBuddies } from '../data/pupBuddies'

/**
 * Full-body Teddy. The captured Home snapshots are the hero's "peek" pose (body hidden, paws on a ledge),
 * so this takes the same rig, shows the body, hides the ledge, and drives the limbs itself.
 *   mode "run"  – gallop cycle (curtain)
 *   mode "idle" – breathing, tail wag, ear flick (door scene)
 * Limb transforms are SVG attributes set from requestAnimationFrame; nothing re-renders.
 */
function prepare(inner: string): string {
  // replace (not duplicate) the opacity attribute on the opening tag of a rig part
  const setOpacity = (html: string, part: string, value: string) =>
    html.replace(new RegExp(`<\\w+ data-p="${part}"[^>]*>`), (tag) =>
      tag.replace(/\sopacity="[^"]*"/, '').replace(/(\s*\/?>)$/, ` opacity="${value}"$1`),
    )
  let html = inner
  html = setOpacity(html, 'body', '1')
  html = setOpacity(html, 'ledge', '0')
  html = setOpacity(html, 'shadow', '0.22')
  return html
}

const HTML = prepare(pupBuddies[0].inner)
const VIEWBOX = pupBuddies[0].viewBox

type Mode = 'run' | 'bound' | 'leap' | 'idle' | 'sit'

/** "sit" mode is alive like the original: eyes track the mouse, blinks, closes his eyes + wags faster when petted. */
const EYE_CENTRE = { x: 212, y: 98 } // between his eyes, in rig units (viewBox 300 x 240)
const VB_W = 300
const VB_H = 240
const GAZE_REACH = 160 // px of mouse distance at which the pupils reach their full travel
const GAZE_MEMORY = 3 // seconds he keeps looking at the mouse after it stops moving
const EYE_TRAVEL = { x: 3.4, y: 2.6 } // rig units the eyes slide at full gaze
const HEAD_TURN = 3 // degrees of head tilt toward the mouse at full gaze
const WAG = { rest: 0.35, petted: 1, after: 0.6, afterSecs: 2.2 } // 0..1 wag strength
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau)

export default function TeddyRig({ mode = 'idle', className }: { mode?: Mode; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const markup = useMemo(() => ({ __html: HTML }), [])

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const part = (name: string) => svg.querySelector<SVGElement>(`[data-p="${name}"]`)
    const body = part('body')
    const head = part('head')
    const tail = part('tail')
    const earL = part('earL')
    const earR = part('earR')
    const legs = { bf: part('bf'), bn: part('bn'), ff: part('ff'), fn: part('fn') }
    const set = (el: SVGElement | null, v: string) => el?.setAttribute('transform', v)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (mode === 'sit') {
      // the rig's own haunch replaces the hind legs: this is Teddy sitting, as on the original page
      part('haunch')?.setAttribute('opacity', '1')
      part('bf')?.setAttribute('opacity', '0')
      part('bn')?.setAttribute('opacity', '0')
    }

    if (mode === 'run' || mode === 'leap') {
      // the original trots / leaps with happy ^ ^ eyes
      part('open')?.setAttribute('opacity', '0')
      part('happy')?.setAttribute('opacity', '1')
    }

    // ---- live "sit" behaviour (mouse gaze, blink, petting, wag speed) ----
    const live = mode === 'sit' && !reduce
    const eyes = part('eyes')
    const blinkEl = part('blink')
    const openEyes = part('open')
    const happyEyes = part('happy')
    const gaze = { x: 0, y: 0 }
    let mouse: { x: number; y: number; t: number } | null = null
    let pet = 0
    let petTarget = 0
    let wag: number = WAG.rest
    let wagTarget: number = WAG.rest
    let wagResetAt = 0
    let tailPhase = 0
    let nextBlink = 1.2
    let blinkAt = -1
    let last = 0

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 }
    }
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      petTarget = 1
      wagTarget = WAG.petted
      wagResetAt = 0
    }
    const onLeave = () => {
      petTarget = 0
      wagTarget = WAG.after
      wagResetAt = performance.now() / 1000 + WAG.afterSecs
    }
    if (live) {
      window.addEventListener('pointermove', onMove, { passive: true })
      svg.addEventListener('pointerenter', onEnter)
      svg.addEventListener('pointerleave', onLeave)
    }

    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      const t = (now - start) / 1000
      if (mode === 'leap') {
        // Mid-leap pose from the original CTA: legs tucked (shortened + folded), happy eyes, held still with a tiny bob.
        const bob = Math.sin(t * 2.1) * 1.4
        set(body, `translate(0 ${(-8 + bob).toFixed(2)}) rotate(-3 196 206)`)
        set(head, `translate(0 ${(-4 + bob).toFixed(2)}) rotate(-2 212 100)`)
        set(legs.bf, 'translate(94 192) rotate(-20) scale(1 0.5)')
        set(legs.bn, 'translate(110 194) rotate(-10) scale(1 0.45)')
        set(legs.ff, 'translate(168 192) rotate(62) scale(1 0.75)')
        set(legs.fn, 'translate(186 194) rotate(48) scale(1 0.7)')
        set(tail, 'rotate(-30 84 150)')
        set(earL, `rotate(${(-6 + Math.sin(t * 2.1 + 1) * 2).toFixed(1)} 174 82)`)
        set(earR, `rotate(${(6 - Math.sin(t * 2.1 + 1) * 2).toFixed(1)} 250 82)`)
      } else if (mode === 'run' || mode === 'bound') {
        const slow = mode === 'bound' // relaxed leaping beside calls to action
        const p = t * Math.PI * 2 * (slow ? 1.1 : 2.6)
        const bounce = -Math.abs(Math.sin(p)) * (slow ? 6 : 9)
        set(body, `translate(0 ${bounce.toFixed(2)}) rotate(${(Math.sin(p) * 2.4).toFixed(2)} 196 206) translate(196 0) scale(1 1) translate(-196 0)`)
        set(head, `translate(0 ${(4 + bounce * 1.15).toFixed(2)}) rotate(${(-Math.sin(p) * 3.5).toFixed(2)} 212 100)`)
        // gallop: hind pair together, front pair together, half a stride apart; near/far legs a hair out of step
        const swing = slow ? 26 : 40
        set(legs.bf, `translate(94 192) rotate(${(Math.sin(p + 0.35) * swing).toFixed(1)})`)
        set(legs.bn, `translate(110 194) rotate(${(Math.sin(p) * swing).toFixed(1)})`)
        set(legs.ff, `translate(168 192) rotate(${(Math.sin(p + Math.PI + 0.35) * swing).toFixed(1)})`)
        set(legs.fn, `translate(186 194) rotate(${(Math.sin(p + Math.PI) * swing).toFixed(1)})`)
        set(tail, `rotate(${(-28 + Math.sin(p * 2) * 12).toFixed(1)} 84 150)`)
        set(earL, `rotate(${(-6 + Math.sin(p + 1) * 14).toFixed(1)} 174 82)`)
        set(earR, `rotate(${(6 - Math.sin(p + 1) * 14).toFixed(1)} 250 82)`)
      } else if (mode === 'sit') {
        const sec = now / 1000
        const dt = Math.min(0.05, last ? sec - last : 0.016)
        last = sec
        if (live) {
          // where he is looking: the mouse (if it moved recently), else straight ahead
          let gx = 0
          let gy = 0
          if (mouse && sec - mouse.t < GAZE_MEMORY) {
            const r = svg.getBoundingClientRect()
            const dx = mouse.x - (r.left + (EYE_CENTRE.x / VB_W) * r.width)
            const dy = mouse.y - (r.top + (EYE_CENTRE.y / VB_H) * r.height)
            const dist = Math.hypot(dx, dy) || 1
            const reach = Math.min(1, dist / GAZE_REACH)
            gx = (dx / dist) * reach
            gy = (dy / dist) * reach
          }
          gaze.x += (gx - gaze.x) * ease(dt, 0.07)
          gaze.y += (gy - gaze.y) * ease(dt, 0.07)
          pet += (petTarget - pet) * ease(dt, 0.15)
          if (wagResetAt && sec > wagResetAt) {
            wagTarget = WAG.rest
            wagResetAt = 0
          }
          wag += (wagTarget - wag) * ease(dt, 0.4)
          tailPhase += dt * (1.2 + 2.6 * wag) * Math.PI * 2
          if (sec > nextBlink && pet < 0.5) {
            blinkAt = sec
            nextBlink = sec + 2.2 + 3.8 * Math.random()
            if (Math.random() < 0.18) nextBlink = sec + 0.32 // the odd double blink
          }
          const c = (sec - blinkAt) / 0.15
          const blink = c >= 0 && c <= 1 ? Math.sin(c * Math.PI) : 0
          eyes?.setAttribute('transform', `translate(${(EYE_TRAVEL.x * gaze.x).toFixed(2)} ${(EYE_TRAVEL.y * gaze.y).toFixed(2)})`)
          blinkEl?.setAttribute('transform', `translate(0 ${(98 * blink * 0.92).toFixed(2)}) scale(1 ${(1 - 0.92 * blink).toFixed(3)})`)
          openEyes?.setAttribute('opacity', (1 - pet).toFixed(2)) // petted: ^ ^ happy eyes fade in
          happyEyes?.setAttribute('opacity', pet.toFixed(2))
        }
        const breathe = Math.sin(t * 2.1) * 0.8
        set(body, `rotate(-24 120 214) translate(0 ${(6 + breathe).toFixed(2)})`)
        set(legs.ff, 'translate(168 206) rotate(24)')
        set(legs.fn, 'translate(186 208) rotate(24)')
        set(head, `translate(6 ${(8 + breathe * 1.3).toFixed(2)}) rotate(${(6 + Math.sin(t * 0.9) * 3 + HEAD_TURN * gaze.x).toFixed(2)} 212 100)`)
        // wag strength sets both swing and speed: rest is a lazy wag, petting is a quick happy one
        const swing = live ? 5 + 17 * wag : 14
        const wave = live ? Math.sin(tailPhase) : Math.sin(t * 6)
        set(tail, `translate(0 4) rotate(${(-30 + wave * swing).toFixed(1)} 84 150)`)
        const flick = Math.max(0, Math.sin(t * 0.7 - 1.2) - 0.92) * 90
        set(earL, `rotate(${(-6 - flick).toFixed(1)} 174 82)`)
        set(earR, `rotate(${(6 + flick * 0.4).toFixed(1)} 250 82)`)
      } else {
        const breathe = Math.sin(t * 2.1) * 1.2
        set(body, `translate(0 ${breathe.toFixed(2)}) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)`)
        set(head, `translate(0 ${(4 + breathe * 1.3).toFixed(2)}) rotate(${(Math.sin(t * 0.9) * 2.5).toFixed(2)} 212 100)`)
        set(tail, `rotate(${(-20 + Math.sin(t * 7) * 16).toFixed(1)} 84 150)`)
        const flick = Math.max(0, Math.sin(t * 0.7 - 1.2) - 0.92) * 90 // rare quick ear flick
        set(earL, `rotate(${(-6 - flick).toFixed(1)} 174 82)`)
        set(earR, `rotate(${(6 + flick * 0.4).toFixed(1)} 250 82)`)
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    if (!reduce) raf = requestAnimationFrame(frame)
    else frame(start)
    return () => {
      cancelAnimationFrame(raf)
      if (live) {
        window.removeEventListener('pointermove', onMove)
        svg.removeEventListener('pointerenter', onEnter)
        svg.removeEventListener('pointerleave', onLeave)
      }
    }
  }, [mode])

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={VIEWBOX}
      style={{ overflow: 'visible', display: 'block', width: '100%' }}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={markup}
    />
  )
}
