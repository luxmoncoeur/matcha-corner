import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  Buddy,
  Button,
  CloseIcon,
  CopyIcon,
  Count,
  Doodle,
  EmptyState,
  Heading,
  IconButton,
  LinkIcon,
  NumberStepper,
  PlopProvider,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SoundIcon,
  StatusDot,
  StatusTimeline,
  StickyNote,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TextField,
  TicketCard,
  WordSticker,
  toast,
  useHaptics,
} from '@plop-ui/react'
import Cookie from './Cookie'
import Cup from './Cup'
import Customize from './Customize'
import Drawer from './Drawer'
import Splash from './Splash'
import StampCard from './StampCard'
import { readLastOrder, saveLastOrder, useSavedCart } from './cart'
import {
  defaultOptions,
  describeLine,
  drinkSteps,
  findItem,
  fortunes,
  isDrink,
  lineKey,
  linePrice,
  menu,
  milksFor,
  peso,
  sizes,
  snackSteps,
  sweetness,
  unitPrice,
} from './menu'
import { MAX_QTY, clearSharedOrder, orderTotal, readSharedOrder, shareUrl } from './share'
import { useSoundSetting } from './sound'
import { useStampCard } from './stamps'

const STEP_MS = 2600
// Whisking waits longer on its own, so helping out actually speeds things up.
const WHISK_STEP_MS = 9000
const WHISKS_NEEDED = 12
const WHISKING = drinkSteps.indexOf('Whisking')
const BITES = 5
const tilts = [-1.5, 1, -0.5, 1.5, -1, 0.5]
const drinks = menu.filter((d) => d.kind === 'drink')
const snacks = menu.filter((d) => d.kind === 'snack')

const nextOrderNo = () => 100 + Math.floor(Math.random() * 900)
const pickFortune = () => fortunes[Math.floor(Math.random() * fortunes.length)]
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
const countItems = (lines) => lines.reduce((sum, line) => sum + line.qty, 0)
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const hasDrinks = (lines) => lines.some((line) => isDrink(line.id))
const stepsFor = (lines) => (hasDrinks(lines) ? drinkSteps : snackSteps)
// Cart lines get a `uid` so React can track them while their options change.
let nextUid = 1
const newLine = (id, qty, options) => ({ uid: nextUid++, id, qty, ...options })
const withUid = (line) => ({ uid: nextUid++, ...line })
// Lines that ended up the same (e.g. split off, then changed back) become one before the order goes out.
const mergeLines = (lines) =>
  lines.reduce((out, line) => {
    const same = out.find((l) => lineKey(l) === lineKey(line))
    if (same) same.qty += line.qty
    else out.push({ ...line })
    return out
  }, [])
const sizeOptions = sizes.map((s) => ({ value: s.name, label: s.extra ? `${s.name} +${peso(s.extra)}` : s.name }))
const sugarOptions = sweetness.map((s) => ({ value: s, label: s }))
// Waits a frame so a section that is about to appear exists before we scroll to it.
// The tray sits beside the menu on wide screens; below this it becomes a bottom drawer.
const WIDE = '(min-width: 960px)'
const watchWide = (cb) => {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const isWide = () => window.matchMedia(WIDE).matches
const scrollTo = (id) =>
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))

function ReceiptLines({ lines }) {
  return (
    <ul className="receipt">
      {lines.map((line) => (
        <li key={lineKey(line)}>
          {line.qty}× {findItem(line.id).name}
          {describeLine(line) && <span className="receipt-detail">{describeLine(line)}</span>}
        </li>
      ))}
    </ul>
  )
}

function Receipt({ order }) {
  return (
    <>
      <ReceiptLines lines={order.lines} />
      {order.discount > 0 && <p className="receipt-free">1 free drink from your stamp card (−{peso(order.discount)})</p>}
      {order.kind === 'gift' ? (
        <p className="receipt-total">Paid by {order.name || 'a friend'} ♥</p>
      ) : (
        <p className="receipt-total">
          <span>Total</span>
          <strong>{peso(order.total)}</strong>
        </p>
      )}
    </>
  )
}

