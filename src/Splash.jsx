import { useEffect, useState } from 'react'
import { useReducedMotion } from '@plop-ui/react'
import Storefront from './Storefront'

const KEY = 'matcha-corner:splash'
const SHOW_MS = 2200

// Once per visit (sessionStorage), so a refresh mid-order doesn't replay it.
const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// The café pops up and its steam curls. Decorative only: the page underneath is already
// there for screen readers, and any tap or key skips it.
export default function Splash() {
  const reduced = useReducedMotion()
  const [show, setShow] = useState(() => !seen())
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!show) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // Private mode: it just plays again next visit.
    }
    if (reduced) return
    const leave = window.setTimeout(() => setLeaving(true), SHOW_MS)
    const skip = () => setLeaving(true)
    window.addEventListener('keydown', skip)
    return () => {
      window.clearTimeout(leave)
      window.removeEventListener('keydown', skip)
    }
  }, [show, reduced])

  // Reduced motion: no splash at all, straight to the menu.
  if (!show || reduced) return null

  return (
    <div
      className={leaving ? 'splash is-leaving' : 'splash'}
      aria-hidden="true"
      onClick={() => setLeaving(true)}
      onAnimationEnd={(e) => e.animationName === 'splash-out' && setShow(false)}
    >
      <Storefront size={260} className="splash-store" />
      <p className="splash-tag">Whisking your table…</p>
    </div>
  )
}
