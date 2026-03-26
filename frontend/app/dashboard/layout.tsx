import type { ReactNode } from "react";

import { DashboardWindowsShell } from "@/components/dashboard/dashboard-windows-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardWindowsShell>{children}</DashboardWindowsShell>;
}
