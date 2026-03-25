"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpenIcon,
  Brain,
  CircleDollarSign,
  CompassIcon,
  Gamepad2,
  ImageIcon,
  LayoutGridIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  Server,
  SparklesIcon,
  TrendingUpIcon,
  Users,
  WalletIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

import { HoverExpand } from "@/components/unlumen-ui/hover-expand";

const items = [
  {
    label: "Kyoto",
    sublabel: "Get",

    image: "https://images.unsplash.com/photo-1773546057870-ba1b62601d1e?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Kyoto",
    sublabel: "Get",

    image: "https://images.unsplash.com/photo-1774028156717-6b9f92babd2d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Kyoto",
    sublabel: "Get",

    image: "https://images.unsplash.com/photo-1773929651401-04db346329dd?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

function GlassPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

function WidgetHeader({
  icon: Icon,
  title,
  badge,
  action,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2  px-4">
      <div className="flex min-w-0 items-center gap-2">

        <h2 className="font-semibold tracking-tight">📦 {title}</h2>
        {badge ? (
          <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        {action}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
          aria-label="More"
        >
          <MoreHorizontalIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

const PLACEHOLDER_RECENTS = [
  { title: "Swap SOL → USDC", sub: "Jupiter · mainnet", dot: "bg-sky-400" },
  { title: "List NFT #2044", sub: "Tensor · listing", dot: "bg-violet-400" },
  { title: "Stake SOL", sub: "Marinade · stake", dot: "bg-emerald-400" },
] as const;

const PLACEHOLDER_NEWS = [
  {
    title: "New: agent skills for Drift",
    time: "Today",
    snippet: "Execute perp intents with clearer risk labels…",
  },
  {
    title: "Maple lightpaper v0.2",
    time: "This week",
    snippet: "How natural language maps to Solana transactions…",
  },
] as const;

const LAUNCHER_APPS: { label: string; icon: LucideIcon }[] = [
  { label: "DeFi", icon: CircleDollarSign },
  { label: "NFTs", icon: ImageIcon },
  { label: "Games", icon: Gamepad2 },
  { label: "Infra", icon: Server },
  { label: "Social", icon: Users },
  { label: "DAO", icon: Brain },
];

const DISCOVER_TOP = [
  {
    name: "Jupiter",
    tag: "DEX · Aggregator",
    action: "Open",
    icon: "bg-gradient-to-br from-cyan-400/80 to-blue-600/80",
  },
  {
    name: "Tensor",
    tag: "NFT Marketplace",
    action: "Open",
    icon: "bg-gradient-to-br from-violet-400/80 to-fuchsia-700/80",
  },
  {
    name: "Phantom",
    tag: "Wallet",
    action: "Open",
    icon: "bg-gradient-to-br from-purple-400/80 to-indigo-700/80",
  },
] as const;

const FEATURED = [
  {
    tag: "SPOTLIGHT",
    title: "Agentic swaps, one sentence",
    desc: "Describe the trade; Maple proposes routes and safety checks before you sign.",
    gradient: "from-[#1a3a52]/90 via-[#0f2840]/80 to-[#0a1628]/90",
  },
  {
    tag: "NEW",
    title: "dApp intents on Solana",
    desc: "Chain natural language to wallet-standard adapters and MWA on mobile.",
    gradient: "from-[#2d1f4e]/90 via-[#1a1240]/80 to-[#0a1628]/90",
  },
  {
    tag: "BUILD",
    title: "Marketplace for prompts",
    desc: "Publish, discover, and monetize reusable agent skills for protocols.",
    gradient: "from-[#1a4d3a]/90 via-[#0f3528]/80 to-[#0a1628]/90",
  },
] as const;

const FAVORITES = [
  { name: "Marinade", cat: "Liquid staking", action: "Open" },
  { name: "Drift", cat: "Perps", action: "Open" },
  { name: "Meteora", cat: "Liquidity", action: "Open" },
] as const;

function shortAddr(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

export function DappMarketplaceDashboard({ address }: { address: string }) {
  const initials = address.slice(0, 2).toUpperCase();

  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(59,130,246,0.12),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(139,92,246,0.08),transparent_45%),linear-gradient(to_bottom,#0a0c12,var(--background))]"
        aria-hidden
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 pb-12">


        <section className="space-y-4">

          <div className="grid gap-4 md:grid-cols-3">
            <HoverExpand items={items} />

            <div>
              <WidgetHeader icon={LayoutGridIcon} title="Categories" />
              <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-4">
                {LAUNCHER_APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <div
                      key={app.label}
                      className="flex flex-col items-center justify-center border border-white/[0.06] p-1 px-4 pb-2"
                    >
                      <p className="flex items-center gap-2 text-sm">
                        <Icon
                          className="size-[18px] shrink-0 text-current"
                          aria-hidden
                        />
                        {app.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* App Store–style rows */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Top picks for you
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {DISCOVER_TOP.map((app) => (
              <GlassPanel key={app.name} className="overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div
                    className={cn(
                      "size-14 shrink-0 rounded-2xl shadow-inner ring-1 ring-white/10",
                      app.icon,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{app.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {app.tag}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 h-8 rounded-full px-4 text-xs"
                      variant="secondary"
                      asChild
                    >
                      <Link href="/explore">{app.action}</Link>
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>



        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Favourites
            </h2>
            <Link
              href="/explore"
              className="text-primary text-sm font-medium hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {FAVORITES.map((app) => (
              <GlassPanel key={app.name}>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="relative">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/10" />
                    <WalletIcon className="text-muted-foreground absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{app.name}</p>
                    <p className="text-muted-foreground text-xs">{app.cat}</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full" asChild>
                    <Link href="/explore">{app.action}</Link>
                  </Button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
