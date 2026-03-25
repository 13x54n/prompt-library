"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Search, X } from "lucide-react";

import { useDashboardAppWindows } from "@/components/dashboard/dashboard-app-windows-context";
import {
  getPurchasedAppDetails,
  type AppDetail,
} from "@/components/dashboard/dapp-app-registry";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

function AppGridTile({
  app,
  onOpen,
}: {
  app: AppDetail;
  onOpen: (slug: string) => void;
}) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={() => onOpen(app.slug)}
        className={cn(
          "group flex w-full flex-col items-center gap-2 rounded-2xl outline-none",
          "transition-[transform,opacity] active:scale-[0.96] sm:active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
      </button>
    </li>
  );
}

/** Floating “liquid glass” search pill — strong blur, thin highlight edge, saturated glass. */
const glassSearchPill = cn(
  "flex w-full min-w-0 items-center gap-2.5 rounded-full border border-white/18",
  "bg-black/35 shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]",
  "backdrop-blur-2xl backdrop-saturate-150",
  "ring-1 ring-white/[0.08]",
);

export function DashboardHome() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { openApp } = useDashboardAppWindows();

  const sorted = useMemo(
    () =>
      getPurchasedAppDetails().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    const matches = sorted.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q) ||
        a.developer.toLowerCase().includes(q),
    );
    return matches.length > 0 ? matches : sorted;
  }, [query, sorted]);

  const resultsDialogOpen = searchOpen && query.trim().length > 0;

  useEffect(() => {
    if (!searchOpen) return;
    const t = requestAnimationFrame(() => searchInputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (resultsDialogOpen) return;
      e.preventDefault();
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, resultsDialogOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const openAppFromResults = (slug: string) => {
    openApp(slug);
    closeSearch();
  };

  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,oklch(0.52_0.16_264/0.12),transparent_50%),linear-gradient(to_bottom,oklch(0.12_0.01_264),var(--background))]"
        aria-hidden
      />

      {searchOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-xl"
          aria-label="Close search"
          onClick={() => closeSearch()}
        />
      ) : null}

      {searchOpen ? (
        <div
          id="dashboard-home-search"
          className="fixed top-[max(0.65rem,env(safe-area-inset-top))] left-1/2 z-50 w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 px-3"
        >
          <div className={cn(glassSearchPill, "px-3.5 py-2.5 sm:px-4 sm:py-3")}>
            <Search
              className="pointer-events-none size-[1.15rem] shrink-0 text-foreground/65"
              aria-hidden
            />
            {/* type="text" avoids WebKit’s second “clear” control on type="search" */}
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your apps"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={cn(
                "min-w-0 flex-1 bg-transparent py-0.5 text-foreground outline-none placeholder:text-muted-foreground/75",
                dashboardTypography.input,
              )}
              aria-label="Search your apps"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  closeSearch();
                }
              }}
            />
            <span
              className="hidden shrink-0 rounded-md border border-white/12 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/90 sm:inline"
              aria-hidden
            >
              ⌘K
            </span>
            <button
              type="button"
              onClick={() => closeSearch()}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Close search"
            >
              <X className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={resultsDialogOpen}
        onOpenChange={(next) => {
          if (!next) setQuery("");
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[100] bg-black/55 backdrop-blur-md supports-backdrop-filter:backdrop-blur-xl"
          className={cn(
            "!z-[101] gap-0 overflow-hidden border-white/[0.12] bg-[#1c1c1e] p-0 text-foreground",
            "w-[min(calc(100vw-1.5rem),26rem)] max-w-none rounded-2xl sm:rounded-3xl",
            "max-h-[min(72dvh,560px)] shadow-2xl ring-1 ring-white/[0.06]",
          )}
        >
          <DialogTitle className="sr-only">Search results</DialogTitle>
          <div className="border-b border-white/10 px-4 py-3 sm:px-5">
            <p className={dashboardTypography.sectionTitle}>Results</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {filtered.length} app{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <ul
            className="max-h-[min(56dvh,440px)] overflow-y-auto overscroll-contain px-2 py-2 sm:px-3"
            aria-label="Apps"
          >
            {filtered.map((app) => (
              <li key={app.slug}>
                <button
                  type="button"
                  onClick={() => openAppFromResults(app.slug)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors",
                    "hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64B5FF]/50",
                  )}
                >
                  <img
                    src={app.logo}
                    alt=""
                    className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                    width={44}
                    height={44}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {app.name}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {app.tagline}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-5 sm:gap-6">
        <header className="sticky top-0 z-30 -mx-4 flex justify-end px-4 pb-2 pt-[max(0.35rem,env(safe-area-inset-top))] sm:static sm:mx-0 sm:justify-end sm:bg-transparent sm:p-0 sm:pb-0 sm:pt-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-expanded={searchOpen}
            aria-controls="dashboard-home-search"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full outline-none",
              "border border-white/16 bg-black/30 text-foreground/85 shadow-lg",
              "backdrop-blur-2xl backdrop-saturate-150",
              "ring-1 ring-white/[0.07]",
              "transition-[transform,background-color,box-shadow] hover:bg-black/40 hover:ring-white/12",
              "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55",
              "active:scale-[0.96]",
            )}
          >
            <Search className="size-[1.15rem]" strokeWidth={2.25} aria-hidden />
            <span className="sr-only">Open search</span>
          </button>
        </header>

        <section aria-labelledby="dashboard-app-grid-heading">
          <h2 id="dashboard-app-grid-heading" className="sr-only">
            Your apps
          </h2>
          {sorted.length === 0 ? (
            <p className={dashboardTypography.empty}>No apps in your library.</p>
          ) : (
            <ul
              className={cn(
                "grid grid-cols-4 gap-x-2 gap-y-7 sm:grid-cols-5 sm:gap-x-3 sm:gap-y-8 md:grid-cols-6 lg:grid-cols-8",
                "px-0.5",
              )}
            >
              {sorted.map((app) => (
                <AppGridTile key={app.slug} app={app} onOpen={openApp} />
              ))}
            </ul>
          )}
        </section>
    </div>
    </div>
  );
}
