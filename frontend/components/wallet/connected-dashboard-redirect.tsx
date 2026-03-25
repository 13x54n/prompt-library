"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { DASHBOARD_HOME_HREF } from "@/components/dashboard/dashboard-constants";

const DASHBOARD_PREFIX = "/dashboard";

function isUnderDashboardShell(pathname: string) {
  return (
    pathname === DASHBOARD_PREFIX ||
    pathname.startsWith(`${DASHBOARD_PREFIX}/`)
  );
}

function isBareDashboard(pathname: string) {
  return pathname === DASHBOARD_PREFIX || pathname === `${DASHBOARD_PREFIX}/`;
}

/**
 * When a wallet is connected, keep the user in the dashboard app shell only.
 * Marketing and other app routes redirect to dashboard home (`/dashboard/home`).
 * Visiting `/dashboard` (no segment) also redirects to that same home URL.
 */
export function ConnectedDashboardRedirect() {
  const { connected } = useWallet();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!connected) return;
    if (!isUnderDashboardShell(pathname)) {
      router.replace(DASHBOARD_HOME_HREF);
      return;
    }
    if (isBareDashboard(pathname)) {
      router.replace(DASHBOARD_HOME_HREF);
    }
  }, [connected, pathname, router]);

  return null;
}
