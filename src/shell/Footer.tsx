import { Container } from '@/shared/ui'
import { site } from '@/config/site'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <Container className="flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted sm:flex-row">
        <p>Built with React, Vite &amp; Tailwind.</p>
        {site.socials.length > 0 && (
          <nav className="flex items-center gap-4" aria-label="Social links">
            {site.socials.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </Container>
    </footer>
  )
}
