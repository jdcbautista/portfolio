// GridController/managers/InputManager.tsx
import { useEffect } from 'react';
import { useGameState } from '../../GameStateController/GameStateController';

export const InputManager = (): void => {
  const { requestAction } = useGameState();

  const handleKeyPress = (key: string): void => {
    switch (key) {
      case 'w':
      case 'ArrowUp':
        requestAction('moveNorth');
        break;
      case 'a':
      case 'ArrowLeft':
        requestAction('moveWest');
        break;
      case 's':
      case 'ArrowDown':
        requestAction('moveSouth');
        break;
      case 'd':
      case 'ArrowRight':
        requestAction('moveEast');
        break;
      case '+':
      case '=':
        requestAction('confirm');
        break;
      case '-':
      case '_':
        requestAction('cancel');
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // return {};
  return { handleKeyPress };
};

export default InputManager;
