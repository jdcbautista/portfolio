import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/shared/theme'
import { router } from './router'

/** Composition root: global providers wrap the router. */
export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
