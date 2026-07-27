import { lazy } from 'react'
import type { ComponentType } from 'react'
import type { ProjectMeta, ProjectModule } from './types'

// Toy-demo metadata (kept, but disabled below).
import { meta as colorLab } from './color-lab/meta'
import { meta as taskBoard } from './task-board/meta'

/**
 * Case studies — real work, described rather than embedded. Infra and AI
 * platform projects have no React demo to run, so they're cards + detail pages,
 * not live previews. Keep these modest and true; add links only for public,
 * polished repos.
 */
const caseStudies: ProjectMeta[] = [
  {
    slug: 'k8s-node-console',
    title: 'Kubernetes Node Console',
    tagline:
      'Self-service terminal access to nodes, where exec is otherwise blocked.',
    description:
      'A deploy-ready, Helm-packaged terminal-console template that gives ' +
      'engineers controlled exec access to Kubernetes nodes. Reused across ' +
      '12+ shared modular services spanning four internal brands, alongside ' +
      'the node-provisioning and bastion-host access patterns I coached teams ' +
      'through.',
    tags: ['Kubernetes', 'Helm', 'Platform', 'Self-service'],
    accent: '#4c8bf5',
    year: 2025,
  },
  {
    slug: 'ai-control-plane',
    title: 'AI Control Plane',
    tagline:
      'Shared agent memory, model routing, and policy enforcement — observable end to end.',
    description:
      'A control plane for multi-agent systems: shared memory, model-provider ' +
      'routing, and policy gates, with OpenTelemetry → Prometheus → Grafana ' +
      'observability, backed by Graphiti and Neo4j.',
    tags: ['Multi-agent', 'MCP', 'OpenTelemetry', 'Neo4j'],
    accent: '#a371f7',
    year: 2025,
  },
  {
    slug: 'incident-copilot',
    title: 'Incident Copilot',
    tagline: 'Triages production incidents and drafts the post-incident report.',
    description:
      'An AI agent for production incident support that integrates Slack, ' +
      'Datadog, Splunk, Jira, and Repomix — with guardrails and an audit trail ' +
      'so it stays in bounds.',
    tags: ['AI Ops', 'Datadog', 'Splunk', 'Guardrails'],
    accent: '#e0533d',
    year: 2025,
  },
  {
    slug: 'automation-self-serve',
    title: 'Automation Self-Serve',
    tagline:
      'Non-engineers ship engineer-approved fixes as batch jobs — in minutes.',
    description:
      'A front-end for our internal automation platform that lets 250+ ' +
      'non-technical representatives self-serve engineer-developed interim ' +
      'fixes, cutting delivery from hours or days to minutes under an approval ' +
      'model.',
    tags: ['Platform', 'Self-service', 'Reliability'],
    accent: '#3fb950',
    year: 2024,
  },
]

type Importer = () => Promise<{ default: ComponentType }>
interface Entry {
  meta: ProjectMeta
  enabled: boolean
  load?: Importer
}

/**
 * The registry. Flip `enabled` to show/hide. Case studies have no `load`;
 * live demos do. To add a case study: append to `caseStudies`. To add a live
 * app: create `src/projects/<slug>/` with `meta.ts` + `index.tsx` and add an
 * entry with its importer.
 */
const entries: ReadonlyArray<Entry> = [
  ...caseStudies.map((meta) => ({ meta, enabled: true })),
  { meta: colorLab, enabled: false, load: () => import('./color-lab') },
  { meta: taskBoard, enabled: false, load: () => import('./task-board') },
]

export const projects: readonly ProjectModule[] = entries
  .filter((entry) => entry.enabled)
  .map((entry) => {
    // Omit Component/load entirely for case studies (exactOptionalPropertyTypes
    // forbids assigning `undefined` to an optional property).
    const mod: ProjectModule = { meta: entry.meta }
    if (entry.load) {
      mod.Component = lazy(entry.load)
      mod.load = entry.load
    }
    return mod
  })

export function getProject(slug: string): ProjectModule | undefined {
  return projects.find((project) => project.meta.slug === slug)
}

/** Warm every live demo's code-split chunk (call from an idle callback). */
export function prefetchProjects(): void {
  for (const project of projects) {
    if (!project.load) continue
    void project.load().catch(() => {
      /* prefetch is best-effort; a failure just means a lazy load later */
    })
  }
}
