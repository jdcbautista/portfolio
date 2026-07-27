export const GameEventManager = (): void => {
  const { gameState, updateGameState, requestAction, removeAction } = useGameState();

  const triggerGameEvent = (eventName: string, payload: unknown): void => {
    console.log(`Triggering event: ${eventName}`, payload);
    requestAction(eventName);
    // Handle event-specific logic here
    // removeAction(eventName);
  };

  // Example: Hook into game state for phase transitions
  const updatePhase = (newPhase: string): void => {
    updateGameState('gamePhase', newPhase);
  };

  return { triggerGameEvent, updatePhase };
};