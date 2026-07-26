import { Container } from '@/shared/ui'
import { projects } from '@/projects/registry'
import { Hero3D } from './Hero3D'
import { VideoReel } from './VideoReel'
import { HeroShowcase } from './HeroShowcase'
import { ProjectCard } from './ProjectCard'

export function HomePage() {
  return (
    <>
      <Hero3D />
      <VideoReel />
      <HeroShowcase />

      <Container id="work" className="py-14 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-text">
            All work
          </h2>
          <p className="text-sm text-muted">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(({ meta }) => (
            <ProjectCard key={meta.slug} meta={meta} />
          ))}
        </div>
      </Container>
    </>
  )
}
