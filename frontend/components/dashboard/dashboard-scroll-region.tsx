"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

const STORAGE_PREFIX = "maple-dashboard-scroll:";

/** Dispatched after `router.replace` when closing the app modal so scroll restores without `useSearchParams` here. */
export const DASHBOARD_RESTORE_SCROLL_EVENT = "maple-dashboard-restore-scroll";

function storageKey(pathname: string) {
  return `${STORAGE_PREFIX}${pathname}`;
}

export function DashboardScrollRegion({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const key = storageKey(pathname);

  const restore = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raw = sessionStorage.getItem(key);
    if (raw == null) return;
    const y = Number.parseInt(raw, 10);
    if (!Number.isFinite(y) || y < 0) return;
    requestAnimationFrame(() => {
      const target = scrollRef.current;
      if (target) target.scrollTop = y;
    });
  }, [key]);

  // Same category page: restore after refresh, and when pathname (category) changes.
  useLayoutEffect(() => {
    restore();
  }, [pathname, restore]);

  // Restore after closing the app modal (`?app=` removed) without depending on useSearchParams.
  useEffect(() => {
    const onRestore = () => restore();
    window.addEventListener(DASHBOARD_RESTORE_SCROLL_EVENT, onRestore);
    return () =>
      window.removeEventListener(DASHBOARD_RESTORE_SCROLL_EVENT, onRestore);
  }, [restore]);

  // bfcache (e.g. mobile back): restore when page is restored from cache
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) restore();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [restore]);

  // Persist scroll on the scrollable dashboard shell (debounced).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        sessionStorage.setItem(key, String(el.scrollTop));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  return (
    <div
      ref={scrollRef}
      id="dashboard-scroll-root"
      className="flex min-h-[100dvh] flex-1 flex-col overflow-auto"
    >
      {children}
    </div>
  );
}
