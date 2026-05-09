import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "royal" | "ocean" | "glass";
export const THEME_ORDER: ThemeName[] = ["royal", "ocean", "glass"];

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);
const STORAGE_KEY = "site_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "royal";
    return (localStorage.getItem(STORAGE_KEY) as ThemeName) || "royal";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((p) => {
      const i = THEME_ORDER.indexOf(p);
      return THEME_ORDER[(i + 1) % THEME_ORDER.length];
    });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
