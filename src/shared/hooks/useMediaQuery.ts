import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query. SSR-safe and tear-free via
 * `useSyncExternalStore`. Returns `false` on the server / before hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }

  const getSnapshot = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches

  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Convenience: true on viewports typically considered "desktop". */
export const usePrefersDesktop = () => useMediaQuery('(min-width: 768px)')
