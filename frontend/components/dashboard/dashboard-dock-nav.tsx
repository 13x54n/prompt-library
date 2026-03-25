"use client";

import type { ComponentType, HTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DASHBOARD_CREATE_HREF,
  DASHBOARD_HOME_HREF,
} from "@/components/dashboard/dashboard-constants";
import { DEFAULT_CATEGORY_ID } from "@/components/dashboard/dapp-marketplace-category-data";
import { cn } from "@/lib/utils";
import { CompassIcon } from "../ui/compass";
import { HomeIcon } from "../ui/home";
import { PickaxeIcon } from "../ui/pickaxe";

type DockIcon = ComponentType<
  HTMLAttributes<HTMLDivElement> & { size?: number }
>;

const EXPLORE_HREF = `/dashboard/${DEFAULT_CATEGORY_ID}`;

function DockItem({
  href,
  icon: Icon,
  active,
}: {
  href: string;
  icon: DockIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-[0.5rem] px-2.5 py-1.5 outline-none transition-[transform,background-color,box-shadow] sm:px-3",
        "focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        active
          ? "bg-white/20 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:bg-white/15"
          : "text-foreground/75 hover:bg-white/12 hover:text-foreground active:scale-[0.97] dark:hover:bg-white/10",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className="shrink-0 text-foreground"
        size={active ? 22 : 20}
        aria-hidden
      />
    </Link>
  );
}

/**
 * Floating bottom tab bar (macOS dock–style) with glass blur.
 * Home = app directory; Explore = category marketplace; Create = builder entry.
 */
export function DashboardDockNav() {
  const pathname = usePathname();
  const homeActive =
    pathname === DASHBOARD_HOME_HREF || pathname === "/dashboard";
  const createActive =
    pathname === DASHBOARD_CREATE_HREF ||
    pathname.startsWith(`${DASHBOARD_CREATE_HREF}/`);
  const exploreActive =
    pathname.startsWith("/dashboard/") &&
    !pathname.startsWith(`${DASHBOARD_HOME_HREF}/`) &&
    pathname !== DASHBOARD_HOME_HREF &&
    !createActive;

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="App"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-end gap-0.5 rounded-[1rem] bg-white/18 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl backdrop-saturate-150",
          "dark:border-white/12 dark:bg-[rgba(28,28,30,0.55)]",
        )}
      >
        <img src="/logo.png" alt="Logo" width={30} height={30} className="w-8 h-8 mr-1" />
        <DockItem
          href={DASHBOARD_HOME_HREF}
          icon={HomeIcon}
          active={homeActive}
        />
        <DockItem
          href={EXPLORE_HREF}
          icon={CompassIcon}
          active={exploreActive}
        />
        <DockItem
          href={DASHBOARD_CREATE_HREF}
          icon={PickaxeIcon}
          active={createActive}
        />
      </div>
    </nav>
  );
}
