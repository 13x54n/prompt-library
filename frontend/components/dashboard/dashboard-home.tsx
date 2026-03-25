"use client";

import { Suspense, useMemo, useState } from "react";

import Link from "next/link";
import { Search } from "lucide-react";

import { AppDetailModalHost } from "@/components/dashboard/app-detail-modal-host";
import { DashboardWalletMenu } from "@/components/dashboard/dapp-marketplace-dashboard";
import { getAllAppDetails, type AppDetail } from "@/components/dashboard/dapp-app-registry";
import { DASHBOARD_HOME_HREF } from "@/components/dashboard/dashboard-constants";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { DEFAULT_CATEGORY_ID } from "@/components/dashboard/dapp-marketplace-category-data";
import { cn } from "@/lib/utils";

function appQueryHref(slug: string) {
  return `${DASHBOARD_HOME_HREF}?app=${encodeURIComponent(slug)}`;
}

function AppGridTile({ app }: { app: AppDetail }) {
  return (
    <li className="min-w-0">
      <Link
        href={appQueryHref(app.slug)}
        scroll={false}
        className={cn(
          "group flex flex-col items-center gap-2 outline-none",
          "transition-[transform,opacity] active:scale-[0.96] sm:active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl",
        )}
      >
        <span
          className={cn(
            "relative flex size-[3.75rem] shrink-0 items-center justify-center overflow-hidden",
            "rounded-[1.35rem] bg-white/[0.08] shadow-sm ring-1 ring-white/[0.12]",
            "transition-[box-shadow,transform] group-hover:ring-white/20 sm:size-16 sm:rounded-[1.45rem]",
          )}
        >
          <img
            src={app.logo}
            alt=""
            className="size-full object-cover"
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className={dashboardTypography.tileTitle} title={app.name}>
          {app.name}
        </span>
      </Link>
    </li>
  );
}

export function DashboardHome({ address }: { address: string }) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      getAllAppDetails().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q) ||
        a.developer.toLowerCase().includes(q),
    );
  }, [query, sorted]);

  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,oklch(0.52_0.16_264/0.12),transparent_50%),linear-gradient(to_bottom,oklch(0.12_0.01_264),var(--background))]"
        aria-hidden
      />

      <div className="flex flex-col gap-5 sm:gap-6">
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/[0.06] bg-background/80 px-4 pb-3 pt-1 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3 pb-3">
            <h1 className={dashboardTypography.pageTitle}>Home</h1>
            <DashboardWalletMenu address={address} />
          </div>

          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 size-[1.1rem] -translate-y-1/2 opacity-80"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={cn(
                "w-full rounded-full border border-white/[0.08] bg-white/[0.07] py-2.5 pl-10 pr-4 text-foreground shadow-inner outline-none",
                dashboardTypography.input,
                "placeholder:text-muted-foreground/80",
                "transition-[box-shadow,background-color] focus:border-[#64B5FF]/35 focus:bg-white/[0.1] focus:ring-2 focus:ring-[#64B5FF]/25",
              )}
              aria-label="Search apps"
            />
          </div>
        </header>

        <section aria-labelledby="dashboard-app-grid-heading">
          <h2 id="dashboard-app-grid-heading" className="sr-only">
            Apps
          </h2>
          {filtered.length === 0 ? (
            <p className={dashboardTypography.empty}>
              No apps match “{query.trim()}”.
            </p>
          ) : (
            <ul
              className={cn(
                "grid grid-cols-4 gap-x-2 gap-y-7 sm:grid-cols-5 sm:gap-x-3 sm:gap-y-8 md:grid-cols-6 lg:grid-cols-8",
                "px-0.5",
              )}
            >
              {filtered.map((app) => (
                <AppGridTile key={app.slug} app={app} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <Suspense fallback={null}>
        <AppDetailModalHost
          category={DEFAULT_CATEGORY_ID}
          closeHref={DASHBOARD_HOME_HREF}
        />
      </Suspense>
    </div>
  );
}
