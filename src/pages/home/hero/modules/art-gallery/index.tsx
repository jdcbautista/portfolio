import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Native r3f-9 art gallery: the real paintings (from public/art) hung in a ring,
 * framed, with an orbiting camera. A clean rebuild — no ported game framework.
 */
const FILES = [
  '1728_JordanHoward_1800x1200.jpg',
  '1724_Dawn_1200x1800.jpg',
  '1931_HarrisonFord_0900x1080.jpg',
  '1712_TheComedyOfHumility_1600x1200.jpg', // screencap — flag headband
  '1806_AMoreColorfulTomorrow_1440x1440.jpg',
  '2001_DonnaZarcone_1400x1680.jpg', // Donna Zarcone
  '1711_InRainbows_1600x1200.jpg', // Thom Yorke (Radiohead — In Rainbows)
  '1926_MellodyHobson_1400x1680.jpg', // Melody Hobson
  '1713_FromInfinityToInnovation_1440x1200.jpg', // Steve Jobs? — GUESS, please confirm
  '1805_LaylahAli_1440x1440.jpg',
  '1709_TheWayOfZen_1600x1200.jpg', // Alan Watts (The Way of Zen)
  // '1503_FinalRound_1600x1200.jpg', // screencap — boxer
  '1717_JackieII_1200x1200.jpg',
  '1502_YouAreBeautifulChildSoldier_1080x0792.jpg', // screencap — blue portrait? confirm
  // TODO: Meryl Streep, Tina Fey — need the file names (not identifiable from filenames)
]
const URLS = FILES.map((f) => `${import.meta.env.BASE_URL}art/Firestore/${f}`)
const aspectOf = (name: string) => {
  const m = name.match(/_(\d+)x(\d+)\.jpg$/i)
  return m ? Number(m[1]) / Number(m[2]) : 1
}

// Size the ring from the paintings themselves: circumference = sum of each
// painting's width + a gap, so more/larger paintings push the radius out and
// they never overlap. Each painting gets an arc slot proportional to its width.
const H = 2.6 // painting height (world units)
const GAP = 1.8 // clear space between paintings along the arc
const LAYOUT = (() => {
  const items = FILES.map((f) => {
    const w = H * aspectOf(f)
    return { w }
  })
  const circumference = items.reduce((s, it) => s + it.w + GAP, 0)
  const radius = circumference / (2 * Math.PI)
  let cursor = 0
  const placed = items.map((it) => {
    const angle = ((cursor + GAP / 2 + it.w / 2) / circumference) * Math.PI * 2
    cursor += it.w + GAP
    return { w: it.w, angle }
  })
  return { radius, placed }
})()

function Paintings() {
  const textures = useTexture(URLS) as THREE.Texture[]
  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
    })
  }, [textures])

  const radius = LAYOUT.radius
  const eyeY = 2.6

  return (
    <group>
      {textures.map((tex, i) => {
        const { angle, w } = LAYOUT.placed[i]
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        const h = H
        return (
          <group key={i} position={[x, eyeY, z]} rotation={[0, angle, 0]}>
            {/* frame */}
            <mesh position={[0, 0, -0.07]}>
              <boxGeometry args={[w + 0.3, h + 0.3, 0.14]} />
              <meshStandardMaterial color="#181b22" roughness={0.6} />
            </mesh>
            {/* the painting — pushed in front of the frame face to avoid z-fighting */}
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial map={tex} toneMapped={false} />
            </mesh>
            {/* little spotlight glow strip above */}
            <mesh position={[0, h / 2 + 0.35, 0.1]}>
              <boxGeometry args={[w * 0.7, 0.05, 0.05]} />
              <meshStandardMaterial color="#fff2cc" emissive="#ffcf66" emissiveIntensity={1.2} />
            </mesh>
          </group>
        )
      })}
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[radius + 4, 64]} />
        <meshStandardMaterial color="#0c0f15" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function ArtGalleryModule() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, LAYOUT.radius * 0.55, LAYOUT.radius * 1.7], fov: 45 }}
      >
        <color attach="background" args={['#0b0f16']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 12, 8]} intensity={0.8} />
        <pointLight position={[0, LAYOUT.radius, 0]} intensity={LAYOUT.radius * 6} color="#9fc0ff" />
        <Suspense fallback={null}>
          <Paintings />
        </Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.55}
          enableZoom={false}
          enablePan={false}
          target={[0, 2.4, 0]}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}
