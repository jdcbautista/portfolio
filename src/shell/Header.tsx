import { Link, NavLink } from 'react-router-dom'
import { Container } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { site } from '@/config/site'
import { ThemeToggle } from './ThemeToggle'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-surface text-text' : 'text-muted hover:text-text',
  )

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-lg bg-brand text-brand-contrast text-sm font-bold"
          >
            ◆
          </span>
          <span>{site.name}</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" end className={navLinkClass}>
            Work
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <ThemeToggle className="ml-1" />
        </nav>
      </Container>
    </header>
  )
}
