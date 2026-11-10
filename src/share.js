import { defaultOptions, isDrink, lineKey, linePrice, menu, milks, milksFor, sizes, sweetness } from './menu'

export const MAX_QTY = 20
const MAX_LINES = 40
const LENGTHS = { to: 24, name: 24, note: 80 }
const PREFIX = '/4u/'

// Treats travel inside the link itself, so no server is needed. The order is packed into one line:
//
//   u:111r2 ⏎ Bea ⏎ Nino ⏎ Enjoy mo 'to!
//   │ │  │     │     │      └ note (optional)
//   │ │  │     │     └─────── from (optional)
//   │ │  │     └───────────── for (optional)
//   │ │  └─────────────────── next line: 2 revel bars
//   │ └────────────────────── a drink's milk, sweetness and size indexes, only when not its defaults
//   └──────────────────────── one letter per item, then the quantity when it's more than 1
//
// Older links put one milk + sweetness pair for the whole order at the end (`ur2-12`). They still open:
// the pair goes on every drink that can take it.
//
// then scrambled and base64url-encoded, so the link is just /4u/<code> and the surprise (and the
// note) can't be read off the link. It's a scramble, not encryption: anyone determined can decode it.
//
// The host sends /4u/ links to index.html (see vercel.json and public/_redirects).

const KEY = new TextEncoder().encode('matcha corner 4u')
const SEP = '\n'

const findByCode = (code) => menu.find((d) => d.code === code)

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

export const orderTotal = (lines) => lines.reduce((sum, line) => sum + linePrice(line), 0)

const encodeLine = (line) => {
  let text = menu.find((d) => d.id === line.id).code + (line.qty > 1 ? line.qty : '')
  if (lineKey(line) !== lineKey({ id: line.id, ...defaultOptions(line.id) })) {
    // A drink with no milk choice stores 0; it's ignored when read back.
    const milk = Math.max(0, milks.indexOf(line.milk))
    text += `:${milk}${sweetness.indexOf(line.sugar)}${sizes.findIndex((s) => s.name === line.size)}`
  }
  return text
}

// Index digits come from a link someone could have edited, so anything unknown falls back to the default.
const optionsFrom = (id, milk, sugar, size) => {
  const base = defaultOptions(id)
  if (!isDrink(id)) return base
  return {
    milk: milksFor(id).includes(milks[milk]) ? milks[milk] : base.milk,
    sugar: sweetness[sugar] ?? base.sugar,
    size: sizes[size]?.name ?? base.size,
  }
}

export function shareUrl(order) {
  const items = order.lines.map(encodeLine).join('')

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
  // Lines, then the old order-wide milk + sweetness pair.
  const match = /^((?:[a-z]\d{0,2}(?::\d{3})?)+)(?:-(\d)(\d))?$/.exec(items)
  if (!match) return null
  const [, body, oldMilk, oldSugar] = match

  const lines = []
  for (const [, code, count, opts] of body.matchAll(/([a-z])(\d{0,2})(?::(\d{3}))?/g)) {
    const item = findByCode(code)
    const qty = count ? Number(count) : 1
    if (!item || qty < 1 || qty > MAX_QTY || lines.length >= MAX_LINES) continue
    const [milk, sugar, size] = opts ? [...opts].map(Number) : [oldMilk ?? 0, oldSugar ?? -1, 0].map(Number)
    const line = { id: item.id, qty, ...optionsFrom(item.id, milk, sugar, size) }
    // The same thing twice (only possible in an edited link) is skipped rather than merged past MAX_QTY.
    if (!lines.some((l) => lineKey(l) === lineKey(line))) lines.push(line)
  }
  if (lines.length === 0) return null

  return {
    to: clean(to, LENGTHS.to),
    name: clean(name, LENGTHS.name),
    note: clean(note, LENGTHS.note),
    no: 0,
    lines,
    total: orderTotal(lines),
  }
}

export function clearSharedOrder() {
  window.history.replaceState(null, '', '/')
}
