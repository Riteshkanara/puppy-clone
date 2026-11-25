import './LoafPup.css'

/**
 * Teddy lying down with a bow on — the "loaf" pose used beside calls to action.
 * Same palette, stroke weight and shapes as <Teddy /> so the two read as one character.
 * Faces left by default (towards the copy when it sits on the right of a card).
 */
export default function LoafPup({ label = 'Teddy, the TeddyPups puppy, resting' }: { label?: string }) {
  const fur = '#f2be6b'
  const furDeep = '#d4893f'
  const cream = '#fbe3b4'
  const ink = '#2a170e'
  const bow = '#c2622b'
  const line = { stroke: ink, strokeWidth: 3.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

  return (
    <svg className="loaf" viewBox="0 0 300 200" role="img" aria-label={label}>
      <ellipse cx="152" cy="184" rx="118" ry="8" fill={ink} opacity="0.12" />

      {/* tail */}
      <g className="loaf__tail">
        <ellipse cx="270" cy="128" rx="17" ry="15" fill={furDeep} {...line} />
      </g>

      {/* body, haunch, back paw */}
      <g className="loaf__body">
        <ellipse cx="178" cy="142" rx="84" ry="38" fill={fur} {...line} />
        <ellipse cx="226" cy="150" rx="42" ry="33" fill={fur} {...line} />
        <path d="M214 176 C214 168 224 164 238 164 C254 164 264 168 264 176 C264 182 256 184 238 184 C222 184 214 182 214 176 Z" fill={cream} {...line} />
        <path d="M232 170 v6 M242 170 v6 M252 170 v6" fill="none" {...line} strokeWidth={2.2} />
      </g>

      {/* front paws */}
      <path d="M64 178 C60 168 68 160 82 160 C96 160 108 164 110 172 C112 180 104 184 90 184 L76 184 C70 184 66 182 64 178 Z" fill={cream} {...line} />
      <path d="M116 180 C114 170 122 164 136 164 C150 164 160 168 160 176 C160 182 152 185 140 185 L126 185 C120 185 117 183 116 180 Z" fill={cream} {...line} />
      <path d="M76 172 v6 M86 171 v7 M126 174 v6 M136 173 v7" fill="none" {...line} strokeWidth={2.2} />

      {/* bow */}
      <g className="loaf__bow">
        <path d="M112 150 L90 138 C86 150 88 162 92 170 Z" fill={bow} {...line} />
        <path d="M112 150 L134 140 C136 152 134 164 128 172 Z" fill={bow} {...line} />
        <circle cx="112" cy="152" r="8" fill={furDeep} {...line} />
      </g>

      {/* head */}
      <g className="loaf__head">
        <g className="loaf__ear loaf__ear--r"><ellipse cx="128" cy="100" rx="17" ry="31" fill={furDeep} {...line} transform="rotate(-14 128 100)" /></g>
        <g className="loaf__ear loaf__ear--l"><ellipse cx="40" cy="104" rx="17" ry="31" fill={furDeep} {...line} transform="rotate(14 40 104)" /></g>
        <ellipse cx="84" cy="96" rx="50" ry="45" fill={fur} {...line} />
        <ellipse cx="88" cy="48" rx="17" ry="12" fill={fur} {...line} />
        <ellipse cx="60" cy="112" rx="10" ry="7" fill="#f9cdbf" opacity="0.8" />
        <ellipse cx="108" cy="112" rx="10" ry="7" fill="#f9cdbf" opacity="0.8" />
        <path d="M60 116 C60 103 72 98 84 98 C96 98 108 103 108 116 C108 129 97 136 84 136 C71 136 60 129 60 116 Z" fill={cream} {...line} />
        <path d="M76.500 108.500 Q84 104.200 91.500 108.500 Q90.200 115.400 84 117 Q77.800 115.400 76.500 108.500 Z" fill={ink} {...line} strokeWidth={2} />
        <path d="M84 117 V121.500 M84 121.500 Q79.200 126.600 74.800 122.200 M84 121.500 Q88.800 126.600 93.200 122.200" fill="none" {...line} strokeWidth={2.6} />
        <g className="loaf__eyes">
          <circle cx="65" cy="86" r="5.2" fill={ink} />
          <circle cx="103" cy="86" r="5.2" fill={ink} />
          <circle cx="66.600" cy="84.200" r="1.700" fill="#fffdf8" />
          <circle cx="104.600" cy="84.200" r="1.700" fill="#fffdf8" />
        </g>
      </g>
    </svg>
  )
}
