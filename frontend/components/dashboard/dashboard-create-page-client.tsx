"use client";

import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { DashboardDockNav } from "@/components/dashboard/dashboard-dock-nav";
import { DashboardScrollRegion } from "@/components/dashboard/dashboard-scroll-region";
import { DashboardWalletMenu } from "@/components/dashboard/dapp-marketplace-dashboard";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardCreatePageClient() {
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

  const address = publicKey.toBase58();

  return (
    <SidebarProvider>
      <SidebarInset>
        <DashboardScrollRegion>
          <div className="mx-auto w-full max-w-3xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:pt-6 md:max-w-5xl md:px-8">
            <div className="relative min-h-full">
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,oklch(0.52_0.16_264/0.12),transparent_50%),linear-gradient(to_bottom,oklch(0.12_0.01_264),var(--background))]"
                aria-hidden
              />
              <header className="flex items-start justify-between gap-3 pb-6">
                <div className="min-w-0 pt-0.5">
                  <h1 className={dashboardTypography.pageTitle}>Create</h1>
                  <p className={dashboardTypography.subtitle}>
                    Build prompts, agents, and flows — this space is coming soon.
                  </p>
                </div>
                <DashboardWalletMenu address={address} />
              </header>
            </div>
          </div>
        </DashboardScrollRegion>
        <DashboardDockNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
