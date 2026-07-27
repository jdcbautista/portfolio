// src/modules/ContextModule/ThemeContextProvider.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
  themeName: string;
  setThemeName: (newTheme: string) => void;
  fullTheme: string;
}

// Correctly creating the context
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeName, setThemeName] = useState('default');

  const fullTheme = `${themeName}-${darkMode ? 'dark' : 'light'}`;

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // Original
  // useEffect(() => {
  //   document.body.className = fullTheme;
  //   // console.log(`Applied theme: ${fullTheme}`);

  useEffect(() => {
    document.body.classList.remove('dark-light', 'default-dark', 'default-light');
    document.body.classList.add(fullTheme);
  }, [fullTheme]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, themeName, setThemeName, fullTheme }}>
      {/* <div className="auto-scroll"> */}
        {children}
      {/* </div> */}
    </ThemeContext.Provider>
  );
};

// Correctly exporting the provider as the default export
export default ThemeContextProvider;
