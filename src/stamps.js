import { useState } from 'react'

export const CARD_SIZE = 8
const KEY = 'matcha-corner:stamps'

// Lives in this browser only (localStorage), so there's no account or server to set up.
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return {
      stamps: Number.isInteger(saved?.stamps) ? saved.stamps : 0,
      freeCups: Number.isInteger(saved?.freeCups) ? saved.freeCups : 0,
    }
  } catch {
    return { stamps: 0, freeCups: 0 }
  }
}

export function useStampCard() {
  const [card, setCard] = useState(load)

  const save = (next) => {
    setCard(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // Private mode or storage full: the card still works until the page closes.
    }
  }

  // Returns how many free cups this earned, so the caller can celebrate.
  const addStamps = (count) => {
    const total = card.stamps + count
    const earned = Math.floor(total / CARD_SIZE)
    save({ stamps: total % CARD_SIZE, freeCups: card.freeCups + earned })
    return earned
  }

  const redeemFreeCup = () => save({ ...card, freeCups: Math.max(0, card.freeCups - 1) })

  return { ...card, addStamps, redeemFreeCup }
}
