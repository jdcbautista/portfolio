import React, { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface HostileEntityProps {
  geometry: 'box';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  behavior: 'emitter';
  onCollide?: (e: any) => void;
}

const HostileEntity: React.FC<HostileEntityProps> = ({
  geometry,
  position,
  size,
  color,
  behavior,
  onCollide,
}) => {
  const ref = useRef<THREE.Mesh>(null);

  const [physicsRef] = useBox(() => ({
    mass: 0, // Static for sentries
    type: 'Static',
    position,
    args: size,
    onCollide,
  }));

  // useFrame(() => {
  //   if (behavior === 'emitter') {
  //     console.log('Laser beam emitted');
  //     // Laser logic here
  //   }
  // });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default HostileEntity;
