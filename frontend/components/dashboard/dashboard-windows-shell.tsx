"use client";

import type { ReactNode } from "react";

import { DashboardAppDrawerStack } from "@/components/dashboard/dashboard-app-drawer-stack";
import { DashboardAppWindowsProvider } from "@/components/dashboard/dashboard-app-windows-context";

/**
 * Holds multitasking state for dApp drawers across all /dashboard/* routes so
 * opened apps survive client navigation (Home, Explore, Build).
 */
export function DashboardWindowsShell({ children }: { children: ReactNode }) {
  return (
    <DashboardAppWindowsProvider>
      {children}
      <DashboardAppDrawerStack />
    </DashboardAppWindowsProvider>
  );
}
