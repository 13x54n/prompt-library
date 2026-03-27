"use client";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { DashboardDockNav } from "@/components/dashboard/dashboard-dock-nav";
import { DashboardScrollRegion } from "@/components/dashboard/dashboard-scroll-region";
import { DappMarketplaceDashboard } from "@/components/dashboard/dapp-marketplace-dashboard";
import type { CategoryId } from "@/components/dashboard/dapp-marketplace-category-data";
import { useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function DashboardPageClient({ category }: { category: CategoryId }) {
  const { connecting, publicKey } = useWallet();
  /** Wallet `connecting` can differ after hydration (autoConnect); only show full-page wait once mounted. */
  const mounted = useMounted();

  if (mounted && connecting) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 bg-background px-6">
        <p className={dashboardTypography.status}>Connecting wallet…</p>
      </div>
    );
  }

  const address = publicKey?.toBase58() ?? "";

  return (
    <SidebarProvider>
      {/* <AppSidebar /> */}
      <SidebarInset>
        <DashboardScrollRegion>
          <div className="mx-auto w-full max-w-3xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:pt-6 md:max-w-5xl md:px-8">
            <DappMarketplaceDashboard address={address} category={category} />
          </div>
        </DashboardScrollRegion>
        <DashboardDockNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
