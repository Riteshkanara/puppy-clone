/** Envelope + post box used by the "posting" animation and the sent state (CSS in ContactPage.css). */

export function Envelope() {
  return (
    <svg viewBox="0 0 120 84" className="tp-post__envelope" aria-hidden="true">
      <path d="M6 10h108v68H6z" fill="#fffdf8" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
      <path className="tp-post__flap" d="M6 10l54 40 54-40" fill="#fbe3b4" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="94" cy="62" r="12" fill="#c2622b" stroke="#2a170e" strokeWidth="2.5" />
    </svg>
  )
}

export function PostBox({ sent = false }: { sent?: boolean }) {
  return (
    <svg
      viewBox="0 0 140 130"
      className={sent ? 'tp-post__box tp-post__box--sent' : 'tp-post__box'}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <path d="M92 124 h-44" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 118 V52 a50 50 0 0 1 100 0 v66 z" fill="#c2622b" stroke="#2a170e" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="38" y="44" width="60" height="9" rx="4.5" fill="#2a170e" />
      <path d="M34 78 h68" stroke="#fffdf8" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M34 92 h68" stroke="#fffdf8" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <g className={sent ? undefined : 'tp-post__flag'} style={sent ? { rotate: '0deg' } : undefined}>
        <rect x="116" y="70" width="3.5" height="24" fill="#2a170e" />
        <path d="M119 70 h14 v11 h-14z" fill="#f2be6b" stroke="#2a170e" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
