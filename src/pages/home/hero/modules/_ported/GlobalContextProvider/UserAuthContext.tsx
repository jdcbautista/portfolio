import React, { createContext, useReducer, useContext, ReactNode,  useEffect } from 'react';

// Types
type UserAuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: { id: string; name: string; email: string } | null;
  requireAuth: boolean; // NEW: Toggles authentication requirement
};

type UserAuthAction =
  | { type: 'LOGIN'; payload: { token: string; user: { id: string; name: string; email: string } } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { name?: string; email?: string } }
  | { type: 'SET_REQUIRE_AUTH'; payload: boolean }; // NEW: Action to toggle `requireAuth`

// Initial State
const initialUserAuthState: UserAuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  requireAuth: true, // Default: Authentication is required
};

// Contexts
const UserAuthContext = createContext<UserAuthState | undefined>(undefined);
const UserAuthDispatchContext = createContext<React.Dispatch<UserAuthAction> | undefined>(
  undefined
);

// Reducer
const userAuthReducer = (state: UserAuthState, action: UserAuthAction): UserAuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return initialUserAuthState;
    case 'UPDATE_USER':
      if (!state.user) return state; // Prevent updates if no user exists
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_REQUIRE_AUTH': // NEW: Handle `requireAuth` toggle
      return {
        ...state,
        requireAuth: action.payload,
      };
    default:
      return state;
  }
};

// Provider
export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userAuthReducer, initialUserAuthState, (initial) => {
    const stored = localStorage.getItem('userAuthState');
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem('userAuthState', JSON.stringify(state));
  }, [state]);

  return (
    <UserAuthContext.Provider value={state}>
      <UserAuthDispatchContext.Provider value={dispatch}>
        {children}
      </UserAuthDispatchContext.Provider>
    </UserAuthContext.Provider>
  );
};

// Hooks
export const useUserAuthState = (): UserAuthState => {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error('useUserAuthState must be used within UserAuthProvider');
  return context;
};

export const useUserAuthDispatch = (): React.Dispatch<UserAuthAction> => {
  const context = useContext(UserAuthDispatchContext);
  if (!context) throw new Error('useUserAuthDispatch must be used within UserAuthProvider');
  return context;
};

// Utility: Toggle requireAuth
export const setRequireAuth = (dispatch: React.Dispatch<UserAuthAction>, value: boolean) => {
  dispatch({ type: 'SET_REQUIRE_AUTH', payload: value });
};
