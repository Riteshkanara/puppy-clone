import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TeddyRig from './TeddyRig'
import { PAW_PATH } from '../lib/paw'
import './PageCurtain.css'

/**
 * enter : sweeping up from the bottom over the old page   cover : fully covering (no transition)
 * lift  : carrying on up and off the top, revealing the new page   idle : parked above the screen, hidden
 */
type Phase = 'cover' | 'enter' | 'lift' | 'idle'

const ENTER_MS = 380 //  curtain sweeps up over the page you are leaving
const HOLD_MS = 520 //   Teddy trots across while the new page is prepared behind it
const LIFT_MS = 600 //   curtain rises (keep in sync with PageCurtain.css)
const FIRST_MIN_MS = 700 //   first load / refresh: never shorter than this…
const FIRST_MAX_MS = 2200 //  …and never longer than this, even if the network is slow

/** Footprints Teddy leaves behind as he trots across (percent of the viewport). */
const PRINTS = Array.from({ length: 7 }, (_, i) => ({
  left: 14 + i * 8.2,
  top: 63 + (i % 2 ? 2 : -2),
  rot: 90 + (i % 2 ? 10 : -10),
  delay: 0.08 + i * 0.09,
}))

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function pageReady(): Promise<void> {
  const fonts: Promise<unknown> = document.fonts?.ready ?? Promise.resolve()
  const loaded: Promise<unknown> =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((res) => window.addEventListener('load', () => res(), { once: true }))
  return Promise.all([fonts, loaded]).then(() => undefined)
}

/**
 * The TeddyPups curtain. It is shown EVERY time a page is entered:
 *
 *  1. first load / refresh          → starts already covering, waits for fonts + load, then lifts;
 *  2. clicking any in-app link      → sweeps up from the bottom, the route changes behind it, then exits through the top;
 *  3. back / forward / navigate()   → covers before the new page can paint, then lifts.
 *
 * While it is up, <html data-curtain="on"> pauses the hero entrance animations and the scroll-reveal scan;
 * both start on the `tp:curtain-open` event fired at the moment of the lift, so nothing plays behind it.
 * Scroll is locked while it is up. Reduced-motion visitors never see it.
 *
 * Only a change of *pathname* triggers it — filtering the puppies list (?breed=…) must not.
 */
export default function PageCurtain() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reduce = prefersReducedMotion()

  const [phase, setPhase] = useState<Phase>(reduce ? 'idle' : 'cover')
  const [run, setRun] = useState(0) //      remounting the stage restarts Teddy's walk
  const [arrived, setArrived] = useState(false)

  const phaseRef = useRef<Phase>(phase)
  const timers = useRef<number[]>([])
  const lastPath = useRef(pathname)
  const selfNav = useRef(false) //           true while *we* are the ones calling navigate()

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const go = useCallback((next: Phase) => {
    const root = document.documentElement
    phaseRef.current = next
    if (next === 'cover' || next === 'enter') root.dataset.curtain = 'on'
    else delete root.dataset.curtain
    if (next === 'lift') window.dispatchEvent(new Event('tp:curtain-open'))
    setPhase(next)
  }, [])

  /** hold → lift → idle */
  const finish = useCallback(
    (holdMs: number) => {
      after(holdMs, () => {
        go('lift')
        after(LIFT_MS, () => go('idle'))
      })
    },
    [after, go],
  )

  const restartWalk = useCallback(() => {
    setArrived(false)
    setRun((n) => n + 1)
  }, [])

  // ── 1. first load / refresh ────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (reduce) return
    document.documentElement.dataset.curtain = 'on' // before any child effect reads it
    return () => {
      delete document.documentElement.dataset.curtain
    }
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const t0 = performance.now()
    let done = false
    const release = () => {
      if (done) return
      done = true
      finish(Math.max(0, FIRST_MIN_MS - (performance.now() - t0)))
    }
    void pageReady().then(release)
    after(FIRST_MAX_MS, release)
    return () => {
      done = true
      clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 2. any in-app link click: enter → navigate → hold → lift ─────────────────
  useEffect(() => {
    if (reduce) return
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return // mailto:, tel:, wa.me …
      if (url.pathname === window.location.pathname) return // same page, ?query or #hash only
      // React Router's <Link> skips its own navigation when the click is already defaultPrevented;
      // other onClick handlers (e.g. closing the mobile menu) still run.
      e.preventDefault()
      if (phaseRef.current !== 'idle') return
      clear()
      restartWalk()
      go('enter')
      after(ENTER_MS, () => {
        selfNav.current = true
        navigate(url.pathname + url.search + url.hash)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        go('cover')
        finish(HOLD_MS)
      })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [after, clear, finish, go, navigate, reduce, restartWalk])

  // ── 3. route changed without our click (back / forward, navigate()) ─────────
  // Layout effect: the new page has rendered but not painted yet, so cover it first.
  useLayoutEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname
    if (selfNav.current) {
      selfNav.current = false
      return
    }
    if (reduce) return
    clear()
    const frame = requestAnimationFrame(() => restartWalk())
    // Intentional: useLayoutEffect must cover the new route before its first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    go('cover')
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    finish(HOLD_MS)
    return () => cancelAnimationFrame(frame)
  }, [pathname, clear, finish, go, reduce, restartWalk])

  // ── scroll lock while the curtain is up ─────────────────────────────────────
  const up = phase !== 'idle'
  useEffect(() => {
    if (!up) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prev
    }
  }, [up])

  if (reduce) return null

  return (
    <div className="tp-curtain" data-phase={phase} aria-hidden="true">
      <div className="tp-curtain__stage" key={run}>
        {PRINTS.map((p, i) => (
          <svg
            key={i}
            viewBox="0 0 64 64"
            className="tp-curtain__paw"
            style={{ left: `${p.left}%`, top: `${p.top}%`, rotate: `${p.rot}deg`, animationDelay: `${p.delay}s` }}
          >
            <path d={PAW_PATH} fill="currentColor" />
          </svg>
        ))}
        <div
          className="tp-curtain__teddy"
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) setArrived(true) // the walk ended, not a paw print
          }}
        >
          <TeddyRig mode={arrived ? 'idle' : 'run'} />
        </div>
        <p className="tp-curtain__note font-scrawl">every puppy is family</p>
      </div>

      {/* scalloped edges: the leading edge while it sweeps up, and the hem it trails as it leaves */}
      <svg className="tp-curtain__edge tp-curtain__edge--top" width="100%" height="40" preserveAspectRatio="none">
        <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
      </svg>
      <svg className="tp-curtain__edge" width="100%" height="40" preserveAspectRatio="none">
        <defs>
          <pattern id="tp-curtain-scallop" width="76" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0V13A38 25 0 0 0 76 13V0Z" fill="#fbe3b4" />
            <path d="M0 13A38 25 0 0 0 76 13" fill="none" stroke="#2a170e" strokeWidth="3" />
            <path
              d="M11 7A27 19 0 0 0 65 7"
              fill="none"
              stroke="#2a170e"
              strokeWidth="1.6"
              strokeDasharray="3.5 5.5"
              strokeLinecap="round"
              opacity=".42"
            />
          </pattern>
        </defs>
        <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
      </svg>
    </div>
  )
}
