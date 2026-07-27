import { useEffect, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'

/**
 * VIZ001 "Smorb" — a faithful, self-contained React + Three.js port of the
 * Atlas chat visualizer. A glowing gradient orb pulses at the center, wrapped
 * in noise-displaced "smoke" shells, orbited by an additive particle field
 * (with fading trails), and punctuated by expanding "ping" rings. There is no
 * audio here, so an internal oscillator (a smooth breathing pulse that
 * occasionally spikes) drives the energy so the scene always looks alive.
 *
 * Everything below the imports is inlined on purpose: noise, gradient sampling,
 * easing, and vector helpers are fresh equivalents of the source app's shared
 * utilities — no cross-app imports.
 */

// ---------------------------------------------------------------------------
// Inlined helpers (fresh equivalents of the source shared utils)
// ---------------------------------------------------------------------------

interface GradientStop {
  color: string
  position: number
}

interface Vec3 {
  x: number
  y: number
  z: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

const easeInOutCubic = (value: number): number => {
  if (value < 0.5) return 4 * value * value * value
  return 1 - Math.pow(-2 * value + 2, 3) / 2
}

const noise3D = (x: number, y: number, z: number): number =>
  Math.sin(x * 2.1 + Math.cos(y * 1.8)) *
  Math.cos(y * 2.3 + Math.sin(z * 1.5)) *
  Math.sin(z * 1.9 + Math.cos(x * 2.4))

const normalizeVector = (x: number, y: number, z: number): Vec3 => {
  const length = Math.sqrt(x * x + y * y + z * z)
  if (length <= 0.000001) return { x: 1, y: 0, z: 0 }
  return { x: x / length, y: y / length, z: z / length }
}

const perpendicularUnitVector = (x: number, y: number, z: number): Vec3 => {
  const direction = normalizeVector(x, y, z)
  const up = Math.abs(direction.y) < 0.92 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 }
  let px = direction.y * up.z - direction.z * up.y
  let py = direction.z * up.x - direction.x * up.z
  let pz = direction.x * up.y - direction.y * up.x
  let length = Math.sqrt(px * px + py * py + pz * pz)
  if (length <= 0.000001) {
    px = -direction.z
    py = 0
    pz = direction.x
    length = Math.sqrt(px * px + py * py + pz * pz)
  }
  if (length <= 0.000001) return { x: 0, y: 1, z: 0 }
  return { x: px / length, y: py / length, z: pz / length }
}

const toWrappedUnit = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  const wrapped = value % 1
  return wrapped < 0 ? wrapped + 1 : wrapped
}

const toPingPongUnit = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  const wrapped = value % 2
  const normalized = wrapped < 0 ? wrapped + 2 : wrapped
  return normalized <= 1 ? normalized : 2 - normalized
}

const getOpacityAtTime = (
  elapsed: number,
  duration: number,
  startOpacity: number,
  midOpacity: number,
  endOpacity: number,
): number => {
  if (duration <= 0) return endOpacity
  const progress = clamp(elapsed / duration, 0, 1)
  if (progress <= 0.5) {
    const local = progress * 2
    return startOpacity + (midOpacity - startOpacity) * local
  }
  const local = (progress - 0.5) * 2
  return midOpacity + (endOpacity - midOpacity) * local
}

// Sample a gradient into `target`, applying a hue rotation. Colors are mixed in
// linear THREE.Color space then hue-shifted with offsetHSL.
const gradientScratchA = new THREE.Color()
const gradientScratchB = new THREE.Color()
const sampleGradientColor = (
  stops: GradientStop[],
  rawT: number,
  hueShift: number,
  target: THREE.Color,
): THREE.Color => {
  if (stops.length === 0) {
    target.set('#4fc3f7')
  } else if (stops.length === 1) {
    target.set(stops[0].color)
  } else {
    const t = toWrappedUnit(rawT)
    const first = stops[0]
    const last = stops[stops.length - 1]
    if (t <= first.position) {
      target.set(first.color)
    } else if (t >= last.position) {
      target.set(last.color)
    } else {
      target.set(last.color)
      for (let index = 1; index < stops.length; index += 1) {
        const right = stops[index]
        if (t > right.position) continue
        const left = stops[index - 1]
        const span = Math.max(0.00001, right.position - left.position)
        const mix = clamp((t - left.position) / span, 0, 1)
        gradientScratchA.set(left.color)
        gradientScratchB.set(right.color)
        target.copy(gradientScratchA).lerp(gradientScratchB, mix)
        break
      }
    }
  }
  if (hueShift !== 0) target.offsetHSL(hueShift, 0, 0)
  return target
}

// Paint a horizontal gradient into a canvas (for the sphere's gradient texture),
// applying the current hue shift. Guards a null 2d context.
const hueColorScratch = new THREE.Color()
const drawGradientToCanvas = (
  canvas: HTMLCanvasElement,
  stops: GradientStop[],
  hueShift: number,
): void => {
  const width = canvas.width || 512
  const height = canvas.height || 64
  const context = canvas.getContext('2d')
  if (!context) return
  const gradient = context.createLinearGradient(0, 0, width, 0)
  for (const stop of stops) {
    hueColorScratch.set(stop.color)
    if (hueShift !== 0) hueColorScratch.offsetHSL(hueShift, 0, 0)
    gradient.addColorStop(clamp(stop.position, 0, 1), `#${hueColorScratch.getHexString()}`)
  }
  context.clearRect(0, 0, width, height)
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

const createCircleTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

const spawnPoint = (radiusStart: number, radiusEnd: number, deadzone: number): Vec3 => {
  const minRadius = Math.max(Math.min(radiusStart, radiusEnd), deadzone)
  const maxRadius = Math.max(Math.max(radiusStart, radiusEnd), deadzone + 0.01)
  const radius = minRadius + Math.random() * Math.max(0, maxRadius - minRadius)
  const theta = Math.random() * Math.PI * 2
  const phi = Math.random() * Math.PI
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  }
}

// ---------------------------------------------------------------------------
// Static configuration (ported from DEFAULT_VISUALIZER_CONFIG)
// ---------------------------------------------------------------------------

const SPHERE_GRADIENT: GradientStop[] = [
  { color: '#4fc3f7', position: 0 },
  { color: '#a6ebff', position: 1 },
]
const SMOKE_GRADIENT: GradientStop[] = [
  { color: '#00bcd4', position: 0 },
  { color: '#4fc3f7', position: 0.5 },
  { color: '#b8f6ff', position: 1 },
]
const PING_GRADIENT: GradientStop[] = [
  { color: '#00bcd4', position: 0 },
  { color: '#4fc3f7', position: 0.5 },
  { color: '#b8f6ff', position: 1 },
]
const PARTICLE_PALETTE: string[] = ['#4fc3f7', '#9de9ff', '#6ecbff']

