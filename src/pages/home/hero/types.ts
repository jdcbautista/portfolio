import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * One hero module = one self-contained R3F canvas plus its config.
 * Every module component owns its own <Canvas> and exports a default config
 * of this shape, which the registry composes into the modular hero.
 */
export type HeroModuleConfig = {
  id: number
  name: string
  enabled: boolean
  /** The module's canvas component (lazy-loaded). */
  component: LazyExoticComponent<ComponentType>
  /** Optional framing hints. */
  aspect?: number
  camera?: { position: [number, number, number]; fov: number }
  /** 'shared' modules (e.g. rt-v6's three) drive a single shared control panel. */
  controls?: 'none' | 'own' | 'shared'
  /** Module-specific parameters; each module defines its own shape. */
  params?: Record<string, unknown>
}
