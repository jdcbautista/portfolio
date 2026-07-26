import { Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useFBX, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The footer avatar, ported from the r3f-demo-1 prototype: the low-poly
 * character (`model-low-poly-dude.fbx`) plays the walk clip (`anim-walking.fbx`)
 * in place while the camera orbits. The original prototype created the mixer but
 * never called mixer.update() in a frame loop — that's fixed here, and the root
 * translation track is stripped so it walks in place instead of drifting.
 */

// Base-aware so it resolves under /portfolio/ in production and / in dev.
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`

function Walker() {
  const character = useFBX(asset('model-low-poly-dude.fbx'))
  const animation = useFBX(asset('anim-walking.fbx'))

  const mixer = useMemo(() => {
    const m = new THREE.AnimationMixer(character)
    const clip = animation.animations[0].clone()
    // Drop root/hip translation tracks -> walk in place, no drift.
    clip.tracks = clip.tracks.filter((t) => !t.name.endsWith('.position'))
    m.clipAction(clip).play()
    return m
  }, [character, animation])

  useFrame((_, delta) => mixer.update(delta))

  return (
    <primitive object={character} scale={0.0125} position={[0, -1.05, 0]} />
  )
}

export function FooterAvatar() {
  return (
    <div className="relative h-72 w-full">
      <Canvas camera={{ position: [0, 0.5, 3.2], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#4c8bf5" />
        <Suspense fallback={null}>
          <Walker />
        </Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={2.2}
          enableZoom={false}
          enablePan={false}
          target={[0, 0.15, 0]}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted">
        still building · drag to spin
      </p>
    </div>
  )
}
