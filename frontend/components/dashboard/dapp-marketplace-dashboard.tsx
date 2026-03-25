"use client";

import { Suspense, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { CopyIcon, ListFilter, LogOutIcon, Search } from "lucide-react";
import Link from "next/link";

import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AppDetailModalHost } from "@/components/dashboard/app-detail-modal-host";
import { CATEGORY_PAGE_COMPONENT } from "@/components/dashboard/category-pages/category-page-registry";
import {
  CATEGORY_LAUNCHER,
  type CategoryId,
} from "@/components/dashboard/dapp-marketplace-category-data";

const DASHBOARD_BASE = "/dashboard";

function categoryDrawerRowClass(active: boolean) {
  return cn(
    "flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 ring-white/5 transition-colors active:scale-[0.98]",
    dashboardTypography.chip,
    active
      ? "border-[#64B5FF]/45 bg-[#0A84FF]/22 text-[#64B5FF] ring-1 ring-[#64B5FF]/35"
      : "border-white/10 bg-white/[0.06] active:bg-white/15",
  );
}

function categoryStripChipClass(active: boolean) {
  return cn(
    "flex min-h-[44px] shrink-0 snap-start items-center justify-center gap-2 px-2 ring-white/5 transition-colors active:scale-[0.98] sm:min-h-0 sm:px-3 sm:py-2",
    dashboardTypography.chip,
    active
      ? "border-[#64B5FF]/45 bg-[#0A84FF]/22 text-[#64B5FF] ring-1 ring-[#64B5FF]/35"
      : "border-white/10 bg-white/[0.06] active:bg-white/15 sm:hover:bg-white/[0.09]",
  );
}

/** Deterministic avatar per wallet — varied “random” look, stable across visits. */
function walletAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

export function DashboardWalletMenu({ address }: { address: string }) {
  const { disconnect, publicKey } = useWallet();
  const full = publicKey?.toBase58() ?? address;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15",
            "cursor-pointer outline-none transition-[transform,box-shadow] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="Account menu"
        >
          <img
            src={walletAvatarUrl(full)}
            alt=""
            className="size-full object-cover"
            width={44}
            height={44}
            loading="eager"
            decoding="async"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[min(calc(100vw-2rem),20rem)] rounded-2xl p-1.5 shadow-lg ring-1 ring-white/10"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex flex-col gap-1.5 px-2 py-2 text-left">
            <span className={dashboardTypography.menuLabel}>
              Connected wallet
            </span>
            <span className={dashboardTypography.menuMono}>
              {full}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer rounded-xl py-2.5 text-xs"
          onClick={() => void navigator.clipboard.writeText(full)}
        >
          <CopyIcon className="size-4" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer rounded-xl py-2.5 text-xs"
          onClick={() => {
            void disconnect();
          }}
        >
          <LogOutIcon className="size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DappMarketplaceDashboard({
  address,
  category,
}: {
  address: string;
  category: CategoryId;
}) {
  const CategoryPage = CATEGORY_PAGE_COMPONENT[category];
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [exploreQuery, setExploreQuery] = useState("");

  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,oklch(0.52_0.16_264/0.12),transparent_50%),linear-gradient(to_bottom,oklch(0.15_0.01_264),var(--background))]"
        aria-hidden
      />

      <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 md:pb-1">
        {/* App Store–style masthead: sticky frosted bar on mobile */}
        {/* <header className="sticky top-0 z-30 -mx-4 border-b border-white/[0.07] bg-background/75 px-4 pb-2 pt-1 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pt-0.5">
              <h1 className={dashboardTypography.pageTitle}>Today</h1>
            </div>
            <DashboardWalletMenu address={address} />
          </div>
        </header> */}

        {/* Categories: horizontal strip on sm+ */}
        <nav
          className="-mx-4 hidden sm:mx-0 sm:block"
          aria-label="Categories"
        >
          <div className="flex flex-wrap gap-1 px-4 pb-1 pt-0.5 sm:px-0 sm:pb-0 sm:pt-0">
            {CATEGORY_LAUNCHER.map((app) => {
              const Icon = app.icon;
              const active = category === app.id;
              return (
                <Link
                  href={`${DASHBOARD_BASE}/${app.id}`}
                  key={app.id}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={categoryStripChipClass(active)}
                >
                  <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                  {app.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Search + category filter (mobile filter) — directly above “Top picks” */}
        <div className="-mx-4 flex items-center gap-2 px-4 sm:mx-0 sm:px-0">
          <div className="relative min-w-0 flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-[1.05rem] -translate-y-1/2 opacity-80"
              aria-hidden
            />
            <input
              type="search"
              value={exploreQuery}
              onChange={(e) => setExploreQuery(e.target.value)}
              placeholder="Search apps"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={cn(
                "w-full rounded-full border border-white/[0.08] bg-white/[0.07] py-2 pl-9 pr-3 text-foreground shadow-inner outline-none",
                dashboardTypography.input,
                "placeholder:text-muted-foreground/80",
                "transition-[box-shadow,background-color] focus:border-[#64B5FF]/35 focus:bg-white/[0.1] focus:ring-2 focus:ring-[#64B5FF]/25",
                "sm:py-2.5 sm:pl-10 sm:pr-4",
              )}
              aria-label="Search apps in this category"
            />
          </div>
          <Drawer open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3.5 outline-none transition-[transform,background-color] sm:hidden",
                  "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "active:scale-[0.98]",
                  dashboardTypography.chip,
                )}
                aria-expanded={categoryFilterOpen}
                aria-haspopup="dialog"
                aria-label="Open category filter"
              >
                <ListFilter className="size-3.5 opacity-90" aria-hidden />
                Filter
              </button>
            </DrawerTrigger>
            <DrawerContent className="border-white/10 bg-background max-h-[min(85dvh,520px)]">
              <DrawerHeader className="border-b border-white/[0.07] pb-3 text-left">
                <DrawerTitle className={dashboardTypography.sectionTitle}>
                  Categories
                </DrawerTitle>
              </DrawerHeader>
              <nav
                className="flex max-h-[min(65dvh,420px)] flex-col gap-1 overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
                aria-label="Categories"
              >
                {CATEGORY_LAUNCHER.map((app) => {
                  const Icon = app.icon;
                  const active = category === app.id;
                  return (
                    <Link
                      href={`${DASHBOARD_BASE}/${app.id}`}
                      key={app.id}
                      scroll={false}
                      onClick={() => setCategoryFilterOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={categoryDrawerRowClass(active)}
                    >
                      <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
                      {app.label}
                    </Link>
                  );
                })}
              </nav>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <CategoryPage searchQuery={exploreQuery} />
        </div>
      </div>

      <Suspense fallback={null}>
        <AppDetailModalHost category={category} />
      </Suspense>
    </div>
  );
}
