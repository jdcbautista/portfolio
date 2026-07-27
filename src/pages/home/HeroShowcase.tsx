import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonStyles, Container, Spinner } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { site } from '@/config/site'
import { projects, prefetchProjects } from '@/projects/registry'
import { useInterval } from '@/shared/hooks/useInterval'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { PreviewFrame } from './PreviewFrame'

// Selectable auto-advance speeds. `ms: null` turns autoplay off entirely.
const SPEEDS = [
  { label: 'Off', ms: null },
  { label: 'Slow', ms: 12000 },
  { label: 'Normal', ms: 7000 },
  { label: 'Fast', ms: 4000 },
] as const
const DEFAULT_SPEED = 2 // "Normal"

const slug = (title: string) => title.toLowerCase().replace(/\s+/g, '-')

export function HeroShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(DEFAULT_SPEED)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  // Only projects that ship a live demo belong in this preview carousel; case
  // studies have nothing to embed. If none are enabled, the section renders null.
  const previewable = projects.filter((p) => p.Component)
  const count = previewable.length

  const go = useCallback(
    (index: number) => setActive(((index % count) + count) % count),
    [count],
  )

  // Auto-advance unless paused, reduced-motion, speed is Off, or nothing to cycle.
  const cycleMs = SPEEDS[speedIdx].ms
  const autoplay = !paused && !reduceMotion && count > 1 && cycleMs !== null
  useInterval(() => go(active + 1), autoplay ? cycleMs : null)

  // Left/right arrow keys step the carousel — but only while it's hovered or
  // focused, so we never hijack the page's normal arrow-key scrolling.
  useEffect(() => {
    if (count <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const el = sectionRef.current
      if (!el) return
      const engaged = el.matches(':hover') || el.contains(document.activeElement)
      if (!engaged) return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      e.preventDefault()
      go(e.key === 'ArrowLeft' ? active - 1 : active + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, count, go])

  // Close the speed menu on outside click or Escape.
  useEffect(() => {
    if (!settingsOpen) return
    const onPointer = (e: PointerEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) setSettingsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  // Warm every preview chunk on idle so swaps are instant after first paint.
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number
    }
    if (w.requestIdleCallback) w.requestIdleCallback(() => prefetchProjects())
    else {
      const t = window.setTimeout(prefetchProjects, 1200)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [])

  const current = previewable[active]
  if (!current) return null
  const Preview = current.Component

  const iconBtn =
    'inline-grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-raised/70 text-muted transition-colors hover:text-text hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

  // Hover-reveal arrows overlaid on the canvas edges, vertically centered.
  const overlayBtn =
    'absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface-raised/85 text-text shadow-lg backdrop-blur transition-opacity duration-200 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none'

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured projects"
      className="relative overflow-hidden border-b border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Accent glow that shifts to the active project's color. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: current.meta.accent, opacity: 0.16 }}
      />

      <Container className="relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        {/* Left: copy + live-updating project blurb + controls */}
        <div>
          <p className="mb-3 text-sm font-medium text-brand">{site.role}</p>
          <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            {site.headline}
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">{site.intro}</p>

          <div
            key={current.meta.slug}
            className="mt-8 animate-fade-in rounded-2xl border border-border bg-surface-raised/70 p-5 backdrop-blur"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Now showing
            </p>
            <h2 className="mt-1 text-xl font-semibold text-text">
              {current.meta.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{current.meta.tagline}</p>
            <Link
              to={`/projects/${current.meta.slug}`}
              className={buttonStyles({ className: 'mt-4' })}
            >
              Explore {current.meta.title} →
            </Link>
          </div>

          {/* Controls: dot indicators + a speed selector. (Prev/next live as
              hover-reveal arrows overlaid on the preview canvas.) */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose a featured project">
              {previewable.map((project, index) => {
                const isActive = index === active
                return (
                  <button
                    key={project.meta.slug}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show ${project.meta.title}`}
                    onClick={() => go(index)}
                    className={cn(
                      'h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                      isActive ? 'w-8 bg-brand' : 'w-2 bg-border hover:bg-muted',
                    )}
                  />
                )
              })}
            </div>

            {/* Speed selector */}
            <div className="relative ml-auto" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={iconBtn}
                aria-haspopup="menu"
                aria-expanded={settingsOpen}
                aria-label={`Scroll speed: ${SPEEDS[speedIdx].label}`}
                title="Scroll speed"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {settingsOpen && (
                <div
                  role="menu"
                  aria-label="Scroll speed"
                  className="absolute right-0 z-10 mt-2 w-36 rounded-xl border border-border bg-surface-raised p-1 shadow-lg"
                >
                  <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted">
                    Scroll speed
                  </p>
                  {SPEEDS.map((s, i) => {
                    const isSel = i === speedIdx
                    return (
                      <button
                        key={s.label}
                        type="button"
                        role="menuitemradio"
                        aria-checked={isSel}
                        onClick={() => {
                          setSpeedIdx(i)
                          setSettingsOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSel ? 'font-medium text-brand' : 'text-text hover:bg-border/40',
                        )}
                      >
                        {s.label}
                        {isSel && (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: the cycling live preview. Only the active app is mounted.
            `group` so the edge arrows reveal on hover of the whole canvas. */}
        <div
          className={cn(
            'group relative',
            !reduceMotion && 'motion-safe:animate-float',
          )}
        >
          <PreviewFrame label={`${slug(current.meta.title)}.app`}>
            <div key={current.meta.slug} className="animate-fade-in">
              <Suspense
                fallback={
                  <div className="grid place-items-center py-24">
                    <Spinner label={`Loading ${current.meta.title}`} />
                  </div>
                }
              >
                {Preview && <Preview />}
              </Suspense>
            </div>
          </PreviewFrame>

          <button
            type="button"
            onClick={() => go(active - 1)}
            className={cn(overlayBtn, 'left-3')}
            aria-label="Previous project"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            className={cn(overlayBtn, 'right-3')}
            aria-label="Next project"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </Container>
    </section>
  )
}
