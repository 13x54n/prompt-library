import type { AppDetail } from "@/components/dashboard/dapp-app-registry";

/** Illustrative on-chain–style metrics for the Explore app detail (no live chain connection). */
export type SnapshotPeriod = "24h" | "7d" | "30d";

export type HistoryPeriod = "7d" | "30d" | "90d" | "1y" | "All";

export type DemoMetric = {
  id: string;
  label: string;
  value: string;
  /** Percent change vs prior window (signed). */
  changePct: number;
};

function seed(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(seedVal: number, min: number, max: number): number {
  const x = (Math.sin(seedVal) * 10000) % 1;
  return min + Math.floor(x * (max - min + 1));
}

function formatCompact(n: number, prefix = ""): string {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(2)}k`;
  return `${prefix}${n.toFixed(2)}`;
}

function metricsForPeriod(
  base: number,
  period: SnapshotPeriod,
): DemoMetric[] {
  const m = period === "24h" ? 0.35 : period === "7d" ? 1 : 2.2;
  const uaw = Math.max(120, Math.round((base % 4000) * m + 800));
  const txs = Math.round(uaw * (1.05 + ((base % 23) / 100)));
  const vol = (base % 90000) * m * 0.5 + 12_000;
  const bal = (base % 400000) * 0.6 + 50_000;

  const c1 = pick(base, -40, 120) / 10;
  const c2 = pick(base + 1, -35, 110) / 10;
  const c3 = pick(base + 2, -45, 40) / 10;
  const c4 = pick(base + 3, -5, 25) / 10;

  return [
    {
      id: "uaw",
      label: "UAW (Unique Active Wallets)",
      value: formatCompact(uaw),
      changePct: c1,
    },
    {
      id: "txs",
      label: "Incoming Txs",
      value: formatCompact(txs),
      changePct: c2,
    },
    {
      id: "vol",
      label: "Incoming Volume",
      value: formatCompact(vol, "$"),
      changePct: c3,
    },
    {
      id: "bal",
      label: "Contracts Balance",
      value: formatCompact(bal, "$"),
      changePct: c4,
    },
  ];
}

export type ExploreDemoAnalytics = {
  rankLabel: string;
  snapshotByPeriod: Record<SnapshotPeriod, DemoMetric[]>;
  historyNote: string;
};

/** Screenshots / marketing stills for the explore detail carousel (hero + stock shots). */
const CAROUSEL_STILLS = [
  "https://images.unsplash.com/photo-1773546057870-ba1b62601d1e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1774028156717-6b9f92babd2d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1773929651401-04db346329dd?q=80&w=1035&auto=format&fit=crop",
] as const;

export function getExploreCarouselImages(app: AppDetail): string[] {
  const s = seed(app.slug);
  const out: string[] = [app.heroImage];
  for (let k = 0; k < CAROUSEL_STILLS.length; k++) {
    const url = CAROUSEL_STILLS[(s + k) % CAROUSEL_STILLS.length];
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

export function getExploreDemoAnalytics(app: AppDetail): ExploreDemoAnalytics {
  const s = seed(app.slug);
  const rank = (s % 12) + 1;
  const rankLabel = `#${rank} in ${app.categoryLabel}`;

  const base = s % 50_000 + 8_000;
  return {
    rankLabel,
    snapshotByPeriod: {
      "24h": metricsForPeriod(base, "24h"),
      "7d": metricsForPeriod(base + 10000, "7d"),
      "30d": metricsForPeriod(base + 20000, "30d"),
    },
    historyNote:
      "Activity aggregates are illustrative for Maple discovery — not live on-chain data.",
  };
}
