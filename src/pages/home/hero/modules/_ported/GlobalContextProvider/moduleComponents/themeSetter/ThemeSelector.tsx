// import { useTheme } from '../../ThemeContextProvider'; // Keep using the original hook name
import { useTheme } from './hooks/useTheme';

import appConfig from '../../../../config/appConfig.json'; // Adjust path if necessary

const ThemeSelector = () => {
  const { themeName, setThemeName } = useTheme(); // Access theme name and setter

  // Ensure "default" is always included in the themes list
  const availableThemes = ["default", ...new Set(appConfig.Themes)];

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select"></label>
      <select
        id="theme-select"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
      >
        {availableThemes.map((theme) => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
