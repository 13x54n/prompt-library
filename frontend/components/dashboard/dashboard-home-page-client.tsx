"use client";

import { DashboardAppDrawerStack } from "@/components/dashboard/dashboard-app-drawer-stack";
import { DashboardAppWindowsProvider } from "@/components/dashboard/dashboard-app-windows-context";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { DashboardDockNav } from "@/components/dashboard/dashboard-dock-nav";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardScrollRegion } from "@/components/dashboard/dashboard-scroll-region";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardHomePageClient() {
  const { connected, connecting, publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connecting) return;
    if (!connected) router.replace("/");
  }, [connected, connecting, router]);

  if (connecting) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 bg-background px-6">
        <p className={dashboardTypography.status}>Connecting wallet…</p>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-6">
        <p className={dashboardTypography.status}>Redirecting…</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardAppWindowsProvider>
        <SidebarInset>
          <DashboardScrollRegion>
            <div className="mx-auto w-full max-w-3xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:pt-6 md:max-w-5xl md:px-8">
              <DashboardHome />
            </div>
          </DashboardScrollRegion>
          <DashboardAppDrawerStack />
          <DashboardDockNav />
        </SidebarInset>
      </DashboardAppWindowsProvider>
    </SidebarProvider>
  );
}
