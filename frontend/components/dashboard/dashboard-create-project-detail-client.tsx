"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import type { CreateProject } from "@/components/dashboard/create-projects-data";
import { DashboardCreateAiChatPanel } from "@/components/dashboard/dashboard-create-ai-chat-panel";
import { DashboardCreateAndroidMockup } from "@/components/dashboard/dashboard-create-android-mockup";
import {
  DASHBOARD_CREATE_HREF,
  DASHBOARD_EXPLORE_HREF,
} from "@/components/dashboard/dashboard-constants";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { DashboardDockNav } from "@/components/dashboard/dashboard-dock-nav";
import { DashboardScrollRegion } from "@/components/dashboard/dashboard-scroll-region";
import { DashboardWalletMenu } from "@/components/dashboard/dapp-marketplace-dashboard";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardCreateProjectDetailClient({
  project,
}: {
  project: CreateProject;
}) {
  const { connected, connecting, publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connecting) return;
    if (!connected) router.replace(DASHBOARD_EXPLORE_HREF);
  }, [connected, connecting, router]);

  const [chatMode, setChatMode] = useState<"open" | "minimized" | "closed">(
    "open",
  );

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
          <div className="mx-auto w-full max-w-6xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:pt-6 lg:max-w-[100rem] lg:px-8">
            <div className="relative min-h-full bg-[#121212]">
              <div
                className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.45_0.12_264/0.15),transparent_55%),linear-gradient(to_bottom,#0a0a0b,var(--background))] opacity-90"
                aria-hidden
              />

              <header className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-6">
                <div className="min-w-0">
                  <Link
                    href={DASHBOARD_CREATE_HREF}
                    className="text-muted-foreground mb-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden />
                    Projects
                  </Link>
                  <h1 className={dashboardTypography.pageTitle}>{project.name}</h1>
                  <p className={dashboardTypography.subtitle}>
                    {project.slug} · AI workspace + device preview
                  </p>
                </div>
                <DashboardWalletMenu address={address} />
              </header>

              <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f10] ring-1 ring-white/[0.04] lg:flex-row lg:min-h-[min(calc(100dvh-12rem),920px)]">
                {chatMode === "open" ? (
                  <div className="min-h-0 w-full lg:w-[min(100%,28rem)] lg:max-w-[40%] lg:shrink-0 xl:max-w-[38%]">
                    <DashboardCreateAiChatPanel
                      project={project}
                      onMinimize={() => setChatMode("minimized")}
                      onClose={() => setChatMode("closed")}
                    />
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 bg-[#0a0a0b] lg:min-w-0">
                  <div className="border-b border-white/[0.08] px-4 py-3 lg:hidden">
                    <p className={dashboardTypography.sectionTitle}>Preview</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Android mockup
                    </p>
                  </div>
                  <DashboardCreateAndroidMockup
                    project={project}
                    className="h-full min-h-[320px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </DashboardScrollRegion>

        {chatMode === "minimized" ? (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[45] flex justify-center px-3"
            aria-label="AI chat minimized"
          >
            <button
              type="button"
              onClick={() => setChatMode("open")}
              className={cn(
                "pointer-events-auto flex max-w-full shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-background/90 px-2 py-1 pr-1.5 shadow-lg ring-1 ring-white/5 backdrop-blur-md outline-none transition-colors",
                "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55",
              )}
            >
              <img
                src={project.icon}
                alt=""
                className="size-8 rounded-lg object-cover ring-1 ring-white/15"
                width={32}
                height={32}
              />
              <span
                className={cn(
                  "max-w-[10rem] truncate text-left text-[11px] font-medium sm:max-w-[12rem]",
                  dashboardTypography.chip,
                )}
              >
                Chat with AI · {project.name}
              </span>
            </button>
          </div>
        ) : null}

        {chatMode === "closed" ? (
          <div className="pointer-events-none fixed left-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[45] sm:left-6">
            <button
              type="button"
              onClick={() => setChatMode("open")}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-background/90 px-3 py-2 text-sm font-medium shadow-lg ring-1 ring-white/5 backdrop-blur-md outline-none transition-colors",
                "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55",
                dashboardTypography.chip,
              )}
            >
              <MessageSquare className="size-4 shrink-0 text-foreground/90" aria-hidden />
              Open chat
            </button>
          </div>
        ) : null}

        <DashboardDockNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
