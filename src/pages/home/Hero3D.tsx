import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, OrbitControls, Stars } from '@react-three/drei'
import type { Group } from 'three'
import { Container, buttonStyles } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { site } from '@/config/site'

/**
 * The Pages-side answer to "can we have a carousel hero?": a real 3D carousel.
 * A ring of colored cards rotates on its own and responds to drag; an HTML
 * overlay shows the active identity's copy in the site's own type. This is the
 * thing the GitHub profile's hero image links out to.
 */

const RADIUS = 2.6

function Card({ index, color }: { index: number; color: string }) {
  const count = site.heroFaces.length
  const angle = (index / count) * Math.PI * 2
  const x = Math.sin(angle) * RADIUS
  const z = Math.cos(angle) * RADIUS
  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <RoundedBox args={[1.9, 2.6, 0.12]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.28}
          metalness={0.35}
          roughness={0.35}
        />
      </RoundedBox>
      {/* thin bright rim on the front face */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[1.7, 2.4]} />
        <meshStandardMaterial
          color="#0d1117"
          emissive={color}
          emissiveIntensity={0.12}
          transparent
          opacity={0.82}
        />
      </mesh>
    </group>
  )
}

function Carousel({
  paused,
  onFront,
  targetRef,
  rotRef,
}: {
  paused: boolean
  onFront: (i: number) => void
  // When non-null, the ring eases toward this Y rotation and parks (manual nav).
  targetRef: React.MutableRefObject<number | null>
  // Latest ring Y rotation, mirrored out so the overlay can compute next/prev.
  rotRef: React.MutableRefObject<number>
}) {
  const ring = useRef<Group>(null)
  const last = useRef(-1)
  const count = site.heroFaces.length

  useFrame((_, delta) => {
    const g = ring.current
    if (!g) return
    const target = targetRef.current
    if (target !== null) {
      // Ease toward the requested card and hold there.
      const step = (target - g.rotation.y) * Math.min(1, delta * 6)
      g.rotation.y += step
      if (Math.abs(target - g.rotation.y) < 0.0005) g.rotation.y = target
    } else if (!paused) {
      g.rotation.y += delta * 0.35
    }
    rotRef.current = g.rotation.y
    // Which card currently faces the camera (+z)? Report it for the overlay.
    const twoPi = Math.PI * 2
    const rot = ((-g.rotation.y % twoPi) + twoPi) % twoPi
    const front = Math.round((rot / twoPi) * count) % count
    if (front !== last.current) {
      last.current = front
      onFront(front)
    }
  })

  return (
    <group ref={ring}>
      {site.heroFaces.map((f, i) => (
        <Card key={f.kicker} index={i} color={f.color} />
      ))}
    </group>
  )
}

export function Hero3D() {
  const [paused, setPaused] = useState(false)
  const [front, setFront] = useState(0)
  const face = useMemo(() => site.heroFaces[front] ?? site.heroFaces[0], [front])
  const count = site.heroFaces.length

  const targetRef = useRef<number | null>(null)
  const rotRef = useRef(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Rotate the ring one card in a direction and park it there (dir +1 = next).
  const step = useCallback(
    (dir: number) => {
      const stepAngle = (Math.PI * 2) / count
      const snapped = Math.round(rotRef.current / stepAngle) * stepAngle
      targetRef.current = snapped - dir * stepAngle
    },
    [count],
  )

  // Jump straight to a specific card, taking the shortest way around the ring.
  const goTo = useCallback(
    (index: number) => {
      const twoPi = Math.PI * 2
      const base = -index * (twoPi / count)
      const k = Math.round((rotRef.current - base) / twoPi)
      targetRef.current = base + k * twoPi
    },
    [count],
  )

  // Left/right arrow keys step the ring — only while the hero is hovered or
  // focused, so we never hijack the page's normal arrow-key scrolling.
  useEffect(() => {
    if (count <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const el = sectionRef.current
      if (!el) return
      if (!el.matches(':hover') && !el.contains(document.activeElement)) return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      e.preventDefault()
      step(e.key === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, step])

  const arrowBtn =
    'group/arrow absolute top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 hover:bg-white/20 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 group-hover:opacity-100 motion-reduce:transition-none'

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={site.headline}
      className="group relative border-b border-border bg-bg"
    >
      {/* 3D layer. Clearing targetRef on drag hands control back to free spin. */}
      <div
        className="absolute inset-0"
        onPointerDown={() => {
          setPaused(true)
          targetRef.current = null
        }}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <Canvas camera={{ position: [0, 0.4, 6.2], fov: 42 }} dpr={[1, 2]}>
          <color attach="background" args={['#0b0f16']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 5]} intensity={1.1} />
          <pointLight position={[-6, -2, -4]} intensity={40} color="#4c8bf5" />
          <Suspense fallback={null}>
            <Stars radius={60} depth={40} count={1800} factor={4} fade speed={1} />
            <Carousel
              paused={paused}
              onFront={setFront}
              targetRef={targetRef}
              rotRef={rotRef}
            />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 2.4}
            maxPolarAngle={Math.PI / 2.4}
          />
        </Canvas>
      </div>

      {/* Edge arrows: hover-reveal, vertically centered on the canvas. */}
      <button
        type="button"
        onClick={() => step(-1)}
        className={cn(arrowBtn, 'left-4')}
        aria-label="Previous"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        className={cn(arrowBtn, 'right-4')}
        aria-label="Next"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Copy overlay — pointer-events off so drags fall through to the canvas */}
      <Container className="pointer-events-none relative grid min-h-[78vh] content-center gap-6 py-16">
        <div className="max-w-xl">
          <p
            className="mb-3 text-sm font-semibold tracking-widest transition-colors duration-500"
            style={{ color: face.color }}
          >
            {face.kicker}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            {site.headline}
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/70">{site.intro}</p>

          <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('work')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className={buttonStyles({ className: 'shadow-lg' })}
            >
              See the work →
            </button>
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/50 hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>

          {/* face indicator dots — clickable to jump to a card */}
          <div className="pointer-events-auto mt-8 flex gap-2" role="tablist" aria-label="Select identity">
            {site.heroFaces.map((f, i) => (
              <button
                key={f.kicker}
                type="button"
                role="tab"
                aria-selected={i === front}
                aria-label={f.kicker}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                  i === front ? 'w-8' : 'w-1.5 bg-white/25 hover:bg-white/50',
                )}
                style={i === front ? { backgroundColor: f.color } : undefined}
              />
            ))}
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-6 right-6 text-xs text-white/40">
          drag, tap arrows, or use ← → ·  {face.sub}
        </p>
      </Container>
    </section>
  )
}
