import type { HTMLAttributes } from 'react'
import { useReveal } from '../hooks/useReveal'

/** Wrapper that reveals every `[data-reveal]` descendant on scroll (see useReveal). */
export default function RevealScope({ children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  )
}