function MenuGrid({ items, onAdd }) {
  return (
    <ul className="menu">
      {items.map((item, i) => (
        <li key={item.id}>
          <StickyNote tone={item.paper} tilt={tilts[i % tilts.length]} footer={peso(item.price)}>
            <h3 className="drink-name">{item.name}</h3>
            <p className="drink-note">{item.note}</p>
            <div className="drink-foot">
              <div className="tags">
                {item.tags.map((t) => (
                  <Tag key={t.label} tone={t.tone} seed={item.id + t.label}>
                    {t.label}
                  </Tag>
                ))}
              </div>
              <Button size="sm" variant="mint" burst="hearts" onClick={() => onAdd(item.id)}>
                Add
                <span className="sr-only"> {item.name}</span>
              </Button>
            </div>
          </StickyNote>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  const [cart, setCart] = useSavedCart(withUid)
  // What was ordered last time, for the one-tap "Order it again" in the empty tray.
  const [last, setLast] = useState(readLastOrder)
  // The cart line whose options are open for changing (one at a time keeps the tray short).
  const [editing, setEditing] = useState(null)
  // The drink being customized in the overlay, before it goes in the cart.
  const [customizing, setCustomizing] = useState(null)
  const [tab, setTab] = useState('drinks')
  const wide = useSyncExternalStore(watchWide, isWide)
  const [cartOpen, setCartOpen] = useState(false)
  const [name, setName] = useState('')
  const [forFriend, setForFriend] = useState(false)
  const [to, setTo] = useState('')
  const [note, setNote] = useState('')
  // kind: 'self' (my order), 'treat' (I'm sending it to a friend), 'gift' (a friend sent it to me)
  const [order, setOrder] = useState(null)
  const [step, setStep] = useState(0)
  const [whisks, setWhisks] = useState(0)
  const [bites, setBites] = useState(0)
  const [fortune, setFortune] = useState(null)
  const [gift, setGift] = useState(() => readSharedOrder())
  const card = useStampCard()
  const [sound, setSound] = useSoundSetting()
  // App renders its own PlopProvider, so this reads the kit default: haptics on (phones only).
  const haptics = useHaptics()

  const lines = cart
  const items = countItems(lines)
  const cartHasDrinks = hasDrinks(lines)
  // The free cup covers the cheapest drink in the cart, size included.
  const drinkPrices = lines.filter((line) => isDrink(line.id)).map(unitPrice)
  const discount = card.freeCups > 0 && drinkPrices.length > 0 ? Math.min(...drinkPrices) : 0
  const total = orderTotal(lines) - discount

  const atBar = order !== null && order.kind !== 'treat'
  const steps = order ? stepsFor(order.lines) : drinkSteps
  const orderHasDrinks = order !== null && hasDrinks(order.lines)
  // A treat is a gift, so the friend doesn't have to work for it: the barista whisks it on their own.
  const canHelpWhisk = orderHasDrinks && order.kind !== 'gift'
  const ready = atBar && step === steps.length - 1
  const finished = bites >= BITES

  // Walk the order through the bar, one step at a time. Treats wait for the friend to open them.
  useEffect(() => {
    if (!atBar || step >= steps.length - 1) return
    const wait = canHelpWhisk && step === WHISKING ? WHISK_STEP_MS : STEP_MS
    const t = window.setTimeout(() => setStep((s) => s + 1), wait)
    return () => window.clearTimeout(t)
  }, [atBar, step, steps, canHelpWhisk])

  useEffect(() => {
    if (!ready) return
    const message = order.kind === 'gift' ? 'Your treat is ready!' : `Order #${order.no} is ready at the counter`
    toast.success(message, { buddy: 'congrats', burst: true })
    haptics.success()
  }, [ready, order, haptics])

  const atMax = (id) => {
    if (countItems(cart.filter((line) => line.id === id)) < MAX_QTY) return false
    toast(`That's the most we can make of one item (${MAX_QTY})`)
    return true
  }

  // One more on the line with exactly these options, or a new line for them.
  const add = (id, options = defaultOptions(id)) => {
    if (atMax(id)) return
    const key = lineKey({ id, ...options })
    setCart((c) => {
      const at = c.findIndex((line) => lineKey(line) === key)
      return at === -1
        ? [...c, newLine(id, 1, options)]
        : c.map((line, i) => (i === at ? { ...line, qty: line.qty + 1 } : line))
    })
  }

  // Drinks open the customize overlay first; snacks have nothing to pick, so they go straight in.
  const pick = (id) => {
    if (!isDrink(id)) return add(id)
    if (!atMax(id)) setCustomizing(id)
  }
  const addCustomized = (id, options) => {
    add(id, options)
    setCustomizing(null)
    haptics.success()
    toast.success(`${findItem(id).name} added`)
  }
  const remove = (uid) => setCart((c) => c.filter((line) => line.uid !== uid))
  const openCart = () => (wide ? scrollTo('tray-heading') : setCartOpen(true))
  // The same item can sit on several lines (different milk or size); together they stay under MAX_QTY.
  const roomFor = (line) => MAX_QTY - countItems(cart.filter((l) => l.id === line.id && l.uid !== line.uid))
  // The row unmounts, so focus goes to the tray heading instead of getting lost.
  const removeLine = (uid) => {
    remove(uid)
    document.getElementById('tray-head')?.focus()
  }
  const orderAgain = () => {
    setCart(last.map(withUid))
    toast.success('Your last order is back in the tray')
  }
  const change = (uid, patch) => setCart((c) => c.map((line) => (line.uid === uid ? { ...line, ...patch } : line)))

  const startAtBar = (next) => {
    setOrder(next)
    setStep(0)
    setWhisks(0)
    setBites(0)
    setFortune(null)
  }

  const placeOrder = () => {
    if (discount > 0) card.redeemFreeCup()
    const base = { no: nextOrderNo(), name: name.trim(), lines: mergeLines(lines), total, discount }
    saveLastOrder(base.lines)
    setLast(base.lines)
    if (forFriend) {
      startAtBar({ ...base, kind: 'treat', to: to.trim(), note: note.trim() })
      toast.success(`Treat ready! Send the link to ${to.trim() || 'your friend'}.`, { burst: 'hearts' })
    } else {
      startAtBar({ ...base, kind: 'self' })
      toast(cartHasDrinks ? 'Order placed. Whisking soon!' : 'Order placed. Warming it up!')
    }
    setCart([])
    setNote('')
    setCartOpen(false)
    scrollTo('tracker-heading')
  }

  const openGift = () => {
    startAtBar({ ...gift, kind: 'gift' })
    setGift(null)
    clearSharedOrder()
    toast(`Yay! ${gift.name || 'Your friend'}'s treat is on its way.`)
    scrollTo('tracker-heading')
  }

  const treatBack = () => {
    setForFriend(true)
    if (order.kind === 'gift') {
      setTo(order.name)
      setName(order.to)
    }
    setOrder(null)
    scrollTo('menu-heading')
  }

  const whisk = () => {
    const next = whisks + 1
    setWhisks(next)
    if (next >= WHISKS_NEEDED) {
      setStep(WHISKING + 1)
      haptics.success()
      toast.success('So frothy! Thanks for the help.', { burst: true })
    }
  }

  const bite = () => {
    const next = bites + 1
    setBites(next)
    if (next < BITES) return
    setFortune(pickFortune())
    haptics.success()
    const stamps = countItems(order.lines)
    const earned = card.addStamps(stamps)
    if (earned > 0) toast.success('Stamp card full! Your next drink is free.', { buddy: 'congrats', burst: true })
    else toast(`+${plural(stamps, 'stamp')} on your card`)
  }

  const orderAnother = () => {
    setOrder(null)
    setStep(0)
    scrollTo('menu-heading')
  }

  const link = () => shareUrl(order)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link())
      toast.success('Link copied. Send it to your friend!')
    } catch {
      toast.error("Couldn't copy the link. Try the share button instead.")
    }
  }

  const shareLink = () =>
    navigator
      .share({ title: 'Matcha corner', text: `A little treat for ${order.to || 'you'}!`, url: link() })
      .catch(() => {})

  const sipWord = orderHasDrinks ? 'Sip' : 'Bite'

  const tray = (
    <PlopProvider surface="notebook" toaster={false} className="tray" role={wide ? 'complementary' : undefined} aria-labelledby="tray-heading">
      <div className="tray-head" id="tray-head" tabIndex={-1}>
        <Heading level={2} id="tray-heading" scribble={false}>
          Your order
        </Heading>
        {items > 0 && <Count label={plural(items, 'item')}>{items}</Count>}
        {!wide && (
          <IconButton
            icon={<CloseIcon />}
            label="Close your order"
            size="sm"
            variant="plain"
            onClick={() => setCartOpen(false)}
          />
        )}
      </div>

      {lines.length === 0 ? (
        <>
          <EmptyState>Nothing here yet. Add a drink or a snack from the menu.</EmptyState>
          {last.length > 0 && (
            <Button variant="plain" onClick={orderAgain} className="order-again">
              Order my last one again ({plural(countItems(last), 'item')})
            </Button>
          )}
        </>
      ) : (
        <>
          <ul className="lines">
            {lines.map((line) => {
              const item = findItem(line.id)
              const choices = milksFor(line.id)
              return (
                <li key={line.uid}>
                  <div className="line-row">
                    <span className="line-name">{item.name}</span>
                    <NumberStepper
                      label={`${item.name} quantity`}
                      hideLabel
                      size="sm"
                      min={1}
                      max={roomFor(line)}
                      value={line.qty}
                      onValueChange={(qty) => change(line.uid, { qty })}
                      onRemove={() => removeLine(line.uid)}
                      removeLabel={`Remove ${item.name}`}
                      removedMessage={`${item.name} removed`}
                    />
                    <span>{peso(linePrice(line))}</span>
                  </div>
                  {isDrink(line.id) && (
                    <div className="line-summary">
                      <span>
                        {describeLine(line)}
                        {choices.length === 0 && ' · no milk'}
                      </span>
                      <Button
                        size="sm"
                        variant="plain"
                        aria-expanded={editing === line.uid}
                        aria-controls={`options-${line.uid}`}
                        onClick={() => setEditing(editing === line.uid ? null : line.uid)}
                      >
                        {editing === line.uid ? 'Done' : 'Change'}
                        <span className="sr-only"> {item.name}</span>
                      </Button>
                    </div>
                  )}
                  {isDrink(line.id) && editing === line.uid && (
                    <div className="line-options" id={`options-${line.uid}`}>
                      {choices.length > 1 && (
                        <Select
                          label="Milk"
                          size="sm"
                          options={choices.map((m) => ({ value: m, label: m }))}
                          value={line.milk}
                          onValueChange={(milk) => change(line.uid, { milk })}
                        />
                      )}
                      <Select
                        label="Sweetness"
                        size="sm"
                        options={sugarOptions}
                        value={line.sugar}
                        onValueChange={(sugar) => change(line.uid, { sugar })}
                      />
                      <Select
                        label="Size"
                        size="sm"
                        options={sizeOptions}
                        value={line.size}
                        onValueChange={(size) => change(line.uid, { size })}
                      />
                      {choices.length === 1 && <p className="line-fixed">Always made with {choices[0].toLowerCase()}.</p>}
                      {choices.length === 0 && <p className="line-fixed">Made without milk.</p>}
                    </div>
                  )}
                </li>
              )
            })}
            {discount > 0 && (
              <li className="free-line">
                <div className="line-row">
                  <span className="line-name">♥ Free drink from your stamp card</span>
                  <span />
                  <span>−{peso(discount)}</span>
                </div>
              </li>
            )}
          </ul>

          <RadioGroup
            legend="Who's it for?"
            value={forFriend ? 'friend' : 'me'}
            onValueChange={(v) => setForFriend(v === 'friend')}
          >
            <Radio value="me" dotColor="var(--plop-mint)">
              For me
            </Radio>
            <Radio value="friend" dotColor="var(--plop-bubblegum)">
              A treat for a friend
            </Radio>
          </RadioGroup>

          {forFriend ? (
            <>
              <TextField label="Friend's name" value={to} maxLength={24} onChange={(e) => setTo(e.target.value)} />
              <TextField
                label="From"
                hint="Your name, so they know who it's from."
                value={name}
                maxLength={24}
                autoComplete="given-name"
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Little note"
                hint="Optional. It shows on a sticky note."
                placeholder="Para sa'yo, enjoy!"
                value={note}
                maxLength={80}
                onChange={(e) => setNote(e.target.value)}
              />
            </>
          ) : (
            <TextField
              label="Name on your order"
              hint="Optional."
              value={name}
              maxLength={24}
              autoComplete="given-name"
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <p className="total">
            <span>Total</span>
            <strong>{peso(total)}</strong>
          </p>
          <Button size="lg" variant="mint" buddy burst onClick={placeOrder} className="place">
            {forFriend ? 'Send treat' : 'Place order'}
          </Button>
        </>
      )}

      <StampCard stamps={card.stamps} freeCups={card.freeCups} />
    </PlopProvider>
  )
  // One short status for the nav and the phone bar, so the order can be found from anywhere on the page.
  const status = !order ? null : order.kind === 'treat' ? 'Treat link ready' : ready ? 'Ready!' : `${steps[step]}…`
  const showBar = items > 0 || order !== null

  return (
    <PlopProvider surface="poster" theme="light" sound={sound} className={showBar ? 'page has-bar' : 'page'}>
      <Splash />
      <nav className="topnav" aria-label="Main">
        <a href="#top" className="topnav-brand">
          Matcha corner
        </a>
        <ul>
          <li>
            <a href="#menu-heading">Menu</a>
          </li>
          <li>
            <a
              href="#tray-heading"
              onClick={(e) => {
                if (wide) return
                e.preventDefault()
                setCartOpen(true)
              }}
            >
              Order {items > 0 && <Count size="sm" label={plural(items, 'item')}>{items}</Count>}
            </a>
          </li>
          {status && (
            <li className="topnav-status">
              <a href="#tracker-heading">
                <StatusDot tone={ready || order.kind === 'treat' ? 'online' : 'busy'}>{status}</StatusDot>
              </a>
            </li>
          )}
        </ul>
      </nav>
      <header id="top" className="masthead">
        <WordSticker tone="mint" size={72} tilt={-3} style={{ fontSize: 'clamp(40px, 11vw, 72px)' }}>
          Matcha corner
        </WordSticker>
        <p className="lede">
          A tiny café for matcha lovers. Pick a drink and a little snack, help whisk, and get a fortune at the end. Or
          send it as a treat to your barkada.
        </p>
        <Switch checked={sound} onCheckedChange={setSound} className="sound-switch">
          <SoundIcon off={!sound} /> Plop sounds
        </Switch>
        <Doodle kind="sparkle" tone="mustard" size={44} tilt={12} className="masthead-doodle" />
        <Doodle kind="heart" tone="bubblegum" size={34} tilt={-10} className="masthead-heart" />
      </header>

      {gift && (
        <section className="shared" aria-labelledby="shared-heading">
          <Heading level={2} id="shared-heading">
            {gift.to ? `Hi ${gift.to}!` : 'Hi!'} This order is for you
          </Heading>
          <div className="shared-body">
            <TicketCard title={`A treat from ${gift.name || 'a friend'}`} stub="For you" tilt={1}>
              <ReceiptLines lines={gift.lines} />
            </TicketCard>
            <div className="shared-actions">
              {gift.note && (
                <StickyNote tone="pink" tilt={-2} className="paper-note" footer={`— ${gift.name || 'your friend'}`}>
                  <p className="note-text">{gift.note}</p>
                </StickyNote>
              )}
              <p>{gift.name || 'Your friend'} already paid, so it's all yours. Open it to watch it get made.</p>
              <Button
                size="lg"
                variant="mint"
                buddy
                buddyMood="congrats"
                burst="hearts"
                onClick={openGift}
                className="open-treat"
              >
                Open my treat
              </Button>
            </div>
          </div>
        </section>
      )}

      <main className="layout">
        <section aria-labelledby="menu-heading">
          <Heading level={2} id="menu-heading">
            Today's menu
          </Heading>
          <Tabs value={tab} onValueChange={setTab} className="menu-tabs">
            <TabList label="Menu">
              <Tab value="drinks">Drinks</Tab>
              <Tab value="snacks">Snacks</Tab>
            </TabList>
            <TabPanel value="drinks">
              <MenuGrid items={drinks} onAdd={pick} />
            </TabPanel>
            <TabPanel value="snacks">
              <MenuGrid items={snacks} onAdd={pick} />
            </TabPanel>
          </Tabs>
        </section>

        {wide && tray}
      </main>

      {order?.kind === 'treat' && (
        <section className="tracker" aria-labelledby="tracker-heading">
          <Heading level={2} id="tracker-heading">
            Your treat for {order.to || 'your friend'} is ready to send!
          </Heading>
          <div className="tracker-body">
            <TicketCard
              title={`For ${order.to || 'a friend'}`}
              meta={order.name ? `From ${order.name}` : undefined}
              stub="Treat"
              tilt={-1}
            >
              <Receipt order={order} />
            </TicketCard>
            <div className="share">
              {order.note && (
                <StickyNote tone="pink" tilt={-2} className="paper-note" footer={`— ${order.name || 'you'}`}>
                  <p className="note-text">{order.note}</p>
                </StickyNote>
              )}
              <p>
                Send this link to {order.to || 'your friend'}. When they open it, the order is theirs: they watch it get
                made live and get a fortune at the end. No work on their side.
              </p>
              <div className="share-buttons">
                <Button variant="mint" iconLeft={<CopyIcon />} burst="hearts" onClick={copyLink}>
                  Copy link
                </Button>
                {canShare && (
                  <Button variant="periwinkle" iconLeft={<LinkIcon />} onClick={shareLink}>
                    Share
                  </Button>
                )}
                <Button variant="plain" onClick={orderAnother}>
                  Order another
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {atBar && (
        <section className="tracker" aria-labelledby="tracker-heading">
          <Heading level={2} id="tracker-heading">
            {ready ? "Here's your order!" : 'At the counter'}
          </Heading>
          <div className="tracker-body">
            <TicketCard
              title={order.kind === 'gift' ? `A treat from ${order.name || 'a friend'}` : `Order #${order.no}`}
              meta={(order.kind === 'gift' ? order.to : order.name) || undefined}
              stub={ready ? 'Ready' : steps[step]}
              tilt={-1}
            >
              <Receipt order={order} />
            </TicketCard>

            <div className="progress">
              {!ready && <StatusTimeline steps={[...steps]} current={step} label="Order progress" />}
              <div className="barista" aria-live="polite">
                <Buddy mood={ready ? 'congrats' : 'thinking'} size="md" />
                <p>{ready ? 'Enjoy! Kain na.' : `${steps[step]}…`}</p>
              </div>
              {canHelpWhisk && step === WHISKING && (
                <div className="whisk">
                  <p>The barista could use a hand. Tap to whisk!</p>
                  <Progress
                    label="Froth"
                    value={whisks}
                    max={WHISKS_NEEDED}
                    valueText={`${whisks} of ${WHISKS_NEEDED} whisks`}
                    tone="mint"
                  />
                  <Button variant="mustard" onClick={whisk}>
                    Whisk!
                  </Button>
                </div>
              )}
              {ready && (
                <div className="after">
                  <div className="sip-card">
                    {orderHasDrinks ? <Cup level={1 - bites / BITES} /> : <Cookie left={1 - bites / BITES} />}
                    {finished ? (
                      <StickyNote tone="mint" tilt={1.5} className="paper-note" footer="Your matcha fortune">
                        <p className="note-text">{fortune}</p>
                      </StickyNote>
                    ) : (
                      <>
                        <p>Tap to {sipWord.toLowerCase()}. Finish it to get a fortune and a stamp.</p>
                        <Button variant="periwinkle" burst="hearts" onClick={bite}>
                          {sipWord} ({BITES - bites} left)
                        </Button>
                      </>
                    )}
                  </div>

                  {finished && (
                    <div className="share">
                      <Heading level={3} scribble={false}>
                        {order.kind === 'gift' ? 'Pay it back?' : 'Share the love?'}
                      </Heading>
                      <p>
                        {order.kind === 'gift'
                          ? `Send ${order.name || 'your friend'} a treat back. They'll get their own link to open.`
                          : 'Treat a friend. They get a link that opens their very own order.'}
                      </p>
                      <div className="share-buttons">
                        <Button variant="mint" burst="hearts" onClick={treatBack}>
                          {order.kind === 'gift' ? `Treat ${order.name || 'them'} back` : 'Treat a friend'}
                        </Button>
                        <Button variant="plain" onClick={orderAnother}>
                          Order another
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </section>
      )}

      {!wide && cartOpen && (
        <Drawer label="Your order" onClose={() => setCartOpen(false)}>
          {tray}
        </Drawer>
      )}

      {customizing && <Customize id={customizing} onAdd={addCustomized} onClose={() => setCustomizing(null)} />}

      <footer className="foot">Matcha corner is a pretend café made with love and PlopUI. No real orders are placed.</footer>

      {showBar && (
        <div className="cart-bar">
          {items > 0 ? (
            <>
              <span className="cart-bar-text">
                <strong>{plural(items, 'item')}</strong> · {peso(total)}
              </span>
              <Button size="sm" variant="mint" onClick={openCart}>
                View order
              </Button>
            </>
          ) : (
            <>
              <span className="cart-bar-text">
                <strong>{order.kind === 'treat' ? 'Treat' : order.kind === 'gift' ? 'Your treat' : `#${order.no}`}</strong> ·{' '}
                {status}
              </span>
              <Button size="sm" variant="mint" onClick={() => scrollTo('tracker-heading')}>
                Track
              </Button>
            </>
          )}
        </div>
      )}
    </PlopProvider>
  )
}
