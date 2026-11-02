// A little cup with a face. `level` runs from 1 (full) to 0 (all gone).
export default function Cup({ level, size = 180 }) {
  const top = 46
  const bottom = 150
  const fillTop = bottom - (bottom - top) * level
  const empty = level <= 0

  return (
    <svg className="cup" width={size} height={size} viewBox="0 0 180 180" aria-hidden="true">
      <defs>
        <clipPath id="cup-inside">
          <path d="M38 46 L142 46 L130 150 Q90 160 50 150 Z" />
        </clipPath>
      </defs>

      {/* Straw */}
      <path d="M104 12 L116 12 L104 100 L96 100 Z" fill="var(--plop-bubblegum)" stroke="var(--plop-ink)" strokeWidth="3" strokeLinejoin="round" />

      {/* Drink: milk underneath, a matcha layer on top */}
      <g clipPath="url(#cup-inside)" className="cup-drink">
        <rect x="30" y={fillTop} width="120" height={bottom - fillTop + 12} fill="#F4EEDC" />
        <rect x="30" y={fillTop} width="120" height={Math.min(26, bottom - fillTop + 12)} fill="var(--plop-mint)" />
      </g>

      {/* Cup outline and lid rim */}
      <path d="M38 46 L142 46 L130 150 Q90 160 50 150 Z" fill="none" stroke="var(--plop-ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M30 40 Q90 30 150 40 L148 48 Q90 40 32 48 Z" fill="var(--plop-paper)" stroke="var(--plop-ink)" strokeWidth="3.5" strokeLinejoin="round" />

      {/* Face */}
      <g className="cup-face">
        {empty ? (
          <>
            <path d="M66 98 q6 -6 12 0" fill="none" stroke="var(--plop-ink)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M102 98 q6 -6 12 0" fill="none" stroke="var(--plop-ink)" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="72" cy="96" rx="4" ry="5.5" fill="var(--plop-ink)" />
            <ellipse cx="108" cy="96" rx="4" ry="5.5" fill="var(--plop-ink)" />
          </>
        )}
        <ellipse cx="60" cy="110" rx="8" ry="5" fill="var(--plop-bubblegum)" opacity="0.8" />
        <ellipse cx="120" cy="110" rx="8" ry="5" fill="var(--plop-bubblegum)" opacity="0.8" />
        <path d="M82 108 q8 8 16 0" fill="none" stroke="var(--plop-ink)" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
