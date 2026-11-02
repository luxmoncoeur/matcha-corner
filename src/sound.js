import { useState } from 'react'

const KEY = 'matcha-corner:sound'

const load = () => {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

// Plop sounds stay off until someone turns them on, then the choice is remembered in this browser.
export function useSoundSetting() {
  const [sound, setSound] = useState(load)

  const save = (next) => {
    setSound(next)
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off')
    } catch {
      // Private mode or storage full: the switch still works until the page closes.
    }
  }

  return [sound, save]
}
