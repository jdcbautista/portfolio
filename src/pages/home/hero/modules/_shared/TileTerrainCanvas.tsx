import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Shared, native r3f-9 renderer for the source's tile-terrain boards
 * (Sokoban, Tactics — same `{ coords, props }` JSON shape). A clean rebuild of
 * the source's GridTileConstructor + GeometryInstantiator, faithful to its two
 * key rendering rules:
 *   • solid presets render as lit boxes tinted by the preset color;
 *   • `renderTopOnly` presets (water) render as a single SEMI-TRANSPARENT plane
 *     at the tile's top — a water surface, not an opaque block.
 * Colors/opacity mirror the source TILE_PRESETS exactly.
 */
interface TilePreset {
  color: string
  opacity: number
  /** water-style surface: draw only a translucent top plane, no box. */
  topOnly: boolean
  roughness: number
  metalness: number
}

const TILE_PRESETS: Record<string, TilePreset> = {
  stone: { color: '#808080', opacity: 1, topOnly: false, roughness: 0.85, metalness: 0.05 },
  stockbrick: { color: '#cbc3ad', opacity: 1, topOnly: false, roughness: 0.9, metalness: 0.02 },
  wood: { color: '#d3b199', opacity: 1, topOnly: false, roughness: 0.75, metalness: 0.03 },
  grass: { color: '#4caf50', opacity: 1, topOnly: false, roughness: 0.8, metalness: 0.02 },
  dirt: { color: '#8b4513', opacity: 1, topOnly: false, roughness: 0.95, metalness: 0.02 },
  snow: { color: '#eef3f7', opacity: 1, topOnly: false, roughness: 0.6, metalness: 0.02 },
  water: { color: '#0088dd', opacity: 0.6, topOnly: true, roughness: 0.12, metalness: 0.2 },
  default: { color: '#c0c0c0', opacity: 1, topOnly: false, roughness: 0.8, metalness: 0.05 },
}

type Vec3 = [number, number, number]

type Tile = {
  coords: [number, number]
  props: { presetConfigStr: string; heightTopPos: number; heightBotPos: number }
}

interface SolidTile {
  key: string
  pos: Vec3
  size: Vec3
  color: string
  roughness: number
  metalness: number
}

interface WaterTile {
  key: string
  pos: Vec3
  color: string
}

interface Board {
  solids: SolidTile[]
  waters: WaterTile[]
  cx: number
  cz: number
}

function useBoard(data: Tile[]): Board {
  return useMemo<Board>(() => {
    let minX = Infinity
    let maxX = -Infinity
    let minZ = Infinity
    let maxZ = -Infinity
    const solids: SolidTile[] = []
    const waters: WaterTile[] = []

    data.forEach((tile, i) => {
      const [x, z] = tile.coords
      const top = Number(tile.props?.heightTopPos) || 0
      const bot = Number(tile.props?.heightBotPos) || 0
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minZ = Math.min(minZ, z)
      maxZ = Math.max(maxZ, z)

      const preset = TILE_PRESETS[tile.props?.presetConfigStr] ?? TILE_PRESETS.default

      if (preset.topOnly) {
        // Water: a flat surface sitting at the tile's top height.
        waters.push({ key: `w-${i}-${x}-${z}`, pos: [x, top, z], color: preset.color })
      } else {
        const h = Math.max(0.1, top - bot)
        solids.push({
          key: `s-${i}-${x}-${z}`,
          pos: [x, (top + bot) / 2, z],
          size: [1, h, 1],
          color: preset.color,
          roughness: preset.roughness,
          metalness: preset.metalness,
        })
      }
    })

    return { solids, waters, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 }
  }, [data])
}

/**
 * All water tiles share one animated MeshPhysicalMaterial. A gentle opacity
 * shimmer + micro vertical bob reads as a living water surface. depthWrite:false
 * + DoubleSide + transparency matches the source's top-plane material.
 */
function WaterSurfaces({ tiles }: { tiles: WaterTile[] }) {
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tiles[0]?.color ?? TILE_PRESETS.water.color),
      transparent: true,
      opacity: TILE_PRESETS.water.opacity,
      roughness: TILE_PRESETS.water.roughness,
      metalness: TILE_PRESETS.water.metalness,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      reflectivity: 0.5,
    })
    return mat
  }, [tiles])
  useEffect(() => () => material.dispose(), [material])

  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    material.opacity = 0.5 + Math.sin(t * 1.3) * 0.08
    if (groupRef.current) groupRef.current.position.y = Math.sin(t * 0.9) * 0.015
  })

  return (
    <group ref={groupRef}>
      {tiles.map((w) => (
        <mesh key={w.key} position={w.pos} rotation={[-Math.PI / 2, 0, 0]} material={material}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  )
}

function BoardMesh({ data }: { data: Tile[] }) {
  const { solids, waters, cx, cz } = useBoard(data)
  return (
    <group position={[-cx, 0, -cz]}>
      {solids.map((s) => (
        <mesh key={s.key} position={s.pos} castShadow receiveShadow>
          <boxGeometry args={s.size} />
          <meshStandardMaterial color={s.color} roughness={s.roughness} metalness={s.metalness} />
        </mesh>
      ))}
      {waters.length > 0 && <WaterSurfaces tiles={waters} />}
    </group>
  )
}

export function TileTerrainCanvas({
  data,
  camera = [10, 9, 10],
}: {
  data: unknown
  camera?: Vec3
}) {
  return (
    <div className="absolute inset-0">
      <Canvas shadows camera={{ position: camera, fov: 42 }}>
        <color attach="background" args={['#0b0f16']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[12, 22, 8]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 6, -8]} intensity={0.4} color="#6ea8ff" />
        <BoardMesh data={data as Tile[]} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
          target={[0, 1, 0]}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  )
}
