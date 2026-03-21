"use client";

import * as React from "react";

/** Dark-only theme context — avoids next-themes injecting a script tag (React 19 disallows that in client components). */
type ThemeContextValue = {
  theme: string;
  setTheme: (theme: string | ((prev: string) => string)) => void;
  forcedTheme: string | undefined;
  resolvedTheme: string;
  themes: string[];
  systemTheme: undefined;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme: "dark",
      setTheme: () => {},
      forcedTheme: "dark",
      resolvedTheme: "dark",
      themes: ["dark"],
      systemTheme: undefined,
    }),
    [],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Same shape as next-themes `useTheme` for components that expect it. */
export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (ctx === undefined) {
    return {
      theme: "dark",
      setTheme: () => {},
      forcedTheme: "dark",
      resolvedTheme: "dark",
      themes: ["dark"],
      systemTheme: undefined,
    };
  }
  return ctx;
}
