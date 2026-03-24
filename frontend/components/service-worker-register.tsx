"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker. Production always; dev only on localhost so HMR
 * on LAN previews is not affected.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    if (process.env.NODE_ENV !== "production" && !isLocal) return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* ignore registration errors (e.g. non-HTTPS host) */
    });
  }, []);

  return null;
}
