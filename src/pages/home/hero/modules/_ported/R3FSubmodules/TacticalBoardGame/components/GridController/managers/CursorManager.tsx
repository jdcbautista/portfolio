// GridController/managers/CursorManager.tsx
import { useGameState } from '../../GameStateController/GameStateController';

export const CursorManager = (): void => {
  const { updateGameState } = useGameState();

  const moveCursor = (direction: 'north' | 'west' | 'south' | 'east'): void => {
    // Handle cursor movement logic
    updateGameState('cursorPosition', { direction });
  };

  return { moveCursor };
};

export default CursorManager;
