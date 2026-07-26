import { Suspense, useMemo, useRef, useState } from 'react'
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
}: {
  paused: boolean
  onFront: (i: number) => void
}) {
  const ring = useRef<Group>(null)
  const last = useRef(-1)
  const count = site.heroFaces.length

  useFrame((_, delta) => {
    const g = ring.current
    if (!g) return
    if (!paused) g.rotation.y += delta * 0.35
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

  return (
    <section className="relative border-b border-border bg-bg">
      {/* 3D layer */}
      <div
        className="absolute inset-0"
        onPointerDown={() => setPaused(true)}
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
            <Carousel paused={paused} onFront={setFront} />
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
            <a
              href="#work"
              className={buttonStyles({ className: 'shadow-lg' })}
            >
              See the work →
            </a>
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

          {/* face indicator dots */}
          <div className="mt-8 flex gap-2" aria-hidden="true">
            {site.heroFaces.map((f, i) => (
              <span
                key={f.kicker}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  i === front ? 'w-8' : 'w-1.5 bg-white/25',
                )}
                style={i === front ? { backgroundColor: f.color } : undefined}
              />
            ))}
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-6 right-6 text-xs text-white/40">
          drag to spin ·  {face.sub}
        </p>
      </Container>
    </section>
  )
}
