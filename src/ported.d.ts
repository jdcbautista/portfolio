// Ported R3F canvases (src/pages/home/hero/modules/_ported) are third-party
// code on older r3f/three. Treat every `#ported/*` import as opaque so tsc never
// type-checks those files — Vite still bundles them at runtime via the alias.
// This is what keeps a ported WIP from ever breaking the main build.
declare module '#ported/*'
