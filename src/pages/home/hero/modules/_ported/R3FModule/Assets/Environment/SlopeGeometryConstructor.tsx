import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';

/**
 * 2-char slope directions:
 *   'NS' => North edge is high, South edge is low
 *   'SN' => South edge is high, North edge is low
 *   'EW' => East edge is high,  West edge is low
 *   'WE' => West edge is high,  East edge is low
 *
 * 4-char directions:
 *   - Original diagonals: 'NESW', 'NWSE', 'SWNE', 'SENW'
 *   - Overlap (becomes 2-char): 'NWSW', 'NESE', 'SWSW', 'SESE'
 *   - New "inverted/convex": 'ENWS', 'WSEN', 'ESWN', 'WNES'
 */
import { CornerOffsets } from './GridTileConstructor';

export type SlopeDirection =
  | 'NS' | 'SN' | 'EW' | 'WE'
  | 'NESW' | 'NWSE' | 'SWNE' | 'SENW'
  | 'NWSW' | 'NESE' | 'SWSW' | 'SESE'
  | 'ENWS' | 'WSEN' | 'ESWN' | 'WNES';

/** Props for the React component */
interface SlopeGeometryConstructorProps {
  meshKey: string;
  position: [number, number, number];
  slopeParams: {
    angle: number;
    direction: SlopeDirection;
    color?: string;
    top?: number;
    baseThickness?: number;
    cornerOffsets?: CornerOffsets | null;
  };
}



/**
 * Builds a 1×1 slope tile with custom BufferGeometry:
 * - 2-char directions => wedge (6 faces)
 * - 4-char => diagonal tile (7 faces)
 * - No extra .5 offsets
 * - North is z=1, South is z=0, East is x=1, West = x=0
 * - So 'NS' => top edge at z=1 is high
 */
