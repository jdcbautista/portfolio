import { useEffect, useRef } from 'react'

/**
 * Declarative setInterval (the Dan Abramov pattern). The latest `callback` is
 * always invoked without resetting the timer, and passing `delay = null`
 * pauses it. Perfect for an auto-advancing carousel you can pause on hover.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = window.setInterval(() => saved.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}
