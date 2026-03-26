"use client";

import type { ComponentType, HTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import {
  DASHBOARD_CREATE_HREF,
  DASHBOARD_EXPLORE_HREF,
  DASHBOARD_HOME_HREF,
} from "@/components/dashboard/dashboard-constants";
import { DashboardWalletMenu } from "@/components/dashboard/dapp-marketplace-dashboard";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapleWalletMultiButton } from "@/components/wallet/maple-wallet-multi-button";
import { CompassIcon } from "../ui/compass";
import { HomeIcon } from "../ui/home";
import { PickaxeIcon } from "../ui/pickaxe";

type DockIcon = ComponentType<
  HTMLAttributes<HTMLDivElement> & { size?: number }
>;

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

const dockLogoTriggerClass = cn(
  "mr-1 flex shrink-0 rounded-xl p-0.5 outline-none transition-opacity",
  "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
);

function DockLogoMenu() {
  const { connected, publicKey } = useWallet();
  const address = publicKey?.toBase58() ?? "";

  const logoTrigger = (
    <button
      type="button"
      className={dockLogoTriggerClass}
      aria-label="Maple menu"
    >
      <img src="/logo.png" alt="" width={30} height={30} className="h-8 w-8" />
    </button>
  );

  if (connected && publicKey) {
    return (
      <DashboardWalletMenu
        address={address}
        contentAlign="start"
        contentSide="top"
        trigger={logoTrigger}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{logoTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={10}
        className="w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-white/10 bg-background p-2 shadow-lg ring-1 ring-white/10"
      >
        <MapleWalletMultiButton className="h-[44px] w-full rounded-lg border border-neutral-800 bg-black px-4 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Floating bottom tab bar (macOS dock–style) with glass blur.
 * Home = app directory; Explore = category marketplace; Create = builder entry.
 */
export function DashboardDockNav() {
  const pathname = usePathname();
  const { connected } = useWallet();
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
        <DockLogoMenu />
        {connected ? (
          <DockItem
            href={DASHBOARD_HOME_HREF}
            icon={HomeIcon}
            active={homeActive}
          />
        ) : null}
        <DockItem
          href={DASHBOARD_EXPLORE_HREF}
          icon={CompassIcon}
          active={exploreActive}
        />
        {connected ? (
          <DockItem
            href={DASHBOARD_CREATE_HREF}
            icon={PickaxeIcon}
            active={createActive}
          />
        ) : null}
      </div>
    </nav>
  );
}
