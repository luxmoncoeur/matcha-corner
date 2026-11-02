// A cookie with a face that loses a bite each time. `left` runs from 1 (whole) to 0 (all gone).
const BITES = [
  [150, 60],
  [158, 112],
  [126, 150],
  [70, 154],
  [32, 110],
]

export default function Cookie({ left, size = 180 }) {
  const taken = Math.round((1 - left) * BITES.length)
  const empty = left <= 0

  return (
    <svg className="cup" width={size} height={size} viewBox="0 0 180 180" aria-hidden="true">
      <defs>
        <mask id="cookie-bites">
          <rect width="180" height="180" fill="white" />
          {BITES.slice(0, taken).map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="22" fill="black" />
              <circle cx={x + 14} cy={y - 14} r="14" fill="black" />
            </g>
          ))}
        </mask>
      </defs>

      {/* Plate */}
      <ellipse cx="90" cy="160" rx="78" ry="14" fill="var(--plop-paper)" stroke="var(--plop-ink)" strokeWidth="3" />

      {empty ? (
        <g fill="#C98E4E" stroke="var(--plop-ink)" strokeWidth="2">
          <circle cx="70" cy="152" r="4" />
          <circle cx="98" cy="156" r="3" />
          <circle cx="116" cy="150" r="3.5" />
        </g>
      ) : (
        <g mask="url(#cookie-bites)">
          <circle cx="90" cy="96" r="62" fill="#E2B074" stroke="var(--plop-ink)" strokeWidth="4" />
          <g fill="#6B4227">
            <ellipse cx="58" cy="70" rx="6" ry="5" />
            <ellipse cx="122" cy="74" rx="5" ry="6" />
            <ellipse cx="66" cy="130" rx="6" ry="5" />
            <ellipse cx="118" cy="128" rx="5" ry="5" />
            <ellipse cx="96" cy="58" rx="4" ry="4" />
          </g>
          <g className="cup-face">
            <ellipse cx="74" cy="96" rx="4" ry="5.5" fill="var(--plop-ink)" />
            <ellipse cx="106" cy="96" rx="4" ry="5.5" fill="var(--plop-ink)" />
            <ellipse cx="62" cy="108" rx="7" ry="4.5" fill="var(--plop-bubblegum)" opacity="0.85" />
            <ellipse cx="118" cy="108" rx="7" ry="4.5" fill="var(--plop-bubblegum)" opacity="0.85" />
            <path d="M84 106 q6 7 12 0" fill="none" stroke="var(--plop-ink)" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </g>
      )}
    </svg>
  )
}
