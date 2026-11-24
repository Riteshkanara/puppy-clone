import { useEffect, useMemo, useRef } from 'react'
import { pupBuddies } from '../data/pupBuddies'
import { PupRig, POSES } from '../lib/pupRig'
import { ACTIONS, nextAction, spawnHearts, type ActionCtx, type ActionName, type Step } from '../lib/pupActions'
import { PAW_PATH } from '../lib/paw'
import {
  ANCHOR,
  RIG_W,
  buildPlan,
  safeArea,
  settleScroll,
  solve,
  whatsappBarTop,
  type Plan,
  type PupCue,
  type State,
} from '../lib/pupJourney'
import './PupJourney.css'

/**
 * Teddy, the mascot who travels the whole page.
 *
 * He is ONE fixed-position actor. Where he is = a pure function of the scroll position (see lib/pupJourney.ts):
 * scroll down and he walks the curved path from stop to stop (hopping up out of the hero's arches, popping behind
 * the doors…), scroll up and he walks the very same path back. At a stop he sits, looks at what's on the scene,
 * fidgets, answers clicks, and follows the mouse with his eyes. All motion is written straight to the DOM from one
 * requestAnimationFrame loop — React never re-renders while you scroll.
 *
 * Needs `[data-pup-stop]` / `[data-pup-scene]` / `[data-pup-look]` markers on the page (already in the home scenes).
 * With prefers-reduced-motion, or a page with fewer than two stops, he doesn't start and the static stops stay.
 */

const PRINTS = 24
const REDUCED = '(prefers-reduced-motion: reduce)'
const randomOf = <T,>(list: readonly T[], not?: T | null): T => {
  const pool = list.filter((v) => v !== not)
  return pool[Math.floor(Math.random() * pool.length)]
}
const setData = (el: HTMLElement, key: string, value: string) => {
  if (el.dataset[key] !== value) el.dataset[key] = value
}

