"use client";

import { Suspense } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { CopyIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
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

/** Varying min widths on larger screens; mobile uses horizontal snap row */
const CATEGORY_CHIP_MIN_W = [
  "min-w-[6.75rem]",
  "min-w-[7.5rem]",
  "min-w-[6rem]",
  "min-w-[8rem]",
  "min-w-[5.75rem]",
  "min-w-[7.25rem]",
] as const;

const DASHBOARD_BASE = "/dashboard";

export function DashboardWalletMenu({ address }: { address: string }) {
  const { disconnect, publicKey } = useWallet();
  const full = publicKey?.toBase58() ?? address;
  const initials = full.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold tracking-wide ring-1 ring-white/15",
            "cursor-pointer outline-none transition-[transform,box-shadow] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="Account menu"
        >
          {initials}
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
            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              Connected wallet
            </span>
            <span className="font-mono text-xs leading-snug break-all text-foreground/90">
              {full}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer rounded-xl py-2.5"
          onClick={() => void navigator.clipboard.writeText(full)}
        >
          <CopyIcon className="size-4" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer rounded-xl py-2.5"
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

  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,oklch(0.52_0.16_264/0.12),transparent_50%),linear-gradient(to_bottom,oklch(0.15_0.01_264),var(--background))]"
        aria-hidden
      />

      <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 md:pb-2">
        {/* App Store–style masthead: sticky frosted bar on mobile */}
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/[0.07] bg-background/75 px-4 pb-3 pt-1 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pt-0.5">
              <p className="text-muted-foreground mb-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-xs">
                Maple
              </p>
              <h1 className="text-[1.625rem] font-bold leading-[1.08] tracking-tight sm:text-[2.125rem] md:text-[2.5rem]">
                Today
              </h1>
            </div>
            <DashboardWalletMenu address={address} />
          </div>
        </header>

        {/* Categories: horizontal snap strip on phones (App Store–style), wrap on md+ */}
        <nav className="-mx-4 sm:mx-0" aria-label="Categories">
          <div
            className={cn(
              "scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-1 pt-0.5",
              "snap-x snap-mandatory sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0",
            )}
          >
            {CATEGORY_LAUNCHER.map((app, i) => {
              const Icon = app.icon;
              const active = category === app.id;
              return (
                <Link
                  href={`${DASHBOARD_BASE}/${app.id}`}
                  key={app.id}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] shrink-0 snap-start items-center justify-center gap-2 rounded-full border px-3.5 py-2.5 text-[13px] font-semibold leading-none ring-white/5 transition-colors active:scale-[0.98] sm:min-h-0 sm:px-3 sm:py-2 sm:text-sm",
                    CATEGORY_CHIP_MIN_W[i % CATEGORY_CHIP_MIN_W.length],
                    active
                      ? "border-[#64B5FF]/45 bg-[#0A84FF]/22 text-[#64B5FF] ring-1 ring-[#64B5FF]/35"
                      : "border-white/10 bg-white/[0.06] active:bg-white/15 sm:hover:bg-white/[0.09]",
                  )}
                >
                  <Icon className="size-[18px] shrink-0 opacity-90 sm:size-4" aria-hidden />
                  {app.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex flex-col gap-8 sm:gap-10">
          <CategoryPage />
        </div>
      </div>

      <Suspense fallback={null}>
        <AppDetailModalHost category={category} />
      </Suspense>
    </div>
  );
}
