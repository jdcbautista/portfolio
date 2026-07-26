import { cn } from '@/shared/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-contrast hover:bg-brand-hover',
  secondary:
    'border border-border bg-surface-raised text-text hover:bg-surface',
  ghost: 'text-muted hover:bg-surface hover:text-text',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

/**
 * Shared button styling. A plain function so the same look can be applied to a
 * `<Link>` or `<a>` (navigation) without nesting a `<button>` inside them.
 */
export function buttonStyles(opts?: {
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  className?: string | undefined
}): string {
  const { variant = 'primary', size = 'md', className } = opts ?? {}
  return cn(base, variants[variant], sizes[size], className)
}
