import { useEffect, useRef } from 'react'

// A bottom sheet on a native <dialog>, like Customize: showModal() keeps focus inside, Escape and the
// backdrop close it, and focus goes back to whatever opened it.
export default function Drawer({ label, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      opener?.focus?.()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </dialog>
  )
}
