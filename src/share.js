import { DEFAULT_MILK, DEFAULT_SUGAR, menu, milks, sweetness } from './menu'

export const MAX_QTY = 20
const LENGTHS = { to: 24, name: 24, note: 80 }
const PREFIX = '/4u/'

// Treats travel inside the link itself, so no server is needed:
//
//   /4u/ur2-21/Bea/Nino/Enjoy-mo-'to
//       │  │    │   │    └ note (optional)
//       │  │    │   └───── from (optional)
//       │  │    └───────── for (optional; "_" when empty but more follows)
//       │  └────────────── milk + sweetness indexes, only when not the default
//       └───────────────── one letter per item, then the quantity when it's more than 1
//
// The host sends /4u/ links to index.html (see vercel.json and public/_redirects).

const findByCode = (code) => menu.find((d) => d.code === code)
const findById = (id) => menu.find((d) => d.id === id)

// Spaces become "-" (a real "-" is escaped), and punctuation at the very end is escaped too, so
// chat apps that trim a trailing "!" off a link can't cut the message short.
const encodeText = (text) =>
  encodeURIComponent(text)
    .replace(/-/g, '%2D')
    .replace(/_/g, '%5F') // "_" alone means an empty field
    .replace(/\./g, '%2E') // a "." could make the host look for a file
    .replace(/%20/g, '-')
    .replace(/[!'()*.~]+$/, (tail) => [...tail].map((c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).join(''))

const decodeText = (text = '') => (text === '_' ? '' : decodeURIComponent(text.replace(/-/g, ' ')).trim())

export const orderTotal = (lines) => lines.reduce((sum, [id, qty]) => sum + qty * findById(id).price, 0)

export function shareUrl(order) {
  let items = order.lines.map(([id, qty]) => findById(id).code + (qty > 1 ? qty : '')).join('')
  if (order.milk !== DEFAULT_MILK || order.sugar !== DEFAULT_SUGAR)
    items += `-${milks.indexOf(order.milk)}${sweetness.indexOf(order.sugar)}`

  const fields = [order.to, order.name, order.note].map((t) => (t ? encodeText(t) : '_'))
  while (fields.at(-1) === '_') fields.pop()

  return new URL(PREFIX + [items, ...fields].join('/'), window.location.origin).toString()
}

// Links can be edited by hand, so check everything and recompute the total from the menu.
export function readSharedOrder(path = window.location.pathname) {
  if (!path.startsWith(PREFIX)) return null
  const [items = '', to, name, note] = path.slice(PREFIX.length).split('/')
  const match = /^((?:[a-z]\d{0,2})+)(?:-(\d)(\d))?$/.exec(items)
  if (!match) return null

  const lines = []
  for (const [, code, count] of match[1].matchAll(/([a-z])(\d{0,2})/g)) {
    const item = findByCode(code)
    const qty = count ? Number(count) : 1
    if (item && qty > 0 && qty <= MAX_QTY && !lines.some(([id]) => id === item.id)) lines.push([item.id, qty])
  }
  if (lines.length === 0) return null

  try {
    return {
      to: decodeText(to).slice(0, LENGTHS.to),
      name: decodeText(name).slice(0, LENGTHS.name),
      note: decodeText(note).slice(0, LENGTHS.note),
      no: 0,
      lines,
      milk: milks[match[2]] ?? DEFAULT_MILK,
      sugar: sweetness[match[3]] ?? DEFAULT_SUGAR,
      total: orderTotal(lines),
    }
  } catch {
    // A broken %-escape in a hand-edited link.
    return null
  }
}

export function clearSharedOrder() {
  window.history.replaceState(null, '', '/')
}
