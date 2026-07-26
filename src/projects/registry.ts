import { lazy } from 'react'
import type { ComponentType } from 'react'
import type { ProjectModule } from './types'

// Metadata is imported eagerly (tiny) so the gallery renders with no waterfall.
import { meta as colorLab } from './color-lab/meta'
import { meta as taskBoard } from './task-board/meta'
import type { ProjectMeta } from './types'

type Importer = () => Promise<{ default: ComponentType }>

/**
 * Raw entries pair metadata with a dynamic importer. Keeping the importer
 * addressable lets us both `lazy()` it AND prefetch it on idle (see
 * `prefetchProjects`), so the hero carousel can swap previews instantly.
 *
 * To add a new app: create `src/projects/<slug>/` with a `meta.ts` and an
 * `index.tsx` default export, then add one line here. Nothing else changes.
 */
const entries: ReadonlyArray<{ meta: ProjectMeta; load: Importer }> = [
  { meta: colorLab, load: () => import('./color-lab') },
  { meta: taskBoard, load: () => import('./task-board') },
]

export const projects: readonly ProjectModule[] = entries.map((entry) => ({
  meta: entry.meta,
  Component: lazy(entry.load),
  load: entry.load,
}))

export function getProject(slug: string): ProjectModule | undefined {
  return projects.find((project) => project.meta.slug === slug)
}

/** Warm every project's code-split chunk (call from an idle callback). */
export function prefetchProjects(): void {
  for (const project of projects) {
    void project.load().catch(() => {
      /* prefetch is best-effort; a failure just means a lazy load later */
    })
  }
}
