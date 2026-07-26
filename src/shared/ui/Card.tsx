import { cn } from '@/shared/lib/cn'

/** Surface container with border + subtle elevation. */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface-raised shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
