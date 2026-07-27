// src/modules/ContextModule/moduleComponents/themeSetter/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '../../../ThemeContextProvider'; // Named imports

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext); // Use the context object, not the provider
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};
