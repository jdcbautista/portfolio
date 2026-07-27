import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from "three";
import { useRef } from 'react';
import LaserBeam from '../../../../../R3FModule/Assets/ParticleFx/PostProcLaser';
import ParticleEmitter from '../../../../../R3FModule/Assets/ParticleFx/ParticleEmitter';
import { useState } from "react";
import PostProcLaser from '../../../../../R3FModule/Assets/ParticleFx/PostProcLaser';
import UnreallBloomPassLaserBeam from '../../../../../R3FModule/Assets/ParticleFx/UnrealBloomLaser';

function DevParticleTest() {
  const [isLaserOn, setLaserOn] = useState(true);

  const toggleLaser = () => setLaserOn(!isLaserOn);

  const points = [
    new Vector3(2, 10, 0),
    new Vector3(2, 2, 0),
    new Vector3(4, 2, 0),
    new Vector3(4, 4, 0),
  ];
  return (
    <>
{/* LaserBeam */}
<ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <PostProcLaser
        origin={new Vector3(0, 0, 0)}
        points={points}
        color="lime"
        radius={1.05}
        isOn={true}
        glowIntensity={5}
        glowStrength={1}
        glowThreshold={0.3}
      />
            <UnreallBloomPassLaserBeam
        origin={new Vector3(0, 0, 0)}
        points={points}
        color="lime"
        radius={.75}
        isOn={true}
        glowIntensity={3}
        glowStrength={1}
        glowThreshold={0.3}
      />
    </>
  )
}

export default DevParticleTest;
