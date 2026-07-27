// Controls the styling around the Canvas View
// Generates the Canvas and Global Objects (Stage, Lights, Physics & Player)
// This controller wraps around a scene, which contains scene-specific entitites
import { Physics as RapierPhysics} from '@react-three/rapier';
import React, { useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
// import { Physics } from '@react-three/cannon';
// import {
//   TrackControllerProvider,
//   // useTrackController,
// } from '../../Camera/TrackController.tsx';
import DebugRendererInfo from '../../Debug/DebugRendererInfo.tsx';
import TrackCursor from '../../Camera/TrackCursor.tsx';
import CameraController from '../../Camera/CameraController.tsx';
import CharacterController from '../../Player/CharacterController.tsx';
import StageLights from '../../Assets/Stage/StageLights.tsx';
import StageFloor from '../../Assets/Stage/StageFloor.tsx';
import { Stats, OrbitControls } from '@react-three/drei'
// import TestScene from '../../Scenes/TestScene.tsx';
import { KeyboardControls } from "@react-three/drei"
import { useContextBridge } from 'its-fine'
// import { Loader } from '@react-three/drei';
// import SkyBox from './Skybox.tsx';
import { useInView } from 'framer-motion';
import { useEventController } from '../EventController.tsx';

import { useGlobalState } from '../../../GlobalContextProvider/GlobalContextProvider.tsx';

type CanvasComponentProps = {
  children: React.ReactNode;
  characterStartPos: [number, number, number];
};


const CanvasComponent: React.FC<CanvasComponentProps> = ({ children, characterStartPos }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {globalState} = useGlobalState()
  const {globalCanvasState, updateGlobalCanvasState} = useEventController()
  // const { ref, inView } = useInView({ threshold: 0.1 }); // Track visibility
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-90% 0px" }); // Adjust margin for better control

  useEffect(()=> {
    // const update = isInView == globalCanvasState.canvasInView ? true : false
    if (globalCanvasState.canvasInView !== isInView) {
      console.log("Updating canvasInView:", globalCanvasState.canvasInView, "to", isInView); // Debugging
      
      updateGlobalCanvasState("canvasInView", isInView);
      return
    }
  
  },[isInView, updateGlobalCanvasState, globalCanvasState.canvasInView, globalCanvasState])
  
  // Ensure the canvas size is correctly updated when the container resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current;
        // Resize the canvas to match the container
        canvasRef.current.querySelector('canvas')?.setAttribute('width', `${clientWidth}`);
        canvasRef.current.querySelector('canvas')?.setAttribute('height', `${clientHeight}`);
      }
    };

    // Initial resize
    updateCanvasSize();
    // Add resize event listener to handle resizing
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup the resize event listener
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const keys = useMemo(
    () =>
      ({
        Space: 'jump',
      } as const),
    []
  );

  useEffect(() => {
    
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.code === 'Space') {
        e.preventDefault();  // This prevents scrolling when the spacebar is pressed
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);


  const Bridge = useContextBridge()
  return (
    <div ref={ref} style={{ position: "relative", height: "100vh" }}>
    {/* <TrackControllerProvider> */}
          {/* <Canvas frameloop="demand" shadows camera={{ near: 0.1, far: 1000 }} */}
          <KeyboardControls 
            map={[
              { name: "forward", keys: ["ArrowUp", "w", "W"] },
              { name: "backward", keys: ["ArrowDown", "s", "S"] },
              { name: "left", keys: ["ArrowLeft", "a", "A"] },
              { name: "right", keys: ["ArrowRight", "d", "D"] },
              { name: "jump", keys: ["Space", "v", "V"] },
            ]}
          >
          <Canvas
          frameloop="always"
          shadows 
          camera={{
            position: [45, 45, 45],
            fov:60,
            near: 0.1,
            far: 4000
          }}
          onCreated={({ camera }) => { camera.position.set(45, 45, 45); camera.lookAt(0, 1, 0) }}

          style={{
            width: '100%', // Ensure the canvas takes full width
            height: '100%', // Ensure the canvas takes full height
            display: 'block', // Prevent canvas from having extra space around it
            position: 'absolute', // Ensure the canvas fills the parent container
            top: 0, // Align canvas at the top of the container
            left: 0, // Align canvas at the left of the container
          }}>
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[8, 8, 8]} />
              <meshBasicMaterial color="red" />
            </mesh>
            <Bridge>
            <StageLights />
            <Suspense>
            <RapierPhysics gravity={[0, -9.8, 0]}>
                {children}
            </RapierPhysics>
            </Suspense>
            {globalState.debugOn == true &&
              <group>
                <DebugRendererInfo />
                <Stats />
              </group>
            }
            </Bridge>
          </Canvas>
          </KeyboardControls>
          {/* <Loader /> */}
        {/* </TrackControllerProvider> */}
        </div>
  );
};

export default CanvasComponent;
