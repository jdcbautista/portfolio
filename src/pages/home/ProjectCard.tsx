import { Link } from 'react-router-dom'
import { Badge, Card } from '@/shared/ui'
import type { ProjectMeta } from '@/projects/types'

/** Gallery tile linking to a project's detail page. */
export function ProjectCard({ meta }: { meta: ProjectMeta }) {
  return (
    <Card className="group overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      <Link
        to={`/projects/${meta.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        {/* Accent banner gives each project a distinct identity. */}
        <div
          className="h-28 w-full"
          style={{
            background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}88)`,
          }}
          aria-hidden="true"
        />
        <div className="space-y-3 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-semibold text-text">{meta.title}</h3>
            <span className="text-xs text-muted">{meta.year}</span>
          </div>
          <p className="text-sm text-muted">{meta.tagline}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meta.tags.slice(0, 3).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  )
}
