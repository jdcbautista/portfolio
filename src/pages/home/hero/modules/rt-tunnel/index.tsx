import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// ============================================================================
//  VIZ002 TUNNEL — neon procedural fly-through tunnel (self-contained port).
//  A faithful rewrite: closed CatmullRom curve, variable-radius grid-textured
//  tube, glowing gradient rings, drifting star particles, and a fly-through
//  camera. Only `react` + `three` are used; everything else is inlined.
// ============================================================================

// ---------------------------------------------------------------------------
//  CONFIG
// ---------------------------------------------------------------------------
const CONFIG = {
  geo: { tubeLongSegs: 500, tubeRadSegs: 20, maxPixelRatio: 2 },
  rings: {
    radiusRatio: 0.97,
    thicknessRatio: 0.012,
    thicknessMin: 0.06,
    radialSegs: 48,
    tubeSegs: 5,
    emissiveBase: 1.3,
    roughness: 0.2,
    metalness: 0.7,
    pulseSpeed: 2.8,
    pulseBase: 0.9,
    pulseDepth: 0.85,
    pulsePhase: 0.27,
  },
  scatter: { count: 14, intensity: 1.0, distance: 75, decay: 2 },
  camLights: {
    keyIntensity: 9,
    keyDistance: 55,
    fillIntensity: 5,
    fillDistance: 75,
    decay: 2,
    fillAheadT: 0.025,
  },
  ambient: { tunnelIntensity: 0.03 },
  fog: { density: 0.009 },
  tubeMat: {
    roughness: 0.78,
    metalness: 0.3,
    emissiveIntensity: 0.38,
    wireframeOpacity: 0.07,
  },
  gridTex: { canvasSize: 512, cells: 8, lineWidth: 1.5, uvRepeatU: 10, uvRepeatV: 2 },
  curveGen: {
    tension: 0.5,
    radialJitter: 0.8,
    tangentOffset: 0.55,
    vertChaosFloor: 0.01,
    smoothPasses: 6,
  },
  radiusFn: { harmonics: [1.0, 2.3, 5.1, 8.7], oscThreshold: 0.01, radiusFloor: 0.8 },
  camera: { nearClip: 0.1, farClip: 600, lookAheadT: 0.003, speedScale: 0.00008 },
  twistAnim: { freq1: 8, amp1: 0.45, freq2: 3.1, amp2: 0.18 },
} as const

// Single built-in star/particle emitter (stationary in world space — the camera
// flies through it). Values mirror the source emitter defaults.
const EMITTER = {
  entityScale: 2.5,
  spawnAhead: 0.35,
  placementRadial: 50,
  quantity: 20,
  spreadX: 8.5,
  spreadY: 15.0,
  jitterMin: -20.0,
  jitterMax: 20.0,
  momentumDecay: 100,
  lifespan: 22,
  spawnInterval: 1.75,
  maxQuantity: 100,
} as const

// ---------------------------------------------------------------------------
//  PALETTES  (affect background, fog, lighting only — not ring/surface color)
// ---------------------------------------------------------------------------
type PalKey = 'neon' | 'blood' | 'void' | 'gold' | 'ghost'
interface Palette {
  bg: number
  tbg: string
  gl: string
  ring: number
  l1: number
  l2: number
}
const PAL: Record<PalKey, Palette> = {
  neon: { bg: 0x000008, tbg: '#020d09', gl: 'rgba(0,255,180,0.55)', ring: 0x00ffcc, l1: 0x00ffcc, l2: 0xff00ff },
  blood: { bg: 0x050000, tbg: '#120000', gl: 'rgba(255,60,0,0.55)', ring: 0xff2200, l1: 0xff2200, l2: 0xff8800 },
  void: { bg: 0x000005, tbg: '#04001a', gl: 'rgba(110,0,255,0.55)', ring: 0x5500ff, l1: 0x5500ff, l2: 0x00aaff },
  gold: { bg: 0x030200, tbg: '#0d0800', gl: 'rgba(255,200,0,0.55)', ring: 0xffcc00, l1: 0xffcc00, l2: 0xff8800 },
  ghost: { bg: 0x010108, tbg: '#06060f', gl: 'rgba(180,180,255,0.55)', ring: 0xaaaaff, l1: 0xaaaaff, l2: 0xffffff },
}
const PAL_KEYS: PalKey[] = ['neon', 'blood', 'void', 'gold', 'ghost']

function numToHex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0')
}

type GradStops = readonly [string, string, string]

// Ring / particle gradient stays fixed regardless of palette (matches source).
const INIT_GRAD: GradStops = [numToHex(PAL.neon.ring), numToHex(PAL.neon.l2), numToHex(PAL.neon.ring)]

// Sample a 3-stop gradient at t in 0..1 with optional stretch (repeat).
function sampleGrad(rawT: number, stops: GradStops, stretch = 1): THREE.Color {
  const t = (((rawT * stretch) % 1) + 1) % 1
  const a = new THREE.Color(stops[0])
  const b = new THREE.Color(stops[1])
  const c = new THREE.Color(stops[2])
  if (t < 1 / 3) return a.clone().lerp(b, t * 3)
  if (t < 2 / 3) return b.clone().lerp(c, (t - 1 / 3) * 3)
  return c.clone().lerp(a, (t - 2 / 3) * 3)
}

