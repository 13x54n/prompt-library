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
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardPageClient() {
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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Maple</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Discover</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="p-4 pt-5 md:p-6 md:pt-6">
            <DappMarketplaceDashboard address={address} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
