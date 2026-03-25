"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DappMarketplaceDashboard } from "@/components/dashboard/dapp-marketplace-dashboard";
import type { CategoryId } from "@/components/dashboard/dapp-marketplace-category-data";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardPageClient({ category }: { category: CategoryId }) {
  const { connected, connecting, publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connecting) return;
    if (!connected) router.replace("/");
  }, [connected, connecting, router]);

  if (connecting) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 bg-background px-6">
        <p className="text-muted-foreground text-sm">Connecting wallet…</p>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-6">
        <p className="text-muted-foreground text-sm">Redirecting…</p>
      </div>
    );
  }

  const address = publicKey.toBase58();

  return (
    <SidebarProvider>
      {/* <AppSidebar /> */}
      <SidebarInset>
        <div className="flex min-h-[100dvh] flex-1 flex-col overflow-auto">
          <div className="mx-auto w-full max-w-3xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:pt-6 md:max-w-5xl md:px-8">
            <DappMarketplaceDashboard address={address} category={category} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
