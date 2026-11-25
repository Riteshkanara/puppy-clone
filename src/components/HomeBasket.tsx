import { useEffect, useRef } from 'react'
import BasketPup from './BasketPup'

/**
 * Footer ending: when the footer comes into view Teddy, now in his basket, pops up and says "home, at last".
 * Wraps the existing BasketPup drawing; the CSS lives in styles/home-motion.css (imported by HomePage).
 */
export default function HomeBasket() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        el.dataset.in = String(e.isIntersecting)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="tp-basketwrap" ref={ref} data-in="false">
      <span className="tp-basketwrap__bubble font-scrawl" aria-hidden="true">
        home, at last ♥
      </span>
      <BasketPup />
    </div>
  )
}