// ---------------------------------------------------------------------------
//  CURVE / RADIUS ALGORITHMS
// ---------------------------------------------------------------------------
interface CurveParams {
  numPoints: number
  spread: number
  vertSpread: number
  chaos: number
  minTurnAngle: number
}

function smoothCurvePoints(pts: THREE.Vector3[], limitDeg: number): THREE.Vector3[] {
  if (limitDeg <= 0) return pts
  const { smoothPasses } = CONFIG.curveGen
  const n = pts.length
  let cur = pts.map((p) => p.clone())
  for (let pass = 0; pass < smoothPasses; pass++) {
    const nxt = cur.map((p) => p.clone())
    for (let i = 0; i < n; i++) {
      const prev = cur[(i - 1 + n) % n]!
      const p = cur[i]!
      const next = cur[(i + 1) % n]!
      const d1 = new THREE.Vector3().subVectors(p, prev).normalize()
      const d2 = new THREE.Vector3().subVectors(next, p).normalize()
      const deg = (Math.acos(Math.max(-1, Math.min(1, d1.dot(d2)))) * 180) / Math.PI
      if (deg > limitDeg) {
        const blend = Math.min(0.65, (deg - limitDeg) / 90)
        nxt[i]!.lerpVectors(
          p,
          new THREE.Vector3().addVectors(prev, next).multiplyScalar(0.5),
          blend,
        )
      }
    }
    cur = nxt
  }
  return cur
}

function generateCurve({ numPoints, spread, vertSpread, chaos, minTurnAngle }: CurveParams): THREE.CatmullRomCurve3 {
  const { tension, radialJitter, tangentOffset, vertChaosFloor } = CONFIG.curveGen
  let pts: THREE.Vector3[] = []
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2
    const r = spread * (1 + (Math.random() - 0.5) * chaos * radialJitter)
    pts.push(
      new THREE.Vector3(
        Math.cos(angle) * r + (Math.random() - 0.5) * spread * chaos * tangentOffset,
        (Math.random() - 0.5) * vertSpread * (chaos + vertChaosFloor),
        Math.sin(angle) * r + (Math.random() - 0.5) * spread * chaos * tangentOffset,
      ),
    )
  }
  pts = smoothCurvePoints(pts, minTurnAngle)
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', tension)
}

type RadiusFn = (t: number) => number

function makeRadiusFn(rMin: number, rMax: number, osc: number): RadiusFn {
  const { harmonics, oscThreshold, radiusFloor } = CONFIG.radiusFn
  const phases = harmonics.map(() => Math.random() * Math.PI * 2)
  const base = (rMin + rMax) * 0.5
  const amp = (rMax - rMin) * 0.5
  return (t: number): number => {
    if (osc < oscThreshold) return base
    let w = 0
    harmonics.forEach((f, k) => {
      w += Math.sin(t * Math.PI * 2 * f + phases[k]!)
    })
    return Math.max(radiusFloor, base + (w / harmonics.length) * amp * osc)
  }
}

// ---------------------------------------------------------------------------
//  GEOMETRY / TEXTURE BUILDERS
// ---------------------------------------------------------------------------
function buildVarTubeGeo(
  curve: THREE.CatmullRomCurve3,
  tSeg: number,
  rSeg: number,
  rfn: RadiusFn,
): THREE.BufferGeometry {
  const { uvRepeatU, uvRepeatV } = CONFIG.gridTex
  const frames = curve.computeFrenetFrames(tSeg, true)
  const v: number[] = []
  const nrm: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= tSeg; i++) {
    const t = i / tSeg
    const fi = i < tSeg ? i : 0
    const p = curve.getPointAt(t)
    const r = rfn(t)
    const N = frames.normals[fi]!
    const B = frames.binormals[fi]!
    for (let j = 0; j <= rSeg; j++) {
      const theta = (j / rSeg) * Math.PI * 2
      const c = Math.cos(theta)
      const s = Math.sin(theta)
      const nx = c * N.x + s * B.x
      const ny = c * N.y + s * B.y
      const nz = c * N.z + s * B.z
      v.push(p.x + r * nx, p.y + r * ny, p.z + r * nz)
      nrm.push(nx, ny, nz)
      uv.push(t * uvRepeatU, (j / rSeg) * uvRepeatV)
    }
  }
  for (let i = 0; i < tSeg; i++) {
    for (let j = 0; j < rSeg; j++) {
      const a = i * (rSeg + 1) + j
      const b = (i + 1) * (rSeg + 1) + j
      const c = (i + 1) * (rSeg + 1) + j + 1
      const d = i * (rSeg + 1) + j + 1
      idx.push(a, b, d, b, c, d)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeBoundingSphere()
  return g
}

function makeGridTex(bg: string, line: string): THREE.CanvasTexture {
  const { canvasSize: S, cells, lineWidth } = CONFIG.gridTex
  const cv = document.createElement('canvas')
  cv.width = cv.height = S
  const ctx = cv.getContext('2d')
  if (ctx) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, S, S)
    ctx.strokeStyle = line
    ctx.lineWidth = lineWidth
    for (let i = 0; i <= cells; i++) {
      const q = (i / cells) * S
      ctx.beginPath()
      ctx.moveTo(q, 0)
      ctx.lineTo(q, S)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, q)
      ctx.lineTo(S, q)
      ctx.stroke()
    }
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

