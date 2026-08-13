"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'bright' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('bright');

  const applyThemeToDOM = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('fincent-theme') as Theme | null;
    const initialTheme = (savedTheme === 'bright' || savedTheme === 'dark') ? savedTheme : 'bright';
    setThemeState(initialTheme);
    applyThemeToDOM(initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('fincent-theme', newTheme);
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'bright' ? 'dark' : 'bright';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Provide a safe fallback if used outside provider during SSR/testing
    return {
      theme: 'bright' as Theme,
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }
  return context;
};
