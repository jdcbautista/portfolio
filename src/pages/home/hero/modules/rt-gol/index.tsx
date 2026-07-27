import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'

// ── Types ───────────────────────────────────────────────────────────────────
type ColorMode = 'monochrome' | 'gradient' | 'random'
type RotDir = -1 | 1
type CellPx = [number, number, number]

interface LayerDef {
  cols: number
  rows: number
  radius: number
  rotMult: number
}

interface Layer {
  grid: Uint8Array[]
  tex: THREE.CanvasTexture
  ctx: CanvasRenderingContext2D
  cols: number
  rows: number
  mesh: THREE.Mesh
  mat: THREE.MeshBasicMaterial
}

interface RuntimeConfig {
  rotDir: RotDir
  rotSpeed: number // already divided by 100
  genMs: number
  randomSec: number
  running: boolean
  colorMode: ColorMode
  baseHue: number
  autoHue: boolean
  fov: number
  glow: number
  persistence: number
  opacity: number
  cellPx: CellPx
  camRollEnabled: boolean
  camRollSpeed: number // already divided by 100
}

// ── Layer base config (radius only; cellPx driven by slider) ─────────────────
// L2 radius 50% bigger: 24→36. L3 2× bigger: 28→56
const LAYER_DEFS: LayerDef[] = [
  { cols: 200, rows: 100, radius: 8, rotMult: 1.0 },
  { cols: 200, rows: 100, radius: 36, rotMult: 0.58 },
  { cols: 200, rows: 100, radius: 56, rotMult: 0.32 },
]
const DEFAULT_CELL_PX: CellPx = [5, 5, 10]

// ── Defaults (ported from the source visualizer settings) ────────────────────
const DEFAULTS = {
  rotDir: 1 as RotDir,
  rotSpeed: 18,
  fps: 9,
  randomSec: 25,
  running: true,
  fov: 90,
  colorMode: 'monochrome' as ColorMode,
  baseHue: 120,
  autoHue: false,
  glow: 0.2,
  persistence: 0,
  opacity: 0.9,
  cellPx: [...DEFAULT_CELL_PX] as CellPx,
  camRollEnabled: false,
  camRollSpeed: 20,
}

// ── GoL ───────────────────────────────────────────────────────────────────────
function makeGrid(cols: number, rows: number, rnd = false): Uint8Array[] {
  return Array.from({ length: rows }, () =>
    Uint8Array.from({ length: cols }, () => (rnd ? (Math.random() < 0.32 ? 1 : 0) : 0)),
  )
}

function stepGrid(g: Uint8Array[], rows: number, cols: number): Uint8Array[] {
  const n: Uint8Array[] = Array.from({ length: rows }, () => new Uint8Array(cols))
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let nb = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue
          nb += g[(r + dr + rows) % rows][(c + dc + cols) % cols]
        }
      n[r][c] = g[r][c] ? (nb === 2 || nb === 3 ? 1 : 0) : nb === 3 ? 1 : 0
    }
  return n
}

// ── Draw layer ────────────────────────────────────────────────────────────────
function drawLayer(
  ctx: CanvasRenderingContext2D,
  grid: Uint8Array[],
  cols: number,
  rows: number,
  mode: ColorMode,
  layerIdx: number,
  hue: number,
  glow: number,
  persistence: number,
  cellPx: number,
): void {
  const alpha = persistence > 0 ? Math.max(0.03, 1 - persistence * 0.96) : 1
  ctx.fillStyle = `rgba(0,0,0,${alpha})`
  ctx.fillRect(0, 0, cols * cellPx, rows * cellPx)

  const glowPx = glow * 22

  const setColor = (col: string): void => {
    ctx.fillStyle = col
    if (glow > 0) {
      ctx.shadowBlur = glowPx
      ctx.shadowColor = col
    } else ctx.shadowBlur = 0
  }

  if (mode === 'monochrome') {
    setColor(`hsl(${hue},100%,54%)`)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c]) ctx.fillRect(c * cellPx + 1, r * cellPx + 1, cellPx - 1, cellPx - 1)
    ctx.shadowBlur = 0
  } else if (mode === 'gradient') {
    const startH = (hue + layerIdx * 120) % 360
    for (let r = 0; r < rows; r++) {
      setColor(`hsl(${((startH + (r / rows) * 120) % 360) | 0},100%,54%)`)
      for (let c = 0; c < cols; c++)
        if (grid[r][c]) ctx.fillRect(c * cellPx + 1, r * cellPx + 1, cellPx - 1, cellPx - 1)
    }
    ctx.shadowBlur = 0
  } else {
    for (let c = 0; c < cols; c++) {
      setColor(`hsl(${(c * 137 + layerIdx * 53) % 360},100%,54%)`)
      for (let r = 0; r < rows; r++)
        if (grid[r][c]) ctx.fillRect(c * cellPx + 1, r * cellPx + 1, cellPx - 1, cellPx - 1)
    }
    ctx.shadowBlur = 0
  }
}

