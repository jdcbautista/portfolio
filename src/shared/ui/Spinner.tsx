import { cn } from '@/shared/lib/cn'

/** Accessible loading indicator used in Suspense fallbacks. */
export function Spinner({
  className,
  label = 'Loading',
}: {
  className?: string
  label?: string
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <span
        className={cn(
          'size-5 animate-spin rounded-full border-2 border-border border-t-brand',
          className,
        )}
      />
      <span className="sr-only">{label}…</span>
    </span>
  )
}
