import { useLayoutEffect, useState, type RefObject } from 'react'
import { cuePup } from '../lib/pupJourney'

/**
 * Home → "Meet the pups": the hall scrolls sideways while the page scrolls down.
 * Ported from the original site's own script, so it behaves the same way:
 *
 *   – wide screens only (>= 1024px, no reduced-motion): the section pins to the screen and the page's
 *     vertical scroll slides the hall (doors + floor) to the left; narrow screens keep the plain grid;
 *   – the doors are sized so that heading + doors + floor always fit the screen height (`--door-w`);
 *   – a door swings open when its left edge passes 36% of the screen width, and closes again when you
 *     scroll back; Teddy glances at each door as it opens;
 *   – the slide is eased with a spring, so it glides instead of following the scrollbar 1:1.
 *
 * There is NO second Teddy here: the one page-wide Teddy (components/PupJourney.tsx) sits at the
 * `.tp-meet__teddy` stop with `data-act="treadmill"` and walks on the spot while the hall slides under him.
 * Everything is written straight to the DOM, so nothing re-renders while you scroll.
 */

const PIN_QUERY = '(min-width: 1024px)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
/** A door opens once its left edge has moved left of this share of the screen width. */
const OPEN_AT = 0.36
/** Extra scroll distance (beyond one screen) = this × the hall's sideways travel. */
const SCROLL_PER_PX = 0.8
/** Same spring as the original (stiffness / damping / mass). */
const SPRING = { stiffness: 170, damping: 32, mass: 0.35 }

interface Parts {
  /** the `data-pin-range` wrapper whose height creates the scroll distance */
  pin: RefObject<HTMLElement | null>
  /** `.tp-meet__hall` — owns `--door-w` and `--floor-x` */
  hall: RefObject<HTMLElement | null>
  /** the `<ol>` of doors — the thing that slides */
  track: RefObject<HTMLElement | null>
}

/** Returns `true` while the section is pinned (wide screen, motion allowed). */
export function useMeetRun({ pin, hall, track }: Parts): boolean {
  const [pinned, setPinned] = useState(false)

  useLayoutEffect(() => {
    const pinEl = pin.current
    const hallEl = hall.current
    const trackEl = track.current
    const stageEl = hallEl?.parentElement
    if (!pinEl || !hallEl || !trackEl || !stageEl) return

    const wide = window.matchMedia(PIN_QUERY)
    const calm = window.matchMedia(REDUCED_QUERY)
    const doors = () => Array.from(trackEl.children) as HTMLElement[]

    let on = false
    let off: (() => void) | null = null

    const enable = () => {
      on = true
      setPinned(true)

      let distance = 0 //  how far the hall can slide (px)
      let lefts: number[] = [] // each door's left edge inside the hall
      let fitted = 0 //    last --door-w written (px)
      let pos = 0 //       eased progress 0…1
      let vel = 0
      let raf = 0
      let roRaf = 0
      let last = 0

      /** Door width that lets heading + plate + door + floor fit the stage (the original's formula). */
      const fit = () => {
        const head = stageEl.querySelector<HTMLElement>('.tp-meet__head')
        const plates = Array.from(trackEl.querySelectorAll<HTMLElement>('.tp-door__plate'), (p) => p.offsetHeight)
        const plate = Math.max(64, ...plates)
        const floor = hallEl.querySelector<HTMLElement>('.tp-meet__floor')?.offsetHeight ?? 0
        const headEnd = head ? head.offsetTop + head.offsetHeight : 0
        const room = (stageEl.clientHeight - headEnd - floor - plate - 40) / 1.3
        const px = Math.round(Math.max(128, Math.min(256, 0.15 * window.innerWidth, room)))
        // ±1px is ignored so wrapping text can't make the doors flicker between two sizes
        if (Math.abs(px - fitted) > 1) {
          fitted = px
          hallEl.style.setProperty('--door-w', `${px}px`)
        }
      }

      const measure = () => {
        fit()
        distance = Math.max(0, trackEl.scrollWidth - window.innerWidth)
        lefts = doors().map((d) => d.offsetLeft)
        pinEl.style.height = `calc(100vh + ${Math.round(SCROLL_PER_PX * distance)}px)`
      }

      const progress = () => {
        const range = pinEl.offsetHeight - window.innerHeight
        return range > 0 ? Math.min(1, Math.max(0, -pinEl.getBoundingClientRect().top / range)) : 0
      }

      const paint = (p: number, cue: boolean) => {
        const x = -p * distance
        trackEl.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`
        hallEl.style.setProperty('--floor-x', `${x.toFixed(1)}px`)
        const edge = OPEN_AT * window.innerWidth
        doors().forEach((door, i) => {
          const open = (lefts[i] ?? 0) + x < edge
          if ((door.dataset.open === 'true') !== open) {
            door.dataset.open = String(open)
            if (open && cue) cuePup({ look: door, secs: 0.9 })
          }
        })
      }

      const frame = (t: number) => {
        raf = 0
        const dt = Math.min(0.05, Math.max(0, (t - last) / 1000))
        last = t
        const target = progress()
        const steps = Math.max(1, Math.ceil(dt / 0.004))
        const h = dt / steps
        for (let i = 0; i < steps; i++) {
          vel += ((SPRING.stiffness * (target - pos) - SPRING.damping * vel) / SPRING.mass) * h
          pos += vel * h
        }
        const settled = Math.abs(target - pos) < 0.0003 && Math.abs(vel) < 0.002
        if (settled) {
          pos = target
          vel = 0
        }
        paint(pos, true)
        if (!settled) raf = requestAnimationFrame(frame)
      }
      const kick = () => {
        if (raf) return
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }

      /** layout changed (resize, fonts, the section just pinned…): re-measure and jump — no glide, no cues */
      const relayout = () => {
        measure()
        pos = progress()
        vel = 0
        paint(pos, false)
      }

      measure()
      pos = progress()
      paint(pos, false)

      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(roRaf) // one pass per frame; also avoids "ResizeObserver loop" warnings
        roRaf = requestAnimationFrame(relayout)
      })
      ro.observe(trackEl)
      ro.observe(stageEl)
      window.addEventListener('scroll', kick, { passive: true })
      window.addEventListener('resize', relayout)
      void document.fonts?.ready.then(() => {
        if (on) relayout()
      })

      return () => {
        on = false
        cancelAnimationFrame(raf)
        cancelAnimationFrame(roRaf)
        ro.disconnect()
        window.removeEventListener('scroll', kick)
        window.removeEventListener('resize', relayout)
        pinEl.style.height = ''
        trackEl.style.transform = ''
        hallEl.style.removeProperty('--floor-x')
        hallEl.style.removeProperty('--door-w')
        // back to the plain grid: every door open
        doors().forEach((d) => {
          d.dataset.open = 'true'
        })
        setPinned(false)
      }
    }

    const sync = () => {
      const want = wide.matches && !calm.matches
      if (want === on) return
      off?.()
      off = want ? enable() : null
    }
    sync()
    wide.addEventListener('change', sync)
    calm.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      calm.removeEventListener('change', sync)
      off?.()
      off = null
    }
  }, [pin, hall, track])

  return pinned
}
