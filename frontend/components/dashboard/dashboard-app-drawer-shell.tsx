"use client";

import type { ReactNode } from "react";
import { Minus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { DrawerContent, DrawerTitle } from "@/components/ui/drawer";

/** Shared with Home (iframe) and Marketplace (app detail scroll). */
export const DASHBOARD_APP_DRAWER_OVERLAY_CLASS =
  "z-50 bg-black/45 backdrop-blur-2xl supports-backdrop-filter:backdrop-blur-2xl";

export const dashboardAppDrawerContentClassName = cn(
  "!z-[55] flex flex-col gap-0 overflow-hidden bg-background p-2.5",
  "rounded-2xl border border-white/12 shadow-[0_16px_56px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.06]",
  "data-[vaul-drawer-direction=bottom]:!top-[calc(env(safe-area-inset-top)+1rem)] data-[vaul-drawer-direction=bottom]:!bottom-[calc(env(safe-area-inset-bottom)+1rem)]",
  "data-[vaul-drawer-direction=bottom]:!left-[calc(env(safe-area-inset-left)+1rem)] data-[vaul-drawer-direction=bottom]:!right-[calc(env(safe-area-inset-right)+1rem)]",
  "!h-auto !max-h-none",
  "data-[vaul-drawer-direction=bottom]:!mt-0",
);

export type DashboardHomeAppChrome = {
  title: string;
  onClose: () => void;
  /** Home only — omit so the leading control is a spacer (e.g. Marketplace). */
  onMinimize?: () => void;
  /** Extra controls before the close button (e.g. Install on app detail). */
  trailingActions?: ReactNode;
  /** When true, title uses Radix `DrawerTitle` (required inside `DrawerContent`). */
  useDrawerTitle?: boolean;
};

const chromeTitleClass =
  "min-w-0 flex-1 truncate px-1 text-center text-[13px] font-medium tracking-tight text-foreground/95";

type DashboardHomeAppSurfaceProps = {
  /** When omitted (all apps minimized), only the body renders so iframe children never remount. */
  chrome?: DashboardHomeAppChrome;
  children: ReactNode;
};

/**
 * Shared launcher surface: optional title bar + one stable body slot for iframes.
 * Home multitasking must keep `children` mounted when chrome toggles.
 */
export function DashboardHomeAppSurface({
  chrome,
  children,
}: DashboardHomeAppSurfaceProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20">
      {chrome ? (
        <div className="flex h-11 shrink-0 items-center gap-1 rounded-t-xl border-b border-white/10 bg-[#2c2c2e] px-1.5 dark:bg-[#1e1e1e]">
          {chrome.onMinimize ? (
            <button
              type="button"
              onClick={chrome.onMinimize}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground/85 transition-colors hover:bg-white/10"
              aria-label="Minimize"
            >
              <Minus className="size-5" strokeWidth={2.25} />
            </button>
          ) : (
            <div className="size-10 shrink-0" aria-hidden />
          )}
          {chrome.useDrawerTitle ? (
            <DrawerTitle className={chromeTitleClass}>{chrome.title}</DrawerTitle>
          ) : (
            <h2 className={chromeTitleClass}>{chrome.title}</h2>
          )}
          <div className="flex shrink-0 items-center gap-0.5 pr-0.5">
            {chrome.trailingActions}
            <button
              type="button"
              onClick={chrome.onClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground/85 transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden bg-black/25",
          chrome ? "rounded-b-xl" : "rounded-xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}

type DashboardAppDrawerPanelProps = {
  title: string;
  onClose: () => void;
  /** Home only — omit on Marketplace so the leading control is a spacer. */
  onMinimize?: () => void;
  trailingActions?: ReactNode;
  children: ReactNode;
};

/** Title bar + body surface (no vaul wrapper). Used by Home persistent launcher. */
export function DashboardAppDrawerPanel({
  title,
  onClose,
  onMinimize,
  trailingActions,
  children,
}: DashboardAppDrawerPanelProps) {
  return (
    <DashboardHomeAppSurface
      chrome={{
        title,
        onClose,
        onMinimize,
        trailingActions,
        useDrawerTitle: true,
      }}
    >
      {children}
    </DashboardHomeAppSurface>
  );
}

type DashboardAppDrawerShellProps = DashboardAppDrawerPanelProps;

/**
 * Same outer drawer + title bar chrome as Home app launcher; `children` is the
 * main surface (iframe on Home, scrollable detail on Marketplace).
 */
export function DashboardAppDrawerShell({
  title,
  onClose,
  onMinimize,
  trailingActions,
  children,
}: DashboardAppDrawerShellProps) {
  return (
    <DrawerContent
      hideHandle
      overlayClassName={DASHBOARD_APP_DRAWER_OVERLAY_CLASS}
      className={dashboardAppDrawerContentClassName}
    >
      <DashboardAppDrawerPanel
        title={title}
        onClose={onClose}
        onMinimize={onMinimize}
        trailingActions={trailingActions}
      >
        {children}
      </DashboardAppDrawerPanel>
    </DrawerContent>
  );
}
