import { useMemo, useState } from 'react'
import { Button } from '@/shared/ui'
import {
  buildScale,
  hexToHsl,
  readableTextColor,
} from './color'

const DEFAULT = '#4f46e5'

export default function ColorLab() {
  const [input, setInput] = useState(DEFAULT)
  const [copied, setCopied] = useState<string | null>(null)

  const hsl = useMemo(() => hexToHsl(input), [input])
  const scale = useMemo(() => (hsl ? buildScale(hsl) : []), [hsl])
  const isValid = hsl !== null

  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      window.setTimeout(() => setCopied(null), 1200)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">Base color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pick base color"
              value={isValid ? input : DEFAULT}
              onChange={(e) => setInput(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-surface-raised p-1"
            />
            <input
              type="text"
              inputMode="text"
              spellCheck={false}
              aria-label="Hex value"
              aria-invalid={!isValid}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-10 w-32 rounded-lg border border-border bg-surface-raised px-3 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </label>
        <Button variant="secondary" onClick={() => setInput(DEFAULT)}>
          Reset
        </Button>
      </div>

      {!isValid && (
        <p role="alert" className="text-sm text-red-500">
          Enter a valid 6-digit hex color, e.g. <code>#4f46e5</code>.
        </p>
      )}

      {isValid && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-9">
          {scale.map(({ step, hex }) => {
            const text = readableTextColor(hex)
            return (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => copy(hex)}
                  style={{ backgroundColor: hex, color: text }}
                  className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-black/5 text-center transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10"
                  title={`Copy ${hex}`}
                >
                  <span className="text-xs font-semibold opacity-80">{step}</span>
                  <span className="font-mono text-[11px] uppercase">
                    {copied === hex ? 'Copied!' : hex}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
