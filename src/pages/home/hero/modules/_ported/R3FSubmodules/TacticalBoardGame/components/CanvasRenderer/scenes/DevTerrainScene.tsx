import GridTileConstructor from '../../../../../R3FModule/Assets/Environment/GridTileConstructor.tsx';
import rr2TerrainData from './configs/dognapped2.json'; // Import your JSON file
import ModuleComponent from '../../../../../R3FModule/Globals/Components/ModuleComponent.tsx';
import { useEventController } from '../../../../../R3FModule/Globals/EventController.tsx';

const DevTerrainScene: React.FC = () => {
  // const { createSequence, playSequence, pauseSequence } = useTrackController();
  // const { requestAction } = useEventController();
  const stringJson = JSON.stringify(rr2TerrainData)
  
    const { requestAction } = useEventController();
    const InitValues = () => {
      console.log("INITIALIZE REQUEST")
      requestAction("initializeValues", {
        // cameraMode: "track",
        // trackCursorPosition: [0, 5, 0],
        // cursorRotation: [Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, 0],
        // isPlaying: false,
        // shouldReset: true,
      });

    };
  
  const terrain = [
    {
      coords: [0,10] as [number,number],
      heightPos: 0,
      heightScale: 100,
      type:"grass",
      initEntity:"playerStart"
    },
    {
      coords: [0,-10] as [number,number],
      heightPos: 1,
      heightScale: 100,
      type:"snow"
    },
    {
      coords: [-10,0] as [number,number],
      heightPos: 2,
      heightScale: 100,
      type:"water"
    },
    {
      coords: [10,0] as [number,number],
      heightPos: 3,
      heightScale: 100,
      type:"grass"
    },
  ]

  // return <GridTileConstructor terrainData={terrain}/>;
  return <GridTileConstructor terrainData={stringJson}/>;
};


export default DevTerrainScene
// requestAction