"use client";

import { useDashboardAppWindows } from "@/components/dashboard/dashboard-app-windows-context";
import {
  DASHBOARD_APP_DRAWER_OVERLAY_CLASS,
  DashboardHomeAppSurface,
} from "@/components/dashboard/dashboard-app-drawer-shell";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { getAppDetail } from "@/components/dashboard/dapp-app-registry";
import { cn } from "@/lib/utils";

const LAUNCHER_PANEL_CLASS = cn(
  "fixed !z-[55] flex min-h-0 flex-col gap-0 overflow-hidden bg-background p-2.5",
  "rounded-2xl border border-white/12 shadow-[0_16px_56px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.06]",
  "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
);

/**
 * Bottom drawers for apps opened from Home — one expanded at a time, minimized
 * apps appear as chips above the bottom dock. Iframes stay mounted per window
 * (keyed by id) so cross-origin scroll and in-app state persist when switching
 * or minimizing; the panel moves off-screen when all apps are minimized.
 */
export function DashboardAppDrawerStack() {
  const { windows, minimizeWindow, closeWindow, restoreWindow } =
    useDashboardAppWindows();

  const active = windows.find((w) => !w.minimized);
  const minimized = windows.filter((w) => w.minimized);
  const hasWindows = windows.length > 0;
  const activeDetail = active ? getAppDetail(active.slug) : null;

  return (
    <>
      {/* Minimized apps — above dock; below app drawer (z-45 vs drawer z-55) */}
      {minimized.length > 0 ? (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[45] flex justify-center px-3"
          aria-label="Open apps in background"
        >
          <div className="pointer-events-auto flex max-w-full gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-background/90 px-2 py-1.5 shadow-lg ring-1 ring-white/5 backdrop-blur-md scrollbar-hide">
            {minimized.map((w) => {
              const d = getAppDetail(w.slug);
              if (!d) return null;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => restoreWindow(w.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-2 py-1 pr-1.5 outline-none transition-colors",
                    "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55",
                  )}
                >
                  <img
                    src={d.logo}
                    alt=""
                    className="size-8 rounded-lg object-cover ring-1 ring-white/15"
                    width={32}
                    height={32}
                  />
                  <span
                    className={cn(
                      "max-w-[6rem] truncate text-left text-[11px] font-medium sm:max-w-[8rem]",
                      dashboardTypography.chip,
                    )}
                  >
                    {d.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {hasWindows ? (
        <>
          {active ? (
            <button
              type="button"
              aria-label="Minimize app"
              className={cn(
                DASHBOARD_APP_DRAWER_OVERLAY_CLASS,
                "fixed inset-0 cursor-default",
              )}
              onClick={() => minimizeWindow(active.id)}
            />
          ) : null}

          <div
            className={cn(
              LAUNCHER_PANEL_CLASS,
              active
                ? "left-[calc(env(safe-area-inset-left)+1rem)] right-[calc(env(safe-area-inset-right)+1rem)] top-[calc(env(safe-area-inset-top)+1rem)] bottom-[calc(env(safe-area-inset-bottom)+1rem)] translate-x-0 opacity-100"
                : "-left-[100vw] top-0 h-[100dvh] w-screen max-w-[100vw] opacity-0 pointer-events-none",
            )}
            aria-hidden={!active}
          >
            <DashboardHomeAppSurface
              chrome={
                active && activeDetail
                  ? {
                      title: activeDetail.name,
                      onClose: () => closeWindow(active.id),
                      onMinimize: () => minimizeWindow(active.id),
                    }
                  : undefined
              }
            >
              <IframeLayers
                windows={windows}
                activeWindowId={active?.id ?? null}
              />
            </DashboardHomeAppSurface>
          </div>
        </>
      ) : null}
    </>
  );
}

function IframeLayers({
  windows,
  activeWindowId,
}: {
  windows: { id: string; slug: string }[];
  activeWindowId: string | null;
}) {
  return (
    <>
      {windows.map((w) => {
        const detail = getAppDetail(w.slug);
        if (!detail) return null;
        const isActive = activeWindowId === w.id;
        return (
          <iframe
            key={w.id}
            title={detail.name}
            src={detail.siteUrl}
            className={cn(
              "absolute inset-0 h-full w-full border-0",
              isActive
                ? "z-10 opacity-100"
                : "z-0 opacity-0 pointer-events-none",
            )}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            referrerPolicy="no-referrer-when-downgrade"
          />
        );
      })}
    </>
  );
}
