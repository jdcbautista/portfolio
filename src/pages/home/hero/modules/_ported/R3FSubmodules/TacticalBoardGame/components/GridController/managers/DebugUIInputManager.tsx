// GridController/managers/DebugUIInputManager.tsx
import React from 'react';
import { InputManager } from './InputManager';

const DebugUIInputManager: React.FC = () => {
  const inputManager = InputManager();

  const simulateKeyPress = (key: string): void => {
    inputManager.handleKeyPress(key);
  };

  return (
    <div>
      <h3>Input Manager Debugger</h3>
      <button onClick={() => simulateKeyPress('w')}>Simulate W Key</button>
      <button onClick={() => simulateKeyPress('a')}>Simulate A Key</button>
      <button onClick={() => simulateKeyPress('s')}>Simulate S Key</button>
      <button onClick={() => simulateKeyPress('d')}>Simulate D Key</button>
      <button onClick={() => simulateKeyPress('+')}>Simulate Confirm</button>
      <button onClick={() => simulateKeyPress('-')}>Simulate Cancel</button>
    </div>
  );
};

export default DebugUIInputManager;
