import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import MovableEntity from './MovableEntity';
// import FixedMovableEntity from './FixedMovableEntity';

interface EntityProps {
  entities: {
    coords: [number, number];
    initEntity: string;
    heightPos: number;
    heightScale: number;
  }[];
}

const EntityConstructor: React.FC<EntityProps> = ({ entities }) => {
  const heightOffset = .25
  // const MovableEntity = FixedMovableEntity
  const movableRef = useRef<THREE.InstancedMesh>(null);
  const scaleMod = .96
  // Filter entities based on type
  const hostileEntities = entities.filter((e) =>
    e.initEntity.startsWith('Bot')
  );
  const movableEntities = entities.filter((e) =>
    ['Box', 'PrismSW', 'PrismSE', 'PrismNE', 'PrismNW'].includes(e.initEntity)
  );

  // Instanced mesh setup for movable entities
  useEffect(() => {
    if (!movableRef.current) return;

    const dummy = new THREE.Object3D();
    movableEntities.forEach((entity, i) => {
      const [x, z] = entity.coords;
      dummy.position.set(x, entity.heightPos, z);
      dummy.scale.set(1, entity.heightScale, 1);
      dummy.updateMatrix();
      movableRef.current.setMatrixAt(i, dummy.matrix);
    });

    movableRef.current.instanceMatrix.needsUpdate = true;
  }, [movableEntities]);

  // Per-frame logic for hostile entities
  // useFrame(() => {
  //   hostileEntities.forEach((entity) => {
  //     if (entity.initEntity.startsWith('Bot')) {
  //       // Add per-frame hostile entity logic here, e.g., lasers or movement
  //       // console.log(`Hostile Bot detected at ${entity.coords}`);
  //     }
  //   });
  // });

  return (
    <group>
      {/* Movable entities passed to MovableEntity */}
      {movableEntities.map((entity, i) => (
        <MovableEntity
          key={`movable-${i}`}
          geometry="box"
          positions={[[entity.coords[0], entity.heightPos + heightOffset, entity.coords[1]]]}
          size={[1 * scaleMod, (entity.heightScale * scaleMod) - heightOffset/4, 1 * scaleMod]}
          color="brown"
          behavior="pushable"
          snapToGrid={true}
          onCollide={(e) => console.log('Collision detected:', e)}
        />
      ))}

      {/* Hostile entities rendered individually */}
      {hostileEntities.map((entity, i) => {
        const [x, z] = entity.coords;
        return (
          <mesh
            key={`hostile-${i}`}
            position={[x, entity.heightPos, z]}
            scale={[1, entity.heightScale, 1]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="red" />
          </mesh>
        );
      })}
    </group>
  );
};

export default EntityConstructor;