import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * SimpleSlopeGeometryConstructor
 * 
 * Simpler version of SlopeGeometryConstructor that takes explicit corner heights
 * instead of calculating them from direction strings.
 * 
 * Used for stairs where we already know the exact corner positions.
 * 
 * Creates geometry centered from -0.5 to 0.5 in X and Z, so when scaled it
 * remains centered at the group position.
 */

interface CornerHeights {
  SW: number; // (-0.5, -0.5) - back-left
  SE: number; // (0.5, -0.5) - back-right  
  NE: number; // (0.5, 0.5) - front-right
  NW: number; // (-0.5, 0.5) - front-left
}

interface SimpleSlopeGeometryConstructorProps {
  meshKey: string;
  position: [number, number, number];
  slopeParams: {
    color?: string;
    baseY: number;
    cornerHeights: CornerHeights;
  };
}

/**
 * Builds a centered 1×1 slope with custom corner heights.
 * Geometry spans from -0.5 to 0.5 in X and Z.
 * Bottom corners are all at baseY, top corners use provided heights.
 */
const SimpleSlopeGeometryConstructor: React.FC<SimpleSlopeGeometryConstructorProps> = ({
  meshKey,
  position,
  slopeParams
}) => {
  const { baseY, cornerHeights, color: slopeColor = '#ff8c00' } = slopeParams;
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Destructure cornerHeights into primitive values for stable dependencies
  const { SW, SE, NE, NW } = cornerHeights;

  const geometry = useMemo(() => {
    // Dispose old geometry if it exists
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }

    // Bottom corners (all at baseY) - centered from -0.5 to 0.5
    const B0 = new THREE.Vector3(-0.5, baseY, -0.5); // SW
    const B1 = new THREE.Vector3(-0.5, baseY, 0.5);  // NW
    const B2 = new THREE.Vector3(0.5, baseY, 0.5);   // NE
    const B3 = new THREE.Vector3(0.5, baseY, -0.5);  // SE

    // Top corners with specified heights - centered from -0.5 to 0.5
    const T0 = new THREE.Vector3(-0.5, baseY + SW, -0.5); // SW
    const T1 = new THREE.Vector3(-0.5, baseY + NW, 0.5);  // NW
    const T2 = new THREE.Vector3(0.5, baseY + NE, 0.5);   // NE
    const T3 = new THREE.Vector3(0.5, baseY + SE, -0.5);  // SE

    const allVerts = [B0, B1, B2, B3, T0, T1, T2, T3];

    // 6 faces => 12 triangles
    const indices = [
      // bottom
      0, 1, 2, 2, 3, 0,
      // top (split along SW-NE diagonal)
      4, 5, 6, 4, 6, 7,
      // front => B0,B3,T3,T0 => (0,3,7,4)
      0, 3, 7, 7, 4, 0,
      // right => B3,B2,T2,T3 => (3,2,6,7)
      3, 2, 6, 6, 7, 3,
      // back  => B2,B1,T1,T2 => (2,1,5,6)
      2, 1, 5, 5, 6, 2,
      // left  => B1,B0,T0,T1 => (1,0,4,5)
      1, 0, 4, 4, 5, 1,
    ];

    const newGeometry = buildBufferGeometry(allVerts, indices);
    geometryRef.current = newGeometry;
    return newGeometry;
  }, [baseY, SW, SE, NE, NW]); // Use primitive values, not object reference

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      transparent: false,
      depthWrite: true,
      roughness: 0.1,
      side: THREE.DoubleSide,
      flatShading: true,
    });
  }, []);

  const vertexColors = useMemo(() => {
    const color = new THREE.Color(slopeColor);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colors.set([color.r, color.g, color.b], i * 3);
    }
    return colors;
  }, [slopeColor, geometry]);

  useEffect(() => {
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(vertexColors, 3)
    );
  }, [geometry, vertexColors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      material.dispose();
    };
  }, [material]);

  return (
    <mesh key={meshKey} position={position} geometry={geometry} material={material} />
  );
};

export default SimpleSlopeGeometryConstructor;

/* ----------------------------------------------------------------------------
   buildBufferGeometry: 
   Takes an array of 8 corner Vector3, plus an index array for faces,
   returns a single BufferGeometry with vertex normals computed.
---------------------------------------------------------------------------- */
function buildBufferGeometry(
  verts: THREE.Vector3[],
  inds: number[]
): THREE.BufferGeometry {
  const positions = new Float32Array(verts.length * 3);
  verts.forEach((v, i) => {
    positions[i * 3 + 0] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  });

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(inds);

  geom.computeVertexNormals();

  return geom;
}