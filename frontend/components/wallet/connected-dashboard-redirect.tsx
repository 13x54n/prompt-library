"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  DASHBOARD_EXPLORE_HREF,
  DASHBOARD_HOME_HREF,
} from "@/components/dashboard/dashboard-constants";
import { parseCategoryParam } from "@/components/dashboard/dapp-marketplace-category-data";

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

/** `/dashboard/:category` marketplace routes (not home/create/project). */
function isDashboardCategoryExplorePath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "dashboard" || parts.length !== 2) return false;
  const segment = parts[1];
  if (!segment) return false;
  return parseCategoryParam(segment) !== null;
}

/**
 * Without a wallet, `/` redirects to the category explore (marketplace) entry.
 * When the wallet newly connects on Explore (or `/`), send the user to dashboard home.
 * When connected, non-dashboard routes redirect to home; bare `/dashboard` normalizes to home.
 */
export function ConnectedDashboardRedirect() {
  const { connected, connecting } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const prevConnectedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (connecting) return;

    if (!connected) {
      prevConnectedRef.current = false;
      if (pathname === "/" || pathname === "") {
        router.replace(DASHBOARD_EXPLORE_HREF);
      }
      return;
    }

    const justConnected = prevConnectedRef.current === false;
    prevConnectedRef.current = true;

    if (justConnected) {
      const onGuestDefault =
        pathname === "/" ||
        pathname === "" ||
        isDashboardCategoryExplorePath(pathname);
      if (onGuestDefault) {
        router.replace(DASHBOARD_HOME_HREF);
        return;
      }
    }

    if (!isUnderDashboardShell(pathname)) {
      router.replace(DASHBOARD_HOME_HREF);
      return;
    }
    if (isBareDashboard(pathname)) {
      router.replace(DASHBOARD_HOME_HREF);
    }
  }, [connected, connecting, pathname, router]);

  return null;
}
