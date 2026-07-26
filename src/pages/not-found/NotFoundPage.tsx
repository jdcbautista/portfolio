import { Link } from 'react-router-dom'
import { buttonStyles, Container } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-text">
        Page not found
      </h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className={buttonStyles({ className: 'mt-6' })}>
        Back to work
      </Link>
    </Container>
  )
}
