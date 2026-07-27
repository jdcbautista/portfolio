import React, { useState, useRef, useEffect, useMemo } from 'react';
import { InstancedMesh } from 'three';
import { InstancedRigidBodies } from '@react-three/rapier';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import {useGlobalState} from '../../../GlobalContextProvider/GlobalContextProvider';
import { PropObject } from './PropObjectTypes';

interface GeometryInstantiatorProps {
  geometryType: string;
  propObjects: PropObject[];
  // playerRef: React.RefObject<THREE.Object3D>;
}

const GeometryInstantiator: React.FC<GeometryInstantiatorProps> = ({ propObjects }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const topMeshRef = useRef<InstancedMesh>(null);
  const [highlightedIndices, setHighlightedIndices] = useState<Set<number>>(new Set());
  const { globalState } = useGlobalState()
  const dummy = useRef(new THREE.Object3D());
  
  // console.log(`[GI] Rendering ${propObjects.length} objects, colors:`, propObjects.slice(0, 3).map(p => p.color));
  
  // const [highlightedFaces, setHighlightedFaces] = useState<(number | null)[]>(Array(propObjects.length).fill(null));
  // const colorRef = useRef(new THREE.Color());

  // const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  // const [hoverStates, setHoverStates] = useState<boolean[]>(
    // Array(propObjects.length).fill(false)
  // );
    // Prepare geometry and materials
    const fullGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const topGeometry = useMemo(() => {
      const plane = new THREE.PlaneGeometry(1, 1);
      plane.rotateX(-Math.PI / 2); // Rotate to face upward
      // plane.translate(0, 0.5, 0); // Move to top of cube
      return plane;
    }, []);

  // Create materials with proper transparency settings
  const materials = useMemo(() => {
    // Create base materials that will work with vertex colors
    const cubeMat = new THREE.MeshBasicMaterial({
      color: '#ff8800',
    });
  
    // const topMat = new THREE.MeshPhongMaterial({
    const topMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false, // Enable depth writing for top plane
      opacity: 0.7,
      // transmission: 0.4
    });
    const defMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      transparent: false,
      depthWrite: true,
      roughness: 0.1,
      transmission: 0.25,
    });
  
    // const topMat = new THREE.MeshPhongMaterial({
    const hlMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false, // Enable depth writing for top plane
      opacity: 0.7,
      // transmission: 0.4
    });

  return { cubeMaterial: cubeMat, topMaterial: topMat, defaultMaterial: defMat, highlightMaterial:hlMat };
}, []);

  // Prepare colors and opacity for each instance
  const colors = useMemo(() => {
    const array = new Float32Array(propObjects.length * 4); // RGBA
    propObjects.forEach((props, i) => {
      const color = new THREE.Color(props.color);
      const opacity = props.opacity ?? 1; // Default to fully opaque
      array.set([color.r, color.g, color.b, opacity], i * 4);
    });
    return array;
  }, [propObjects]);

    // Separate tiles into full geometry and top-only
    const fullGeometryTiles = propObjects.filter((tile) => !tile.renderTopOnly);
    const topSurfaceTiles = propObjects.filter((tile) => tile.renderTopOnly);

// Initialize full geometry tiles
useEffect(() => {
  if (!meshRef.current || fullGeometryTiles.length === 0) return;


  fullGeometryTiles.forEach((props, i) => {
    dummy.current.position.set(...props.position);
    dummy.current.scale.set(...props.args);
    dummy.current.updateMatrix();
    meshRef.current!.setMatrixAt(i, dummy.current.matrix);
  });

  meshRef.current!.instanceMatrix.needsUpdate = true;

  // Assign vertex colors
  meshRef.current!.geometry.setAttribute(
    'color',
    new THREE.InstancedBufferAttribute(colors, 4)
  );
}, [fullGeometryTiles, colors]);

// Initialize top-surface-only tiles
useEffect(() => {
  if (!topMeshRef.current || topSurfaceTiles.length === 0) return;

  topSurfaceTiles.forEach((props, i) => {
    dummy.current.position.set(...props.position);
    dummy.current.scale.set(props.args[0], props.args[1], props.args[2]); // Scale width and depth only
    dummy.current.updateMatrix();
    topMeshRef.current!.setMatrixAt(i, dummy.current.matrix);
  });

  topMeshRef.current!.instanceMatrix.needsUpdate = true;

  // Assign vertex colors
  topMeshRef.current!.geometry.setAttribute(
    'color',
    new THREE.InstancedBufferAttribute(colors, 4)
  );
}, [topSurfaceTiles, colors]);


  ////////// TEXT
    // Precompute text positions and labels based on tile position and height
    const textPositions = useMemo(
      () =>
          propObjects.map((props, i) => {
              // Add debugging logs for each tile
              // console.debug(`Text position for propObject[${i}]`, props);
  
              return {
                  position: [
                      props.position[0], // X remains unchanged
                      props.position[1] + (props.args[1] / 2) + 0.05 + (props.slopedTileYOffset || 0), // Ensure slopedTileYOffset defaults to 0
                      props.position[2], // Z remains unchanged
                  ] as [number, number, number],
                  label: `(${props.position[0]},${props.position[2]}... ${props.slopedTileYOffset?.toFixed(2)})`,
              };
          }),
      [propObjects]
  );


  // const magicMaterial = useMemo(
  //   () =>
  //     new THREE.MeshStandardMaterial({
  //       vertexColors: false,
  //       color: new THREE.Color('white'),
  //     }),
  //   []
  // );


  useEffect(() => {
    if (!meshRef.current) return;

    const color = new THREE.Color();
    propObjects.forEach((props, i) => {
      color.set(highlightedIndices.has(i) ? 'hotpink' : props.color);
      meshRef.current!.setColorAt(i, color);
    });
    meshRef.current!.instanceColor!.needsUpdate = true;
  }, [highlightedIndices, propObjects]);

  const handleIntersectionEnter = (index: number) => {
    if (globalState.debugOn) {

      setHighlightedIndices(prev => new Set(prev).add(index));
    }
};

const handleIntersectionExit = (index: number) => {
  if (globalState.debugOn) {
    setHighlightedIndices(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
    });
  }
};

const handleCollisionEnter = (index: number) => {
  if (globalState.debugOn) {
    setHighlightedIndices(prev => new Set(prev).add(index));
  }
};

// const handleCollisionExit = (index: number) => {
//   if (globalState.debugOn) {
//     setHighlightedIndices(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(index);
//         return newSet;
//     });
//   }
// };
  return (
    <>
      {/* Static hero splash: render the tiles directly (no physics). The
          setMatrixAt effect positions each instance. Dropping the rapier
          <InstancedRigidBodies> wrapper avoids the v1->v2 API mismatch that
          left the instances unpositioned/invisible. */}
      {fullGeometryTiles.length > 0 && (
        <instancedMesh
          ref={meshRef}
          args={[fullGeometry, materials.cubeMaterial, fullGeometryTiles.length]}
          castShadow
          frustumCulled={false}
          name="tile"
        />
      )}
        {/* If you have separate "topSurfaceTiles": do a second instancedMesh here */}
        {topSurfaceTiles.length > 0 && (
          <instancedMesh
            ref={topMeshRef}
            args={[topGeometry, materials.topMaterial, topSurfaceTiles.length]}
            receiveShadow
          />
        )}

      {/* For the text labels, typed as well */}
      {textPositions.map((text, i) => (
        <Text
          key={`text-${i}`}
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
          position={text.position}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.125}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {text.label}
        </Text>
      ))}
    </>
  );
};

export default GeometryInstantiator;