// ── Star sprite (soft circle) ─────────────────────────────────────────────────
function makeStarSprite(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable for star sprite')
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 12)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.75)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(c)
}

// ── UI helpers ────────────────────────────────────────────────────────────────
const mono: React.CSSProperties = { fontFamily: "'Courier New', Courier, monospace" }

function Sep() {
  return <div style={{ width: 1, alignSelf: 'stretch', background: '#1a3a1a' }} />
}

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
  width?: number
}

function Knob({ label, value, min, max, step, display, onChange, width = 78 }: KnobProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ color: '#1e6630', fontSize: 9, letterSpacing: '0.18em' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width, accentColor: '#39ff5a', cursor: 'pointer' }}
      />
      <span style={{ color: '#39ff5a', fontSize: 10, letterSpacing: '0.1em' }}>{display}</span>
    </div>
  )
}

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: '#39ff5a', cursor: 'pointer', width: 11, height: 11 }}
      />
      <span style={{ color: checked ? '#39ff5a' : '#1e6630', fontSize: 9, letterSpacing: '0.12em' }}>
        {label}
      </span>
    </label>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GameOfLifeSpheresModule() {
  const mountRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<Layer[] | null>(null)
  const hueRollRef = useRef(0)
  const camRollRef = useRef(0)
  const colorDirty = useRef(false)
  const cellsDirty = useRef<[boolean, boolean, boolean]>([false, false, false])
  const previousColorStateRef = useRef({
    colorMode: DEFAULTS.colorMode,
    baseHue: DEFAULTS.baseHue,
    glow: DEFAULTS.glow,
    persistence: DEFAULTS.persistence,
  })
  const previousCellPxRef = useRef<CellPx>([...DEFAULTS.cellPx])

  // Sim controls
  const [rotDir, setRotDir] = useState<RotDir>(DEFAULTS.rotDir)
  const [rotSpeed, setRotSpeed] = useState(DEFAULTS.rotSpeed)
  const [fps, setFps] = useState(DEFAULTS.fps)
  const [randomSec, setRandomSec] = useState(DEFAULTS.randomSec)
  const [running, setRunning] = useState(DEFAULTS.running)
  const [fov, setFov] = useState(DEFAULTS.fov)

  // Color
  const [colorMode, setColorMode] = useState<ColorMode>(DEFAULTS.colorMode)
  const [baseHue, setBaseHue] = useState(DEFAULTS.baseHue)
  const [autoHue, setAutoHue] = useState(DEFAULTS.autoHue)

  // FX
  const [glow, setGlow] = useState(DEFAULTS.glow)
  const [persistence, setPersistence] = useState(DEFAULTS.persistence)
  const [opacity, setOpacity] = useState(DEFAULTS.opacity)

  // Cell sizes per layer
  const [cellPx, setCellPx] = useState<CellPx>([...DEFAULTS.cellPx])

  // Camera roll
  const [camRollEnabled, setCamRollEnabled] = useState(DEFAULTS.camRollEnabled)
  const [camRollSpeed, setCamRollSpeed] = useState(DEFAULTS.camRollSpeed)

  // Panel (default collapsed)
  const [panelOpen, setPanelOpen] = useState(false)

  // HUD
  const [gen, setGen] = useState(0)
  const [liveHue, setLiveHue] = useState(DEFAULTS.baseHue)
  const [resetCountdowns, setResetCountdowns] = useState<[number, number, number]>([25, 25, 25])

  // Packed cfg ref — the rAF loop READS this; it never triggers a rebuild.
  const cfgRef = useRef<RuntimeConfig>({
    rotDir: DEFAULTS.rotDir,
    rotSpeed: DEFAULTS.rotSpeed / 100,
    genMs: Math.round(1000 / Math.max(1, DEFAULTS.fps)),
    randomSec: DEFAULTS.randomSec,
    running: DEFAULTS.running,
    colorMode: DEFAULTS.colorMode,
    baseHue: DEFAULTS.baseHue,
    autoHue: DEFAULTS.autoHue,
    fov: DEFAULTS.fov,
    glow: DEFAULTS.glow,
    persistence: DEFAULTS.persistence,
    opacity: DEFAULTS.opacity,
    cellPx: [...DEFAULTS.cellPx],
    camRollEnabled: DEFAULTS.camRollEnabled,
    camRollSpeed: DEFAULTS.camRollSpeed / 100,
  })

  // Flow control state into cfgRef whenever it changes (no scene rebuild).
  useEffect(() => {
    cfgRef.current = {
      rotDir,
      rotSpeed: rotSpeed / 100,
      genMs: Math.round(1000 / Math.max(1, fps)),
      randomSec,
      running,
      colorMode,
      baseHue,
      autoHue,
      fov,
      glow,
      persistence,
      opacity,
      cellPx: [...cellPx],
      camRollEnabled,
      camRollSpeed: camRollSpeed / 100,
    }

    const prevColor = previousColorStateRef.current
    const colorChanged =
      prevColor.colorMode !== colorMode ||
      prevColor.baseHue !== baseHue ||
      prevColor.glow !== glow ||
      prevColor.persistence !== persistence
    if (colorChanged) {
      colorDirty.current = true
      previousColorStateRef.current = { colorMode, baseHue, glow, persistence }
    }

    const prevCell = previousCellPxRef.current
    const cellSizeChanged =
      prevCell[0] !== cellPx[0] || prevCell[1] !== cellPx[1] || prevCell[2] !== cellPx[2]
    if (cellSizeChanged) {
      cellsDirty.current = [true, true, true]
      previousCellPxRef.current = [...cellPx]
    }
  }, [
    rotDir,
    rotSpeed,
    fps,
    randomSec,
    running,
    colorMode,
    baseHue,
    autoHue,
    fov,
    glow,
    persistence,
    opacity,
    cellPx,
    camRollEnabled,
    camRollSpeed,
  ])

  // ── Three.js init (runs once) ────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth || 1
    const H = mount.clientHeight || 1

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(DEFAULTS.fov, W / H, 0.01, 500)

    // ── Stars (white, circular sprites) ────────────────────────────────────
    const starSprite = makeStarSprite()
    const starGroup = new THREE.Group()
    starGroup.renderOrder = 0
    scene.add(starGroup)

    const starDefs: { count: number; size: number; rBase: number; color: number }[] = [
      { count: 120, size: 0.22, rBase: 6.5, color: 0xffffff },
      { count: 500, size: 0.11, rBase: 6.2, color: 0xddddff },
      { count: 1100, size: 0.05, rBase: 5.8, color: 0xaaaacc },
    ]
    starDefs.forEach(({ count, size, rBase, color }) => {
      const pos: number[] = []
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const rad = rBase * (0.88 + Math.random() * 0.12)
        pos.push(
          Math.sin(phi) * Math.cos(theta) * rad,
          Math.cos(phi) * rad,
          Math.sin(phi) * Math.sin(theta) * rad,
        )
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      starGroup.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            color,
            size,
            map: starSprite,
            alphaMap: starSprite,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.92,
            alphaTest: 0.02,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
          }),
        ),
      )
    })

    // ── GoL sphere layers ───────────────────────────────────────────────────
    const layers: Layer[] = LAYER_DEFS.map((def, i) => {
      const { cols, rows, radius } = def
      const cpx = DEFAULT_CELL_PX[i]
      const tc = document.createElement('canvas')
      tc.width = cols * cpx
      tc.height = rows * cpx
      const ctx = tc.getContext('2d')
      if (!ctx) throw new Error('2d context unavailable for GoL layer')
      const grid = makeGrid(cols, rows, true)
      drawLayer(
        ctx,
        grid,
        cols,
        rows,
        DEFAULTS.colorMode,
        i,
        DEFAULTS.baseHue,
        DEFAULTS.glow,
        DEFAULTS.persistence,
        cpx,
      )

      const tex = new THREE.CanvasTexture(tc)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        transparent: true,
        opacity: DEFAULTS.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), mat)
      mesh.renderOrder = LAYER_DEFS.length - i
      scene.add(mesh)
      return { grid, tex, ctx, cols, rows, mesh, mat }
    })

    layersRef.current = layers

    // ── Staggered per-layer reset timers ────────────────────────────────────
    const lastRandomPerLayer: (number | null)[] = [null, null, null]
    let genCount = 0
    let lastGen = 0
    let frameCount = 0
    let rafId = 0

    const animate = (ts: number): void => {
      rafId = requestAnimationFrame(animate)
      const cfg = cfgRef.current

      // Init staggered timers on first frame
      for (let i = 0; i < 3; i++) {
        if (lastRandomPerLayer[i] === null) {
          lastRandomPerLayer[i] = ts - i * (cfg.randomSec / 3) * 1000
        }
      }

      // FOV
      if (Math.abs(camera.fov - cfg.fov) > 0.1) {
        camera.fov = cfg.fov
        camera.updateProjectionMatrix()
      }

      // Auto-hue
      if (cfg.autoHue) hueRollRef.current = (hueRollRef.current + 0.008) % 360
      const liveH = (cfg.baseHue + hueRollRef.current) % 360
      if (frameCount % 6 === 0) setLiveHue(Math.round(liveH))

      // Camera roll
      if (cfg.camRollEnabled) {
        camRollRef.current += cfg.camRollSpeed * 0.004
        camera.rotation.z = camRollRef.current
      } else if (Math.abs(camera.rotation.z) > 0.001) {
        camera.rotation.z *= 0.96
      } else {
        camera.rotation.z = 0
        camRollRef.current = 0
      }

      const baseRot = cfg.rotDir * cfg.rotSpeed * 0.012

      // Rotate layers (parallax)
      layers.forEach((layer, i) => {
        layer.mesh.rotation.y += baseRot * LAYER_DEFS[i].rotMult
        layer.mesh.rotation.x = Math.sin(ts * 0.00014 + i * 0.45) * 0.11
        if (Math.abs(layer.mat.opacity - cfg.opacity) > 0.005) layer.mat.opacity = cfg.opacity
      })

      // Stars: opposite, 1/8 speed
      starGroup.rotation.y -= baseRot * 0.125
      starGroup.rotation.x = Math.sin(ts * 0.00009) * 0.04

      // Cell size resize (canvas dimensions)
      for (let i = 0; i < 3; i++) {
        if (cellsDirty.current[i]) {
          const layer = layers[i]
          const cpx = cfg.cellPx[i]
          layer.ctx.canvas.width = layer.cols * cpx
          layer.ctx.canvas.height = layer.rows * cpx
          drawLayer(
            layer.ctx,
            layer.grid,
            layer.cols,
            layer.rows,
            cfg.colorMode,
            i,
            liveH,
            cfg.glow,
            cfg.persistence,
            cpx,
          )
          layer.tex.needsUpdate = true
          cellsDirty.current[i] = false
        }
      }

      // GoL step
      const shouldStep = cfg.running && ts - lastGen >= cfg.genMs
      const dirty = colorDirty.current

      if (shouldStep || dirty || cfg.autoHue) {
        layers.forEach((layer, i) => {
          if (shouldStep) layer.grid = stepGrid(layer.grid, layer.rows, layer.cols)
          drawLayer(
            layer.ctx,
            layer.grid,
            layer.cols,
            layer.rows,
            cfg.colorMode,
            i,
            liveH,
            cfg.glow,
            cfg.persistence,
            cfg.cellPx[i],
          )
          layer.tex.needsUpdate = true
        })
        if (shouldStep) {
          genCount++
          lastGen = ts
          setGen(genCount)
        }
        if (dirty) colorDirty.current = false
      }

      // Per-layer staggered auto-reset
      const countdowns: [number, number, number] = [0, 0, 0]
      for (let i = 0; i < 3; i++) {
        const last = lastRandomPerLayer[i] ?? ts
        const elapsed = (ts - last) / 1000
        countdowns[i] = Math.max(0, Math.ceil(cfg.randomSec - elapsed))
        if (elapsed >= cfg.randomSec) {
          const layer = layers[i]
          layer.grid = makeGrid(layer.cols, layer.rows, true)
          drawLayer(
            layer.ctx,
            layer.grid,
            layer.cols,
            layer.rows,
            cfg.colorMode,
            i,
            liveH,
            cfg.glow,
            cfg.persistence,
            cfg.cellPx[i],
          )
          layer.tex.needsUpdate = true
          lastRandomPerLayer[i] = ts
          if (i === 0) {
            genCount = 0
            setGen(0)
          }
        }
      }
      if (frameCount % 10 === 0) setResetCountdowns([...countdowns])

      frameCount++
      renderer.render(scene, camera)
    }
    rafId = requestAnimationFrame(animate)

    const onResize = (): void => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      layers.forEach((layer) => {
        layer.mesh.geometry.dispose()
        layer.mat.dispose()
        layer.tex.dispose()
      })
      starGroup.children.forEach((child) => {
        if (child instanceof THREE.Points) {
          child.geometry.dispose()
          const m = child.material
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose())
          else m.dispose()
        }
      })
      starSprite.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      layersRef.current = null
    }
  }, [])

  const doRandomize = (): void => {
    const layers = layersRef.current
    if (!layers) return
    const cfg = cfgRef.current
    const liveH = (cfg.baseHue + hueRollRef.current) % 360
    layers.forEach((layer, i) => {
      layer.grid = makeGrid(layer.cols, layer.rows, true)
      drawLayer(
        layer.ctx,
        layer.grid,
        layer.cols,
        layer.rows,
        cfg.colorMode,
        i,
        liveH,
        cfg.glow,
        cfg.persistence,
        cfg.cellPx[i],
      )
      layer.tex.needsUpdate = true
    })
    setGen(0)
  }

  const setCellPxLayer = (i: number, v: number): void => {
    setCellPx((prev) => {
      const next: CellPx = [...prev]
      next[i] = v
      return next
    })
  }

  const rotButtons: [RotDir, string][] = [
    [-1, '◀ L'],
    [1, 'R ▶'],
  ]
  const colorButtons: [ColorMode, string][] = [
    ['monochrome', 'MONO'],
    ['gradient', 'GRAD'],
    ['random', 'RAND'],
  ]
  const layerLabels = ['L1 r=8 ', 'L2 r=36', 'L3 r=56']

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0" style={{ background: '#000', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* HUD (top-left) */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 22,
          ...mono,
          fontSize: 11,
          letterSpacing: '0.18em',
          color: '#1e6630',
          lineHeight: 2.0,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 13, letterSpacing: '0.3em', marginBottom: 3 }}>
          GAME<span style={{ color: '#39ff5a' }}> OF LIFE</span>
        </div>
        <div>
          GEN <span style={{ color: '#39ff5a' }}>{String(gen).padStart(6, '0')}</span>
        </div>
        {autoHue && (
          <div>
            HUE <span style={{ color: `hsl(${liveHue},100%,60%)` }}>{liveHue}°</span>
          </div>
        )}
        <div style={{ fontSize: 9, color: '#142814', marginTop: 4, lineHeight: 2.2 }}>
          {layerLabels.map((lbl, i) => (
            <div key={i}>
              {lbl} · RST <span style={{ color: '#1e6630' }}>{resetCountdowns[i]}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control panel (bottom-right, collapsible, default-collapsed, expands upward) */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'stretch',
          background: 'rgba(2,8,3,0.92)',
          border: '1px solid #1c4422',
          backdropFilter: 'blur(14px)',
          ...mono,
          maxWidth: '96vw',
          minWidth: panelOpen ? 280 : 0,
          pointerEvents: 'auto',
        }}
      >
        {/* Collapsible header (anchored at the bottom via column-reverse) */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderTop: panelOpen ? '1px solid #1c4422' : 'none',
            color: '#39ff5a',
            cursor: 'pointer',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            ...mono,
            fontSize: 10,
            letterSpacing: '0.2em',
          }}
        >
          <span>CONTROLS</span>
          <span style={{ fontSize: 9 }}>{panelOpen ? '▼ HIDE' : '▲ SHOW'}</span>
        </button>

        {panelOpen && (
          <div
            style={{
              padding: '12px 14px 11px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.8rem',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            {/* === SIMULATION === */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#1e6630', fontSize: 9, letterSpacing: '0.18em' }}>ROTATION</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {rotButtons.map(([d, lbl]) => (
                  <button
                    key={d}
                    onClick={() => setRotDir(d)}
                    style={{
                      background: rotDir === d ? '#39ff5a' : 'transparent',
                      color: rotDir === d ? '#000' : '#39ff5a',
                      border: '1px solid #285a28',
                      ...mono,
                      fontSize: 9,
                      padding: '3px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <Knob label="SPIN" min={0} max={100} step={1} value={rotSpeed} display={`${rotSpeed}%`} onChange={setRotSpeed} />
            <Knob label="SIM FPS" min={1} max={60} step={1} value={fps} display={`${fps} fps`} onChange={setFps} />
            <Knob label="RESET INT." min={5} max={120} step={5} value={randomSec} display={`${randomSec}s`} onChange={setRandomSec} />
            <Knob label="FOV" min={40} max={150} step={1} value={fov} display={`${fov}°`} onChange={setFov} />

            <Sep />

            {/* === CAMERA ROLL === */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Checkbox label="CAM ROLL" checked={camRollEnabled} onChange={setCamRollEnabled} />
              <Knob label="ROLL SPEED" min={1} max={100} step={1} value={camRollSpeed} display={`${camRollSpeed}%`} onChange={setCamRollSpeed} width={70} />
            </div>

            <Sep />

            {/* === COLOR === */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#1e6630', fontSize: 9, letterSpacing: '0.18em' }}>COLOR MODE</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {colorButtons.map(([m, lbl]) => (
                  <button
                    key={m}
                    onClick={() => setColorMode(m)}
                    style={{
                      background: colorMode === m ? '#39ff5a' : 'transparent',
                      color: colorMode === m ? '#000' : '#39ff5a',
                      border: '1px solid #285a28',
                      ...mono,
                      fontSize: 9,
                      padding: '3px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#1e6630', fontSize: 9, letterSpacing: '0.18em' }}>BASE HUE</span>
              <div style={{ position: 'relative', width: 100, height: 20, display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: '6px 0',
                    borderRadius: 3,
                    pointerEvents: 'none',
                    background:
                      'linear-gradient(to right,hsl(0,90%,32%),hsl(60,90%,32%),hsl(120,90%,32%),hsl(180,90%,32%),hsl(240,90%,32%),hsl(300,90%,32%),hsl(360,90%,32%))',
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={baseHue}
                  onChange={(e) => setBaseHue(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', position: 'relative', accentColor: `hsl(${baseHue},100%,55%)` }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: `hsl(${liveHue},100%,62%)`, fontSize: 10 }}>{liveHue}°</span>
                <Checkbox label="AUTO HUE" checked={autoHue} onChange={setAutoHue} />
              </div>
            </div>

            <Sep />

            {/* === FX === */}
            <Knob label="OPACITY" min={0} max={100} step={1} value={Math.round(opacity * 100)} display={`${Math.round(opacity * 100)}%`} onChange={(v) => setOpacity(v / 100)} width={70} />
            <Knob label="GLOW" min={0} max={100} step={1} value={Math.round(glow * 100)} display={`${Math.round(glow * 100)}%`} onChange={(v) => setGlow(v / 100)} width={70} />
            <Knob label="PERSISTENCE" min={0} max={100} step={1} value={Math.round(persistence * 100)} display={`${Math.round(persistence * 100)}%`} onChange={(v) => setPersistence(v / 100)} width={70} />

            <Sep />

            {/* === CELL SIZES === */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#1e6630', fontSize: 9, letterSpacing: '0.18em' }}>CELL SIZE</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <Knob
                    key={i}
                    label={`L${i + 1}`}
                    min={2}
                    max={20}
                    step={1}
                    value={cellPx[i]}
                    display={`${cellPx[i]}px`}
                    onChange={(v) => setCellPxLayer(i, v)}
                    width={52}
                  />
                ))}
              </div>
            </div>

            <Sep />

            {/* === PLAY / RANDOMIZE === */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
              <button
                onClick={() => setRunning((r) => !r)}
                style={{
                  background: running ? '#39ff5a' : 'transparent',
                  color: running ? '#000' : '#39ff5a',
                  border: '1px solid #285a28',
                  ...mono,
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  padding: '5px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {running ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onClick={doRandomize}
                style={{
                  background: 'transparent',
                  color: '#39ff5a',
                  border: '1px solid #285a28',
                  ...mono,
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  padding: '4px 12px',
                  cursor: 'pointer',
                }}
              >
                RANDOMIZE ALL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
