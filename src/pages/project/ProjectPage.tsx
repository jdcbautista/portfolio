import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, buttonStyles, Card, Container, Spinner } from '@/shared/ui'
import { getProject } from '@/projects/registry'
import { NotFoundPage } from '../not-found/NotFoundPage'

export function ProjectPage() {
  const { slug = '' } = useParams()
  const project = getProject(slug)

  // Unknown slug → reuse the 404 view rather than crashing the route.
  if (!project) return <NotFoundPage />

  const { meta, Component } = project

  return (
    <Container className="py-10 sm:py-14">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        ← Back to work
      </Link>

      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          {meta.title}
        </h1>
        <p className="mt-3 text-muted">{meta.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {meta.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        {meta.links && meta.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {meta.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Live demo only when the project ships one; case studies are the copy above. */}
      {Component && (
        <Card className="mt-8 p-5 sm:p-7">
          <div
            className="mb-5 text-xs font-medium uppercase tracking-wide text-muted"
            aria-hidden="true"
          >
            Live demo
          </div>
          <Suspense
            fallback={
              <div className="grid place-items-center py-16">
                <Spinner label={`Loading ${meta.title}`} />
              </div>
            }
          >
            <Component />
          </Suspense>
        </Card>
      )}
    </Container>
  )
}
