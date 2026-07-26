import type { ReactNode } from 'react'
import { useElementSize } from '@/shared/hooks/useElementSize'

// The preview renders its children at this fixed "desktop" size and scales the
// whole stage down to fit the frame — like a live screenshot. Because the size
// is fixed and overflow is clipped, the frame keeps a constant aspect ratio no
// matter how tall the individual app is, so swapping previews never jumps.
const DESIGN_W = 1040
const DESIGN_H = 720

export function PreviewFrame({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const [ref, { width }] = useElementSize<HTMLDivElement>()
  const scale = width ? width / DESIGN_W : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl shadow-black/10 dark:shadow-black/40">
      {/* Faux browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-yellow-400/80" />
        <span className="size-2.5 rounded-full bg-green-400/80" />
        <span className="ml-3 truncate font-mono text-[11px] text-muted">
          {label}
        </span>
      </div>

      {/* Scaled stage */}
      <div
        ref={ref}
        className="relative w-full overflow-hidden bg-bg"
        style={
          scale
            ? { height: DESIGN_H * scale }
            : { aspectRatio: `${DESIGN_W} / ${DESIGN_H}` }
        }
      >
        <div
          // `inert` keeps the scaled snapshot out of tab order and the
          // accessibility tree — it's a visual preview, not real controls.
          inert
          className="pointer-events-none absolute left-0 top-0 origin-top-left select-none"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
          }}
        >
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
