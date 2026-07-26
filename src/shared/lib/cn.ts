/**
 * Tiny classname combiner — joins truthy string/array class values.
 * Kept dependency-free on purpose; the app has no need for `clsx`/`tailwind-merge`.
 */
export type ClassValue = string | number | false | null | undefined | ClassValue[]

export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const value of values) {
    if (!value) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }
  return out.join(' ')
}
