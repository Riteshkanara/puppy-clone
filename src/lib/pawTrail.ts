import { PAW_PATH } from './paw'

/** Tunables — one place to adjust the feel of the footprint trail. */
export const PAW_TRAIL = {
  /** Distance the pointer must travel before the next footprint is stamped (px). */
  step: 46,
  /** Sideways offset of left/right feet from the pointer path (px). */
  stride: 7,
  /** Footprint size (px) and peak opacity. */
  size: 24,
  opacity: 0.9,
  /** How long a footprint lives before it has fully faded (ms). */
  life: 1500,
  /** Short "stamp" pop at the start (ms). */
  pop: 180,
  colour: '122 70 40', // warm mid brown (#7a4628)
} as const

interface Print {
  x: number
  y: number
  angle: number
  born: number
}

/**
 * Draws a fading trail of alternating left/right paw prints behind a moving mouse.
 * Canvas based (one element, no DOM churn); the animation loop sleeps when no print is visible.
 * Returns a cleanup function.
 */
export function startPawTrail(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const paw = new Path2D(PAW_PATH)
  const prints: Print[] = []
  let last: { x: number; y: number } | null = null
  let side = 1
  let raf = 0
  let dpr = 1

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
  }

  const frame = (now: number) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = prints.length - 1; i >= 0; i--) {
      const p = prints[i]
      const age = now - p.born
      if (age >= PAW_TRAIL.life) {
        prints.splice(i, 1)
        continue
      }
      const fade = 1 - age / PAW_TRAIL.life
      const pop = Math.min(1, age / PAW_TRAIL.pop)
      const scale = (PAW_TRAIL.size / 64) * (0.6 + 0.4 * pop)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle + Math.PI / 2)
      ctx.scale(scale, scale)
      ctx.translate(-32, -34)
      ctx.fillStyle = `rgb(${PAW_TRAIL.colour} / ${(PAW_TRAIL.opacity * fade * fade).toFixed(3)})`
      ctx.fill(paw)
    }
    raf = prints.length ? requestAnimationFrame(frame) : 0
  }

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    if (!last) {
      last = { x: e.clientX, y: e.clientY }
      return
    }
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    const dist = Math.hypot(dx, dy)
    if (dist < PAW_TRAIL.step) return
    const angle = Math.atan2(dy, dx)
    // perpendicular offset so feet alternate either side of the path
    const nx = -Math.sin(angle) * PAW_TRAIL.stride * side
    const ny = Math.cos(angle) * PAW_TRAIL.stride * side
    side = -side
    prints.push({ x: e.clientX + nx, y: e.clientY + ny, angle, born: performance.now() })
    last = { x: e.clientX, y: e.clientY }
    wake()
  }
  const onLeave = () => {
    last = null
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}