const BACKGROUND_COLOR = '#040914'
const SPHERE_PULSE_SPEED = 5.0
const SMOKE_PULSE_SPEED = 2.0
const PULSE_RADIUS_START = 0.08
const PULSE_RADIUS_END = 0.26
const SMOKE_LAYER_COUNT = 3
const SMOKE_GEOMETRY_SEGMENTS = 48
const SMOKE_DISPLACEMENT_AMPLITUDE = 0.075
const SMOKE_DRIFT = 0.2
const SPHERE_WIDTH_SEGMENTS = 96
const SPHERE_HEIGHT_SEGMENTS = 96
const TAIL_SPAWN_INTERVAL = 0.1
const TRAIL_MOMENTUM = 0.55
const TAIL_FADE_TIME = 2.0
const TRAIL_POINT_COUNT = 900
const MAX_PING_RINGS = 96
const PING_RADIUS_START_PX = 72
const PING_RADIUS_END_PX = 1800
const PING_SPEED = 1.25
const PING_RING_DEPTH = 5
const CAMERA_DISTANCE = 5

// Per-field parameters for the background (inner) and foreground (outer) fields.
interface FieldParams {
  baseSize: number
  spawnRadiusMin: number
  spawnRadiusMax: number
  deadzone: number
  speed: number
  speedMultiplier: number
  lifespan: number
  fadeOut: number
  opacityStart: number
  opacityMid: number
  opacityEnd: number
  curvature: number
}

const BG_FIELD: FieldParams = {
  baseSize: 0.028,
  spawnRadiusMin: 0.6,
  spawnRadiusMax: 0.6,
  deadzone: 0.3,
  speed: 1.35,
  speedMultiplier: 1,
  lifespan: 3.4,
  fadeOut: 0.8,
  opacityStart: 0.18,
  opacityMid: 0.22,
  opacityEnd: 0,
  curvature: 0.4,
}
const FG_FIELD: FieldParams = {
  baseSize: 0.043,
  spawnRadiusMin: 2.5,
  spawnRadiusMax: 2.5,
  deadzone: 1.25,
  speed: 1.5,
  speedMultiplier: 1.2,
  lifespan: 3.0,
  fadeOut: 1,
  opacityStart: 0.28,
  opacityMid: 0.3,
  opacityEnd: 0,
  curvature: 1,
}

// ---------------------------------------------------------------------------
// Runtime data structures
// ---------------------------------------------------------------------------

interface ParticleData {
  x: number
  y: number
  z: number
  velocityX: number
  velocityY: number
  velocityZ: number
  opacity: number
  age: number
  lifespan: number
  fadeDuration: number
  travelLimit: number
  trailSpawnAccumulator: number
  colorR: number
  colorG: number
  colorB: number
  curveSeedX: number
  curveSeedY: number
  curveAxisX: number
  curveAxisY: number
  curveAxisZ: number
}

interface ParticleField {
  points: THREE.Points
  geometry: THREE.BufferGeometry
  material: THREE.PointsMaterial
  positions: Float32Array
  colors: Float32Array
  particles: ParticleData[]
  params: FieldParams
}

interface TrailField {
  points: THREE.Points
  geometry: THREE.BufferGeometry
  material: THREE.ShaderMaterial
  positions: Float32Array
  colors: Float32Array
  alphas: Float32Array
  ages: Float32Array
  active: Float32Array
  velocityX: Float32Array
  velocityY: Float32Array
  velocityZ: Float32Array
  initialVelocityX: Float32Array
  initialVelocityY: Float32Array
  initialVelocityZ: Float32Array
  sourceOpacity: Float32Array
  sourceColorR: Float32Array
  sourceColorG: Float32Array
  sourceColorB: Float32Array
  nextIndex: number
  maxPoints: number
}

interface SmokeLayer {
  phase: number
  baseScale: number
  driftX: number
  driftY: number
  driftZ: number
  position: THREE.Vector3
}

interface PingRing {
  startAtMs: number
  durationMs: number
  startSizePx: number
  endSizePx: number
  opacityStart: number
  opacityMid: number
  opacityEnd: number
  offsetXPx: number
  offsetYPx: number
  colorR: number
  colorG: number
  colorB: number
}

interface SmorbConfig {
  pulseAmount: number
  rotationSpeed: number
  particleCount: number
  showParticles: boolean
  smokeOpacity: number
  hueShift: number
  showPing: boolean
  pingRate: number
  backgroundOpacity: number
}

const DEFAULT_CONFIG: SmorbConfig = {
  pulseAmount: 0.6,
  rotationSpeed: 1,
  particleCount: 180,
  showParticles: true,
  smokeOpacity: 0.12,
  hueShift: 0,
  showPing: true,
  pingRate: 0.6,
  backgroundOpacity: 0,
}

interface FieldsApi {
  rebuild: (count: number) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SmorbModule() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const cfgRef = useRef<SmorbConfig>({ ...DEFAULT_CONFIG })
  const fieldsApiRef = useRef<FieldsApi | null>(null)

  const [pulseAmount, setPulseAmount] = useState<number>(DEFAULT_CONFIG.pulseAmount)
  const [rotationSpeed, setRotationSpeed] = useState<number>(DEFAULT_CONFIG.rotationSpeed)
  const [particleCount, setParticleCount] = useState<number>(DEFAULT_CONFIG.particleCount)
  const [showParticles, setShowParticles] = useState<boolean>(DEFAULT_CONFIG.showParticles)
  const [smokeOpacity, setSmokeOpacity] = useState<number>(DEFAULT_CONFIG.smokeOpacity)
  const [hueShift, setHueShift] = useState<number>(DEFAULT_CONFIG.hueShift)
  const [showPing, setShowPing] = useState<boolean>(DEFAULT_CONFIG.showPing)
  const [pingRate, setPingRate] = useState<number>(DEFAULT_CONFIG.pingRate)
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(DEFAULT_CONFIG.backgroundOpacity)
  const [collapsed, setCollapsed] = useState<boolean>(true)

  // Push control state into the ref the animation loop reads (no scene rebuild).
  useEffect(() => {
    cfgRef.current = {
      pulseAmount,
      rotationSpeed,
      particleCount,
      showParticles,
      smokeOpacity,
      hueShift,
      showPing,
      pingRate,
      backgroundOpacity,
    }
  }, [
    pulseAmount,
    rotationSpeed,
    particleCount,
    showParticles,
    smokeOpacity,
    hueShift,
    showPing,
    pingRate,
    backgroundOpacity,
  ])

