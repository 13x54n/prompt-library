"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Paths allowed while connected (app + docs); marketing home redirects away. */
const CONNECTED_ALLOWED_PREFIXES = [
  "/dashboard",
  "/explore",
  "/whitepaper",
  "/featured",
  "/about",
  "/privacy",
  "/terms",
] as const;

function pathAllowedWhenConnected(pathname: string) {
  return CONNECTED_ALLOWED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * When a wallet is connected, send users to the app (not the marketing landing).
 * Allows dashboard, explore, lightpaper, and policy pages so the sidebar works.
 */
export function ConnectedDashboardRedirect() {
  const { connected } = useWallet();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!connected) return;
    if (pathAllowedWhenConnected(pathname)) return;
    router.replace("/dashboard");
  }, [connected, pathname, router]);

  return null;
}
