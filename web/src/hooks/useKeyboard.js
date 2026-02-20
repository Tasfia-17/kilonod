import { useEffect } from 'react'

export function useKeyboard({ enabled, onApprove, onReject, onTimed }) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        onApprove()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        onReject()
      } else if (e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const minutes = [1, 5, 15, 30, 60, 120, 240, 480, 1440][parseInt(e.key) - 1]
        onTimed(minutes)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, onApprove, onReject, onTimed])
}
