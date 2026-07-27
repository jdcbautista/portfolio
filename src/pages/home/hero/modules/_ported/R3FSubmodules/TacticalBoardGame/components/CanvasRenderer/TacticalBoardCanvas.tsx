import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PuzzleMatchGame } from './PuzzleMatchGame';
import MinimalDemoScene from './PuzzleMatchGameScene.tsx';
// import { useTrackController } from "../../../../R3FModule/Camera/TrackController.tsx";
// import DevScene from './scenes/DevScene.tsx';
// import DevTerrainScene from './scenes/DevTerrainScene.tsx';
// import { useGlobalState } from '../../../../GlobalContextProvider/GlobalContextProvider.tsx';
// import DevParticleTest from './scenes/DevParticleTest.tsx';
import CanvasComponent from "../../../../R3FModule/Globals/Components/CanvasComponent.tsx";
import { useEventController } from '../../../../R3FModule/Globals/EventController.tsx';
import GridTileConstructor from '../../../../R3FModule/Assets/Environment/GridTileConstructor.tsx';
// import DebugStats from './ArtGalleryCanvas.ts';
import terrainJSON from './scenes/configs/tbg-orbonne.json'; // Import your JSON file
export function DebugStats() {
  const { gl } = useThree();
  
  useFrame(() => {
    // Log every 60 frames to avoid spam
    if (gl.info.render.frame % 60 === 0) {
      console.log('Renderer Info:', {
        calls: gl.info.render.calls,        // Draw calls
        triangles: gl.info.render.triangles, // Total triangles/polygons
        points: gl.info.render.points,
        lines: gl.info.render.lines,
        geometries: gl.info.memory.geometries, // Unique geometries
        textures: gl.info.memory.textures,     // Unique textures
      });
    }
  });
  
  return null;
}

const TacticalBoardCanvas: React.FC = () => {
  const { 
    requestAction,
    // stateValues,
    // setStateValues,
    // setGlobalCanvasState
  } = useEventController()
  const terrainData = JSON.stringify(terrainJSON)
  const InitValues = () => {
    console.log("INITIALIZE REQUEST")
    requestAction("initializeValues", {
      // cameraMode: "track",
      // trackCursorPosition: [0, 5, 0],
      // cursorRotation: [Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, 0],
      // isPlaying: false,
      // shouldReset: true,
      updateCameraPosition: [0,10,0],
      updateCameraRotation: [0, 0, 0,],
      projectionType: "orthographic"
    });
    
  };
  
    useEffect(()=> {
      InitValues()
    },[])

  return <div>
    {/* <MinimalDemoScene/> */}
      <CanvasComponent characterStartPos={[0,10,0]}>
        <DebugStats/>
        <GridTileConstructor terrainData={terrainData}/>
      </CanvasComponent>
    </div>;
};

export default TacticalBoardCanvas;