const SlopeGeometryConstructor: React.FC<SlopeGeometryConstructorProps> = ({
  meshKey,
  position,
  slopeParams
}) => {
  // 1) Base Y: if slopeParams.top is defined, use that. Otherwise fallback:
  const baseY = slopeParams.top !== undefined
    ? slopeParams.top
    : slopeParams.baseThickness ?? 0;

  // 2) Convert angle => vertical “delta”
  const angleRad = THREE.MathUtils.degToRad(slopeParams.angle);
  const delta = Math.floor(Math.tan(angleRad)/.25) * .25;
  const cornerOffsets = slopeParams.cornerOffsets
  // console.log(delta)

  // 3) Build geometry
  const geometry = useMemo(() => {
    const dir = slopeParams.direction;

    if (dir.length === 2) {
      // 2-char => wedge w/ 6 faces
      return buildTwoCharSlope(dir as any, baseY, delta);
    } else {
      // 4-char => diagonal w/ 7 faces
      return buildFourCharSlope(dir as SlopeDirection, baseY, delta, cornerOffsets ?? null, position);
    }
  }, [baseY, delta, slopeParams.direction]);

  // 4) Color
  const slopeColor = slopeParams.color || '#ff8c00';

  // Memoize the material for reuse and performance
  // const material = useMemo(
  //   () =>
  //     new THREE.MeshPhysicalMaterial({
  //       color: slopeColor, // Apply slopeColor directly
  //       roughness: 0.1, // Match cube tiles
  //       vertexColors: false, // Unless you're explicitly using vertex colors
  //       transparent: false,
  //       depthWrite: true,
  //       side: THREE.DoubleSide,
  //     }),
  //   [slopeColor]
  // );
// Memoize the material
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      vertexColors: true, // Use vertex colors for consistent shading
      transparent: false,
      depthWrite: true,
      roughness: 0.1,
      side: THREE.DoubleSide,
      flatShading: true,
    });
}, []);

  const vertexColors = useMemo(() => {
    const color = new THREE.Color(slopeColor);
    const colors = new Float32Array(geometry.attributes.position.count * 3); // RGB
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colors.set([color.r, color.g, color.b], i * 3);
    }
    return colors;
  }, [slopeColor, geometry]);
  
  // Attach vertex colors to the geometry
  useEffect(() => {
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(vertexColors, 3)
    );
  }, [geometry, vertexColors]);
  
  // 5) Return the slope mesh (double-sided so no face flicker)
  return (
    <mesh key={meshKey} position={position} geometry={geometry}>
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default SlopeGeometryConstructor;

/* ----------------------------------------------------------------------------
   TWO‐CHAR SLOPE: 'NS','SN','EW','WE'
   No .5 offsets, corners:
     B0 => (x=0, y=baseY, z=0) => SW
     B1 => (x=0, y=baseY, z=1) => NW
     B2 => (x=1, y=baseY, z=1) => NE
     B3 => (x=1, y=baseY, z=0) => SE
   'NS' => B1,B2 are high (z=1).
   'SN' => B0,B3 are high (z=0).
   'EW' => B2,B3 are high (x=1).
   'WE' => B0,B1 are high (x=0).
---------------------------------------------------------------------------- */
function buildTwoCharSlope(
  dir: 'NS' | 'SN' | 'EW' | 'WE',
  baseY: number,
  delta: number
): THREE.BufferGeometry {
  const B0 = new THREE.Vector3(0, baseY, 0); // SW
  const B1 = new THREE.Vector3(0, baseY, 1); // NW
  const B2 = new THREE.Vector3(1, baseY, 1); // NE
  const B3 = new THREE.Vector3(1, baseY, 0); // SE

  // top corners initially same
  const T0 = B0.clone();
  const T1 = B1.clone();
  const T2 = B2.clone();
  const T3 = B3.clone();

  const yH = baseY + delta;


  // Adjust these to adjust direction
  switch (dir) {
    case 'NS':
      // // north => corners B0,B1 => T0,T1
      // T0.y = yH; 
      // T1.y = yH;
      T0.y = yH;
      T3.y = yH;

      break;
    case 'SN':
      // south => corners B2,B3 => T2,T3
      // T2.y = yH;
      // T3.y = yH;
      // west => corners B0,B3 => T0,T3
      T1.y = yH;
      T2.y = yH;
      break;
    case 'EW':
      // east => corners B1,B2 => T1,T2
      // T1.y = yH;
      // T2.y = yH;
      // south => corners B2,B3 => T2,T3
      T2.y = yH;
      T3.y = yH;
      break;
    case 'WE':
      // // west => corners B0,B3 => T0,T3
      // T0.y = yH;
      // T3.y = yH;
            // north => corners B0,B1 => T0,T1
      T0.y = yH; 
      T1.y = yH;
      break;
  }

  const allVerts = [B0,B1,B2,B3, T0,T1,T2,T3];
  // 6 faces => 12 triangles
  const indices = [
    // bottom
    0,1,2,   2,3,0,
    // top
    4,5,6,   6,7,4,
    // front => B0,B3,T3,T0 => (0,3,7,4)
    0,3,7,   7,4,0,
    // right => B3,B2,T2,T3 => (3,2,6,7)
    3,2,6,   6,7,3,
    // back  => B2,B1,T1,T2 => (2,1,5,6)
    2,1,5,   5,6,2,
    // left  => B1,B0,T0,T1 => (1,0,4,5)
    1,0,4,   4,5,1,
  ];

  return buildBufferGeometry(allVerts, indices);
}

/* ----------------------------------------------------------------------------
   FOUR‐CHAR SLOPE: 'NESW','NWSE','SWNE','SENW'
   Same corner layout as above, but top corners can be:
     - high (y=baseY+delta)
     - low (y=baseY)
     - mid (y=baseY+delta/2)
   Then the top face is 2 triangles => 7 faces total.
---------------------------------------------------------------------------- */
function buildFourCharSlope(
  // dir:
  //   | 'NESW' | 'NWSE' | 'SWNE' | 'SENW'    // existing diagonal slopes
  //   | 'NWSW' | 'NESE' | 'SWSW' | 'SESE'    // overlap => 2-char
  //   | 'ENWS' | 'WSEN' | 'ESWN' | 'WNES'    // new “inverted/convex” strings
  // ,
  dir: SlopeDirection,
  baseY: number,
  delta: number,
  cornerOffsets: CornerOffsets | null,
  position: [number,number,number] // Used for debugging
): THREE.BufferGeometry {

  // 1) Check for known "overlap" patterns that should degrade to 2-letter slope
  const twoLetterDir = getTwoLetterOverlap(dir);
  if (twoLetterDir) {
    return buildTwoCharSlope(twoLetterDir, baseY, delta);
  }

    // 2) Otherwise build a proper corner diagonal slope:
  // First, define bottom corners
  const B0 = new THREE.Vector3(0, baseY, 0); 
  const B1 = new THREE.Vector3(0, baseY, 1); 
  const B2 = new THREE.Vector3(1, baseY, 1); 
  const B3 = new THREE.Vector3(1, baseY, 0); 

  const yH = baseY + delta;
  const yM = baseY + delta / 2;
  const yL = baseY;

  // top corners start at mid
  const T0 = new THREE.Vector3(0, yM, 0);
  const T1 = new THREE.Vector3(0, yM, 1);
  const T2 = new THREE.Vector3(1, yM, 1);
  const T3 = new THREE.Vector3(1, yM, 0);

  const O0 = (cornerOffsets?.NW ?? 0);
  const O1 = (cornerOffsets?.NE ?? 0);
  const O2 = (cornerOffsets?.SW ?? 0);
  const O3 = (cornerOffsets?.SE ?? 0);

  // function applyHighLowSets(direction: string) {
  //   function cornersFor(letter: string) {
  //     switch (letter) {
  //       case 'N': return [T1];
  //       case 'S': return [T0];
  //       case 'E': return [T2];
  //       case 'W': return [T3];
  //       default:  return [];
  //     }
  //   }

  // "first 2 letters => high, last 2 => low"
  function cornersFor(letter: string) {
    switch (letter) {

      case 'N': return [T0, T3]; // NW + NE
      case 'E': return [T2, T3]; // SE + NE
      case 'S': return [T1, T2]; // SW + SE
      case 'W': return [T0, T1]; // NW + SW
      default: return [];
    }
  }
  const highSet = new Set([...cornersFor(dir[0]), ...cornersFor(dir[1])]);
  const lowSet  = new Set([...cornersFor(dir[2]), ...cornersFor(dir[3])]);

  // high overrides low, else remain mid
  [T0,T1,T2,T3].forEach((corner) => {
    if (highSet.has(corner)) corner.y = yH;
    else if (lowSet.has(corner)) corner.y = yL;
  });

  console.log(`CORNER OFFSETS for (${position[0]+.5},${position[2]+.5}):`, O0,O1,O2,O3, "O1,O2,O3,O4, SW, NW, NE, SW")
  
  const allVerts = [B0,B1,B2,B3, T0,T1,T2,T3];

  const topTriIndices = (() => {
    
    switch (dir) {
      case 'ENWS':
      // We want T1,T2 => high, T0,T3 => low
      T0.y = yL + O0; // SW /NW -> low
      T1.y = yL + O2; // NW /NE -> low
      T2.y = yL + O3; // SE /SE -> low
      T3.y = yH + O1; // NE /SW -> high
      // NW->SE diagonal
      return [4, 5, 7, 5, 6, 7];
      
      // break;

      case 'ESWN':
      // We want T2,T1 => high, T3,T0 => low
      T0.y = yL + O0;  // NW
      T1.y = yL + O2;  // NE
      T2.y = yH + O3;  // SE
      T3.y = yL + O1;  // SW
      // Let's pick NW->SE again: T0->T2
      return [4, 5, 6, 4, 6, 7];
      break;

      case 'WSEN':
        // We want T0,T3 => high, T1,T2 => low
        T0.y = yL + O0;  // NW
        T1.y = yH + O2;  // SW
        T2.y = yL + O3;  // SE
        T3.y = yL + O1;  // NE
        // Diagonal => SW->NE: T1->T3 => [4,5,7, 5,6,7]
        return [4, 5, 7, 5, 6, 7];
        break;

    case 'WNES':
      // We want T3,T0 => high, T2,T1 => low
      T0.y = yH + O0;  // NW
      T1.y = yL + O2;  // NE
      T2.y = yL + O3;  // SE
      T3.y = yL + O1;  // SW
      // We'll do SW->NE: T1->T3 => [4,5,7, 5,6,7]
      // return [4, 5, 7, 5, 6, 7];
      return [4, 5, 6, 4, 6, 7];
      break;

      case 'SWNE':  // Southwest to Northeast diagonal
      case 'NESW':  // These should have SW to NE diagonal split
        return [4, 5, 7, 5, 6, 7];
        
      case 'NWSE':  // Northwest to Southeast diagonal
      case 'SENW':  // These should have NW to SE diagonal split
        return [4, 5, 6, 4, 6, 7];
        
      case 'NWSW':  // Handle corner cases
      case 'NESE':
      case 'SWSW':
      case 'SESE':
        // Determine appropriate diagonal based on which corners are high/low
        // We might need to analyze the specific corner heights for these cases
        return [4, 5, 6, 4, 6, 7];  
    }
  })();

  // Full indices for the geometry
  const indices = [
    // Bottom face
    0, 1, 2, 2, 3, 0,

    // Top face
    ...topTriIndices,

    // Sides
    0, 3, 7, 7, 4, 0, // Front
    3, 2, 6, 6, 7, 3, // Right
    2, 1, 5, 5, 6, 2, // Back
    1, 0, 4, 4, 5, 1, // Left
  ];

  return buildBufferGeometry(allVerts, indices);
}

/**
 * Returns a 2-letter slope if we detect an "overlap" pattern,
 * otherwise null. Extend this map as needed.
 */
function getTwoLetterOverlap(
  dir: string
): 'NS' | 'SN' | 'EW' | 'WE' | null {
  // Your custom re-mappings:
  switch (dir) {
    case 'NWSW': return 'NS';
    case 'SENE': return 'SN';
    case 'NWNE': return 'WE';
    // Add others if needed
    default: return null;
  }
}

/* ----------------------------------------------------------------------------
   buildBufferGeometry: 
   Takes an array of 8 corner Vector3, plus an index array for faces,
   returns a single BufferGeometry with vertex normals computed.
   Double-sided rendering is controlled in <meshStandardMaterial side=...>
---------------------------------------------------------------------------- */
function buildBufferGeometry(
  verts: THREE.Vector3[],
  inds: number[]
): THREE.BufferGeometry {
    // console.log("Vertices:", verts);
  // console.log("Indices:", inds);

  const positions = new Float32Array(verts.length * 3);
  verts.forEach((v, i) => {
    positions[i * 3 + 0] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  });

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(inds);

  geom.computeVertexNormals(); // Recompute normals for proper shading

  return geom;
}