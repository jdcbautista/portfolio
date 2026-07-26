import type { ProjectMeta } from '../types'

export const meta: ProjectMeta = {
  slug: 'color-lab',
  title: 'Color Lab',
  tagline: 'Generate an accessible tint & shade scale from any base color.',
  description:
    'A small interactive color tool: pick a base color and it derives a ' +
    'perceptually even lightness scale in HSL, shows contrast-safe text on ' +
    'each swatch, and copies the hex to your clipboard on click. Pure ' +
    'client-side color math, no dependencies.',
  tags: ['React', 'TypeScript', 'Canvas-free color math', 'Clipboard API'],
  accent: '#4f46e5',
  year: 2026,
}
