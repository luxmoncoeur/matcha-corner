import { useEffect, useState } from 'react'
import { defaultOptions, findItem, isDrink, milksFor, sizes, sweetness } from './menu'
import { MAX_QTY } from './share'

const CART_KEY = 'matcha-corner:cart'
const LAST_KEY = 'matcha-corner:last-order'

// Saved lines come from storage someone could edit, so anything off-menu is dropped and odd options reset.
export const cleanLines = (saved) =>
  (Array.isArray(saved) ? saved : [])
    .filter((l) => findItem(l?.id) && Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_QTY)
    .map((l) => {
      const base = defaultOptions(l.id)
      if (!isDrink(l.id)) return { id: l.id, qty: l.qty }
      return {
        id: l.id,
        qty: l.qty,
        milk: milksFor(l.id).includes(l.milk) ? l.milk : base.milk,
        sugar: sweetness.includes(l.sugar) ? l.sugar : base.sugar,
        size: sizes.some((s) => s.name === l.size) ? l.size : base.size,
      }
    })

const read = (key) => {
  try {
    return cleanLines(JSON.parse(localStorage.getItem(key)))
  } catch {
    return []
  }
}

const write = (key, lines) => {
  try {
    localStorage.setItem(key, JSON.stringify(lines.map(({ uid: _uid, ...line }) => line)))
  } catch {
    // Private mode or storage full: it still works until the page closes.
  }
}

// The cart survives a refresh. `toLine` gives each saved line back its React uid.
export function useSavedCart(toLine) {
  const [cart, setCart] = useState(() => read(CART_KEY).map(toLine))
  useEffect(() => write(CART_KEY, cart), [cart])
  return [cart, setCart]
}

export const readLastOrder = () => read(LAST_KEY)
export const saveLastOrder = (lines) => write(LAST_KEY, lines)
