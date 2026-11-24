import { useEffect, useRef } from 'react'
import { startPawTrail } from '../lib/pawTrail'
import './PawTrail.css'

/**
 * Site-wide paw cursor (CSS, see PawTrail.css) + fading footprint trail behind the mouse.
 * Only runs for a real mouse (hover + fine pointer) and when motion is allowed.
 */
export default function PawTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    let stop: (() => void) | undefined
    const sync = () => {
      stop?.()
      stop = mouse.matches && !calm.matches ? startPawTrail(canvas) : undefined
    }
    sync()
    mouse.addEventListener('change', sync)
    calm.addEventListener('change', sync)
    return () => {
      mouse.removeEventListener('change', sync)
      calm.removeEventListener('change', sync)
      stop?.()
    }
  }, [])

  return <canvas ref={ref} className="paw-trail" aria-hidden="true" />
}
