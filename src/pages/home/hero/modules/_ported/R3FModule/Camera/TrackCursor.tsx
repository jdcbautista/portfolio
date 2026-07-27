// UI/TrackCursor.tsx

import React, { useRef, useEffect } from 'react';
import { useTrackController } from '../Camera/TrackController';
import { useEventController } from '../Globals/EventController';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const TrackCursor: React.FC = () => {

  // Definitions
  const {
    getCurrentLerpedPosition,
    getCurrentLerpedRotation,
    isPlaying, updateLerp
  } = useTrackController();

  const {
    updateGlobalCanvasState,
    globalCanvasState,
    updateStateValues
  } = useEventController();

  const meshRef = useRef<Mesh>(null);

  // Update position and lerp cursor on every frame
  useFrame((state, delta) => {
    
    // Check for Track mode and Play status
    if (globalCanvasState.cameraMode === 'track') {
      if (isPlaying) {
      updateLerp(delta);
    }
    const position = getCurrentLerpedPosition();
    const rotation = getCurrentLerpedRotation();

    if (position && meshRef.current) {
      meshRef.current.position.set(...position);
      updateStateValues('trackCursorPosition', position); // Update global state
    }

    if (rotation && meshRef.current) {
      meshRef.current.rotation.set(...rotation);
      updateStateValues('trackCursorRotation', rotation); // Update global state
    }
    
    }}
  );

  useEffect(() => {
    // console.log('TrackCursor mounted');
  }, []);

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => console.log('Cursor Sphere Clicked')}
      >
        {/* <sphereGeometry args={[0.5, 32, 32]} /> */}
        {/* <meshStandardMaterial color="purple" /> */}
      </mesh>
    </group>
  );
};

export default TrackCursor;
