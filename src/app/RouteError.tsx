import { Link, useRouteError } from 'react-router-dom'
import { buttonStyles, Container } from '@/shared/ui'

/** Router-level error boundary — catches render/loader errors per route. */
export function RouteError() {
  const error = useRouteError()
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <Container className="py-24 text-center">
      <h1 className="text-2xl font-semibold text-text">Something broke</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">{message}</p>
      <Link to="/" className={buttonStyles({ className: 'mt-6' })}>
        Back to safety
      </Link>
    </Container>
  )
}
