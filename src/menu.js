// Each `code` is the item's single letter inside treat links (`ur2` = 1 ube matcha, 2 revel bars; see share.js).
// Never change or reuse a code, or links people already sent will open the wrong thing.
export const menu = [
  // Drinks
  {
    id: 'ceremonial',
    code: 'c',
    kind: 'drink',
    name: 'Ceremonial latte',
    note: 'Stone-ground matcha whisked by hand, over cold milk.',
    price: 150,
    paper: 'mint',
    tags: [{ label: 'Bestseller', tone: 'mint' }],
  },
  {
    id: 'strawberry',
    code: 's',
    kind: 'drink',
    name: 'Strawberry matcha',
    note: 'Crushed strawberry jam at the bottom, matcha on top.',
    price: 170,
    paper: 'pink',
    tags: [{ label: 'Iced', tone: 'periwinkle' }],
  },
  {
    id: 'ube',
    code: 'u',
    kind: 'drink',
    name: 'Ube matcha',
    note: 'Ube halaya milk under a layer of matcha.',
    price: 170,
    paper: 'pink',
    tags: [{ label: 'Iced', tone: 'periwinkle' }],
  },
  {
    id: 'cloud',
    code: 'm',
    kind: 'drink',
    name: 'Matcha cloud',
    note: 'Sweet cream cold foam floating on straight matcha.',
    price: 175,
    paper: 'mint',
    tags: [{ label: 'New', tone: 'tomato' }],
  },
  {
    id: 'mango',
    code: 'g',
    kind: 'drink',
    name: 'Mango matcha',
    note: 'Ripe Guimaras mango puree, milk and a matcha float.',
    price: 175,
    paper: 'mustard',
    tags: [{ label: 'Summer', tone: 'mustard' }],
  },
  {
    id: 'biscoff',
    code: 'f',
    kind: 'drink',
    name: 'Biscoff matcha',
    note: 'Cookie butter swirled through, crumbs on top.',
    price: 185,
    paper: 'mustard',
    tags: [{ label: 'Sweet tooth', tone: 'bubblegum' }],
  },
  {
    id: 'coconut',
    code: 'k',
    kind: 'drink',
    name: 'Coconut matcha',
    note: 'Creamy coconut milk and matcha. Dairy-free.',
    price: 175,
    paper: 'mint',
    tags: [{ label: 'Dairy-free', tone: 'mint' }],
  },
  {
    id: 'dirty',
    code: 'd',
    kind: 'drink',
    name: 'Dirty matcha',
    note: 'Matcha latte with a shot of espresso. For long days.',
    price: 180,
    paper: 'mustard',
    tags: [{ label: 'Extra kick', tone: 'tomato' }],
  },
  {
    id: 'hojicha',
    code: 'h',
    kind: 'drink',
    name: 'Hojicha latte',
    note: 'Roasted green tea. Toasty, nutty, low in caffeine.',
    price: 155,
    paper: 'mustard',
    tags: [{ label: 'Low caffeine', tone: 'ink' }],
  },
  {
    id: 'choco-banana',
    code: 'b',
    kind: 'drink',
    name: 'Choco banana frappe',
    note: 'Blended banana, dark chocolate and a cloud of cream.',
    price: 165,
    paper: 'pink',
    tags: [{ label: 'No matcha', tone: 'mustard' }],
  },

  // Snacks
  {
    id: 'dubai-cookie',
    code: 'y',
    kind: 'snack',
    name: 'Dubai chewy cookie',
    note: 'Pistachio cream and crispy kunafa inside a soft chocolate cookie.',
    price: 160,
    paper: 'mint',
    tags: [{ label: 'Viral', tone: 'tomato' }],
  },
  {
    id: 'revel-bar',
    code: 'r',
    kind: 'snack',
    name: 'Revel bar',
    note: 'Oat crumble bar with a thick layer of fudge.',
    price: 85,
    paper: 'mustard',
    tags: [{ label: 'Bestseller', tone: 'mint' }],
  },
  {
    id: 'choco-chip',
    code: 'o',
    kind: 'snack',
    name: 'Choco chip cookie',
    note: 'Crispy edges, gooey middle, a pinch of sea salt.',
    price: 75,
    paper: 'mustard',
    tags: [{ label: 'Classic', tone: 'ink' }],
  },
  {
    id: 'matcha-cookie',
    code: 'w',
    kind: 'snack',
    name: 'Matcha white choco cookie',
    note: 'Matcha dough studded with white chocolate chunks.',
    price: 85,
    paper: 'mint',
    tags: [{ label: 'Matcha', tone: 'mint' }],
  },
  {
    id: 'crinkles',
    code: 'n',
    kind: 'snack',
    name: 'Matcha crinkles',
    note: 'Soft and fudgy, rolled in powdered sugar. Pack of 3.',
    price: 65,
    paper: 'mint',
    tags: [{ label: 'Pack of 3', tone: 'periwinkle' }],
  },
  {
    id: 'mochi-brownie',
    code: 'x',
    kind: 'snack',
    name: 'Mochi brownie',
    note: 'Fudgy brownie with a chewy mochi layer.',
    price: 95,
    paper: 'pink',
    tags: [{ label: 'Chewy', tone: 'bubblegum' }],
  },
  {
    id: 'ube-pandesal',
    code: 'p',
    kind: 'snack',
    name: 'Ube cheese pandesal',
    note: 'Pillowy ube bread with a melty cheese middle.',
    price: 55,
    paper: 'pink',
    tags: [{ label: 'Warm', tone: 'mustard' }],
  },
  {
    id: 'ensaymada',
    code: 'e',
    kind: 'snack',
    name: 'Ensaymada',
    note: 'Buttery brioche swirl, sugar and grated cheese on top.',
    price: 70,
    paper: 'mustard',
    tags: [{ label: 'Merienda', tone: 'periwinkle' }],
  },
]

export const findItem = (id) => menu.find((d) => d.id === id)
export const isDrink = (id) => findItem(id)?.kind === 'drink'

export const milks = ['Fresh milk', 'Oat milk', 'Soy milk']
export const sweetness = ['No sugar', 'Less sweet', 'Regular']
export const DEFAULT_MILK = milks[0]
export const DEFAULT_SUGAR = sweetness[1]

// Snack-only orders skip the whisk.
export const drinkSteps = ['Ordered', 'Whisking', 'Pouring', 'Ready']
export const snackSteps = ['Ordered', 'Warming up', 'Plating', 'Ready']

export const peso = (n) => `₱${n}`

export const fortunes = [
  'Something sweet is coming your way. Less sweet, but still sweet.',
  'Today you are 100% that matcha girlie (or boy, or cup).',
  'A friend is about to message you. Reply with a matcha emoji.',
  'Your vibe today: frothy, calm and slightly caffeinated.',
  'Good things take time. So does whisking. Kaya mo yan!',
  'You will find a cute café you have never tried. Go!',
  'Treat yourself. Then treat a friend. Then treat yourself again.',
  'Your next good idea will arrive somewhere between sip 3 and sip 5.',
  'A cookie a day keeps the sungit away.',
  'Someone is thinking of you right now. Probably while eating a revel bar.',
]
