import { useEffect, useRef, useState } from 'react'

export interface Size {
  width: number
  height: number
}

/**
 * Track an element's rendered size via ResizeObserver. Returns a ref to attach
 * and the current size. Used to scale live previews to fit their container.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect) setSize({ width: rect.width, height: rect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, size] as const
}
