import { useTheme } from '@/shared/theme'
import { cn } from '@/shared/lib/cn'

/** Sun/moon toggle for light ⇄ dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface-raised text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span aria-hidden="true" className="text-base">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