// Local orthonormal frame (tangent, normal, binormal) at curve-t.
interface Frame {
  tan: THREE.Vector3
  norm: THREE.Vector3
  binorm: THREE.Vector3
}
function localFrame(curve: THREE.CatmullRomCurve3, t: number): Frame {
  const tan = curve.getTangentAt(t).normalize()
  const ref = Math.abs(tan.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const norm = new THREE.Vector3().crossVectors(ref, tan).normalize()
  const binorm = new THREE.Vector3().crossVectors(tan, norm).normalize()
  return { tan, norm, binorm }
}

// World position for a particle from its curve-t plus stored offsets.
function particleWorldPos(
  curve: THREE.CatmullRomCurve3,
  rfn: RadiusFn,
  t: number,
  radialFraction: number,
  angle: number,
  sx: number,
  sy: number,
  jitter: number,
): THREE.Vector3 {
  const tc = ((t % 1) + 1) % 1
  const pos = curve.getPointAt(tc)
  const r = rfn(tc) * radialFraction
  const { tan, norm, binorm } = localFrame(curve, tc)
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  return new THREE.Vector3(
    pos.x + norm.x * (cosA * r + sx) + binorm.x * (sinA * r + sy) + tan.x * jitter,
    pos.y + norm.y * (cosA * r + sx) + binorm.y * (sinA * r + sy) + tan.y * jitter,
    pos.z + norm.z * (cosA * r + sx) + binorm.z * (sinA * r + sy) + tan.z * jitter,
  )
}

// ---------------------------------------------------------------------------
//  SCENE BUILDERS
// ---------------------------------------------------------------------------
type RingMesh = THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>

function rebuildRings(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  rfn: RadiusFn,
  count: number,
  gradStops: GradStops,
  gradStretch: number,
  opacity: number,
): void {
  const {
    radiusRatio,
    thicknessRatio,
    thicknessMin,
    tubeSegs,
    radialSegs,
    emissiveBase,
    roughness,
    metalness,
  } = CONFIG.rings
  while (group.children.length) {
    const ch = group.children[0] as RingMesh
    ch.geometry.dispose()
    ch.material.dispose()
    group.remove(ch)
  }
  for (let i = 0; i < count; i++) {
    const t = i / count
    const pos = curve.getPointAt(t)
    const tan = curve.getTangentAt(t).normalize()
    const r = rfn(t)
    const col = sampleGrad(t, gradStops, gradStretch)
    const m: RingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(r * radiusRatio, Math.max(thicknessMin, r * thicknessRatio), tubeSegs, radialSegs),
      new THREE.MeshStandardMaterial({
        color: col.clone(),
        emissive: col.clone(),
        emissiveIntensity: emissiveBase,
        roughness,
        metalness,
        transparent: opacity < 1,
        opacity,
      }),
    )
    m.position.copy(pos)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan)
    group.add(m)
  }
}

function rebuildScatterLights(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  l1: number,
  l2: number,
): void {
  const { count, intensity, distance, decay } = CONFIG.scatter
  while (group.children.length) group.remove(group.children[0]!)
  for (let i = 0; i < count; i++) {
    const sl = new THREE.PointLight(i % 2 === 0 ? l1 : l2, intensity, distance, decay)
    sl.position.copy(curve.getPointAt(i / count))
    group.add(sl)
  }
}

// ---------------------------------------------------------------------------
//  RUNTIME STATE
// ---------------------------------------------------------------------------
interface Particle {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  spawnTime: number
  curveT: number
  radialFraction: number
  angle: number
  sx: number
  sy: number
  jitter: number
}

interface TunnelScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  curve: THREE.CatmullRomCurve3
  rfn: RadiusFn
  tex: THREE.CanvasTexture
  geo: THREE.BufferGeometry
  tubeMat: THREE.MeshStandardMaterial
  wireMat: THREE.MeshBasicMaterial
  tubeMesh: THREE.Mesh
  wireMesh: THREE.Mesh
  ringGroup: THREE.Group
  scatterGroup: THREE.Group
  emitterGroup: THREE.Group
  camLight: THREE.PointLight
  headLight: THREE.PointLight
  t: number
}

interface RegenParams {
  numPoints: number
  spread: number
  vertSpread: number
  chaos: number
  minTurnAngle: number
  rMin: number
  rMax: number
  rOsc: number
  ringCount: number
}

