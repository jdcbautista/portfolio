import React, { useEffect } from 'react';
import CanvasComponent from "../../../../R3FModule/Globals/Components/CanvasComponent.tsx";
import DevTerrainScene from './scenes/DevTerrainScene.tsx';
import GridTileConstructor from '../../../../R3FModule/Assets/Environment/GridTileConstructor.tsx';
// import rr2TerrainData from './configs/dognapped2.json'; // Import your JSON file
import rr2TerrainData from './scenes/configs/dognapped2.json'
// import { useGlobalState } from '../../../../GlobalContextProvider/GlobalContextProvider.tsx';
import { useEventController } from '../../../../R3FModule/Globals/EventController.tsx';
// import { useTrackController } from "../../../../R3FModule/Camera/TrackController.tsx";
// import DevScene from './scenes/DevScene.tsx';
// import DevParticleTest from './scenes/DevParticleTest.tsx';
import terrainJSON from './scenes/configs/tbg-Orbonne.json'; // Import your JSON file
const SokobanCanvas: React.FC = () => {
  const { requestAction, stateValues, setStateValues, setGlobalCanvasState } = useEventController()
  const terrainData = JSON.stringify(rr2TerrainData)
  const InitValues = () => {
    console.log("INITIALIZE REQUEST")
    requestAction("initializeValues", {
      // cameraMode: "track",
      // trackCursorPosition: [0, 5, 0],
      // cursorRotation: [Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, 0],
      // isPlaying: false,
      // shouldReset: true,
      updateCameraPosition: [8,3,5],
      updateCameraRotation: [0, 0, 0,],
      projectionType: "orthographic"
    });
    
  };
  
    useEffect(()=> {
      InitValues()
    },[])

  return <div>
      <CanvasComponent characterStartPos={[8,3,5]}>
        <GridTileConstructor terrainData={terrainData}/>
      </CanvasComponent>
    </div>;
};
// {/* <DevScene/> */}
// {/* <DevTerrainScene/> */}
// {/* <DevParticleTest/> */}

export default SokobanCanvas;
