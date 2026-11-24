import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal for any element tagged `data-reveal` inside the returned ref.
 *
 * Mirrors the original "RevealScope":
 *  - elements already on screen at mount are marked revealed immediately (no flash);
 *  - the rest get `data-armed` (hidden state in CSS) and `data-revealed` when scrolled into view;
 *  - elements added later (e.g. after a filter change) are picked up by a MutationObserver;
 *  - prefers-reduced-motion → everything is revealed at once;
 *  - the page-entry curtain gate: while <html data-curtain="on"> is set, nothing is scanned — the scan
 *    starts on the curtain's `tp:curtain-open` event, so reveals play after the lift, not behind it.
 */
function runReveal(root: HTMLElement): () => void {
  const pending = '[data-reveal]:not([data-revealed])'

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealAll = () => root.querySelectorAll<HTMLElement>(pending).forEach((el) => (el.dataset.revealed = 'true'))
    revealAll()
    const mo = new MutationObserver(revealAll)
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.dataset.revealed = 'true'
        io.unobserve(el)
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
  )

  const arm = (el: HTMLElement) => {
    if (el.dataset.armed) return io.observe(el)
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.dataset.revealed = 'true'
      return
    }
    el.dataset.armed = 'true'
    io.observe(el)
  }
  const scan = () => root.querySelectorAll<HTMLElement>(pending).forEach(arm)

  scan()
  const mo = new MutationObserver(scan)
  mo.observe(root, { childList: true, subtree: true })
  return () => {
    io.disconnect()
    mo.disconnect()
  }
}

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    let stop: (() => void) | undefined
    const start = () => {
      stop = runReveal(root)
    }

    if (document.documentElement.dataset.curtain === 'on') {
      window.addEventListener('tp:curtain-open', start, { once: true })
    } else {
      start()
    }

    return () => {
      window.removeEventListener('tp:curtain-open', start)
      stop?.()
    }
  }, [])

  return ref
}
