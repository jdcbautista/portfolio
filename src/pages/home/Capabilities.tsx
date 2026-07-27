import type { ReactNode } from 'react'
import { Container } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

/**
 * Interim section that sits between the hero and the work grid while the video
 * reel is parked. A "What I do" capabilities band — the conventional way to
 * establish context/credibility above a projects grid. Edit the two arrays
 * below to retune; drop this back for <VideoReel /> in HomePage once a reel
 * exists.
 */
interface Capability {
  kicker: string
  title: string
  body: string
  accent: string
  icon: ReactNode
}

const CAPABILITIES: Capability[] = [
  {
    kicker: 'Reliability',
    title: 'Cloud & platform ops',
    body: 'Keeping production calm — incident response, observability, and the internal tooling that makes on-call boring. AWS, Terraform, and automation over heroics.',
    accent: '#e0533d',
    icon: (
      <path d="M4 13a8 8 0 0 1 16 0M2 13h2m16 0h2M12 5V3M6.3 6.3 4.9 4.9m12.8 1.4 1.4-1.4M12 13l4-3" />
    ),
  },
  {
    kicker: 'AI Ops',
    title: 'Agents that stay in bounds',
    body: 'Designing multi-agent delivery systems with guardrails — retrieval, evaluation, and orchestration that stay predictable instead of clever.',
    accent: '#4c8bf5',
    icon: (
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M7.5 7.5 9 9m6 6 1.5 1.5m0-9L15 9m-6 6-1.5 1.5M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    ),
  },
  {
    kicker: 'Craft',
    title: 'Design & instruction',
    body: 'A decade of design before engineering, now teaching veterans to code at Code Platoon. Interfaces with intent, docs that actually get read.',
    accent: '#3fb950',
    icon: (
      <path d="m12 3 2.2 4.6L19 8.3l-3.5 3.4.8 4.9L12 14.3 7.7 16.6l.8-4.9L5 8.3l4.8-.7L12 3Z" />
    ),
  },
]

const STACK = [
  'AWS',
  'Terraform',
  'Python',
  'TypeScript',
  'React',
  'PostgreSQL',
  'Datadog',
  'Grafana',
  'Docker',
  'Bash',
  'Neo4j',
]

export function Capabilities() {
  return (
    <section className="border-b border-border bg-surface-raised/30">
      <Container className="py-16 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">What I do</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text">
              Reliable systems, built and taught
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-muted sm:block">
            Three threads that run through every project below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 shadow-sm transition-colors hover:border-muted/50"
            >
              {/* accent glow, tinted per capability */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 opacity-40 group-hover:opacity-70"
                style={{ backgroundColor: c.accent }}
              />
              <div className="relative">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl border"
                  style={{
                    borderColor: `${c.accent}55`,
                    backgroundColor: `${c.accent}1a`,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke={c.accent}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {c.icon}
                  </svg>
                </span>
                <p
                  className="mt-4 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: c.accent }}
                >
                  {c.kicker}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-text">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* tech row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-widest text-muted">
            Stack
          </span>
          {STACK.map((tech, i) => (
            <span
              key={tech}
              className={cn(
                'rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted',
                i === 0 && 'ml-0',
              )}
            >
              {tech}
            </span>
          ))}
        </div>
      </Container>
    </section>
  )
}
