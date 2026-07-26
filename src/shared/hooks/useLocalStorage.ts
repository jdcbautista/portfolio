import { useCallback, useEffect, useState } from 'react'

/**
 * State synced to localStorage. Generic and side-effect-safe:
 * - lazily reads the initial value (no work on every render),
 * - tolerates JSON parse errors and unavailable storage,
 * - stays in sync across tabs via the `storage` event.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof localStorage === 'undefined') return initialValue
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return
      try {
        setValue(JSON.parse(e.newValue) as T)
      } catch {
        /* ignore malformed cross-tab payloads */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const reset = useCallback(
    () => setValue(initialValue),
    [initialValue],
  )

  return [value, setValue, reset] as const
}
