// GameStateController/managers/DebugUIEventManager.tsx: Event Debugger UI

import React from 'react';
import { useGameState } from '../GameStateController';

const DebugUIEventManager: React.FC = () => {
  const { eventRequests, requestAction, clearRequests } = useGameState();

  return (
    <div>
      <h3 className='sub-modal-title'>Event Debugger</h3>
      <pre>{JSON.stringify(eventRequests, null, 2)}</pre>
      <button onClick={() => requestAction('TestEvent')}>Trigger Test Event</button>
      <button onClick={clearRequests}>Clear All Events</button>
    </div>
  );
};

export default DebugUIEventManager;