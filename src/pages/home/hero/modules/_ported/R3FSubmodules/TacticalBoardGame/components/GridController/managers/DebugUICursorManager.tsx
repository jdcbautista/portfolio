// GridController/managers/DebugUICursorManager.tsx
import React from 'react';
import { CursorManager } from './CursorManager';

const DebugUICursorManager: React.FC = () => {
  const cursorManager = CursorManager();

  return (
    <div>
      <h3>Cursor Manager Debugger</h3>
      <button onClick={() => cursorManager.moveCursor('north')}>Move North</button>
      <button onClick={() => cursorManager.moveCursor('west')}>Move West</button>
      <button onClick={() => cursorManager.moveCursor('south')}>Move South</button>
      <button onClick={() => cursorManager.moveCursor('east')}>Move East</button>
    </div>
  );
};

export default DebugUICursorManager;
