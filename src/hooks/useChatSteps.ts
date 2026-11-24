import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from './useMediaQuery'

/**
 * Journey chat: as each step on the left scrolls into the middle band, the matching WhatsApp
 * message group appears after a short "typing…" pause (ported from the original `Chat`).
 * Below 1024px, or with reduced motion, everything is shown at once with the last step active.
 */
export function useChatSteps(count: number) {
  const wide = useMediaQuery('(min-width: 1024px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isStatic = reduced || !wide
  const [current, setCurrent] = useState(-1)
  const [typingNow, setTyping] = useState(false)
  const stepsRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = stepsRef.current
    if (isStatic || !list) return
    const items = [...list.children]
    let last = -1
    let timer: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const i = items.indexOf(entry.target)
          setCurrent(i)
          if (i > last) {
            last = i
            setTyping(true)
            clearTimeout(timer)
            timer = setTimeout(() => setTyping(false), 750)
          }
        }
      },
      { rootMargin: '-28% 0px -62% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [isStatic])

  const active = isStatic ? count - 1 : current
  const typing = isStatic ? false : typingNow
  return {
    stepsRef,
    typing,
    stepState: (i: number) => ({ 'data-done': i < active || undefined, 'data-active': i === active || undefined }),
    groupShown: (i: number) => (i < active || (i === active && !typing) ? 'true' : 'false'),
  }
}
