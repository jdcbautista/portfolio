/**
 * Dependency-free color helpers for Color Lab.
 * All functions are pure so they're trivially testable.
 */

export interface Hsl {
  h: number
  s: number
  l: number
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

export function hexToHsl(hex: string): Hsl | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const int = parseInt(match[1], 16)
  const r = ((int >> 16) & 255) / 255
  const g = ((int >> 8) & 255) / 255
  const b = (int & 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sN = clamp(s, 0, 100) / 100
  const lN = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lN - c / 2
  const [r, g, b] = (() => {
    if (h < 60) return [c, x, 0]
    if (h < 120) return [x, c, 0]
    if (h < 180) return [0, c, x]
    if (h < 240) return [0, x, c]
    if (h < 300) return [x, 0, c]
    return [c, 0, x]
  })()
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Build an evenly spaced lightness scale around a base color. */
export function buildScale(base: Hsl, steps = 9): Array<{ step: number; hex: string; l: number }> {
  const out = []
  for (let i = 0; i < steps; i++) {
    // Spread lightness from ~95% (lightest) down to ~12% (darkest).
    const l = Math.round(95 - (i * (95 - 12)) / (steps - 1))
    out.push({ step: (i + 1) * 100, hex: hslToHex({ ...base, l }), l })
  }
  return out
}

/** Relative luminance (WCAG) used to pick black/white text over a swatch. */
export function readableTextColor(hex: string): '#000000' | '#ffffff' {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return '#000000'
  const int = parseInt(match[1], 16)
  const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  return lum > 0.4 ? '#000000' : '#ffffff'
}
