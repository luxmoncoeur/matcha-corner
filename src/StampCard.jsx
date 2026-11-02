import { Doodle } from '@plop-ui/react'
import { CARD_SIZE } from './stamps'

export default function StampCard({ stamps, freeCups }) {
  return (
    <div className="stamp-card" role="group" aria-label={`Stamp card: ${stamps} of ${CARD_SIZE} stamps`}>
      <div className="stamp-head">
        <span className="stamp-title">Stamp card</span>
        <span>
          {stamps}/{CARD_SIZE}
        </span>
      </div>
      <ol className="stamps">
        {Array.from({ length: CARD_SIZE }, (_, i) => (
          <li key={i} className={i < stamps ? 'stamp is-on' : 'stamp'}>
            {i < stamps && <Doodle kind="heart" tone="bubblegum" size={26} tilt={(i % 3) * 8 - 8} />}
          </li>
        ))}
      </ol>
      <p className="stamp-note">
        {freeCups > 0
          ? `You have ${freeCups} free ${freeCups === 1 ? 'drink' : 'drinks'}! It comes off your next order.`
          : '1 stamp for every item you finish. 8 stamps = 1 free drink.'}
      </p>
    </div>
  )
}
