"use client";

import { AppDetailPanelBody } from "@/components/dashboard/app-detail-panel-body";
import type { AppDetail } from "@/components/dashboard/dapp-app-registry";
import { DashboardAppDrawerShell } from "@/components/dashboard/dashboard-app-drawer-shell";
import { Drawer } from "@/components/ui/drawer";

/**
 * Marketplace app detail — same drawer shell as Home (inset, blur, title bar),
 * but scrollable storefront content instead of an iframe. Close with ✕ (no Done row).
 */
export function DappAppDetailModal({
  open,
  onOpenChange,
  app,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: AppDetail | null;
}) {
  if (!app) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal>
      <DashboardAppDrawerShell
        title={app.name}
        onClose={() => onOpenChange(false)}
      >
        <div className="absolute inset-0 overflow-y-auto overscroll-contain">
          <AppDetailPanelBody
            app={app}
            className="!px-4 !pb-5 !pt-3 sm:!gap-6 sm:!px-5 sm:!pb-6 sm:!pt-4"
          />
        </div>
      </DashboardAppDrawerShell>
    </Drawer>
  );
}
