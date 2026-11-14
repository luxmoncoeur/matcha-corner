// The café itself, drawn like the rest of PlopUI: thick ink lines, flat sticker colors, a face.
const INK = { stroke: 'var(--plop-ink)', strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round' }
// Awning stripes: alternating mint and cream, each with a scalloped bottom.
const STRIPES = Array.from({ length: 8 }, (_, i) => 28 + i * 23)

export default function Storefront({ size = 260, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * (204 / 240)}
      viewBox="0 0 240 204"
      role="img"
      aria-label="Matcha corner, a tiny café with a striped awning"
    >
      {/* Ground */}
      <path d="M8 196 Q120 190 232 196" fill="none" {...INK} />

      {/* Building */}
      <path d="M40 84 L200 84 L198 194 L42 194 Z" fill="var(--plop-paper)" {...INK} />

      {/* Sign board on the roof */}
      <path d="M30 22 Q120 14 210 22 L208 56 Q120 50 32 56 Z" fill="var(--plop-mint)" {...INK} />
      <text
        x="120"
        y="44"
        textAnchor="middle"
        fontFamily="var(--plop-font-letter)"
        fontSize="22"
        fill="var(--plop-ink-text)"
      >
        Matcha corner
      </text>

      {/* Awning */}
      {STRIPES.map((x, i) => (
        <path
          key={x}
          d={`M${x} 56 L${x + 23} 56 L${x + 23} 78 Q${x + 11.5} 92 ${x} 78 Z`}
          fill={i % 2 ? '#F4EEDC' : 'var(--plop-mint)'}
          {...INK}
          strokeWidth="3.5"
        />
      ))}

      {/* Window, with a little cup peeking out */}
      <rect x="54" y="106" width="76" height="58" rx="6" fill="#DDF0E3" {...INK} />
      <path d="M78 132 L106 132 L103 160 L81 160 Z" fill="var(--plop-mint)" {...INK} strokeWidth="3" />
      <path d="M96 122 L100 122 L97 134 L93 134 Z" fill="var(--plop-bubblegum)" {...INK} strokeWidth="2" />
      <ellipse cx="87" cy="144" rx="2" ry="2.6" fill="var(--plop-ink)" />
      <ellipse cx="97" cy="144" rx="2" ry="2.6" fill="var(--plop-ink)" />
      <path d="M89 150 q3 3 6 0" fill="none" {...INK} strokeWidth="2" />
      <path d="M54 164 L130 164" {...INK} />

      {/* Door, with an "Open" tag */}
      <path d="M146 194 L146 112 Q166 100 186 112 L186 194" fill="var(--plop-mustard)" {...INK} />
      <circle cx="177" cy="156" r="3" fill="var(--plop-ink)" />
      <path d="M160 116 L166 126 M172 116 L166 126" fill="none" {...INK} strokeWidth="2.5" />
      <rect x="152" y="126" width="28" height="15" rx="4" fill="var(--plop-paper)" {...INK} strokeWidth="2.5" />
      <text x="166" y="137.5" textAnchor="middle" fontFamily="var(--plop-font-letter)" fontSize="10.5" fill="var(--plop-ink-text)">
        Open
      </text>

      {/* The café's face, on the wall under the window */}
      <ellipse cx="104" cy="178" rx="7" ry="4.5" fill="var(--plop-bubblegum)" opacity="0.8" />
      <ellipse cx="66" cy="178" rx="7" ry="4.5" fill="var(--plop-bubblegum)" opacity="0.8" />
      <ellipse cx="74" cy="176" rx="3" ry="4" fill="var(--plop-ink)" />
      <ellipse cx="96" cy="176" rx="3" ry="4" fill="var(--plop-ink)" />
      <path d="M80 182 q5 5 10 0" fill="none" {...INK} strokeWidth="3" />

      {/* Potted plant by the door */}
      <path d="M200 194 L203 174 L223 174 L226 194 Z" fill="var(--plop-bubblegum)" {...INK} strokeWidth="3.5" />
      <path d="M213 174 Q204 156 210 146 Q216 158 213 174 Q222 156 230 154 Q226 168 213 174" fill="var(--plop-mint)" {...INK} strokeWidth="3" />

      {/* Steam from the café */}
      <g className="storefront-steam">
        <path d="M182 16 q-6 -6 0 -12" fill="none" {...INK} strokeWidth="3" opacity="0.7" />
        <path d="M194 18 q-6 -6 0 -12" fill="none" {...INK} strokeWidth="3" opacity="0.7" />
      </g>
    </svg>
  )
}
