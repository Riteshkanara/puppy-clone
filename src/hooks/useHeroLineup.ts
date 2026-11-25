import { useEffect, useRef, useState, type RefObject } from 'react'
import { doors, type HomeDoor } from '../data/homeDoors'

export const LINEUP_SIZE = 6
export type SeatState = 'duck' | 'pop' | undefined

export interface LineupView {
  /** Which puppy (index into `pool`) sits in each seat. */
  slots: number[]
  /** `duck` = sinking out of sight, `pop` = springing back up (drives the original CSS hooks). */
  state: SeatState[]
  /** Show the name tag above this seat. */
  tag: boolean[]
}

/** Every puppy that can appear in the hero arches (the same list as the Meet-the-pups doors). */
export const lineupPool: HomeDoor[] = doors

const wait = (ms: number) => new Promise<void>((res) => window.setTimeout(res, ms))

/** Resolve once an image is cached and decoded (or after a short timeout), so a swap never shows a blank arch. */
function preload(src: string): Promise<void> {
  return new Promise((res) => {
    const img = new Image()
    const done = () => res()
    const timer = window.setTimeout(done, 1600)
    img.onload = () => {
      window.clearTimeout(timer)
      if (img.decode) {
          img.decode().then(done, done)
        } else {
          done()
        }
    }
    img.onerror = () => {
      window.clearTimeout(timer)
      done()
    }
    img.src = src
  })
}

/**
 * The hero's puppy arches: every couple of seconds one puppy ducks out of sight, a *different* puppy pops
 * back up in its place, and a name tag flashes above it. Also drives `data-here` on the section so the whole
 * line-up sinks while the hero is scrolled away and rises again on return.
 *
 * Pauses while the tab is hidden, the hero is off screen, or the pointer / keyboard is on a puppy.
 * With prefers-reduced-motion the line-up stays still.
 */
export function useHeroLineup(sectionRef: RefObject<HTMLElement | null>, initial: number[]): LineupView {
  const [view, setView] = useState<LineupView>(() => ({
    slots: initial,
    state: Array<SeatState>(LINEUP_SIZE).fill(undefined),
    tag: Array<boolean>(LINEUP_SIZE).fill(false),
  }))
  const slotsRef = useRef<number[]>(initial)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let alive = true
    let here = true
    let hover = false
    let busy = false
    let timer = 0
    const recent: number[] = []

    const patch = (seat: number, state: SeatState, tag: boolean, slot?: number) =>
      setView((v) => {
        const slots = v.slots.slice()
        const st = v.state.slice()
        const tg = v.tag.slice()
        if (slot !== undefined) slots[seat] = slot
        st[seat] = state
        tg[seat] = tag
        return { slots, state: st, tag: tg }
      })

    const pickSeat = () => {
      const pool = Array.from({ length: LINEUP_SIZE }, (_, i) => i).filter((i) => !recent.includes(i))
      const seat = pool[Math.floor(Math.random() * pool.length)]
      recent.push(seat)
      if (recent.length > 2) recent.shift()
      return seat
    }

    const pickPup = () => {
      const free = lineupPool.map((_, i) => i).filter((i) => !slotsRef.current.includes(i))
      return free[Math.floor(Math.random() * free.length)]
    }

    const play = async () => {
      busy = true
      const seat = pickSeat()
      const next = pickPup()
      const loading = preload(lineupPool[next].src)
      patch(seat, 'duck', false)
      await Promise.all([wait(380), loading])
      if (!alive) return
      slotsRef.current = slotsRef.current.map((s, i) => (i === seat ? next : s))
      patch(seat, 'pop', true, next)
      await wait(650)
      if (!alive) return
      patch(seat, undefined, true)
      await wait(1100)
      if (!alive) return
      patch(seat, undefined, false)
      busy = false
    }

    const tick = () => {
      if (!alive) return
      if (here && !hover && !busy && !document.hidden) void play()
      timer = window.setTimeout(tick, 1500 + Math.random() * 1700)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        here = entry.isIntersecting
        // once Teddy's journey is running it owns `data-here` (the line-up sinks when he is not at home)
        if (!document.documentElement.dataset.pup) section.dataset.here = String(entry.isIntersecting)
      },
      { threshold: 0.3 },
    )
    io.observe(section)

    const lineup = section.querySelector<HTMLElement>('.tp-lineup:not(.tp-lineup--tags)')
    const enter = () => (hover = true)
    const leave = () => (hover = false)
    lineup?.addEventListener('pointerenter', enter)
    lineup?.addEventListener('pointerleave', leave)
    lineup?.addEventListener('focusin', enter)
    lineup?.addEventListener('focusout', leave)

    // first swap shortly after the entrance has finished (and after the curtain, if any)
    const begin = () => {
      timer = window.setTimeout(tick, 2600)
    }
    if (document.documentElement.dataset.curtain === 'on') {
      window.addEventListener('tp:curtain-open', begin, { once: true })
    } else {
      begin()
    }

    return () => {
      alive = false
      window.clearTimeout(timer)
      window.removeEventListener('tp:curtain-open', begin)
      io.disconnect()
      lineup?.removeEventListener('pointerenter', enter)
      lineup?.removeEventListener('pointerleave', leave)
      lineup?.removeEventListener('focusin', enter)
      lineup?.removeEventListener('focusout', leave)
      delete section.dataset.here
    }
  }, [sectionRef])

  return view
}
