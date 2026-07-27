// GameStateController.tsx: Central State Management

import React, { createContext, useState, ReactNode } from 'react';

interface GameState {
  [stateName: string]: unknown;
}

interface EventRequest {
  [actionName: string]: unknown;
}

interface GameStateContextType {
  gameState: GameState;
  eventRequests: EventRequest;
  updateGameState: <T>(stateName: string, state: T) => void;
  requestAction: (actionName: string) => void;
  removeAction: (actionName: string) => void;
  clearRequests: () => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateController: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({});
  const [eventRequests, setEventRequests] = useState<EventRequest>({});

  const updateGameState = <T,>(stateName: string, state: T): void => {
    setGameState((prev) => ({
      ...prev,
      [stateName]: state,
    }));
  };

  const requestAction = (actionName: string): void => {
    setEventRequests((prev) => ({
      ...prev,
      [actionName]: true,
    }));
  };

  const removeAction = (actionName: string): void => {
    setEventRequests((prev) => {
      const updated = { ...prev };
      delete updated[actionName];
      return updated;
    });
  };

  const clearRequests = (): void => {
    setEventRequests({});
  };

  return (
    <GameStateContext.Provider
      value={{ gameState, eventRequests, updateGameState, requestAction, removeAction, clearRequests }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = React.useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateController');
  }
  return context;
};

export default GameStateController;