// Defaults — shared by the initial scene build and the control useState seeds.
const DEF = {
  palette: 'neon' as PalKey,
  fov: 90,
  speed: 0.4,
  twist: 0.8,
  camRoll: 0,
  autoRoll: false,
  rollSpeed: 30,
  numPoints: 8,
  spread: 120,
  vertSpread: 80,
  chaos: 0.5,
  minTurnAngle: 30,
  rMin: 5,
  rMax: 9,
  rOsc: 0.3,
  ringCount: 80,
  ringOpacity: 1.0,
  wireOpacity: 0.07,
  surfaceOpacity: 1.0,
  gradStretch: 1.0,
} as const

// ---------------------------------------------------------------------------
//  UI PRIMITIVES
// ---------------------------------------------------------------------------
interface SliderCfg {
  label: string
  min: number
  max: number
  step: number
  fmt: (v: number) => string
}

const SL = {
  fov: { label: 'FOV', min: 40, max: 150, step: 5, fmt: (v: number) => `${v}°` },
  speed: { label: 'SPEED', min: 0.05, max: 5.0, step: 0.05, fmt: (v: number) => v.toFixed(2) },
  twist: { label: 'TWIST', min: 0, max: 3.5, step: 0.1, fmt: (v: number) => v.toFixed(1) },
  camRoll: { label: 'ROLL °', min: -180, max: 180, step: 1, fmt: (v: number) => `${v}°` },
  rollSpeed: { label: 'ROLL SPEED', min: -360, max: 360, step: 5, fmt: (v: number) => `${v}°/s` },
  numPoints: { label: 'CTRL PTS', min: 3, max: 16, step: 1, fmt: (v: number) => `${v}` },
  spread: { label: 'SPREAD', min: 30, max: 300, step: 5, fmt: (v: number) => `${v}` },
  vertSpread: { label: 'VERT', min: 0, max: 300, step: 5, fmt: (v: number) => `${v}` },
  chaos: { label: 'CHAOS', min: 0, max: 1.0, step: 0.05, fmt: (v: number) => v.toFixed(2) },
  minTurnAngle: { label: 'TURN LIMIT', min: 0, max: 120, step: 5, fmt: (v: number) => `${v}°` },
  rMin: { label: 'R MIN', min: 0, max: 100, step: 1, fmt: (v: number) => `${v}` },
  rMax: { label: 'R MAX', min: 0, max: 100, step: 1, fmt: (v: number) => `${v}` },
  rOsc: { label: 'R VARY', min: 0, max: 1.0, step: 0.05, fmt: (v: number) => v.toFixed(2) },
  ringCount: { label: 'RING COUNT', min: 10, max: 300, step: 5, fmt: (v: number) => `${v}` },
  ringOpacity: { label: 'RING OPACITY', min: 0, max: 1.0, step: 0.05, fmt: (v: number) => v.toFixed(2) },
  wireOpacity: { label: 'GRID OPACITY', min: 0, max: 0.5, step: 0.01, fmt: (v: number) => v.toFixed(2) },
  surfaceOpacity: { label: 'SURF OPACITY', min: 0, max: 1.0, step: 0.05, fmt: (v: number) => v.toFixed(2) },
  gradStretch: { label: 'GRAD STRETCH', min: 0.1, max: 10.0, step: 0.1, fmt: (v: number) => v.toFixed(1) },
} satisfies Record<string, SliderCfg>

const ACCENT = '#3ff0e0'
const MONO = "'Courier New', ui-monospace, monospace"

function Section({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '11px 0' }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: '0.18em',
          color: `${ACCENT}66`,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function Divider(): React.JSX.Element {
  return <div style={{ height: 1, background: `${ACCENT}22`, margin: '0 -2px' }} />
}

function Slider({
  cfg,
  value,
  onChange,
}: {
  cfg: SliderCfg
  value: number
  onChange: (v: number) => void
}): React.JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ letterSpacing: '0.1em', color: '#8fd8d0', textTransform: 'uppercase' }}>
          {cfg.label}
        </span>
        <span style={{ color: '#e8fffb', fontVariantNumeric: 'tabular-nums' }}>{cfg.fmt(value)}</span>
      </div>
      <input
        type="range"
        min={cfg.min}
        max={cfg.max}
        step={cfg.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: ACCENT,
          height: 2,
          background: `${ACCENT}22`,
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ letterSpacing: '0.1em', color: '#8fd8d0', textTransform: 'uppercase' }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 34,
          height: 17,
          borderRadius: 9,
          background: value ? `${ACCENT}55` : 'rgba(255,255,255,0.07)',
          border: `1px solid ${value ? `${ACCENT}aa` : 'rgba(255,255,255,0.15)'}`,
          cursor: 'pointer',
          position: 'relative',
          padding: 0,
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: value ? '#eafffc' : '#ffffff44',
            position: 'absolute',
            top: 2,
            left: value ? 19 : 2,
            transition: 'left 0.15s',
          }}
        />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  COMPONENT
