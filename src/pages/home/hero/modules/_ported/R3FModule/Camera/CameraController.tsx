// Camera/CameraController.tsx
// What a fucking nightmare.  OK, so regardless of where camera from useThree is called from, it updates the same fucking camera, associated with the canvas

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useEventController } from '../Globals/EventController';
// import { Vector3 } from 'three';
// import { OrbitControls, PointerLockControls } from '@react-three/drei';
import { useGlobalState } from '../../GlobalContextProvider/GlobalContextProvider';

import * as THREE from 'three';
import { PerspectiveCamera, OrthographicCamera } from "@react-three/drei";

const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { 
    globalCanvasState,
    stateValues,
    // updateGlobalCanvasState,
    updateStateValues
  } = useEventController();
  const { globalState } = useGlobalState()

  const targetPosition = new THREE.Vector3();
  const perspectiveCam = useRef<THREE.PerspectiveCamera>(null!);
  const orthoCam = useRef<THREE.OrthographicCamera>(null!);

  const defaultPosition = new THREE.Vector3(0, 0, 0);
  const defaultRotation = new THREE.Euler(0, 0, 0);
   
  // Rotation limits
  //  const minPitch = -Math.PI / 4; // Minimum pitch (-45 degrees)
  //  const maxPitch = Math.PI / 4;  // Maximum pitch (+45 degrees)
   
  const { get, set } = useThree(({ get, set }) => ({ get, set }));

  useEffect(() => {

    if (stateValues.projectionType === "orthographic" && orthoCam.current) {
      set({ camera: orthoCam.current });
      // orthoCam.current.lookAt(0, 0, 0);
    } else {
      set({ camera: perspectiveCam.current });
    }
  }, [stateValues, set]);

  useEffect(() => {

    if (Array.isArray(stateValues.updateCameraPosition)) {
      const [x, y, z] = stateValues.updateCameraPosition;
  
      // Check if the position needs updating to avoid redundant updates
      if (
        camera.position.x !== x ||
        camera.position.y !== y ||
        camera.position.z !== z
      ) {
        camera.position.set(x, y, z+10); // Update camera position
        updateStateValues("updateCameraPosition", null); // Reset state to null
      }
    if (Array.isArray(stateValues.updateCameraRotation)) {
        const [x, y, z] = stateValues.updateCameraRotation;
    
        // Check if the position needs updating to avoid redundant updates
        if (
          camera.position.x !== x ||
          camera.position.y !== y ||
          camera.position.z !== z
        ) {
          camera.position.set(x, y, z); // Update camera position
          updateStateValues("updateCameraRotation", null); // Reset state to null
        }
    }
  }}, [stateValues.updateCameraPosition, stateValues.updateCameraRotation, camera.position, updateStateValues]);
  


  useEffect(() => {
    
    if(globalState["debugOn"]){

      const position = stateValues.trackCursorPosition ?? [5, 10, 0];
      const rotation = stateValues.trackCursorRotation ?? [0, Math.PI / 2, 0];
      updateStateValues("trackCursorPosition", position)
      updateStateValues("trackCursorRotation", rotation)
      camera.updateProjectionMatrix();
      console.log("📸 📸 📸 CAMERA CONTROLLER INIT - Seems to be getting overwritten")
    }

  }, []);

  
  // Extract cameraMode from globalCanvasState
  const cameraMode =
    typeof globalCanvasState.cameraMode === 'string'
      ? globalCanvasState.cameraMode.toLowerCase()
      : 'manual'; // Default to 'manual'

    const manualMode =
    typeof globalCanvasState.manualMode === 'string'
      ? globalCanvasState.manualMode.toLowerCase()
      : 'freeroam';


  useFrame(() => {
    const cameraPosition = camera.position ?? defaultPosition;
    const cameraRotation = camera.rotation ?? defaultRotation;
    updateStateValues('cameraPosition', [cameraPosition.x, cameraPosition.y, cameraPosition.z]);
    updateStateValues('cameraRotation', [cameraRotation.x, cameraRotation.y, cameraRotation.z]);
      
    // Cache camera properties to avoid repeated access
    // const { position: cameraPosition, rotation: cameraRotation } = camera;

      // Update global state only if values have changed
    // const currentPosition = (stateValues.cameraPosition || [0, 0, 0]) as [number, number, number];
    // const currentRotation = (stateValues.cameraRotation || [0, 0, 0]) as [number, number, number];
    // if (
    //   cameraPosition.x !== currentPosition[0] ||
    //   cameraPosition.y !== currentPosition[1] ||
    //   cameraPosition.z !== currentPosition[2]
    // ) {
    //   updateStateValues('cameraPosition', [cameraPosition.x, cameraPosition.y, cameraPosition.z]);
    // }
    // if (
    //   cameraRotation.x !== currentRotation[0] ||
    //   cameraRotation.y !== currentRotation[1] ||
    //   cameraRotation.z !== currentRotation[2]
    // ) {
    //   updateStateValues('cameraRotation', [cameraRotation.x, cameraRotation.y, cameraRotation.z]);

    // }
      if (cameraMode === 'manual') {

        if (manualMode === 'freeroam') {
          // FreeRoam Mode: Update camera position based on movement state
        } else if (manualMode === 'character') {
            
          // const { x: x, y: y, z: z } = targetRb.translation();
          // const { x: x, y: y, z: z } = stateValues.updateCameraPosition || [camera.position.x, camera.position.y, camera.position.z];
          const [x, y, z] = stateValues.updateCameraPosition || [camera.position.x, camera.position.y, camera.position.z];
          const [rx, ry, rz] = stateValues.updateCameraRotation || [camera.rotation.x, camera.rotation.y, camera.rotation.z];
          // const [x, y, z] = (stateValues.updateCameraPosition ?? [
          //   camera.position.x,
          //   camera.position.y,
          //   camera.position.z,
          // ]) as [number, number, number];

          // const [rx, ry, rz] = (stateValues.updateCameraRotation ?? [
          //   camera.rotation.x,
          //   camera.rotation.y,
          //   camera.rotation.z,
          // ]) as [number, number, number];
          
          if (camera.position.x !== x || camera.position.y !== y || camera.position.z !== z) {
            camera.position.set(x, y, z);
          }
          if (camera.rotation.x !== rx || camera.rotation.y !== ry || camera.rotation.z !== rz) {
            camera.rotation.set(rx, ry, rz);
          }
        }

    } else if (cameraMode === 'track') {
      // Track Mode: Follow cursor's position
        if (stateValues.isPlaying === true) {

          // const trackedPosition = stateValues.trackCursorPosition as [number, number, number];
          // const targetPosition = new Vector3(...trackedPosition);
          // const trackedPosition = stateValues.trackCursorPosition || [
          //   cameraPosition.x,
          //   cameraPosition.y,
          //   cameraPosition.z,
          // ];
          const trackedPosition = (stateValues.trackCursorPosition || [
            camera.position.x,
            camera.position.y,
            camera.position.z,
          ]) as [number, number, number];
          // Reuse the targetPosition object and set its values
          targetPosition.set(...trackedPosition);
          
          // Smoothly interpolate camera position
          if (camera.position !== targetPosition) {
            camera.position.lerp(targetPosition, 0.1);
          }
          
          // Make the camera look at the tracked object
          camera.rotation.x = 0
          // camera.rotation.y = 0 * Math.PI / 1
          camera.rotation.y = 0
          camera.rotation.z = 0

        } else if (stateValues.isPlaying === false  && !stateValues.isPaused){
          if (camera.position !== stateValues.trackCursorPosition){
            const pos = stateValues.trackCursorPosition as [number, number, number] ?? [0, 0, 0];
            camera.position.set(pos[0],pos[1],pos[2])
          }
          if (camera.rotation !== stateValues.trackCursorRotation){
            const pos = stateValues.trackCursorRotation as [number, number, number] ?? [0, 0, 0];
            camera.rotation.set(pos[0],pos[1],pos[2])
          }
          return null;
        }

        // camera.lookAt(targetPosition);
      } else {
        // Handle other camera modes or default behavior
        console.warn(`Unhandled camera mode: ${cameraMode}`);
      }
    }
  );

  return (
    <>
      <PerspectiveCamera
        name="3d"
        ref={perspectiveCam}
        position={[0, 200, 10]}
        fov={90}
      />
      <OrthographicCamera
        name="2d"
        ref={orthoCam}
        // position={[0, 2, 0]}
        position={[10, 2, 10]}
        zoom={100}
        near={-100}
        far={100}
        rotation={[Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, Math.PI/7]} // Tilt and rotate for isometric view
        left={window.innerWidth / -2}
        right={window.innerWidth / 2}
        top={window.innerHeight / 2}
        bottom={window.innerHeight / -2}
      />
        {/* {cameraMode === 'manual' && manualMode === 'character' && (
      <PointerLockControls camera={camera} selector="#toggleCursorLock" />
    )} */}
    {/* {cameraMode === 'manual' && manualMode === 'character' && (
      <PointerLockControls camera={camera} selector="#toggleCursorLock" />
    )} */}
  </>
  )
};

export default CameraController;
