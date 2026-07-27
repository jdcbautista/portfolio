// Import Point
// Loads a scene and is wrapped in EventController
// Scenes are wrapped by the StageController
// Should be OK to load Player here.  Entities can be loaded from the scene.
//
// Tried having canvas and stage controller here, and it didn't work.
// Having scene objects in their own component (DemoScene) as a child
// of StageController in ModuleController was only 1 additional layer
// of abstraction, but it apparantly was one layer too many, caused errors

import EventControllerProvider from '../EventController.tsx';
// import StageController from './StageController.tsx';
// import CharacterController from '../Player/CharacterController.tsx';
// import DemoScene from '../../Scenes/DemoScene.tsx';
// import DemoScene2 from '../../Scenes/DemoScene2.tsx';
// import SphereDemo from '../../Scenes/SphereDemo.tsx';
import { ReactNode } from 'react';
// import UIController from '../../UI/UIController.tsx';
// import TrackControllerProvider from '../../Camera/TrackController.tsx';
// import SkyBox from '../Globals/Skybox.tsx';
// import { Canvas } from '@react-three/fiber';
// import { Loader } from '@react-three/drei';
// import { TrackControllerProvider } from '../Camera/TrackController.tsx';
// import TrackControlPanel from '../UI/TrackControlPanel.tsx';
// import ConstructorDemoScene from '../../Scenes/ConstructorDemoScene.tsx';
import SubApp from '../../../R3FSubmodules/TacticalBoardGame/SubApp.tsx';
// import GameUIController from '../../../R3FSubmodules/TacticalBoardGame/components/GameUIController/GameUIController.tsx';

function ModuleComponent(): ReactNode {

  return (
    <div
    style={{
      paddingLeft:1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 12,
      // paddingTop: '4vh',
      width: '100vw',
      // height: '50vw',
    }}
  >
    <div style={{
      width: '99vw',
      // width: '80vw',
      height: '98vh',
      // height: '100vh',
      backgroundColor: 'lightgray',
      borderRadius: '20px',
      overflow: 'hidden'
      }}>
      <EventControllerProvider>
        {/* <TrackControllerProvider> */}
        <div style={styles.container}>
          {/* <DemoScene2 />  */}
          <SubApp />
          {/* <GameUIController enabled={true}/> */}
          {/* <UIController enabled={true}/> */}
        </div>
        {/* </TrackControllerProvider> */}
      </EventControllerProvider>
    </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',  // Ensure full viewport height
    overflow: 'hidden', // Prevent scrollbars if necessary
  },
};

export default ModuleComponent;
