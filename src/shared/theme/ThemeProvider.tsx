import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ThemeContext,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeContextValue,
} from './context'

type Preference = Theme | 'system'

function readStoredPreference(): Preference {
  if (typeof localStorage === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<Preference>(
    readStoredPreference,
  )
  const [systemValue, setSystemValue] = useState<Theme>(systemTheme)

  // Track the OS preference while the user is in "system" mode.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemValue(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const theme: Theme = preference === 'system' ? systemValue : preference

  // Reflect the resolved theme onto <html> for Tailwind's `.dark` variant.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  const setPreference = useCallback((next: Preference) => {
    setPreferenceState(next)
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPreference])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference, toggle }),
    [theme, preference, setPreference, toggle],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