// ---------------------------------------------------------------------------
export default function TunnelModule(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<TunnelScene | null>(null)

  const [panelOpen, setPanelOpen] = useState(false)
  const [palette, setPalette] = useState<PalKey>(DEF.palette)
  const [fov, setFov] = useState<number>(DEF.fov)
  const [speed, setSpeed] = useState<number>(DEF.speed)
  const [twist, setTwist] = useState<number>(DEF.twist)
  const [camRoll, setCamRoll] = useState<number>(DEF.camRoll)
  const [autoRoll, setAutoRoll] = useState<boolean>(DEF.autoRoll)
  const [rollSpeed, setRollSpeed] = useState<number>(DEF.rollSpeed)
  const [numPoints, setNumPoints] = useState<number>(DEF.numPoints)
  const [spread, setSpread] = useState<number>(DEF.spread)
  const [vertSpread, setVertSpread] = useState<number>(DEF.vertSpread)
  const [chaos, setChaos] = useState<number>(DEF.chaos)
  const [minTurnAngle, setMinTurnAngle] = useState<number>(DEF.minTurnAngle)
  const [rMin, setRMin] = useState<number>(DEF.rMin)
  const [rMax, setRMax] = useState<number>(DEF.rMax)
  const [rOsc, setROsc] = useState<number>(DEF.rOsc)
  const [ringCount, setRingCount] = useState<number>(DEF.ringCount)
  const [ringOpacity, setRingOpacity] = useState<number>(DEF.ringOpacity)
  const [wireOpacity, setWireOpacity] = useState<number>(DEF.wireOpacity)
  const [surfaceOpacity, setSurfaceOpacity] = useState<number>(DEF.surfaceOpacity)
  const [gradStretch, setGradStretch] = useState<number>(DEF.gradStretch)

  // Loop-readable refs (seeded so the loop is correct before any sync effect runs).
  const speedRef = useRef<number>(DEF.speed)
  const twistRef = useRef<number>(DEF.twist)
  const rollRef = useRef<number>((DEF.camRoll * Math.PI) / 180)
  const autoRollRef = useRef<boolean>(DEF.autoRoll)
  const rollSpeedRef = useRef<number>(DEF.rollSpeed)
  const autoRollAngleRef = useRef<number>(0)
  const gradStretchRef = useRef<number>(DEF.gradStretch)
  const ringOpacityRef = useRef<number>(DEF.ringOpacity)
  const regenRef = useRef<RegenParams>({
    numPoints: DEF.numPoints,
    spread: DEF.spread,
    vertSpread: DEF.vertSpread,
    chaos: DEF.chaos,
    minTurnAngle: DEF.minTurnAngle,
    rMin: DEF.rMin,
    rMax: DEF.rMax,
    rOsc: DEF.rOsc,
    ringCount: DEF.ringCount,
  })
  const emitterRef = useRef<{ entities: Particle[]; timer: number }>({ entities: [], timer: 0 })
  const regenSignalRef = useRef(0)
  const [regenNonce, setRegenNonce] = useState(0)

  // Keep loop refs mirrored to state.
  useEffect(() => {
    speedRef.current = speed
    twistRef.current = twist
    rollRef.current = (camRoll * Math.PI) / 180
    autoRollRef.current = autoRoll
    rollSpeedRef.current = rollSpeed
    gradStretchRef.current = gradStretch
    ringOpacityRef.current = ringOpacity
    regenRef.current = {
      numPoints,
      spread,
      vertSpread,
      chaos,
      minTurnAngle,
      rMin,
      rMax,
      rOsc,
      ringCount,
    }
  }, [
    speed,
    twist,
    camRoll,
    autoRoll,
    rollSpeed,
    gradStretch,
    ringOpacity,
    numPoints,
    spread,
    vertSpread,
    chaos,
    minTurnAngle,
    rMin,
    rMax,
    rOsc,
    ringCount,
  ])

  // --- Three.js setup: single effect, one rAF loop, full cleanup. ---
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const readSize = (): { w: number; h: number } => ({
      w: Math.max(1, mount.clientWidth || 1),
      h: Math.max(1, mount.clientHeight || 1),
    })

    const { w, h } = readSize()
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.geo.maxPixelRatio))
    renderer.autoClear = true
    mount.appendChild(renderer.domElement)

    const { nearClip, farClip } = CONFIG.camera
    const camera = new THREE.PerspectiveCamera(DEF.fov, w / h, nearClip, farClip)

    const curve = generateCurve({
      numPoints: DEF.numPoints,
      spread: DEF.spread,
      vertSpread: DEF.vertSpread,
      chaos: DEF.chaos,
      minTurnAngle: DEF.minTurnAngle,
    })
    const rfn = makeRadiusFn(DEF.rMin, DEF.rMax, DEF.rOsc)

    const { tubeLongSegs, tubeRadSegs } = CONFIG.geo
    const p = PAL[DEF.palette]
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(p.bg)
    scene.fog = new THREE.FogExp2(p.bg, CONFIG.fog.density)

    const tex = makeGridTex(p.tbg, p.gl)
    const geo = buildVarTubeGeo(curve, tubeLongSegs, tubeRadSegs, rfn)

    const tm = CONFIG.tubeMat
    const tubeMat = new THREE.MeshStandardMaterial({
      map: tex,
      side: THREE.DoubleSide,
      roughness: tm.roughness,
      metalness: tm.metalness,
      color: new THREE.Color(p.tbg),
      emissive: new THREE.Color(p.tbg),
      emissiveIntensity: tm.emissiveIntensity,
      transparent: DEF.surfaceOpacity < 1,
      opacity: DEF.surfaceOpacity,
    })
    const wireMat = new THREE.MeshBasicMaterial({
      color: p.ring,
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: DEF.wireOpacity,
    })
    const tubeMesh = new THREE.Mesh(geo, tubeMat)
    const wireMesh = new THREE.Mesh(geo, wireMat)
    scene.add(tubeMesh, wireMesh)

    const ringGroup = new THREE.Group()
    const scatterGroup = new THREE.Group()
    const emitterGroup = new THREE.Group()
    scene.add(ringGroup, scatterGroup, emitterGroup)
    rebuildRings(ringGroup, curve, rfn, DEF.ringCount, INIT_GRAD, DEF.gradStretch, DEF.ringOpacity)
    rebuildScatterLights(scatterGroup, curve, p.l1, p.l2)

    scene.add(new THREE.AmbientLight(0xffffff, CONFIG.ambient.tunnelIntensity))
    const cl = CONFIG.camLights
    const camLight = new THREE.PointLight(p.l1, cl.keyIntensity, cl.keyDistance, cl.decay)
    const headLight = new THREE.PointLight(p.l2, cl.fillIntensity, cl.fillDistance, cl.decay)
    scene.add(camLight, headLight)

    sceneRef.current = {
      scene,
      camera,
      curve,
      rfn,
      tex,
      geo,
      tubeMat,
      wireMat,
      tubeMesh,
      wireMesh,
      ringGroup,
      scatterGroup,
      emitterGroup,
      camLight,
      headLight,
      t: 0,
    }
    emitterRef.current = { entities: [], timer: 0 }

    const { freq1, amp1, freq2, amp2 } = CONFIG.twistAnim
    const { speedScale, lookAheadT } = CONFIG.camera
    const { fillAheadT } = CONFIG.camLights
    const { pulseSpeed, pulseBase, pulseDepth, pulsePhase } = CONFIG.rings

    let rafId = 0
    let prevTime = 0

    const loop = (time: number): void => {
      rafId = requestAnimationFrame(loop)
      const s = sceneRef.current
      if (!s) return
      const elapsed = time * 0.001
      const dt = prevTime === 0 ? 0.016 : Math.min((time - prevTime) * 0.001, 0.1)
      prevTime = time

      const cameraStep = speedRef.current * speedScale
      s.t = (s.t + cameraStep) % 1
      const pos = s.curve.getPointAt(s.t)
      const lookPt = s.curve.getPointAt((s.t + lookAheadT) % 1)
      const farPt = s.curve.getPointAt((s.t + fillAheadT) % 1)

      if (autoRollRef.current) {
        autoRollAngleRef.current += (rollSpeedRef.current * dt * Math.PI) / 180
      }

      s.camera.position.copy(pos)
      s.camera.lookAt(lookPt)
      const animRoll =
        Math.sin(s.t * Math.PI * freq1 * twistRef.current) * amp1 +
        Math.sin(s.t * Math.PI * freq2 * twistRef.current) * amp2
      s.camera.rotateZ((autoRollRef.current ? autoRollAngleRef.current : rollRef.current) + animRoll)

      s.camLight.position.copy(pos)
      s.headLight.position.copy(farPt)

      s.ringGroup.children.forEach((child, i) => {
        const rm = child as RingMesh
        rm.material.emissiveIntensity = pulseBase + pulseDepth * Math.sin(elapsed * pulseSpeed + i * pulsePhase)
      })

      // --- Star emitter: stationary particles the camera flies past. ---
      const em = EMITTER
      const rt = emitterRef.current
      const velFactor = 1 - em.momentumDecay / 100

      for (let i = rt.entities.length - 1; i >= 0; i--) {
        const ent = rt.entities[i]!
        if (em.lifespan > 0 && elapsed - ent.spawnTime > em.lifespan) {
          s.emitterGroup.remove(ent.mesh)
          ent.mesh.geometry.dispose()
          ent.mesh.material.dispose()
          rt.entities.splice(i, 1)
          continue
        }
        ent.curveT = (((ent.curveT + cameraStep * velFactor) % 1) + 1) % 1
        ent.mesh.position.copy(
          particleWorldPos(s.curve, s.rfn, ent.curveT, ent.radialFraction, ent.angle, ent.sx, ent.sy, ent.jitter),
        )
      }

      while (rt.entities.length >= em.maxQuantity) {
        const old = rt.entities.shift()
        if (!old) break
        s.emitterGroup.remove(old.mesh)
        old.mesh.geometry.dispose()
        old.mesh.material.dispose()
      }

      rt.timer += dt
      while (rt.timer >= em.spawnInterval) {
        rt.timer -= em.spawnInterval
        for (let q = 0; q < em.quantity; q++) {
          if (rt.entities.length >= em.maxQuantity) {
            const old = rt.entities.shift()
            if (old) {
              s.emitterGroup.remove(old.mesh)
              old.mesh.geometry.dispose()
              old.mesh.material.dispose()
            }
          }
          const spawnT = (s.t + em.spawnAhead) % 1
          const angle = Math.random() * Math.PI * 2
          const radialFraction = (em.placementRadial / 100) * Math.sqrt(Math.random())
          const sx = (Math.random() - 0.5) * 2 * em.spreadX
          const sy = (Math.random() - 0.5) * 2 * em.spreadY
          const jitter = em.jitterMin + Math.random() * (em.jitterMax - em.jitterMin)
          const col = sampleGrad(spawnT, INIT_GRAD, gradStretchRef.current)
          const pGeo = new THREE.SphereGeometry(0.5 * em.entityScale, 6, 6)
          const pMat = new THREE.MeshStandardMaterial({
            color: col.clone(),
            emissive: col.clone(),
            emissiveIntensity: 2.5,
            roughness: 0.05,
            metalness: 0.3,
          })
          const mesh = new THREE.Mesh(pGeo, pMat)
          mesh.position.copy(
            particleWorldPos(s.curve, s.rfn, spawnT, radialFraction, angle, sx, sy, jitter),
          )
          s.emitterGroup.add(mesh)
          rt.entities.push({
            mesh,
            spawnTime: elapsed,
            curveT: spawnT,
            radialFraction,
            angle,
            sx,
            sy,
            jitter,
          })
        }
      }

      renderer.render(s.scene, s.camera)
    }
    rafId = requestAnimationFrame(loop)

    const onResize = (): void => {
      const { w: rw, h: rh } = readSize()
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
      renderer.setSize(rw, rh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
      // Dispose emitter particles.
      for (const ent of emitterRef.current.entities) {
        ent.mesh.geometry.dispose()
        ent.mesh.material.dispose()
      }
      emitterRef.current.entities = []
      // Dispose rings.
      for (const child of ringGroup.children as RingMesh[]) {
        child.geometry.dispose()
        child.material.dispose()
      }
      geo.dispose()
      tubeMat.dispose()
      wireMat.dispose()
      tex.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  // --- Regenerate curve + tube + rings + scatter (explicit action). ---
  useEffect(() => {
    if (regenSignalRef.current === regenNonce) return
    regenSignalRef.current = regenNonce
    const s = sceneRef.current
    if (!s) return
    const rp = regenRef.current
    const pal = PAL[palette]
    const curve = generateCurve({
      numPoints: rp.numPoints,
      spread: rp.spread,
      vertSpread: rp.vertSpread,
      chaos: rp.chaos,
      minTurnAngle: rp.minTurnAngle,
    })
    const rfn = makeRadiusFn(rp.rMin, rp.rMax, rp.rOsc)

    const newGeo = buildVarTubeGeo(curve, CONFIG.geo.tubeLongSegs, CONFIG.geo.tubeRadSegs, rfn)
    s.geo.dispose()
    s.geo = newGeo
    s.tubeMesh.geometry = newGeo
    s.wireMesh.geometry = newGeo

    const newTex = makeGridTex(pal.tbg, pal.gl)
    s.tex.dispose()
    s.tex = newTex
    s.tubeMat.map = newTex
    s.tubeMat.needsUpdate = true

    rebuildRings(s.ringGroup, curve, rfn, rp.ringCount, INIT_GRAD, gradStretchRef.current, ringOpacityRef.current)
    rebuildScatterLights(s.scatterGroup, curve, pal.l1, pal.l2)

    // Clear emitter particles so they re-seed onto the new path.
    for (const ent of emitterRef.current.entities) {
      s.emitterGroup.remove(ent.mesh)
      ent.mesh.geometry.dispose()
      ent.mesh.material.dispose()
    }
    emitterRef.current = { entities: [], timer: 0 }

    s.curve = curve
    s.rfn = rfn
    s.t = 0
  }, [regenNonce, palette])

  // --- Palette: background / fog / lights only (not ring/surface color). ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    const pal = PAL[palette]
    s.scene.background = new THREE.Color(pal.bg)
    s.scene.fog = new THREE.FogExp2(pal.bg, CONFIG.fog.density)
    s.camLight.color.set(pal.l1)
    s.headLight.color.set(pal.l2)
    rebuildScatterLights(s.scatterGroup, s.curve, pal.l1, pal.l2)
  }, [palette])

  // --- FOV hot-update. ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    s.camera.fov = fov
    s.camera.updateProjectionMatrix()
  }, [fov])

  // --- Ring count: rebuild ring meshes. ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    rebuildRings(s.ringGroup, s.curve, s.rfn, ringCount, INIT_GRAD, gradStretchRef.current, ringOpacityRef.current)
  }, [ringCount])

  // --- Ring opacity hot-update. ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    for (const child of s.ringGroup.children as RingMesh[]) {
      child.material.transparent = ringOpacity < 1
      child.material.opacity = ringOpacity
    }
  }, [ringOpacity])

  // --- Gradient stretch: recolor rings. ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    const n = s.ringGroup.children.length
    s.ringGroup.children.forEach((child, i) => {
      const rm = child as RingMesh
      const col = sampleGrad(i / Math.max(1, n - 1), INIT_GRAD, gradStretch)
      rm.material.color.copy(col)
      rm.material.emissive.copy(col)
    })
  }, [gradStretch])

  // --- Surface opacity hot-update. ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    s.tubeMat.transparent = surfaceOpacity < 1
    s.tubeMat.opacity = surfaceOpacity
    s.tubeMat.needsUpdate = true
  }, [surfaceOpacity])

  // --- Grid (wireframe) opacity hot-update. ---
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    s.wireMat.opacity = wireOpacity
  }, [wireOpacity])

  const handleRegen = (): void => setRegenNonce((n) => n + 1)

  // -------------------------------------------------------------------------
  //  RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {!panelOpen && (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            pointerEvents: 'auto',
            background: 'rgba(4,14,13,0.82)',
            border: `1px solid ${ACCENT}55`,
            borderRadius: 5,
            color: ACCENT,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '7px 13px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {'⚙'} Controls
        </button>
      )}

      {panelOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 268,
            maxHeight: 'calc(100% - 32px)',
            overflowY: 'auto',
            pointerEvents: 'auto',
            background: 'rgba(3,12,11,0.9)',
            border: `1px solid ${ACCENT}44`,
            borderRadius: 6,
            backdropFilter: 'blur(18px)',
            padding: '10px 16px 14px',
            fontFamily: MONO,
            fontSize: 11,
            color: '#cfeeea',
            boxShadow: `0 0 24px ${ACCENT}22`,
            scrollbarWidth: 'thin',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 4,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: '0.2em', color: ACCENT, textTransform: 'uppercase' }}>
              Tunnel {'·'} VIZ002
            </span>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: `${ACCENT}aa`,
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1,
                padding: 0,
              }}
            >
              {'✕'}
            </button>
          </div>
          <Divider />

          <Section label="Palette · lighting & bg">
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PAL_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPalette(k)}
                  style={{
                    padding: '3px 9px',
                    background: palette === k ? `${ACCENT}33` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${palette === k ? `${ACCENT}aa` : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 3,
                    color: palette === k ? '#eafffc' : '#9fcfca',
                    cursor: 'pointer',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </Section>
          <Divider />

          <Section label="Camera">
            <Slider cfg={SL.fov} value={fov} onChange={setFov} />
            <Slider cfg={SL.speed} value={speed} onChange={setSpeed} />
            <Slider cfg={SL.twist} value={twist} onChange={setTwist} />
            <Toggle label="Auto Roll" value={autoRoll} onChange={setAutoRoll} />
            {autoRoll ? (
              <Slider cfg={SL.rollSpeed} value={rollSpeed} onChange={setRollSpeed} />
            ) : (
              <Slider cfg={SL.camRoll} value={camRoll} onChange={setCamRoll} />
            )}
          </Section>
          <Divider />

          <Section label="Path shape">
            <Slider cfg={SL.numPoints} value={numPoints} onChange={setNumPoints} />
            <Slider cfg={SL.spread} value={spread} onChange={setSpread} />
            <Slider cfg={SL.vertSpread} value={vertSpread} onChange={setVertSpread} />
            <Slider cfg={SL.chaos} value={chaos} onChange={setChaos} />
            <Slider cfg={SL.minTurnAngle} value={minTurnAngle} onChange={setMinTurnAngle} />
            <Slider cfg={SL.rMin} value={rMin} onChange={setRMin} />
            <Slider cfg={SL.rMax} value={rMax} onChange={setRMax} />
            <Slider cfg={SL.rOsc} value={rOsc} onChange={setROsc} />
            <button
              type="button"
              onClick={handleRegen}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '7px 0',
                background: `${ACCENT}18`,
                border: `1px solid ${ACCENT}66`,
                borderRadius: 3,
                color: ACCENT,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {'↺'} Regenerate Path
            </button>
          </Section>
          <Divider />

          <Section label="Layers">
            <Slider cfg={SL.ringCount} value={ringCount} onChange={setRingCount} />
            <Slider cfg={SL.ringOpacity} value={ringOpacity} onChange={setRingOpacity} />
            <Slider cfg={SL.surfaceOpacity} value={surfaceOpacity} onChange={setSurfaceOpacity} />
            <Slider cfg={SL.wireOpacity} value={wireOpacity} onChange={setWireOpacity} />
            <Slider cfg={SL.gradStretch} value={gradStretch} onChange={setGradStretch} />
          </Section>
        </div>
      )}
    </div>
  )
}
