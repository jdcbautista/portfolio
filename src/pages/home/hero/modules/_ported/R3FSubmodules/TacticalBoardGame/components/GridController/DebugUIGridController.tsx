// GridController/DebugUIGridController.tsx
import React from 'react';
import { GridController } from './GridController';

const DebugUIGridController: React.FC = () => {
  const gridController = GridController();

  return (
    <div>
      <h3 className='sub-modal-title'>Grid Controller Debugger</h3>
      <button onClick={() => gridController.moveCursor('north')}>Move Cursor North</button>
      <button onClick={() => gridController.moveCursor('west')}>Move Cursor West</button>
      <button onClick={() => gridController.moveCursor('south')}>Move Cursor South</button>
      <button onClick={() => gridController.moveCursor('east')}>Move Cursor East</button>
      <button onClick={gridController.confirmSelection}>Confirm Selection</button>
      <button onClick={gridController.cancelSelection}>Cancel Selection</button>
    </div>
  );
};

export default DebugUIGridController;
