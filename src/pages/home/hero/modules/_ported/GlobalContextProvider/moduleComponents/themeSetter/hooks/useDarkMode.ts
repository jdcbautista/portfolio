// src/modules/ContextModule/moduleComponents/themeSetter/hooks/useDarkMode.ts
import { useTheme } from './useTheme';

export const useDarkMode = () => {
  const { darkMode, toggleTheme } = useTheme();
  return { darkMode, toggleTheme };
};
