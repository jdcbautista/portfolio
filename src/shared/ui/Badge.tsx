import { cn } from '@/shared/lib/cn'

/** Small pill used for tech tags. */
export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted',
        className,
      )}
      {...props}
    />
  )
}
