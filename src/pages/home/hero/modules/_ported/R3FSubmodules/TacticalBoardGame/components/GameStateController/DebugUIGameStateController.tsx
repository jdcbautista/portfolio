// GameStateController/DebugUIGameStateController.tsx: Game State Debugger UI

import React from 'react';
import { useGameState } from './GameStateController';
import '../GameUIController/ModalsManager/modals.css';

const DebugUIGameStateController: React.FC = () => {
  const { gameState, updateGameState } = useGameState();

  return (
    <div>
      <h3 className='sub-modal-title'>Game State Debugger</h3>
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
      <button onClick={() => updateGameState('gamePhase', 'Started')}>Set Phase to Started</button>
      <button onClick={() => updateGameState('gamePhase', 'ActiveRound')}>Set Phase to Active Round</button>
    </div>
  );
};

export default DebugUIGameStateController;