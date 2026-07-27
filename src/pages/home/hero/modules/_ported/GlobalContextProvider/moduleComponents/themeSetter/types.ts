export interface ThemeSetterProps {
  metadata?: Record<string, unknown>;
}

export interface ThemeSetterConfig {
  metadata?: Record<string, unknown>;
}

export interface ThemeModeToggleConfig {
  metadata?: Record<string, unknown>;
}

export interface ThemeSelectorConfig {
  metadata?: Record<string, unknown>;
}

// src/modules/ContextModule/moduleComponents/themeSetter/types.ts
export interface ThemeModeToggleProps {
  darkMode: boolean;
  toggleTheme: () => void;
  metadata?: Record<string, unknown>;
}

export interface ThemeSelectorProps {
  themeName: string;
  setThemeName: (theme: string) => void;
  metadata?: Record<string, unknown>;
}
