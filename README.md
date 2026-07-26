# Portfolio

A lightweight, fast, responsive portfolio that showcases interactive React apps
as **live, code-split demos**. Built with Vite + React + TypeScript + Tailwind.

## Why it's structured this way

The whole design goal is **modularity and separation of concerns**: each app you
showcase is an isolated feature module that knows nothing about the shell, and
the shell knows nothing about individual apps. They meet in exactly one place —
a typed registry.

```
src/
├── app/          # Composition root: providers + router wiring only.
│   ├── App.tsx           # ThemeProvider → RouterProvider
│   ├── router.tsx        # Route table (SPA data router)
│   └── RouteError.tsx    # Router-level error boundary
├── shell/        # Layout chrome. Depends on ui + theme, NOT on projects.
│   ├── RootLayout.tsx    # Skip link, header, <Outlet/>, footer
│   ├── Header.tsx  Footer.tsx  ThemeToggle.tsx
├── pages/        # Route views, one folder per page.
│   ├── home/             # Gallery (reads the project registry)
│   ├── project/          # Renders a project's lazy demo in <Suspense>
│   ├── about/  not-found/
├── projects/     # ← Each showcased app is a self-contained module.
│   ├── types.ts          # ProjectMeta / ProjectModule contracts
│   ├── registry.ts       # SINGLE source of truth
│   ├── color-lab/        # meta.ts + index.tsx (default export) + color.ts
│   └── task-board/       # meta.ts + index.tsx (default export)
├── shared/       # Cross-cutting, app-agnostic building blocks.
│   ├── ui/               # Design system: Button, Card, Badge, Container, Spinner
│   ├── hooks/            # useMediaQuery, useLocalStorage
│   ├── theme/            # ThemeProvider + useTheme (light/dark/system)
│   └── lib/              # Pure utils (cn)
└── styles/       # Tailwind entry + semantic design tokens (theming)
```

**Dependency direction is one-way:** `app → pages/shell → projects/shared`.
Projects and shared modules never import upward, so any piece can be moved,
tested, or deleted in isolation.

## Adding a new app to the portfolio

1. Create `src/projects/<slug>/`.
2. Add `meta.ts` exporting a `ProjectMeta` (title, tagline, tags, accent…).
3. Add `index.tsx` with a **default export** — your app's root component.
4. Register it — **one line** in `src/projects/registry.ts`:

   ```ts
   { meta: myAppMeta, Component: lazy(() => import('./my-app')) }
   ```

That's it. The gallery card, the `/projects/<slug>` route, and the code-split
chunk all derive from that entry. No shell or router edits needed.

## The hero showcase

The landing page leads with a carousel that **cycles through your real project
components**, rendered as scaled live "mini-app" snapshots inside a browser
frame (`pages/home/HeroShowcase.tsx` + `PreviewFrame.tsx`). It's built to stay
light and accessible:

- Only the **active** preview mounts; the frame is a fixed aspect ratio so
  swapping projects never shifts layout.
- Chunks are **prefetched on idle** (`prefetchProjects`) so cycles are instant.
- The scaled snapshot is `inert` — invisible to keyboard and screen readers,
  since it's a preview, not real controls. Visitors act via the dots and the
  "Explore →" CTA.
- Auto-advance pauses on hover/focus and is disabled under
  `prefers-reduced-motion`; the accent glow shifts to each project's color.

## Performance

- **Route/feature code splitting** — each demo ships as its own chunk via
  `React.lazy` and only downloads when its route is opened (`<Suspense>`
  fallback shows a spinner meanwhile).
- **Vendor splitting** — React and React Router are split into long-lived
  cacheable chunks (`vite.config.ts` → `manualChunks`).
- **Eager metadata, lazy components** — the registry imports tiny `meta.ts`
  files eagerly so the gallery renders with no waterfall, while heavy demo code
  stays deferred.
- **No runtime CSS-in-JS** — Tailwind + CSS custom properties; theming is a
  single class toggle on `<html>`, set before first paint (see `index.html`) to
  avoid a flash of the wrong theme.

## Accessibility & responsiveness

- Semantic landmarks, a skip link, visible focus rings, `aria-*` on controls,
  a `role="switch"` theme toggle, and `prefers-reduced-motion` handling.
- Mobile-first Tailwind layouts; verified at 375px and desktop, in light and dark.

## Commands

```bash
npm run dev        # start dev server
npm run build      # typecheck (tsc -b) + production build
npm run preview    # preview the production build
npm run typecheck  # types only
npm run lint       # oxlint
```

## Deployment

Static SPA — deploys to Vercel or Netlify with zero config. Deep-link fallback
rewrites are included for both (`vercel.json`, `public/_redirects`) so hard
refreshes on routes like `/projects/color-lab` resolve correctly.

## Security note — `npm audit`

`npm audit` reports one advisory against `react-router` (**RSC-mode CSRF**,
GHSA-qwww-vcr4-c8h2). It applies **only to React Router's server/RSC framework
mode**, which this app does not use — we run a client-only SPA data router
(`createBrowserRouter`). The pinned version (`react-router-dom@7.18.1`) already
carries the fixes for the two advisories that *do* affect SPAs (the open-redirect
and `ScrollRestoration` XSS issues). Downgrading to silence the RSC flag would
reintroduce those real XSS bugs, so 7.18.1 is the deliberately chosen,
most-secure version for this use case.
