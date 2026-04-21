import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => localStorage.getItem('adminTheme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('adminTheme', dark ? 'dark' : 'light');
  }, [dark]);
  const toggle = () => setDark(d => !d);
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
};
