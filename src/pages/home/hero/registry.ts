import { lazy } from 'react'
import type { HeroModuleConfig } from './types'

/**
 * The modular hero registry. Add a module here; flip `enabled` to show it.
 * Each module lazy-loads its own canvas; the hero container cycles the enabled
 * ones via the left/right arrows and dots.
 *
 * id 0 — "demo": the original 3D card carousel (Hero3D), disabled.
 * ids 2-4 — template canvases: marble-sokoban, marble-tactics, art-gallery.
 * ids 5-7 — rt-v6 visualizers rebuilt natively (plain three.js, no ported
 *           scaffolding): rt-smorb (orb), rt-tunnel, rt-gol (Game of Life).
 */
export const heroModules: HeroModuleConfig[] = [
  {
    id: 0,
    name: 'demo',
    enabled: false,
    component: lazy(() =>
      import('../Hero3D').then((m) => ({ default: m.Hero3D })),
    ),
    camera: { position: [0, 0.4, 6.2], fov: 42 },
    controls: 'own',
    params: {},
  },
  {
    id: 2,
    name: 'marble-sokoban',
    enabled: true,
    component: lazy(() => import('./modules/marble-sokoban')),
    controls: 'own',
    params: {},
  },
  {
    id: 3,
    name: 'marble-tactics',
    enabled: true,
    component: lazy(() => import('./modules/marble-tactics')),
    controls: 'own',
    params: {},
  },
  {
    id: 4,
    name: 'art-gallery',
    enabled: true,
    component: lazy(() => import('./modules/art-gallery')),
    controls: 'own',
    params: {},
  },
  {
    id: 5,
    name: 'rt-smorb',
    enabled: true,
    component: lazy(() => import('./modules/rt-smorb')),
    controls: 'shared',
    params: {},
  },
  {
    id: 6,
    name: 'rt-tunnel',
    enabled: true,
    component: lazy(() => import('./modules/rt-tunnel')),
    controls: 'shared',
    params: {},
  },
  {
    id: 7,
    name: 'rt-gol',
    enabled: true,
    component: lazy(() => import('./modules/rt-gol')),
    controls: 'shared',
    params: {},
  },
]
