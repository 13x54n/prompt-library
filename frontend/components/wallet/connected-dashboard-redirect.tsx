"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { DEFAULT_CATEGORY_ID } from "@/components/dashboard/dapp-marketplace-category-data";

/** While connected, only `/dashboard` and nested routes (e.g. `/dashboard/defi`) are allowed. */
const DASHBOARD_PREFIX = "/dashboard";

function pathAllowedWhenConnected(pathname: string) {
  return (
    pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`)
  );
}

/**
 * When a wallet is connected, keep the user in the dashboard app shell only.
 * Visiting marketing or other app routes redirects to the default dashboard category.
 */
export function ConnectedDashboardRedirect() {
  const { connected } = useWallet();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!connected) return;
    if (pathAllowedWhenConnected(pathname)) return;
    router.replace(`/dashboard/${DEFAULT_CATEGORY_ID}`);
  }, [connected, pathname, router]);

  return null;
}
