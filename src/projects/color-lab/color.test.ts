import { describe, it, expect } from 'vitest'
import {
  buildScale,
  hexToHsl,
  hslToHex,
  readableTextColor,
} from './color'

describe('hexToHsl', () => {
  it('parses black and white', () => {
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 })
    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('parses a saturated hue and tolerates a missing #', () => {
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 })
    expect(hexToHsl('00ff00')).toEqual({ h: 120, s: 100, l: 50 })
  })

  it('returns null for invalid input', () => {
    expect(hexToHsl('nope')).toBeNull()
    expect(hexToHsl('#fff')).toBeNull() // shorthand not supported
    expect(hexToHsl('#12345g')).toBeNull()
  })
})

/** Max per-channel difference between two hex colors (0–255). */
function channelDelta(a: string, b: string): number {
  const parse = (h: string) => {
    const n = parseInt(h.replace('#', ''), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  return Math.max(Math.abs(ar - br), Math.abs(ag - bg), Math.abs(ab - bb))
}

describe('hslToHex', () => {
  it('round-trips exactly for pure primary colors', () => {
    for (const hex of ['#ff0000', '#00ff00', '#0000ff']) {
      const hsl = hexToHsl(hex)
      expect(hsl).not.toBeNull()
      expect(hslToHex(hsl!)).toBe(hex)
    }
  })

  it('round-trips arbitrary colors within integer-rounding tolerance', () => {
    // HSL is stored as integers, so recovery is near-exact, not bit-exact.
    for (const hex of ['#4f46e5', '#0ea5e9', '#c026d3']) {
      const hsl = hexToHsl(hex)
      expect(hsl).not.toBeNull()
      expect(channelDelta(hslToHex(hsl!), hex)).toBeLessThanOrEqual(3)
    }
  })

  it('clamps out-of-range lightness', () => {
    expect(hslToHex({ h: 0, s: 0, l: 200 })).toBe('#ffffff')
    expect(hslToHex({ h: 0, s: 0, l: -50 })).toBe('#000000')
  })
})

describe('buildScale', () => {
  it('produces the requested number of evenly labelled steps', () => {
    const scale = buildScale({ h: 240, s: 80, l: 50 })
    expect(scale).toHaveLength(9)
    expect(scale.map((s) => s.step)).toEqual([
      100, 200, 300, 400, 500, 600, 700, 800, 900,
    ])
  })

  it('goes from light to dark (descending lightness)', () => {
    const scale = buildScale({ h: 240, s: 80, l: 50 })
    const lightness = scale.map((s) => s.l)
    const sorted = [...lightness].sort((a, b) => b - a)
    expect(lightness).toEqual(sorted)
    expect(lightness[0]).toBeGreaterThan(lightness.at(-1)!)
  })
})

describe('readableTextColor', () => {
  it('picks dark text on light backgrounds and vice versa', () => {
    expect(readableTextColor('#ffffff')).toBe('#000000')
    expect(readableTextColor('#000000')).toBe('#ffffff')
    expect(readableTextColor('#f5f5f5')).toBe('#000000')
    expect(readableTextColor('#1b1593')).toBe('#ffffff')
  })
})