  // Recreate the particle fields only when the count changes.
  useEffect(() => {
    fieldsApiRef.current?.rebuild(particleCount)
  }, [particleCount])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = CAMERA_DISTANCE

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    const clearColor = new THREE.Color(BACKGROUND_COLOR)
    renderer.setClearColor(clearColor, clamp(cfgRef.current.backgroundOpacity, 0, 1))
    mount.appendChild(renderer.domElement)

    // --- Lighting -----------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
    const pointLight1 = new THREE.PointLight(0xffffff, 0.9)
    pointLight1.position.set(10, 10, 10)
    scene.add(pointLight1)
    const pointLight2 = new THREE.PointLight(0x4fc3f7, 0.55)
    pointLight2.position.set(-10, -10, -10)
    scene.add(pointLight2)

    // --- Central gradient sphere -------------------------------------------
    const sphereGeometry = new THREE.SphereGeometry(1, SPHERE_WIDTH_SEGMENTS, SPHERE_HEIGHT_SEGMENTS)
    const sphereCanvas = document.createElement('canvas')
    sphereCanvas.width = 1024
    sphereCanvas.height = 64
    drawGradientToCanvas(sphereCanvas, SPHERE_GRADIENT, cfgRef.current.hueShift)
    const sphereTexture = new THREE.CanvasTexture(sphereCanvas)
    sphereTexture.wrapS = THREE.ClampToEdgeWrapping
    sphereTexture.wrapT = THREE.ClampToEdgeWrapping
    sphereTexture.needsUpdate = true
    const sphereUniforms = {
      uGradientMap: { value: sphereTexture as THREE.Texture },
      uDirection: { value: new THREE.Vector3(1, 0, 0) },
      uPhase: { value: 0 },
      uOpacity: { value: 0.3 },
      uPulse: { value: 0 },
    }
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: sphereUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      vertexShader: `
        varying vec3 vWorldNormal;
        void main() {
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uGradientMap;
        uniform vec3 uDirection;
        uniform float uPhase;
        uniform float uOpacity;
        uniform float uPulse;
        varying vec3 vWorldNormal;

        void main() {
          vec3 n = normalize(vWorldNormal);
          vec3 gradientDirection = normalize(uDirection);
          float t = clamp(dot(n, gradientDirection) * 0.5 + 0.5, 0.0, 1.0);
          float wrapped = fract(t + uPhase);
          float samplePos = 1.0 - abs(wrapped * 2.0 - 1.0);
          vec3 gradientColor = texture2D(uGradientMap, vec2(samplePos, 0.5)).rgb;
          float light = 0.68 + 0.32 * (dot(n, normalize(vec3(0.35, 0.45, 1.0))) * 0.5 + 0.5);
          float rim = pow(1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))), 1.8);
          vec3 color = gradientColor * light * (1.0 + uPulse * 0.55) + gradientColor * rim * 0.28;
          gl_FragColor = vec4(color, uOpacity);
        }
      `,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // --- Noise-displaced smoke shells --------------------------------------
    const smokeGeometry = new THREE.SphereGeometry(1, SMOKE_GEOMETRY_SEGMENTS, SMOKE_GEOMETRY_SEGMENTS)
    const smokePositions = smokeGeometry.attributes.position.array as Float32Array
    const smokeOriginalPositions = new Float32Array(smokePositions.length)
    smokeOriginalPositions.set(smokePositions)
    const smokeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: cfgRef.current.smokeOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const smokeMesh = new THREE.InstancedMesh(smokeGeometry, smokeMaterial, SMOKE_LAYER_COUNT)
    smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    smokeMesh.frustumCulled = false
    scene.add(smokeMesh)

    const smokeLayers: SmokeLayer[] = []
    const smokeTransform = new THREE.Object3D()
    const smokeColor = new THREE.Color('#00bcd4')
    for (let layerIndex = 0; layerIndex < SMOKE_LAYER_COUNT; layerIndex += 1) {
      const baseScale = 1.28 + layerIndex * 0.22
      smokeLayers.push({
        phase: Math.random() * Math.PI * 2,
        baseScale,
        driftX: (Math.random() - 0.5) * SMOKE_DRIFT,
        driftY: (Math.random() - 0.5) * SMOKE_DRIFT,
        driftZ: (Math.random() - 0.5) * SMOKE_DRIFT,
        position: new THREE.Vector3(),
      })
      smokeMesh.setColorAt(layerIndex, smokeColor)
      smokeTransform.position.set(0, 0, 0)
      smokeTransform.rotation.set(0, 0, 0)
      smokeTransform.scale.setScalar(baseScale)
      smokeTransform.updateMatrix()
      smokeMesh.setMatrixAt(layerIndex, smokeTransform.matrix)
    }
    smokeMesh.instanceMatrix.needsUpdate = true
    if (smokeMesh.instanceColor) {
      smokeMesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
      smokeMesh.instanceColor.needsUpdate = true
    }

