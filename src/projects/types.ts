import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * Metadata for a showcased app. This is intentionally lightweight and eagerly
 * imported so the gallery can render instantly — the heavy demo component is
 * loaded separately and lazily (see `registry.ts`).
 */
export interface ProjectMeta {
  /** URL-safe id; also the route segment (`/projects/:slug`). */
  slug: string
  title: string
  /** One-line hook shown on the gallery card. */
  tagline: string
  /** Longer description shown on the project detail page. */
  description: string
  /** Tech tags. */
  tags: string[]
  /** Accent color (any CSS color) used for the card's visual identity. */
  accent: string
  year: number
  /** Optional external links (live site, source, case study). */
  links?: ReadonlyArray<{ label: string; href: string }>
}

/** A registry entry: metadata + a code-split demo component. */
export interface ProjectModule {
  meta: ProjectMeta
  Component: LazyExoticComponent<ComponentType>
  /** Triggers the underlying dynamic import — used for idle prefetching. */
  load: () => Promise<unknown>
}
