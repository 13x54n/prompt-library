"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { DappAppDetailModal } from "@/components/dashboard/dapp-app-detail-modal";
import { getAppDetail } from "@/components/dashboard/dapp-app-registry";
import type { CategoryId } from "@/components/dashboard/dapp-marketplace-category-data";

export function AppDetailModalHost({ category }: { category: CategoryId }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("app");
  const app = raw ? getAppDetail(raw) : null;

  useEffect(() => {
    if (raw && !app) {
      router.replace(`/dashboard/${category}`, { scroll: false });
    }
  }, [raw, app, category, router]);

  const open = Boolean(raw && app);

  return (
    <DappAppDetailModal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          router.replace(`/dashboard/${category}`, { scroll: false });
        }
      }}
      app={app}
    />
  );
}
