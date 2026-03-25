"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { DappAppDetailModal } from "@/components/dashboard/dapp-app-detail-modal";
import { getAppDetail } from "@/components/dashboard/dapp-app-registry";
import { DASHBOARD_RESTORE_SCROLL_EVENT } from "@/components/dashboard/dashboard-scroll-region";
import type { CategoryId } from "@/components/dashboard/dapp-marketplace-category-data";

export function AppDetailModalHost({
  category,
  closeHref,
}: {
  category: CategoryId;
  /** When set, closing the modal or clearing an invalid `?app=` uses this URL instead of `/dashboard/${category}`. */
  closeHref?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("app");
  const app = raw ? getAppDetail(raw) : null;
  const fallback = closeHref ?? `/dashboard/${category}`;

  useEffect(() => {
    if (raw && !app) {
      router.replace(fallback, { scroll: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event(DASHBOARD_RESTORE_SCROLL_EVENT));
        });
      });
    }
  }, [raw, app, fallback, router]);

  const open = Boolean(raw && app);

  return (
    <DappAppDetailModal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          router.replace(fallback, { scroll: false });
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.dispatchEvent(new Event(DASHBOARD_RESTORE_SCROLL_EVENT));
            });
          });
        }
      }}
      app={app}
    />
  );
}
