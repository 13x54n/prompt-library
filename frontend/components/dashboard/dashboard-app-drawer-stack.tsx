"use client";

import { useDashboardAppWindows } from "@/components/dashboard/dashboard-app-windows-context";
import { DashboardAppDrawerShell } from "@/components/dashboard/dashboard-app-drawer-shell";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { getAppDetail } from "@/components/dashboard/dapp-app-registry";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";

/**
 * Bottom drawers for apps opened from Home — one expanded at a time, minimized
 * apps appear as chips above the bottom dock. Top bar: minimize · title · close.
 */
export function DashboardAppDrawerStack() {
  const { windows, minimizeWindow, closeWindow, restoreWindow } =
    useDashboardAppWindows();

  const active = windows.find((w) => !w.minimized);
  const minimized = windows.filter((w) => w.minimized);
  const app = active ? getAppDetail(active.slug) : null;

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

      {active && app ? (
        <Drawer
          open
          onOpenChange={(next) => {
            if (!next) minimizeWindow(active.id);
          }}
          modal
        >
          <DashboardAppDrawerShell
            title={app.name}
            onClose={() => closeWindow(active.id)}
            onMinimize={() => minimizeWindow(active.id)}
          >
            <iframe
              title={app.name}
              src={app.siteUrl}
              className="absolute inset-0 h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </DashboardAppDrawerShell>
        </Drawer>
      ) : null}
    </>
  );
}
