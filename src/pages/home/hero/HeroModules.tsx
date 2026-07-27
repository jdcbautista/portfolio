import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { buttonStyles } from '@/shared/ui'
import { site } from '@/config/site'
import { heroModules } from './registry'

/**
 * The hero splash: a container that holds the enabled canvas modules and lets
 * you switch between them with the left/right buttons (or ← → keys). Each module
 * is its own R3F canvas (or embedded canvas). Disabling a module (e.g. `demo`)
 * just removes it from the rotation — the container stays.
 */
export function HeroModules() {
  const modules = heroModules.filter((m) => m.enabled)
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const count = modules.length

  const go = useCallback(
    (dir: number) => count && setActive((i) => (i + dir + count) % count),
    [count],
  )

  // ← / → select the canvas while the hero is hovered or focused.
  useEffect(() => {
    if (count <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const el = sectionRef.current
      if (!el || (!el.matches(':hover') && !el.contains(document.activeElement)))
        return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      e.preventDefault()
      go(e.key === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, go])

  const edgeArrow =
    'absolute top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-200 hover:opacity-100 hover:bg-white/20 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none'

  const current = modules[active]

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured canvases"
      className="relative min-h-[78vh] w-full overflow-hidden border-b border-border bg-bg"
    >
      {current ? (
        <Suspense fallback={null}>
          <div key={current.id} className="absolute inset-0">
            <current.component />
          </div>
        </Suspense>
      ) : (
        <div className="grid min-h-[78vh] place-items-center text-sm text-muted">
          No canvas enabled — enable a module in the hero registry.
        </div>
      )}

      {/* Copy overlay — pointer-events off so canvas drag/orbit falls through. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
        <div className="w-full pl-20 pr-4">
          <div className="w-[clamp(17rem,34vw,28rem)] rounded-2xl bg-gradient-to-br from-black/45 via-black/30 to-black/15 p-5 shadow-2xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-md backdrop-saturate-150">
            <p className="mb-2 text-[0.7rem] font-semibold tracking-widest text-brand">
              Site Reliability Engineer, Instructor &amp; Designer
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Turn complex ideas into working systems.
            </h1>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">
              <p>
                Whether you need a product, prototype, or pipeline, I&apos;ll help you
                turn your ideas into something real.
              </p>
              <p>
                I&apos;m passionate about designing, building, and operating reliable
                systems and tools that scale. And as a U.S. Marine Corps veteran, I
                carry the Corps&apos; core values of honor, courage, and commitment to
                every partnership and every challenge we take on together.
              </p>
            </div>
            {/* one row: social bubbles + "See the work" centered in the leftover space */}
            <div className="pointer-events-auto mt-4 flex items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {site.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-white/50 hover:text-white"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-1 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className={buttonStyles({ className: 'px-3.5 py-1.5 text-xs shadow-lg' })}
                >
                  See the work →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          {/* left 8% edge strip -> left arrow */}
          <div className="peer/le absolute inset-y-0 left-0 z-10 w-[8%]" aria-hidden="true" />
          <button type="button" onClick={() => go(-1)} className={cn(edgeArrow, 'left-4 peer-hover/le:opacity-60')} aria-label="Previous canvas">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          {/* right 8% edge strip -> right arrow */}
          <div className="peer/re absolute inset-y-0 right-0 z-10 w-[8%]" aria-hidden="true" />
          <button type="button" onClick={() => go(1)} className={cn(edgeArrow, 'right-4 peer-hover/re:opacity-60')} aria-label="Next canvas">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          {/* module indicator dots */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Select canvas">
            {modules.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={m.name}
                onClick={() => setActive(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                  i === active ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
