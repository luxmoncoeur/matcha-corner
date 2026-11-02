import { DEFAULT_MILK, DEFAULT_SUGAR, menu, milks, sweetness } from './menu'

export const MAX_QTY = 20
const LENGTHS = { to: 24, name: 24, note: 80 }
const PREFIX = '/4u/'

// Treats travel inside the link itself, so no server is needed. The order is packed into one line:
//
//   ur2-12 ⏎ Bea ⏎ Nino ⏎ Enjoy mo 'to!
//   │  │      │     │      └ note (optional)
//   │  │      │     └─────── from (optional)
//   │  │      └───────────── for (optional)
//   │  └──────────────────── milk + sweetness indexes, only when not the default
//   └─────────────────────── one letter per item, then the quantity when it's more than 1
//
// then scrambled and base64url-encoded, so the link is just /4u/<code> and the surprise (and the
// note) can't be read off the link. It's a scramble, not encryption: anyone determined can decode it.
//
// The host sends /4u/ links to index.html (see vercel.json and public/_redirects).

const KEY = new TextEncoder().encode('matcha corner 4u')
const SEP = '\n'

const findByCode = (code) => menu.find((d) => d.code === code)
const findById = (id) => menu.find((d) => d.id === id)

// XOR with KEY is its own inverse, so the same function scrambles and unscrambles.
const scramble = (bytes) => bytes.map((b, i) => b ^ KEY[i % KEY.length])

const toCode = (text) => {
  const bytes = scramble(new TextEncoder().encode(text))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromCode = (code) => {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = scramble(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

const clean = (text, max) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

export const orderTotal = (lines) => lines.reduce((sum, [id, qty]) => sum + qty * findById(id).price, 0)

export function shareUrl(order) {
  let items = order.lines.map(([id, qty]) => findById(id).code + (qty > 1 ? qty : '')).join('')
  if (order.milk !== DEFAULT_MILK || order.sugar !== DEFAULT_SUGAR)
    items += `-${milks.indexOf(order.milk)}${sweetness.indexOf(order.sugar)}`

  const fields = [items, clean(order.to, LENGTHS.to), clean(order.name, LENGTHS.name), clean(order.note, LENGTHS.note)]
  while (fields.at(-1) === '') fields.pop()

  return new URL(PREFIX + toCode(fields.join(SEP)), window.location.origin).toString()
}

// Links can be edited by hand, so check everything and recompute the total from the menu.
export function readSharedOrder(path = window.location.pathname) {
  if (!path.startsWith(PREFIX)) return null
  let text
  try {
    text = fromCode(path.slice(PREFIX.length).replace(/\/+$/, ''))
  } catch {
    // Not valid base64, or not valid text once unscrambled.
    return null
  }

  const [items = '', to, name, note] = text.split(SEP)
  const match = /^((?:[a-z]\d{0,2})+)(?:-(\d)(\d))?$/.exec(items)
  if (!match) return null

  const lines = []
  for (const [, code, count] of match[1].matchAll(/([a-z])(\d{0,2})/g)) {
    const item = findByCode(code)
    const qty = count ? Number(count) : 1
    if (item && qty > 0 && qty <= MAX_QTY && !lines.some(([id]) => id === item.id)) lines.push([item.id, qty])
  }
  if (lines.length === 0) return null

  return {
    to: clean(to, LENGTHS.to),
    name: clean(name, LENGTHS.name),
    note: clean(note, LENGTHS.note),
    no: 0,
    lines,
    milk: milks[match[2]] ?? DEFAULT_MILK,
    sugar: sweetness[match[3]] ?? DEFAULT_SUGAR,
    total: orderTotal(lines),
  }
}

export function clearSharedOrder() {
  window.history.replaceState(null, '', '/')
}