    // --- Ping rings (instanced, billboarded) -------------------------------
    const pingGeometry = new THREE.RingGeometry(0.992, 1, 64, 1)
    const pingTintAttribute = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PING_RINGS * 3), 3)
    pingTintAttribute.setUsage(THREE.DynamicDrawUsage)
    for (let index = 0; index < MAX_PING_RINGS; index += 1) {
      pingTintAttribute.setXYZ(index, 1, 1, 1)
    }
    pingGeometry.setAttribute('instanceTint', pingTintAttribute)
    const pingAlphaAttribute = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PING_RINGS), 1)
    pingAlphaAttribute.setUsage(THREE.DynamicDrawUsage)
    pingGeometry.setAttribute('instanceAlpha', pingAlphaAttribute)
    const pingMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
      toneMapped: false,
      vertexShader: `
        attribute vec3 instanceTint;
        attribute float instanceAlpha;
        varying vec3 vInstanceTint;
        varying float vInstanceAlpha;
        void main() {
          vInstanceTint = instanceTint;
          vInstanceAlpha = instanceAlpha;
          vec3 transformed = position;
          #ifdef USE_INSTANCING
            transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
          #endif
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vInstanceTint;
        varying float vInstanceAlpha;
        void main() {
          float alpha = clamp(vInstanceAlpha, 0.0, 1.0);
          if (alpha <= 0.0001) discard;
          gl_FragColor = vec4(vInstanceTint, alpha);
        }
      `,
    })
    const pingMesh = new THREE.InstancedMesh(pingGeometry, pingMaterial, MAX_PING_RINGS)
    pingMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    pingMesh.count = 0
    pingMesh.frustumCulled = false
    pingMesh.renderOrder = 3
    scene.add(pingMesh)

    const pingTransform = new THREE.Object3D()
    const pingColorScratch = new THREE.Color('#4fc3f7')
    const pingCenter = new THREE.Vector3()
    const pingRight = new THREE.Vector3(1, 0, 0)
    const pingUp = new THREE.Vector3(0, 1, 0)
    const pingForward = new THREE.Vector3(0, 0, -1)
    const activePings: PingRing[] = []
    let pingAccumulator = 0

    const circleTexture = createCircleTexture()

    // --- Particle + trail fields -------------------------------------------
    const createParticleField = (count: number, params: FieldParams): ParticleField => {
      const particles: ParticleData[] = []
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const spawnColor = new THREE.Color()
      const baseTravelLimit = Math.max(
        Math.max(params.spawnRadiusMin, params.spawnRadiusMax) * 1.45,
        params.deadzone + 0.35,
      )
      for (let index = 0; index < count; index += 1) {
        const spawn = spawnPoint(params.spawnRadiusMin, params.spawnRadiusMax, params.deadzone)
        const outward = normalizeVector(spawn.x, spawn.y, spawn.z)
        const moveDirection = normalizeVector(
          outward.x + (Math.random() - 0.5) * 0.55,
          outward.y + (Math.random() - 0.5) * 0.55,
          outward.z + (Math.random() - 0.5) * 0.55,
        )
        const initialSpeed = (0.45 + Math.random() * 0.55) * params.speedMultiplier
        const lifeDuration = Math.max(0.1, params.lifespan)
        const fadeOutDuration = Math.max(0, params.fadeOut)
        const totalLifetime = Math.max(0.1, lifeDuration + fadeOutDuration)
        const paletteIndex = Math.floor(Math.random() * PARTICLE_PALETTE.length)
        spawnColor.set(PARTICLE_PALETTE[paletteIndex] ?? PARTICLE_PALETTE[0])
        if (cfgRef.current.hueShift !== 0) spawnColor.offsetHSL(cfgRef.current.hueShift, 0, 0)
        const curveAxis = normalizeVector(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        particles.push({
          x: spawn.x,
          y: spawn.y,
          z: spawn.z,
          velocityX: moveDirection.x * initialSpeed,
          velocityY: moveDirection.y * initialSpeed,
          velocityZ: moveDirection.z * initialSpeed,
          opacity: params.opacityStart,
          age: Math.random() * totalLifetime,
          lifespan: lifeDuration,
          fadeDuration: fadeOutDuration,
          travelLimit: baseTravelLimit * (0.72 + Math.random() * 0.64),
          trailSpawnAccumulator: 0,
          colorR: spawnColor.r,
          colorG: spawnColor.g,
          colorB: spawnColor.b,
          curveSeedX: Math.random(),
          curveSeedY: Math.random(),
          curveAxisX: curveAxis.x,
          curveAxisY: curveAxis.y,
          curveAxisZ: curveAxis.z,
        })
        colors[index * 3] = spawnColor.r * params.opacityStart
        colors[index * 3 + 1] = spawnColor.g * params.opacityStart
        colors[index * 3 + 2] = spawnColor.b * params.opacityStart
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const material = new THREE.PointsMaterial({
        size: params.baseSize,
        transparent: true,
        sizeAttenuation: true,
        depthWrite: false,
        map: circleTexture,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      })
      const points = new THREE.Points(geometry, material)
      return { points, geometry, material, positions, colors, particles, params }
    }

    const createTrailField = (maxPoints: number, pointSize: number): TrailField => {
      const positions = new Float32Array(maxPoints * 3)
      const colors = new Float32Array(maxPoints * 3)
      const alphas = new Float32Array(maxPoints)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1))
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: circleTexture as THREE.Texture },
          uPointSize: { value: pointSize },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: `
          attribute vec3 color;
          attribute float alpha;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float uPointSize;
          void main() {
            vColor = color;
            vAlpha = alpha;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float perspectiveSize = uPointSize * (1400.0 / max(0.0001, -mvPosition.z));
            gl_PointSize = clamp(perspectiveSize, 1.0, 64.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec4 tex = texture2D(uTexture, gl_PointCoord);
            float alpha = tex.a * vAlpha;
            if (alpha <= 0.0001) discard;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
      })
      const points = new THREE.Points(geometry, material)
      return {
        points,
        geometry,
        material,
        positions,
        colors,
        alphas,
        ages: new Float32Array(maxPoints),
        active: new Float32Array(maxPoints),
        velocityX: new Float32Array(maxPoints),
        velocityY: new Float32Array(maxPoints),
        velocityZ: new Float32Array(maxPoints),
        initialVelocityX: new Float32Array(maxPoints),
        initialVelocityY: new Float32Array(maxPoints),
        initialVelocityZ: new Float32Array(maxPoints),
        sourceOpacity: new Float32Array(maxPoints),
        sourceColorR: new Float32Array(maxPoints),
        sourceColorG: new Float32Array(maxPoints),
        sourceColorB: new Float32Array(maxPoints),
        nextIndex: 0,
        maxPoints,
      }
    }

    const disposeParticleField = (field: ParticleField): void => {
      scene.remove(field.points)
      field.geometry.dispose()
      field.material.dispose()
    }

    const backgroundTrail = createTrailField(TRAIL_POINT_COUNT, 0.022)
    const foregroundTrail = createTrailField(TRAIL_POINT_COUNT, 0.028)
    scene.add(backgroundTrail.points)
    scene.add(foregroundTrail.points)

    let backgroundField: ParticleField = createParticleField(DEFAULT_CONFIG.particleCount, BG_FIELD)
    let foregroundField: ParticleField = createParticleField(DEFAULT_CONFIG.particleCount, FG_FIELD)
    scene.add(backgroundField.points)
    scene.add(foregroundField.points)
    let fieldCount = DEFAULT_CONFIG.particleCount

    fieldsApiRef.current = {
      rebuild: (count: number): void => {
        const nextCount = Math.max(0, Math.round(count))
        if (nextCount === fieldCount) return
        disposeParticleField(backgroundField)
        disposeParticleField(foregroundField)
        backgroundField = createParticleField(nextCount, BG_FIELD)
        foregroundField = createParticleField(nextCount, FG_FIELD)
        scene.add(backgroundField.points)
        scene.add(foregroundField.points)
        fieldCount = nextCount
      },
    }

    // --- Field simulation ---------------------------------------------------
    const updateField = (
      field: ParticleField,
      trailField: TrailField,
      delta: number,
      intensity: number,
      trailsEnabled: boolean,
      hueShift: number,
      spawnColor: THREE.Color,
    ): void => {
      const params = field.params
      const targetSpeed = clamp(params.speed * (0.8 + intensity * 0.85), 0.22, 8)
      const spawnMin = Math.min(params.spawnRadiusMin, params.spawnRadiusMax)
      const spawnMax = Math.max(params.spawnRadiusMin, params.spawnRadiusMax)
      const baseTravelRadius = Math.max(spawnMax * 1.45, params.deadzone + 0.35)

      for (let index = 0; index < field.particles.length; index += 1) {
        const particle = field.particles[index]
        particle.age += delta

        if (params.curvature > 0) {
          const velocityDirection = normalizeVector(particle.velocityX, particle.velocityY, particle.velocityZ)
          const curveAxis = normalizeVector(particle.curveAxisX, particle.curveAxisY, particle.curveAxisZ)
          let basisAX = velocityDirection.y * curveAxis.z - velocityDirection.z * curveAxis.y
          let basisAY = velocityDirection.z * curveAxis.x - velocityDirection.x * curveAxis.z
          let basisAZ = velocityDirection.x * curveAxis.y - velocityDirection.y * curveAxis.x
          const basisALength = Math.sqrt(basisAX * basisAX + basisAY * basisAY + basisAZ * basisAZ)
          if (basisALength > 0.000001) {
            basisAX /= basisALength
            basisAY /= basisALength
            basisAZ /= basisALength
          } else {
            const fallback = perpendicularUnitVector(velocityDirection.x, velocityDirection.y, velocityDirection.z)
            basisAX = fallback.x
            basisAY = fallback.y
            basisAZ = fallback.z
          }
          let sideX = basisAX * (particle.curveSeedX <= 0.5 ? 1 : -1)
          let sideY = basisAY * (particle.curveSeedX <= 0.5 ? 1 : -1)
          let sideZ = basisAZ * (particle.curveSeedX <= 0.5 ? 1 : -1)
          const axisJitter = params.curvature * delta * 0.24
          sideX += (Math.random() - 0.5) * axisJitter
          sideY += (Math.random() - 0.5) * axisJitter
          sideZ += (Math.random() - 0.5) * axisJitter
          const sideLength = Math.sqrt(sideX * sideX + sideY * sideY + sideZ * sideZ)
          if (sideLength > 0.000001) {
            sideX /= sideLength
            sideY /= sideLength
            sideZ /= sideLength
          }
          const lifeProgress = clamp(particle.age / Math.max(0.0001, particle.lifespan), 0, 1)
          const lifeCurvature = 0.55 + 0.45 * Math.sin(Math.PI * lifeProgress)
          const turnStrength = params.curvature * (0.4 + intensity * 0.6) * lifeCurvature
          const curveForce = turnStrength * targetSpeed * 2.2 * delta
          particle.velocityX += sideX * curveForce
          particle.velocityY += sideY * curveForce
          particle.velocityZ += sideZ * curveForce
        }

        const radialBefore = normalizeVector(particle.x, particle.y, particle.z)
        const outwardDrive = (0.42 + intensity * 0.56) * delta
        particle.velocityX += radialBefore.x * outwardDrive
        particle.velocityY += radialBefore.y * outwardDrive
        particle.velocityZ += radialBefore.z * outwardDrive

        let velocityMagnitude = Math.sqrt(
          particle.velocityX * particle.velocityX +
          particle.velocityY * particle.velocityY +
          particle.velocityZ * particle.velocityZ,
        )
        if (velocityMagnitude <= 0.00001) {
          particle.velocityX = radialBefore.x * targetSpeed
          particle.velocityY = radialBefore.y * targetSpeed
          particle.velocityZ = radialBefore.z * targetSpeed
          velocityMagnitude = targetSpeed
        }
        const speedBlend = clamp(delta * 3.2, 0, 1)
        const adjustedSpeed = lerp(velocityMagnitude, targetSpeed, speedBlend)
        const speedScale = adjustedSpeed / Math.max(0.00001, velocityMagnitude)
        particle.velocityX *= speedScale
        particle.velocityY *= speedScale
        particle.velocityZ *= speedScale

        particle.x += particle.velocityX * delta
        particle.y += particle.velocityY * delta
        particle.z += particle.velocityZ * delta

        let distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z)
        if (distance < params.deadzone) {
          const outward = distance <= 0.0001
            ? normalizeVector(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            : { x: particle.x / distance, y: particle.y / distance, z: particle.z / distance }
          const escapeRadius = params.deadzone + 0.02
          particle.x = outward.x * escapeRadius
          particle.y = outward.y * escapeRadius
          particle.z = outward.z * escapeRadius
          const escapeSpeed = targetSpeed * (1.05 + (params.deadzone - distance) * 0.8)
          particle.velocityX = outward.x * escapeSpeed
          particle.velocityY = outward.y * escapeSpeed
          particle.velocityZ = outward.z * escapeSpeed
          distance = escapeRadius
        }

        const travelLimit = clamp(
          Number.isFinite(particle.travelLimit) ? particle.travelLimit : baseTravelRadius,
          params.deadzone + 0.05,
          Math.max(baseTravelRadius * 2, params.deadzone + 0.1),
        )
        const totalLifetime = Math.max(0.1, particle.lifespan + particle.fadeDuration)
        if (distance > travelLimit || particle.age >= totalLifetime || !Number.isFinite(distance)) {
          const spawn = spawnPoint(spawnMin, spawnMax, params.deadzone)
          particle.x = spawn.x
          particle.y = spawn.y
          particle.z = spawn.z
          particle.lifespan = Math.max(0.1, params.lifespan)
          particle.fadeDuration = Math.max(0, params.fadeOut)
          particle.age = Math.random() * Math.max(0.1, particle.lifespan + particle.fadeDuration)
          particle.travelLimit = baseTravelRadius * (0.72 + Math.random() * 0.64)
          const spawnDir = normalizeVector(spawn.x, spawn.y, spawn.z)
          const moveDirection = normalizeVector(
            spawnDir.x + (Math.random() - 0.5) * 0.6,
            spawnDir.y + (Math.random() - 0.5) * 0.6,
            spawnDir.z + (Math.random() - 0.5) * 0.6,
          )
          const resetSpeed = targetSpeed * (0.7 + Math.random() * 0.4)
          particle.velocityX = moveDirection.x * resetSpeed
          particle.velocityY = moveDirection.y * resetSpeed
          particle.velocityZ = moveDirection.z * resetSpeed
          const paletteIndex = Math.floor(Math.random() * PARTICLE_PALETTE.length)
          spawnColor.set(PARTICLE_PALETTE[paletteIndex] ?? PARTICLE_PALETTE[0])
          if (hueShift !== 0) spawnColor.offsetHSL(hueShift, 0, 0)
          particle.colorR = spawnColor.r
          particle.colorG = spawnColor.g
          particle.colorB = spawnColor.b
          particle.curveSeedX = Math.random()
          particle.curveSeedY = Math.random()
          const nextCurveAxis = normalizeVector(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          particle.curveAxisX = nextCurveAxis.x
          particle.curveAxisY = nextCurveAxis.y
          particle.curveAxisZ = nextCurveAxis.z
          particle.trailSpawnAccumulator = Math.random() * TAIL_SPAWN_INTERVAL
        }

        if (particle.age <= particle.lifespan) {
          particle.opacity = getOpacityAtTime(
            particle.age,
            particle.lifespan,
            params.opacityStart,
            params.opacityMid,
            params.opacityEnd,
          )
        } else {
          const fadeProgress = particle.fadeDuration <= 0
            ? 1
            : clamp((particle.age - particle.lifespan) / particle.fadeDuration, 0, 1)
          particle.opacity = lerp(params.opacityEnd, 0, fadeProgress)
        }

        field.positions[index * 3] = particle.x
        field.positions[index * 3 + 1] = particle.y
        field.positions[index * 3 + 2] = particle.z
        field.colors[index * 3] = particle.colorR * particle.opacity
        field.colors[index * 3 + 1] = particle.colorG * particle.opacity
        field.colors[index * 3 + 2] = particle.colorB * particle.opacity

        if (trailsEnabled) {
          particle.trailSpawnAccumulator += delta
          let spawnsThisFrame = 0
          while (particle.trailSpawnAccumulator >= TAIL_SPAWN_INTERVAL) {
            const trailIndex = trailField.nextIndex
            trailField.positions[trailIndex * 3] = particle.x
            trailField.positions[trailIndex * 3 + 1] = particle.y
            trailField.positions[trailIndex * 3 + 2] = particle.z
            trailField.initialVelocityX[trailIndex] = particle.velocityX * TRAIL_MOMENTUM
            trailField.initialVelocityY[trailIndex] = particle.velocityY * TRAIL_MOMENTUM
            trailField.initialVelocityZ[trailIndex] = particle.velocityZ * TRAIL_MOMENTUM
            trailField.velocityX[trailIndex] = trailField.initialVelocityX[trailIndex]
            trailField.velocityY[trailIndex] = trailField.initialVelocityY[trailIndex]
            trailField.velocityZ[trailIndex] = trailField.initialVelocityZ[trailIndex]
            trailField.sourceOpacity[trailIndex] = clamp(particle.opacity, 0, 1)
            trailField.sourceColorR[trailIndex] = particle.colorR
            trailField.sourceColorG[trailIndex] = particle.colorG
            trailField.sourceColorB[trailIndex] = particle.colorB
            trailField.ages[trailIndex] = 0
            trailField.alphas[trailIndex] = trailField.sourceOpacity[trailIndex]
            trailField.active[trailIndex] = 1
            trailField.nextIndex = (trailIndex + 1) % trailField.maxPoints
            particle.trailSpawnAccumulator -= TAIL_SPAWN_INTERVAL
            spawnsThisFrame += 1
            if (spawnsThisFrame >= 3) {
              particle.trailSpawnAccumulator = Math.min(particle.trailSpawnAccumulator, TAIL_SPAWN_INTERVAL)
              break
            }
          }
        } else {
          particle.trailSpawnAccumulator = 0
        }
      }

      field.geometry.attributes.position.needsUpdate = true
      field.geometry.attributes.color.needsUpdate = true
    }

    const updateTrailField = (trailField: TrailField, delta: number, parentVisible: boolean): void => {
      for (let index = 0; index < trailField.maxPoints; index += 1) {
        if (trailField.active[index] <= 0) {
          trailField.colors[index * 3] = 0
          trailField.colors[index * 3 + 1] = 0
          trailField.colors[index * 3 + 2] = 0
          trailField.alphas[index] = 0
          continue
        }
        trailField.ages[index] += delta
        const progress = clamp(trailField.ages[index] / TAIL_FADE_TIME, 0, 1)
        const remainingMomentum = 1 - progress
        trailField.velocityX[index] = trailField.initialVelocityX[index] * remainingMomentum
        trailField.velocityY[index] = trailField.initialVelocityY[index] * remainingMomentum
        trailField.velocityZ[index] = trailField.initialVelocityZ[index] * remainingMomentum
        trailField.positions[index * 3] += trailField.velocityX[index] * delta
        trailField.positions[index * 3 + 1] += trailField.velocityY[index] * delta
        trailField.positions[index * 3 + 2] += trailField.velocityZ[index] * delta
        trailField.colors[index * 3] = trailField.sourceColorR[index]
        trailField.colors[index * 3 + 1] = trailField.sourceColorG[index]
        trailField.colors[index * 3 + 2] = trailField.sourceColorB[index]
        const sourceOpacity = clamp(trailField.sourceOpacity[index], 0, 1)
        const opacityCurve = getOpacityAtTime(trailField.ages[index], TAIL_FADE_TIME, 0.7, 0.5, 0)
        trailField.alphas[index] = parentVisible ? sourceOpacity * opacityCurve : 0
        if (progress >= 0.999) {
          trailField.active[index] = 0
          trailField.colors[index * 3] = 0
          trailField.colors[index * 3 + 1] = 0
          trailField.colors[index * 3 + 2] = 0
          trailField.alphas[index] = 0
        }
      }
      trailField.geometry.attributes.position.needsUpdate = true
      trailField.geometry.attributes.color.needsUpdate = true
      trailField.geometry.attributes.alpha.needsUpdate = true
    }

    // --- Ping emission ------------------------------------------------------
    const pingGradientColor = new THREE.Color('#4fc3f7')
    const emitPing = (nowMs: number, elapsed: number, hueShift: number): void => {
      if (activePings.length >= MAX_PING_RINGS) activePings.shift()
      const ringDurationMs = (3 / Math.max(0.3, PING_SPEED)) * 1000
      sampleGradientColor(PING_GRADIENT, elapsed * 0.08, hueShift, pingGradientColor)
      const jitterPx = 0.2 * 42
      activePings.push({
        startAtMs: nowMs,
        durationMs: ringDurationMs + 120,
        startSizePx: PING_RADIUS_START_PX,
        endSizePx: PING_RADIUS_END_PX,
        opacityStart: 0.8,
        opacityMid: 0.2,
        opacityEnd: 0,
        offsetXPx: (Math.random() - 0.5) * jitterPx * 2,
        offsetYPx: (Math.random() - 0.5) * jitterPx * 2,
        colorR: pingGradientColor.r,
        colorG: pingGradientColor.g,
        colorB: pingGradientColor.b,
      })
    }

    // --- Resize -------------------------------------------------------------
    const resize = (): void => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    window.addEventListener('resize', resize)
    resize()

    // --- Animation loop -----------------------------------------------------
    const clock = new THREE.Clock()
    const sphereDirection = new THREE.Vector3(1, 0, 0)
    const spawnColorScratch = new THREE.Color()
    let frameHandle = 0
    let orbitYaw = 0
    let energyPulse = 0
    let spikeValue = 0
    let lastSphereHue = cfgRef.current.hueShift

    const animate = (nowMs: number): void => {
      frameHandle = window.requestAnimationFrame(animate)
      if (document.hidden) return

      const cfg = cfgRef.current
      const delta = clamp(clock.getDelta(), 0, 0.05)
      const elapsed = clock.elapsedTime

      renderer.setClearColor(clearColor, clamp(cfg.backgroundOpacity, 0, 1))

      // Internal energy oscillator: a smooth breathing baseline that occasionally
      // spikes. Replaces the source's `speaking` boolean.
      spikeValue *= Math.pow(0.5, delta / 0.35)
      let spikedThisFrame = false
      if (Math.random() < delta * 0.7) {
        spikeValue = 1
        spikedThisFrame = true
      }
      const baseline = 0.5 + 0.5 * Math.sin(elapsed * 1.4)
      const energyTarget = clamp(cfg.pulseAmount * (0.35 + baseline * 0.4 + spikeValue * 0.7), 0, 1)
      energyPulse += (energyTarget - energyPulse) * clamp(delta * 4, 0, 1)
      const easedEnergy = easeInOutCubic(energyPulse)

      // Camera: gentle orbit + vertical bob keeps the composition alive.
      orbitYaw += cfg.rotationSpeed * 0.12 * delta
      if (Math.abs(orbitYaw) > Math.PI * 4) orbitYaw %= Math.PI * 2
      camera.position.x = Math.sin(orbitYaw) * CAMERA_DISTANCE * 0.35
      camera.position.y = Math.sin(elapsed * 0.3) * 0.4
      camera.position.z = Math.cos(orbitYaw) * CAMERA_DISTANCE
      camera.lookAt(0, 0, 0)

      // Sphere pulse + gradient.
      const pulseSpan = PULSE_RADIUS_END - PULSE_RADIUS_START
      const pulseAmplitude = PULSE_RADIUS_START + pulseSpan * easedEnergy
      const spherePulse = Math.sin(elapsed * SPHERE_PULSE_SPEED) * pulseAmplitude
      const smokePulse = Math.sin(elapsed * SMOKE_PULSE_SPEED) * pulseAmplitude
      sphere.rotation.y = elapsed * 0.18 * cfg.rotationSpeed
      sphere.rotation.x = Math.sin(elapsed * 0.2) * 0.1
      sphere.scale.setScalar(1 + spherePulse)

      if (Math.abs(cfg.hueShift - lastSphereHue) > 0.001) {
        drawGradientToCanvas(sphereCanvas, SPHERE_GRADIENT, cfg.hueShift)
        sphereTexture.needsUpdate = true
        lastSphereHue = cfg.hueShift
      }
      sphereDirection.set(1, 0, 0).normalize()
      sphereUniforms.uDirection.value.copy(sphereDirection)
      sphereUniforms.uPhase.value = toWrappedUnit(elapsed * 0.04)
      sphereUniforms.uPulse.value = easedEnergy

      // Smoke shells: noise-displace shared geometry, then per-layer transforms.
      for (let idx = 0; idx < smokePositions.length; idx += 3) {
        const ox = smokeOriginalPositions[idx]
        const oy = smokeOriginalPositions[idx + 1]
        const oz = smokeOriginalPositions[idx + 2]
        const displacement =
          noise3D(ox * 2 + elapsed * 0.5, oy * 2 + elapsed * 0.35, oz * 2 + elapsed * 0.45) *
          SMOKE_DISPLACEMENT_AMPLITUDE
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1
        smokePositions[idx] = ox + (ox / len) * displacement
        smokePositions[idx + 1] = oy + (oy / len) * displacement
        smokePositions[idx + 2] = oz + (oz / len) * displacement
      }
      smokeGeometry.attributes.position.needsUpdate = true
      smokeMaterial.opacity = cfg.smokeOpacity * (1 + easedEnergy * 0.45)
      for (let layerIndex = 0; layerIndex < smokeLayers.length; layerIndex += 1) {
        const layer = smokeLayers[layerIndex]
        const layerTime = elapsed + layer.phase
        layer.position.x += layer.driftX * delta
        layer.position.y += layer.driftY * delta
        layer.position.z += layer.driftZ * delta
        const driftDistance = layer.position.length()
        if (driftDistance > 0.3) layer.position.multiplyScalar(0.95)
        smokeTransform.position.copy(layer.position)
        smokeTransform.rotation.y = layerTime * 0.14 * cfg.rotationSpeed * (layerIndex % 2 === 0 ? 1 : -1)
        smokeTransform.rotation.z = Math.sin(layerTime * 0.38) * 0.18
        smokeTransform.scale.setScalar(layer.baseScale * (1 + smokePulse * 0.52))
        smokeTransform.updateMatrix()
        smokeMesh.setMatrixAt(layerIndex, smokeTransform.matrix)
        const smokePhase = toPingPongUnit(elapsed * 0.03 + layerIndex * 0.2)
        sampleGradientColor(SMOKE_GRADIENT, smokePhase, cfg.hueShift, smokeColor)
        smokeMesh.setColorAt(layerIndex, smokeColor)
      }
      smokeMesh.instanceMatrix.needsUpdate = true
      if (smokeMesh.instanceColor) smokeMesh.instanceColor.needsUpdate = true

      // Particles + trails.
      const intensity = 0.35 + easedEnergy
      backgroundField.points.visible = cfg.showParticles
      foregroundField.points.visible = cfg.showParticles
      backgroundTrail.points.visible = cfg.showParticles
      foregroundTrail.points.visible = cfg.showParticles
      if (cfg.showParticles) {
        updateField(backgroundField, backgroundTrail, delta, intensity, true, cfg.hueShift, spawnColorScratch)
        updateField(foregroundField, foregroundTrail, delta, intensity, true, cfg.hueShift, spawnColorScratch)
        updateTrailField(backgroundTrail, delta, true)
        updateTrailField(foregroundTrail, delta, true)
      }

      // Ping rings.
      if (!cfg.showPing) {
        activePings.length = 0
        pingAccumulator = 0
        pingMesh.visible = false
        pingMesh.count = 0
      } else {
        const interval = 1 / clamp(cfg.pingRate, 0.1, 6)
        pingAccumulator += delta
        while (pingAccumulator >= interval) {
          pingAccumulator -= interval
          emitPing(nowMs, elapsed, cfg.hueShift)
        }
        if (spikedThisFrame) emitPing(nowMs, elapsed, cfg.hueShift)

        const viewportHeight = Math.max(1, mount.clientHeight)
        const worldHeightAtDepth = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * PING_RING_DEPTH
        const worldUnitsPerPixel = worldHeightAtDepth / viewportHeight
        camera.getWorldDirection(pingForward)
        pingCenter.copy(camera.position).addScaledVector(pingForward, PING_RING_DEPTH)
        pingRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
        pingUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize()

        let ringInstanceCount = 0
        for (let ringIndex = activePings.length - 1; ringIndex >= 0; ringIndex -= 1) {
          const ring = activePings[ringIndex]
          const elapsedMs = nowMs - ring.startAtMs
          if (!Number.isFinite(elapsedMs) || elapsedMs >= ring.durationMs) {
            activePings.splice(ringIndex, 1)
            continue
          }
          const expansionProgress = clamp(elapsedMs / Math.max(1, ring.durationMs), 0, 1)
          const ringSizePx = lerp(ring.startSizePx, ring.endSizePx, expansionProgress)
          const baseOpacity = getOpacityAtTime(
            elapsedMs,
            ring.durationMs,
            ring.opacityStart,
            ring.opacityMid,
            ring.opacityEnd,
          )
          const ringOpacity = clamp(baseOpacity * (1 - expansionProgress), 0, 1)
          if (ringOpacity <= 0.03) {
            activePings.splice(ringIndex, 1)
            continue
          }
          const ringRadiusWorld = Math.max(0.0001, ringSizePx * 0.5 * worldUnitsPerPixel)
          pingTransform.position.copy(pingCenter)
          pingTransform.position.addScaledVector(pingRight, ring.offsetXPx * worldUnitsPerPixel)
          pingTransform.position.addScaledVector(pingUp, ring.offsetYPx * worldUnitsPerPixel)
          pingTransform.quaternion.copy(camera.quaternion)
          pingTransform.scale.set(ringRadiusWorld, ringRadiusWorld, 1)
          pingTransform.updateMatrix()
          pingMesh.setMatrixAt(ringInstanceCount, pingTransform.matrix)
          pingColorScratch.setRGB(ring.colorR, ring.colorG, ring.colorB)
          pingTintAttribute.setXYZ(ringInstanceCount, pingColorScratch.r, pingColorScratch.g, pingColorScratch.b)
          pingAlphaAttribute.setX(ringInstanceCount, ringOpacity)
          ringInstanceCount += 1
          if (ringInstanceCount >= MAX_PING_RINGS) break
        }
        pingMesh.visible = ringInstanceCount > 0
        pingMesh.count = ringInstanceCount
        pingMesh.instanceMatrix.needsUpdate = true
        pingAlphaAttribute.needsUpdate = true
        pingTintAttribute.needsUpdate = true
      }

      renderer.render(scene, camera)
    }
    frameHandle = window.requestAnimationFrame(animate)

    // --- Cleanup ------------------------------------------------------------
    return () => {
      window.cancelAnimationFrame(frameHandle)
      window.removeEventListener('resize', resize)
      fieldsApiRef.current = null
      activePings.length = 0
      sphereGeometry.dispose()
      sphereMaterial.dispose()
      sphereTexture.dispose()
      smokeGeometry.dispose()
      smokeMaterial.dispose()
      pingGeometry.dispose()
      pingMaterial.dispose()
      disposeParticleField(backgroundField)
      disposeParticleField(foregroundField)
      backgroundTrail.geometry.dispose()
      backgroundTrail.material.dispose()
      foregroundTrail.geometry.dispose()
      foregroundTrail.material.dispose()
      circleTexture.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  // -------------------------------------------------------------------------
  // Control panel (collapsible, default-collapsed, bottom-right)
  // -------------------------------------------------------------------------
  const panelStyle: CSSProperties = {
    position: 'absolute',
    right: 12,
    bottom: 12,
    pointerEvents: 'auto',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  }
  const toggleStyle: CSSProperties = {
    appearance: 'none',
    cursor: 'pointer',
    border: '1px solid rgba(79,195,247,0.4)',
    borderRadius: 999,
    background: 'rgba(8,14,24,0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#9de9ff',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '6px 12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
  }
  const cardStyle: CSSProperties = {
    width: 230,
    border: '1px solid rgba(79,195,247,0.28)',
    borderRadius: 12,
    background: 'rgba(6,11,20,0.74)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    color: '#cfe9ff',
  }

  return (
    <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={panelStyle}>
        {!collapsed && (
          <div style={cardStyle}>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4fc3f7', fontWeight: 600 }}>
              Smorb
            </div>
            <SliderRow label="Pulse" value={pulseAmount} min={0} max={1.5} step={0.01} onChange={setPulseAmount} />
            <SliderRow label="Rotation" value={rotationSpeed} min={0} max={4} step={0.05} onChange={setRotationSpeed} />
            <SliderRow label="Hue" value={hueShift} min={-0.5} max={0.5} step={0.01} onChange={setHueShift} />
            <SliderRow label="Smoke" value={smokeOpacity} min={0} max={0.6} step={0.01} onChange={setSmokeOpacity} />
            <SliderRow
              label="Particles"
              value={particleCount}
              min={0}
              max={400}
              step={10}
              onChange={(next) => setParticleCount(Math.round(next))}
            />
            <ToggleRow label="Show particles" value={showParticles} onChange={setShowParticles} />
            <ToggleRow label="Ping rings" value={showPing} onChange={setShowPing} />
            <SliderRow label="Ping rate" value={pingRate} min={0.1} max={4} step={0.05} onChange={setPingRate} />
            <SliderRow label="BG opacity" value={backgroundOpacity} min={0} max={1} step={0.01} onChange={setBackgroundOpacity} />
          </div>
        )}
        <button type="button" style={toggleStyle} onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? 'Controls +' : 'Controls −'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small control rows (inline styles only)
// ---------------------------------------------------------------------------

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function SliderRow({ label, value, min, max, step, onChange }: SliderRowProps) {
  const rowStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 3 }
  const headStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    letterSpacing: '0.04em',
    color: '#a9c8de',
  }
  return (
    <label style={rowStyle}>
      <span style={headStyle}>
        <span>{label}</span>
        <span style={{ color: '#9de9ff' }}>{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: '100%', accentColor: '#4fc3f7', cursor: 'pointer' }}
      />
    </label>
  )
}

interface ToggleRowProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  const rowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    letterSpacing: '0.04em',
    color: '#a9c8de',
    cursor: 'pointer',
  }
  return (
    <label style={rowStyle}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        style={{ accentColor: '#4fc3f7', cursor: 'pointer' }}
      />
    </label>
  )
}
