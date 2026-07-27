// This needs to be swapped with ModuleComponent, or replace ModuleComponent completely

// import ReactDOM from 'react-dom';
// SubApp.tsx: Entry Point for the Tactical RPG Submodule

import React, { useMemo, Suspense } from 'react';
import GameStateControllerProvider from './components/GameStateController/GameStateController';
import GameUIController from './components/GameUIController/GameUIController';
import { useEventController } from '../../R3FModule/Globals/EventController';
// import GameEventControllerProvider from './components/GameEventController/GameEventController';
import R3FCanvasIndex from './components/CanvasRenderer/R3FCanvasIndex'; // Import the refactored R3FCanvasIndex
import TrackControllerProvider from '../../R3FModule/Camera/TrackController';
const SubApp: React.FC = () => {
  const {globalCanvasState} = useEventController()

    // Get the current canvas dynamically
    const currentCanvas = useMemo(() => {
      return R3FCanvasIndex().find((canvas) => canvas.id === globalCanvasState.currentCanvas) || null;
    }, [globalCanvasState.currentCanvas]);

  return (
    <GameStateControllerProvider>
      <TrackControllerProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* { globalCanvasState.currentCanvas === 0 && <TacticalBoardCanvasCopy /> } */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* Conditionally render the appropriate canvas component */}
          {currentCanvas ? (
            <currentCanvas.component /> // Render the component dynamically
          ) : (
            <div>Canvas not found</div> // Handle case where canvas ID does not match
          )}
        </Suspense>
        {/* { globalCanvasState.currentCanvas === 0 && <ArtGalleryCanvas /> }
        { globalCanvasState.currentCanvas === 1 && <TacticalBoardCanvas /> } */}
        <GameUIController enabled={true}/>
      </div>
      </TrackControllerProvider>
    </GameStateControllerProvider>
  );
};

export default SubApp;