export default function PupJourney() {
  const layer = useRef<HTMLDivElement>(null)
  const actor = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLSpanElement>(null)
  const bubbleAt = useRef<HTMLSpanElement>(null)
  const prints = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLDivElement>(null)
  // the captured rig has every part (body, legs, haunch, ledge, eyes…); the rig sets the pose on top of it
  const markup = useMemo(() => ({ __html: pupBuddies[0].inner }), [])

  useEffect(() => {
    const layerEl = layer.current
    const actorEl = actor.current
    const bodyEl = body.current
    const bubbleEl = bubble.current
    const bubbleAtEl = bubbleAt.current
    const printsEl = prints.current
    const probeEl = probe.current
    const svg = bodyEl?.querySelector('svg')
    if (!layerEl || !actorEl || !bodyEl || !bubbleEl || !bubbleAtEl || !printsEl || !probeEl || !svg) return

    const root = document.documentElement
    const printEls = [...printsEl.children] as HTMLElement[]
    const reduced = matchMedia(REDUCED)

    // ---- state ------------------------------------------------------------------------------------------
    let plan: Plan | null = null
    let rig: PupRig | null = null
    let live = false
    let raf = 0
    let rebuildTimer = 0

    let lastT = performance.now() / 1000
    let lastScroll = scrollY
    let lastScrollMove = lastT
    let scrollDir = 1
    let settled = false // was the previous frame solved from the "settled" scroll value?
    let prev: { x: number; y: number } | null = null // last frame's position
    let last: (State & { x: number; y: number }) | null = null
    const spring = { x: 0, y: 0, s: 0 } // eases away jumps (re-plans, hand-offs) instead of teleporting
    let stillFor = 0
    let held = -1 // index of the stop he is resting at, -1 while travelling
    let heldSince = 0
    let lastActivity = 0
    let queue: Step[] = []
    let lookCycleAt = 0
    let lookIdx = -1
    let trackLeft: number | null = null
    let trackIdle = 0
    let printSeg = -1
    let printStep = 0
    let printCursor = 0
    let basketAt = 0
    let laneEase: { x: number; y: number } | null = null
    let laneBottom = 0
    let laneWalked = 0
    let overlayTop = 0
    let bubbleUntil = 0
    let lookAt: { el: HTMLElement; until: number } | null = null
    let mouse: { x: number; y: number; t: number } | null = null
    let lastAct: ActionName | null = null
    let rapid = 0
    let lastClick = 0
    let lastTravelTrick: 'jump' | 'woof' | 'love' | 'sneeze' | null = null

    const say = (text: string, now: number, secs = 1.4) => {
      bubbleEl.textContent = text
      bubbleEl.dataset.show = 'true'
      bubbleUntil = now + secs
    }
    const ctxFor = (stop: number): ActionCtx => {
      const r = rig as PupRig
      const m = (plan as Plan).meta[stop]
      return {
        d: r,
        rest: POSES[m.pose],
        facing: m.facing,
        say: (text, secs) => say(text, performance.now() / 1000, secs),
        hearts: () => {
          if (!last) return
          const faceX = r.facingDir > 0 ? 212 : RIG_W - 212
          spawnHearts(layerEl, last.x - ANCHOR.x * last.s + faceX * last.s, last.y - (ANCHOR.y - 40) * last.s - overlayTop)
        },
      }
    }

    // ---- pointer / focus / cues ------------------------------------------------------------------------
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 }
    }
    const onCue = (e: Event) => {
      const d = (e as CustomEvent<PupCue>).detail
      const scene = held >= 0 && plan ? plan.meta[held]?.scene : null
      if (!scene || (d.look && !scene.contains(d.look))) return
      const now = performance.now() / 1000
      if (d.look) lookAt = { el: d.look, until: now + (d.secs ?? 1.6) }
      if (d.say) say(d.say, now)
    }
    const onFocus = (e: FocusEvent) => {
      const t = e.target
      if (t instanceof HTMLElement && t.matches('a, button, input, textarea, select, summary')) {
        lookAt = { el: t, until: performance.now() / 1000 + 1.4 }
      }
    }
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && rig && held >= 0) { rig.petting(true); rig.wag(1) }
    }
    const onLeave = () => {
      if (!rig) return
      rig.petting(false)
      if (held >= 0) rig.wag(plan?.meta[held]?.act === 'basket' ? 0.3 : 0.7)
    }
    const onClick = () => {
      if (!rig || !plan) return
      const now = performance.now() / 1000
      rapid = now - lastClick < 0.7 ? rapid + 1 : 1
      lastClick = now
      lastActivity = now
      if (held < 0) {
        // clicked mid-travel: a quick trick right where he is
        const idx = Math.max(0, last?.k ?? 0)
        const pick = randomOf(['jump', 'woof', 'love', 'sneeze'] as const, lastTravelTrick)
        lastTravelTrick = pick
        const c = ctxFor(idx)
        queue =
          pick === 'jump' ? [[now, () => { rig?.hop(1.35); c.say(randomOf(['wheee!', 'boing!', 'yip!'])) }], [now + 0.5, () => rig?.hop(0.7)]]
          : pick === 'woof' ? [[now, (t) => { rig?.woof(t); c.say('woof!') }], [now + 0.4, (t) => rig?.woof(t)]]
          : pick === 'love' ? [[now, () => { rig?.wag(1); rig?.hop(0.5); c.hearts(); c.say('I like you!') }]]
          : [[now, (t) => { rig?.jolt(1.4); rig?.hop(0.4); rig?.yawn(t, 0.22); c.say('achoo!') }]]
        return
      }
      const m = plan.meta[held]
      let pick: ActionName
      if (m.track) pick = randomOf(['woof', 'hop', 'love'] as const, lastAct)
      else if (m.act === 'basket') pick = randomOf(['tilt', 'love', 'sneeze', 'woof'] as const, lastAct)
      else if (m.pose === 'peek') pick = randomOf(['peekaboo', 'woof', 'tilt', 'sneeze'] as const, lastAct)
      else {
        pick = nextAction(lastAct, rapid)
        if (pick === 'zoomies') pick = 'spin'
      }
      if (pick === 'peekaboo' && queue.length) return
      lastAct = pick
      rig.reset()
      queue = ACTIONS[pick](ctxFor(held), now)
    }

    // ---- the frame --------------------------------------------------------------------------------------
    const solveAt = (p: Plan, scroll: number): State => {
      if (p.lane) {
        const bottom = whatsappBarTop()
        for (const s of p.stops) if (s.track.kind === 'screen') s.track.top = bottom - 159 * s.s
      }
      return solve(p, scroll, safeArea(p))
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!plan || !rig) return
      const p = plan
      const r = rig
      const now = performance.now() / 1000
      const dt = Math.min(0.05, now - lastT)
      lastT = now
      const y0 = scrollY
      const moved = y0 - lastScroll
      lastScroll = y0
      if (Math.abs(moved) > 0.5) { lastScrollMove = now; scrollDir = moved > 0 ? 1 : -1 }
      while (queue.length && queue[0][0] <= now) (queue.shift() as Step)[1](now)

      // once the scroll has been still for a moment, settle at the end of any hide / sink move
      const eff = now - lastScrollMove > 0.25 ? settleScroll(p, y0) : y0
      const v = solveAt(p, eff)
      const laneBottomMode =
        p.lane &&
        p.stops[v.k].track.kind === 'screen' &&
        (v.t > 0 ? p.stops[v.k + 1] : p.stops[v.k])?.track.kind === 'screen'

      // jumps (re-plan, snapping) are eased away over ~0.3 s
      const decay = Math.exp(-dt / 0.28)
      spring.x *= decay; spring.y *= decay; spring.s *= decay
      if (Math.abs(spring.x) < 0.05 && Math.abs(spring.y) < 0.05) { spring.x = 0; spring.y = 0 }
      const isSettled = eff !== y0
      if (isSettled !== settled && prev && !laneBottomMode) { spring.x = prev.x - v.x; spring.y = prev.y - v.y }
      settled = isSettled

      const scale = v.s + spring.s
      let x = v.x + spring.x
      let y = v.y + spring.y
      const bottom = p.lane ? whatsappBarTop() : 0
      let still = true
      if (laneBottomMode) {
        // phones: he walks along the bottom edge — ease him there instead of following the page
        if (!laneEase) laneEase = prev ? { x: prev.x, y: prev.y - laneBottom } : { x, y: y - bottom }
        const ease = 1 - Math.exp(-dt / 0.14)
        laneEase.x += (x - laneEase.x) * ease
        laneEase.y += (y - bottom - laneEase.y) * ease
        still = Math.hypot(x - laneEase.x, y - bottom - laneEase.y) < 1.5
        x = laneEase.x
        y = bottom + laneEase.y
      } else if (laneEase) {
        spring.x = (prev?.x ?? x) - v.x
        spring.y = (prev?.y ?? y) - v.y
        x = v.x + spring.x
        y = v.y + spring.y
        laneEase = null
      }
      laneBottom = bottom
      last = { ...v, x, y, s: scale }
      setData(layerEl, 'anchor', laneBottomMode ? 'bottom' : 'top')
      overlayTop = laneBottomMode ? layerEl.getBoundingClientRect().top : 0

      const holding = v.t === 0 && still
      const k = v.k
      if (holding) {
        // ---------------------------------------------------------------- resting at a stop
        const m = p.meta[k]
        if (held !== k) {
          queue = []; lookAt = null
          held = k; heldSince = now; lastActivity = now; trackLeft = null
          r.reset(); r.setPose(m.pose); r.face(m.facing, 0.14); r.stride(0)
          r.wag(m.act === 'basket' ? 0.3 : 0.7); r.jolt(0.4)
          basketAt = now + 2.4
        }
        if (m.track && !queue.length) {
          // treadmill: his legs follow the scene sliding underneath him
          const left = m.track.getBoundingClientRect().left
          const dl = trackLeft === null ? 0 : left - trackLeft
          trackLeft = left
          r.walkedTo(-left / scale)
          if (Math.abs(dl) > 0.15) { trackIdle = 0; r.setPose('walk'); r.stride(1); r.face(dl < 0 ? 1 : -1, 0.16) }
          else if ((trackIdle += dt) > 0.25) { r.setPose('stand'); r.stride(0) }
        }
        if (m.act === 'tilt' && !queue.length && now - heldSince > 1.2) {
          const s = Math.sin(0.9 * now)
          r.cock(s > 0.35 ? 13 : s < -0.35 ? -10 : 0)
        }
        if (m.act === 'basket' && !queue.length && now > basketAt) {
          basketAt = now + 4.5 + 3 * Math.random()
          if (Math.random() < 0.7) r.jolt(0.55)
          else r.yawn(now, 0.7)
        }
        // glance at things on the scene, one after another
        const busy = (lookAt && lookAt.until > now) || (mouse && now - mouse.t < 2.5)
        if (m.looks.length && !busy && now - heldSince > 0.8 && now - lookCycleAt > 1.7) {
          lookCycleAt = now
          lookIdx = (lookIdx + 1) % (m.looks.length + 1)
          if (lookIdx < m.looks.length) lookAt = { el: m.looks[lookIdx], until: now + 1.4 }
        }
        if (Math.abs(moved) > 0.5) lastActivity = now
        // bored after a while: a little head tilt or a happy wag
        if (!queue.length && !m.track && m.act !== 'basket' && now - lastActivity > 9) {
          lastActivity = now
          queue = Math.random() < 0.55 ? ACTIONS.tilt(ctxFor(k), now) : [[now, () => r.wag(1)], [now + 2.4, () => r.wag(0.7)]]
        }
      } else {
        // ---------------------------------------------------------------- travelling between stops
        if (held !== -1) { held = -1; queue = []; r.reset() }
        const step = prev ? Math.hypot(x - prev.x, y - prev.y) : 0
        stillFor = step > 0.25 ? 0 : stillFor + dt
        let air = v.airborne
        if (p.lane && v.t > 0) {
          const a = p.stops[k]
          const b = p.stops[k + 1]
          if (a.sink && v.t < 0.22) air = scrollDir > 0
          else if (b?.sink && v.t > 0.78) air = scrollDir < 0
        }
        if (air) { r.setPose('hop'); r.stride(0) }
        else if (stillFor > 0.3) {
          r.setPose('stand'); r.stride(0)
          if (stillFor > 2.6 && stillFor - dt <= 2.6) say('coming?', now)
        } else { r.setPose('walk'); r.stride(1) }
        // legs follow the ground covered along the path — scrolling back un-walks him
        r.walkedTo((laneBottomMode ? (laneWalked += step) : v.walked) / Math.max(0.05, scale))
        if (prev) {
          const dx = x - prev.x
          if (Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(y - prev.y)) r.face(dx > 0 ? 1 : -1, 0.16)
        }
        if (!p.lane) {
          // paw prints on the page behind him, one per stride
          const idx = Math.floor(v.walked / (34 * scale))
          if (printSeg === k && idx !== printStep && !v.airborne && prev) {
            const odd = idx & 1
            const side = odd ? 186 : 110
            const px = x - ANCHOR.x * scale + (r.facingDir > 0 ? side : RIG_W - side) * scale
            const py = y - ANCHOR.y * scale + 226 * scale + y0 - p.mainTop + (odd ? -4 : 4) * scale
            const ang = Math.atan2(y - prev.y + moved, x - prev.x) + Math.PI / 2
            const size = 14 * Math.max(0.75, 1.5 * scale)
            const el = printEls[printCursor++ % printEls.length]
            el.style.transform = `translate(${(px - size / 2).toFixed(1)}px, ${(py - size / 2).toFixed(1)}px) rotate(${ang.toFixed(3)}rad)`
            el.style.width = el.style.height = `${size.toFixed(1)}px`
            el.animate(
              [{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }],
              { duration: 2600, easing: 'ease-out' },
            )
          }
          printSeg = k
          printStep = idx
        }
      }

      prev = { x, y }
      // scenes know where he is: `visited` opens doors behind him, `here` is for the scene he is resting in
      p.meta.forEach((m, i) => {
        if (!m.scene) return
        setData(m.scene, 'here', String(holding && i === k))
        setData(m.scene, 'visited', String(i <= k || (i === k + 1 && v.t > 0.92)))
      })

      // eyes: a thing he was told to look at, else the mouse (for a few seconds after it moves), else ahead
      if (lookAt && lookAt.until > now) {
        const b = lookAt.el.getBoundingClientRect()
        r.lookAt({ x: b.left + b.width / 2, y: b.top + b.height / 2 })
      } else if (mouse && now - mouse.t < 2.5) r.lookAt(mouse)
      else r.lookAt(null)

      actorEl.style.transform = `translate3d(${(x - ANCHOR.x * scale).toFixed(2)}px, ${(y - ANCHOR.y * scale - overlayTop).toFixed(2)}px, 0)`
      bodyEl.style.transform = `scale(${scale.toFixed(4)})`
      setData(layerEl, 'front', String(v.front))
      setData(actorEl, 'holding', String(holding))
      if (bubbleEl.dataset.show === 'true') {
        if (now > bubbleUntil) bubbleEl.dataset.show = 'false'
        const bx = (r.facingDir > 0 ? 214 : RIG_W - 214) * scale
        bubbleAtEl.style.transform = `translate(${bx.toFixed(1)}px, ${(30 * scale).toFixed(1)}px)`
      }
      r.tick(dt, now)
    }

    // ---- start / stop / re-plan ------------------------------------------------------------------------
    const start = () => {
      if (live || reduced.matches) return
      const next = buildPlan(probeEl)
      if (next.stops.length < 2) return
      plan = next
      live = true
      root.dataset.pup = next.lane ? 'lane' : 'live'
      layerEl.hidden = false
      const first = next.meta[0]
      rig = new PupRig(svg, first.pose, first.facing)
      lastScroll = scrollY
      prev = null
      lastT = lastScrollMove = performance.now() / 1000
      settled = false
      laneEase = null
      const t0 = lastT
      const here = solveAt(next, scrollY)
      if (here.k === 0 && here.t === 0 && first.act === 'peekaboo') {
        // arriving at the hero: he pops up between the puppies and glances along the line
        held = 0
        heldSince = t0
        const friends = [...(first.scene?.querySelectorAll<HTMLElement>('[data-pup-friend]') ?? [])]
        const a = friends[0]
        const z = friends[friends.length - 1]
        queue = [
          [t0 + 0.1, () => rig?.setPose({ ...POSES.peek, headY: 120 })],
          [t0 + 0.7, (n) => { rig?.setPose('peek'); rig?.jolt(1.2); say('peekaboo!', n, 1.6) }],
          [t0 + 1.5, (n) => { if (a) lookAt = { el: a, until: n + 0.8 } }],
          [t0 + 2.3, (n) => { if (z) lookAt = { el: z, until: n + 0.8 } }],
          [t0 + 3.1, () => { lookAt = null; rig?.wag(1) }],
        ]
      } else held = -1
      addEventListener('pointermove', onPointer, { passive: true })
      addEventListener('pup:cue', onCue)
      addEventListener('focusin', onFocus)
      actorEl.addEventListener('click', onClick)
      actorEl.addEventListener('pointerenter', onEnter)
      actorEl.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      if (!live) return
      live = false
      cancelAnimationFrame(raf)
      raf = 0
      delete root.dataset.pup
      layerEl.hidden = true
      delete layerEl.dataset.anchor
      overlayTop = 0
      plan?.meta.forEach((m) => {
        if (m.scene) { delete m.scene.dataset.here; delete m.scene.dataset.visited }
      })
      plan = null
      rig = null
      held = -1
      queue = []
      removeEventListener('pointermove', onPointer)
      removeEventListener('pup:cue', onCue)
      removeEventListener('focusin', onFocus)
      actorEl.removeEventListener('click', onClick)
      actorEl.removeEventListener('pointerenter', onEnter)
      actorEl.removeEventListener('pointerleave', onLeave)
    }

    // layout changed (resize, fonts, images…): re-measure, and ease him across any difference
    const replan = () => {
      clearTimeout(rebuildTimer)
      rebuildTimer = window.setTimeout(() => {
        if (!live || !plan) { start(); return }
        const next = buildPlan(probeEl)
        if (next.stops.length < 2) { stop(); return }
        const before = last
        const laneChanged = next.lane !== plan.lane
        plan = next
        root.dataset.pup = next.lane ? 'lane' : 'live'
        if (laneChanged) held = -1
        if (before) {
          const now = solveAt(next, scrollY)
          spring.x = before.x - now.x
          spring.y = before.y - now.y
          spring.s = before.s - now.s
        }
      }, 120)
    }
    const ro = new ResizeObserver(replan)
    ro.observe(document.body)
    addEventListener('resize', replan)
    addEventListener('load', replan)
    const onMotionPref = () => (reduced.matches ? stop() : start())
    reduced.addEventListener('change', onMotionPref)
    start()
    void document.fonts?.ready.then(replan)

    return () => {
      stop()
      clearTimeout(rebuildTimer)
      ro.disconnect()
      removeEventListener('resize', replan)
      removeEventListener('load', replan)
      reduced.removeEventListener('change', onMotionPref)
    }
  }, [])

  return (
    <>
      <div ref={probe} aria-hidden="true" className="pup-probe" />
      <div ref={prints} aria-hidden="true" className="pup-prints">
        {Array.from({ length: PRINTS }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW_PATH} />
          </svg>
        ))}
      </div>
      <div ref={layer} aria-hidden="true" className="pup-layer" hidden data-front="true">
        <div ref={actor} className="pup-actor">
          <div ref={body} className="pup-actor__body">
            <svg viewBox="0 0 300 240" style={{ overflow: 'visible' }} dangerouslySetInnerHTML={markup} />
          </div>
          <span ref={bubbleAt} className="pup-bubble-at">
            <span ref={bubble} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  )
}
