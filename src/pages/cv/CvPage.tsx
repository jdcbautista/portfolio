import { buttonStyles, Container } from '@/shared/ui'
import { cv } from '@/config/cv'
import type { CvRole } from '@/config/cv'

/** Section wrapper with a small uppercase heading, matching the résumé's rhythm. */
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-brand">
        {title}
      </h2>
      <div className="mt-4 space-y-6 border-t border-border pt-4">{children}</div>
    </section>
  )
}

/** A dated block: org/title on the left, period on the right, bullets below. */
function RoleBlock({ role }: { role: CvRole }) {
  return (
    <div className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="font-semibold text-text">{role.org}</h3>
          <p className="text-sm text-muted">
            {role.title} · {role.location}
          </p>
        </div>
        <p className="shrink-0 text-sm tabular-nums text-muted">{role.period}</p>
      </div>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-brand/60">
        {role.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  )
}

export function CvPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-text">
              {cv.name}
            </h1>
            <p className="mt-1 text-sm text-muted">{cv.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <a
                href={`mailto:${cv.contact.email}`}
                className="hover:text-text"
              >
                {cv.contact.email}
              </a>
              <span aria-hidden="true">·</span>
              <span>{cv.contact.phone}</span>
              <span aria-hidden="true">·</span>
              <span>{cv.contact.location}</span>
              {cv.contact.links.map((link) => (
                <span key={link.href} className="flex items-center gap-3">
                  <span aria-hidden="true">·</span>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-text"
                  >
                    {link.label}
                  </a>
                </span>
              ))}
            </div>
          </div>
          <a
            href={cv.resumeHref}
            download
            className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'print:hidden' })}
          >
            Download résumé
          </a>
        </header>

        <Section title="Summary">
          <div className="space-y-3 border-t-0 pt-0">
            {cv.summary.map((p, i) => (
              <p key={i} className="text-sm text-muted">
                {p}
              </p>
            ))}
          </div>
        </Section>

        <Section title="Core Expertise">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[max-content_1fr]">
            {cv.skills.map((group) => (
              <div
                key={group.label}
                className="sm:contents"
              >
                <dt className="text-sm font-semibold text-text">
                  {group.label}
                </dt>
                <dd className="text-sm text-muted">{group.items}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Professional Experience">
          {cv.experience.map((role) => (
            <RoleBlock key={role.org} role={role} />
          ))}
        </Section>

        <Section title="Selected Engineering Projects">
          {cv.projects.map((project) => (
            <div key={project.title} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-text">{project.title}</h3>
                <p className="shrink-0 text-sm tabular-nums text-muted">
                  {project.period}
                </p>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-brand/60">
                {project.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="Additional Experience">
          {cv.additional.map((role) => (
            <RoleBlock key={role.org} role={role} />
          ))}
        </Section>

        <Section title="Volunteer & Community">
          {cv.volunteer.map((role) => (
            <RoleBlock key={role.org} role={role} />
          ))}
        </Section>

        <div className="grid gap-x-10 sm:grid-cols-2">
          <Section title="Certifications">
            <ul className="space-y-2 text-sm">
              {cv.certifications.map((c, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-muted">{c.primary}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {c.period}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Education">
            <ul className="space-y-3 text-sm">
              {cv.education.map((e, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4">
                  <span>
                    <span className="font-medium text-text">{e.primary}</span>
                    {e.secondary ? (
                      <span className="block text-muted">{e.secondary}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {e.period}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </Container>
  )
}
