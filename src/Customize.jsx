import { useEffect, useRef, useState } from 'react'
import { Button, CloseIcon, IconButton, Radio, RadioGroup, Sheet } from '@plop-ui/react'
import { defaultOptions, findItem, milksFor, peso, sizes, sweetness, unitPrice } from './menu'

// PlopUI has no dialog yet, so this is a native <dialog> (like PlopUI's CommandPalette): showModal()
// keeps focus inside and Escape closes it. Focus goes back to the Add button afterwards.
export default function Customize({ id, onAdd, onClose }) {
  const ref = useRef(null)
  const item = findItem(id)
  const [options, setOptions] = useState(() => defaultOptions(id))
  const set = (patch) => setOptions((o) => ({ ...o, ...patch }))
  const choices = milksFor(id)

  useEffect(() => {
    const dialog = ref.current
    // React removes the dialog before the browser would hand focus back, so do it here.
    const opener = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      opener?.focus?.()
    }
  }, [])

  const add = (e) => {
    e.preventDefault()
    onAdd(id, options)
  }

  return (
    <dialog
      ref={ref}
      className="customize"
      aria-labelledby="customize-title"
      // Escape fires `cancel`; let React own closing so state and the dialog stay in step.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Sheet tape={item.paper === 'pink' ? 'bubblegum' : item.paper} className="customize-sheet">
        <form onSubmit={add} className="customize-form">
          <div className="customize-head">
            <div>
              <h2 id="customize-title" className="customize-title">
                {item.name}
              </h2>
              <p className="customize-note">{item.note}</p>
            </div>
            <IconButton icon={<CloseIcon />} label="Close" size="sm" variant="plain" onClick={onClose} />
          </div>

          {choices.length > 1 ? (
            <RadioGroup legend="Milk" vertical={false} value={options.milk} onValueChange={(milk) => set({ milk })}>
              {choices.map((m) => (
                <Radio key={m} value={m} dotColor="var(--plop-mint)">
                  {m}
                </Radio>
              ))}
            </RadioGroup>
          ) : (
            <p className="customize-fixed">
              {choices.length === 1 ? `Always made with ${choices[0].toLowerCase()}.` : 'Made without milk.'}
            </p>
          )}

          <RadioGroup legend="Sweetness" vertical={false} value={options.sugar} onValueChange={(sugar) => set({ sugar })}>
            {sweetness.map((s) => (
              <Radio key={s} value={s} dotColor="var(--plop-bubblegum)">
                {s}
              </Radio>
            ))}
          </RadioGroup>

          <RadioGroup legend="Size" vertical={false} value={options.size} onValueChange={(size) => set({ size })}>
            {sizes.map((s) => (
              <Radio key={s.name} value={s.name} dotColor="var(--plop-mustard)">
                {s.name} {s.extra > 0 && <span className="customize-extra">+{peso(s.extra)}</span>}
              </Radio>
            ))}
          </RadioGroup>

          <div className="customize-actions">
            <Button type="button" variant="plain" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="mint">
              Add to order · {peso(unitPrice({ id, ...options }))}
            </Button>
          </div>
        </form>
      </Sheet>
    </dialog>
  )
}
