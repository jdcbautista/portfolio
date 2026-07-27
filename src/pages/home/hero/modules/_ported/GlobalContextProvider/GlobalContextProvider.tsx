// src/modules/GlobalContextProvider/GlobalContextProvider.tsx
import React, { ReactNode, createContext, useState, useContext } from 'react';
import ThemeContextProvider from './ThemeContextProvider';
import { UserAuthProvider } from './UserAuthContext';

// Define the shape of the global state
interface GlobalState {
  [moduleName: string]: unknown; // Each module manages its state
}

// Context type
interface GlobalStateContextType {
  globalState: GlobalState;
  updateModuleState: <T>(moduleName: string, state: T) => void; // Strictly typed update function
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalContextProvider');
  }
  return context;
};

const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalState, setGlobalState] = useState<GlobalState>({});

  const updateModuleState = <T,>(moduleName: string, state: T): void => {
    setGlobalState((prev) => ({
      ...prev,
      [moduleName]: state,
    }));
    // console.log(`Updated state for module "${moduleName}":`, state);
  };

  return (
    <GlobalStateContext.Provider value={{ globalState, updateModuleState }}>
      <UserAuthProvider>
        <ThemeContextProvider>{children}</ThemeContextProvider>
      </UserAuthProvider>
    </GlobalStateContext.Provider>
  );
};

export default GlobalContextProvider;
