import { Container } from '@/shared/ui'

export function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-text">About</h1>
        <p className="text-muted">
          This portfolio is a Vite + React + TypeScript app. Each showcased
          project is an isolated feature module that's code-split and loaded on
          demand, so the initial page stays small and fast.
        </p>
        <p className="text-muted">
          Styling is Tailwind CSS driven by a small set of semantic design
          tokens, which is what makes light/dark theming a one-line change.
          Replace this copy with your own story.
        </p>
      </div>
    </Container>
  )
}
