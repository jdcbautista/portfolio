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
  const { eventRequest,eventLog } = useEventController();

  const roundedEventRequest = roundFloats(convertRotationToDegrees(eventRequest));
  const roundedEventLog = roundFloats(convertRotationToDegrees(eventLog));

  return (
    <div>
      <h3 className='sub-modal-title'>Game State Debugger</h3>
      <pre>Events Requests: {JSON.stringify(roundedEventRequest, null, 2)}</pre>
      <pre>Event Log: {JSON.stringify(roundedEventLog, null, 2)}</pre>
    </div>
  );
};

export default DebugUIGameStateController;