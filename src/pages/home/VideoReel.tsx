import { Container } from '@/shared/ui'
import { site } from '@/config/site'

/**
 * The video container. Drop an mp4/webm URL into `site.video.src` and it becomes
 * a real player; until then it renders a designed placeholder so the section
 * holds its shape. (On the GitHub profile, video comes from an mp4 attached to
 * a release; here it's a first-class <video>.)
 */
export function VideoReel() {
  const { src, poster, title, caption } = site.video

  return (
    <section className="border-b border-border bg-surface-raised/30">
      <Container className="py-16 sm:py-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">Watch</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text">
              {title}
            </h2>
          </div>
          <p className="max-w-xs text-right text-sm text-muted">{caption}</p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
          {src ? (
            <video
              className="h-full w-full"
              controls
              playsInline
              preload="metadata"
              poster={poster ?? undefined}
            >
              <source src={src} />
              Your browser doesn’t support embedded video.
            </video>
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#161b22] to-[#0d1117]">
              {/* animated concentric rings behind the play glyph */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="absolute h-40 w-40 animate-ping rounded-full border border-white/10" />
                <span className="absolute h-64 w-64 rounded-full border border-white/5" />
              </div>
              <div className="relative flex flex-col items-center gap-4">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-white/5 backdrop-blur">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 translate-x-0.5 text-white"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <p className="text-sm font-medium tracking-wide text-white/60">
                  Reel coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
