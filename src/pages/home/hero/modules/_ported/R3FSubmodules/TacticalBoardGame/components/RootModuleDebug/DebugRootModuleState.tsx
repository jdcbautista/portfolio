// GameStateController/DebugUIGameStateController.tsx: Game State Debugger UI

import React, { useEffect } from 'react';
import { useEventController } from '../../../../R3FModule/Globals/EventController';

const roundFloats = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(roundFloats);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, roundFloats(value)])
    );
  } else if (typeof obj === 'number') {
    return parseFloat(obj.toFixed(2)); // Round float to 2 decimal places
  }
  return obj; // Return as-is if not a number or object/array
};

// Utility: Convert radians to degrees
const convertRotationToDegrees = (obj: any): any => {
  const radiansToDegrees = (rad: number) => (rad * 180) / Math.PI;

  if (Array.isArray(obj)) {
    return obj.map((value) => (typeof value === 'number' ? radiansToDegrees(value) : value));
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        key.toLowerCase().includes('rotation') && Array.isArray(value)
          ? value.map((v) => (typeof v === 'number' ? radiansToDegrees(v) : v)) // Convert array of numbers
          : value, // Return non-rotation values untouched
      ])
    );
  }
  return obj; // Return primitive values as-is
};

const DebugUIGameStateController: React.FC = () => {
  const { stateValues, globalCanvasState } = useEventController();

  const roundedStateValues = roundFloats(convertRotationToDegrees(stateValues));
  const roundedGlobalCanvasState = roundFloats(convertRotationToDegrees(globalCanvasState));

  // const roundedEventRequest = convertRotationToDegrees(roundFloats(eventRequest));
  // const roundedStateValues = convertRotationToDegrees(roundFloats(stateValues));
  // const roundedGlobalCanvasState = convertRotationToDegrees(roundFloats(globalCanvasState));


  // useEffect(() => {
  //   console.log('DebugUIGameStateController re-rendered');
  //   console.log('eventRequest:', eventRequest);
  //   console.log('stateValues:', stateValues);
  //   console.log('globalCanvasState:', globalCanvasState);
  // }, [eventRequest, stateValues, globalCanvasState]);


  return (
    <div>
      <h3 className='sub-modal-title'>Game State Debugger</h3>
      <pre>State: {JSON.stringify(roundedStateValues, null, 2)}</pre>
      <pre>Global State:{JSON.stringify(roundedGlobalCanvasState, null, 2)}</pre>
      {/* <pre>{JSON.stringify(eventRequest, null, 2)}</pre>
      <pre>{JSON.stringify(stateValues, null, 2)}</pre>
      <pre>{JSON.stringify(globalCanvasState, null, 2)}</pre> */}
      {/* <button onClick={() => updateGameState('gamePhase', 'Started')}>Set Phase to Started</button> */}
      {/* <button onClick={() => updateGameState('gamePhase', 'ActiveRound')}>Set Phase to Active Round</button> */}
    </div>
  );
};

export default DebugUIGameStateController;