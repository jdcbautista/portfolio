import { Brightness7, Brightness4 } from '@mui/icons-material';
import { useDarkMode } from './hooks/useDarkMode';

const ThemeModeToggle = () => {
  const { darkMode, toggleTheme } = useDarkMode();

  return (
    <button
      className="theme-mode-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme mode"
    >
      {darkMode ? <Brightness4 /> : <Brightness7 />}
    </button>
  );
};

export default ThemeModeToggle;

