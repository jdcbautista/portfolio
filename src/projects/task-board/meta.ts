import type { ProjectMeta } from '../types'

export const meta: ProjectMeta = {
  slug: 'task-board',
  title: 'Task Board',
  tagline: 'A responsive kanban that remembers your work across reloads.',
  description:
    'A compact kanban board: add tasks, move them across Todo / Doing / Done, ' +
    'and delete them. State persists to localStorage and stays in sync across ' +
    'browser tabs. Columns sit side-by-side on desktop and stack cleanly on ' +
    'mobile.',
  tags: ['React', 'TypeScript', 'localStorage', 'Responsive grid'],
  accent: '#0ea5e9',
  year: 2026,
}
