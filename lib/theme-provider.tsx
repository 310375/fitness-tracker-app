import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);

  // Apply scheme immediately
  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      applyScheme(scheme);
      
      // Save to localStorage for persistence
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("theme-preference", scheme);
      }
    },
    [applyScheme],
  );

  // Load saved theme on mount
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("theme-preference") as ColorScheme | null;
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        setColorSchemeState(saved);
        applyScheme(saved);
      } else {
        applyScheme(systemScheme);
      }
    } else {
      applyScheme(systemScheme);
    }
  }, [applyScheme, systemScheme]);

  // Apply scheme when it changes
  useEffect(() => {
    applyScheme(colorScheme);
  }, [colorScheme, applyScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
    }),
    [colorScheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
