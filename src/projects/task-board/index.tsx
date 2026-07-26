import { useState } from 'react'
import { Button } from '@/shared/ui'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

type ColumnId = 'todo' | 'doing' | 'done'

interface Task {
  id: string
  title: string
  column: ColumnId
}

const COLUMNS: ReadonlyArray<{ id: ColumnId; label: string }> = [
  { id: 'todo', label: 'Todo' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]

const SEED: Task[] = [
  { id: 't1', title: 'Sketch the layout', column: 'done' },
  { id: 't2', title: 'Wire up state persistence', column: 'doing' },
  { id: 't3', title: 'Make columns responsive', column: 'todo' },
]

// Monotonic id generator — avoids Math.random / Date for stable, testable ids.
let counter = 0
const nextId = () => `task-${(counter += 1)}-${SEED.length}`

export default function TaskBoard() {
  const [tasks, setTasks, reset] = useLocalStorage<Task[]>(
    'portfolio:task-board',
    SEED,
  )
  const [draft, setDraft] = useState('')

  function addTask(e: React.FormEvent) {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return
    setTasks((prev) => [...prev, { id: nextId(), title, column: 'todo' }])
    setDraft('')
  }

  function move(id: string, direction: -1 | 1) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task
        const index = COLUMNS.findIndex((c) => c.id === task.column)
        const nextIndex = Math.min(
          COLUMNS.length - 1,
          Math.max(0, index + direction),
        )
        return { ...task, column: COLUMNS[nextIndex].id }
      }),
    )
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <div className="space-y-5">
      <form onSubmit={addTask} className="flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task title"
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit">Add</Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((column, columnIndex) => {
          const items = tasks.filter((t) => t.column === column.id)
          return (
            <section
              key={column.id}
              aria-label={column.label}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <header className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">
                  {column.label}
                </h3>
                <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-muted">
                  {items.length}
                </span>
              </header>

              <ul className="space-y-2">
                {items.map((task) => (
                  <li
                    key={task.id}
                    className="group rounded-lg border border-border bg-surface-raised p-2.5"
                  >
                    <p className="mb-2 text-sm text-text">{task.title}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(task.id, -1)}
                        disabled={columnIndex === 0}
                        aria-label={`Move "${task.title}" left`}
                        className="rounded px-2 py-1 text-xs text-muted hover:bg-surface hover:text-text disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => move(task.id, 1)}
                        disabled={columnIndex === COLUMNS.length - 1}
                        aria-label={`Move "${task.title}" right`}
                        className="rounded px-2 py-1 text-xs text-muted hover:bg-surface hover:text-text disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(task.id)}
                        aria-label={`Delete "${task.title}"`}
                        className="ml-auto rounded px-2 py-1 text-xs text-muted hover:bg-surface hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted">
                    Nothing here
                  </li>
                )}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
