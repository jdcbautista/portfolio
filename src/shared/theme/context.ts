import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  /** User's explicit choice, or 'system' when following the OS. */
  preference: Theme | 'system'
  setPreference: (preference: Theme | 'system') => void
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

export const THEME_STORAGE_KEY = 'portfolio:theme'
