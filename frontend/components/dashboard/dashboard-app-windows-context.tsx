"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DashboardAppWindow = {
  id: string;
  slug: string;
  minimized: boolean;
};

type Ctx = {
  windows: DashboardAppWindow[];
  openApp: (slug: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
};

const DashboardAppWindowsContext = createContext<Ctx | null>(null);

export function DashboardAppWindowsProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<DashboardAppWindow[]>([]);

  /** Opens a new app on top; other open apps move to the minimized tray. */
  const openApp = useCallback((slug: string) => {
    setWindows((prev) => {
      const minimized = prev.map((x) => ({ ...x, minimized: true }));
      return [
        ...minimized,
        { id: crypto.randomUUID(), slug, minimized: false },
      ];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((w) => w.filter((x) => x.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((x) => (x.id === id ? { ...x, minimized: true } : x)),
    );
  }, []);

  /** Brings one app to the foreground; others stay in the tray. */
  const restoreWindow = useCallback((id: string) => {
    setWindows((w) =>
      w.map((x) => ({
        ...x,
        minimized: x.id !== id,
      })),
    );
  }, []);

  const value = useMemo(
    () => ({
      windows,
      openApp,
      closeWindow,
      minimizeWindow,
      restoreWindow,
    }),
    [windows, openApp, closeWindow, minimizeWindow, restoreWindow],
  );

  return (
    <DashboardAppWindowsContext.Provider value={value}>
      {children}
    </DashboardAppWindowsContext.Provider>
  );
}

export function useDashboardAppWindows() {
  const ctx = useContext(DashboardAppWindowsContext);
  if (!ctx) {
    throw new Error(
      "useDashboardAppWindows must be used within DashboardAppWindowsProvider",
    );
  }
  return ctx;
}
