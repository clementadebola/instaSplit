// theme/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

const getTheme = (darkMode: boolean) => ({
  dark: darkMode,
  colors: {
    primary: darkMode ? "#8B5CF6" : "#6F2BD4",
    secondary: darkMode ? "#A78BFA" : "#9333EA",
    background: darkMode ? "#0F0F23" : "#F8FAFC",
    card: darkMode ? "#1E1B4B" : "#FFFFFF",
    text: darkMode ? "#F1F5F9" : "#1E293B",
    secondaryText: darkMode ? "#94A3B8" : "#64748B",
    border: darkMode
      ? "rgba(139, 92, 246, 0.2)"
      : "rgba(111, 43, 212, 0.1)",
    danger: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    notification: darkMode ? "#A78BFA" : "#9333EA",
  },
});

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  theme: ReturnType<typeof getTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider
      value={{ darkMode, setDarkMode, toggleDarkMode, theme: getTheme(darkMode) }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
