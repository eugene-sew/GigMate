// theme/colors.ts
export const lightColors = {
  primary: "#2563eb",
  secondary: "#10b981",
  background: "#ffffff",
  surface: "#f3f4f6",
  text: "#1f2937",
  border: "#e5e7eb",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

export const darkColors: typeof lightColors = {
  primary: "#3b82f6",
  secondary: "#34d399",
  background: "#111827",
  surface: "#1f2937",
  text: "#f9fafb",
  border: "#374151",
  error: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
};

// theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";

export type ColorScheme = typeof lightColors;

export interface Theme {
  colors: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<Theme>({
  colors: lightColors,
  isDark: true,
  toggleTheme: () => {},
});

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
