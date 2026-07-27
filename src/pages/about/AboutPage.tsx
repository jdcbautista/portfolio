import { Container } from '@/shared/ui'

export function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-text">About</h1>

        <p className="text-muted">
          I&rsquo;m a Site Reliability Engineer who came up through design. For
          fifteen years the work has been the same at its core: make things
          people can rely on — first for clients as an artist and founder, now
          for engineering teams in the cloud.
        </p>

        <p className="text-muted">
          Today that&rsquo;s reliability and platform work at Enova — keeping a
          large automation platform calm and dependable — and building AI agents
          for operations with the controls that make them trustworthy: guardrails,
          policy gates, and an audit trail. I care more about systems that stay
          boring than tools that look clever.
        </p>

        <p className="text-muted">
          Before all that I founded a visual-arts studio, taught, and served as
          a U.S. Marine. That design instinct and Marine Corps steadiness still
          shape how I build and how I explain it. Based in Chicago.
        </p>
      </div>
    </Container>
  )
}
