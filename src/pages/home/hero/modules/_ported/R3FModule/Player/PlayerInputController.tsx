import { useState, useEffect, useMemo } from 'react';

/*****************
 * Player Input Controller
 ****************/
export const PlayerInputController = () => {
  
  // Define the possible keys explicitly
  // Wrap keys in useMemo to ensure it doesn't change on every render
  const keys = useMemo(
    () =>
      ({
        KeyW: 'forward',
        KeyS: 'backward',
        KeyA: 'left',
        KeyD: 'right',
        KeyT: 'toggleMode',
        Space: 'jump',
      } as const),
    []
  );

  // Type for movement keys
  type MovementKeys = keyof typeof keys;
  type MovementState = Record<typeof keys[MovementKeys], boolean>;

  const [movement, setMovement] = useState<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    toggleMode: false,
  });

  useEffect(() => {
    
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.code === 'Space') {
        e.preventDefault();  // This prevents scrolling when the spacebar is pressed
      }
      
      const key = keys[e.code as MovementKeys];
      if (key) {
        setMovement((prev) => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = keys[e.code as MovementKeys];
      if (key) {
        setMovement((prev) => ({ ...prev, [key]: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  return movement;
};
