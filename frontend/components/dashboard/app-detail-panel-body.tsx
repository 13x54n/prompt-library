"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Info,
  Newspaper,
  Star,
} from "lucide-react";

import {
  getExploreCarouselImages,
  getExploreDemoAnalytics,
  type HistoryPeriod,
  type SnapshotPeriod,
} from "@/components/dashboard/app-detail-demo-analytics";
import type { AppDetail } from "@/components/dashboard/dapp-app-registry";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { cn } from "@/lib/utils";

/** Wide illustrative banner — file lives in `frontend/public/`. */
const EXPLORE_OVERVIEW_BANNER = "/dashboard-explore-banner.png";

function StarRating({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const starClass = size === "sm" ? "size-3.5" : "size-4";
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && i < Math.ceil(value) && value % 1 >= 0.35;
        return (
          <Star
            key={i}
            className={cn(
              starClass,
              "shrink-0",
              filled || half
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-white/25",
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
        active
          ? "bg-[#0A84FF]/22 text-[#64B5FF] ring-1 ring-[#64B5FF]/35"
          : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PeriodToggle<T extends string>({
  value,
  onChange,
  options,
  endSlot,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  endSlot?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1 rounded-lg bg-white/[0.06] p-0.5 ring-1 ring-white/10">
        {options.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
              value === p
                ? "bg-white/18 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/90",
            )}
          >
            {p}
            {p === "All" ? (
              <span className="ml-1 align-middle text-[9px] font-bold uppercase text-violet-400">
                Pro
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {endSlot}
    </div>
  );
}

function OverviewImageCarousel({
  images,
  appName,
}: {
  images: string[];
  appName: string;
}) {
  const [idx, setIdx] = useState(0);
  const n = images.length;
  const step = (d: number) => setIdx((i) => (i + d + n) % n);

  if (images.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl ring-1 ring-white/10 sm:rounded-[1.25rem]"
      aria-roledescription="carousel"
      aria-label={`${appName} screenshots`}
    >
      <div className="relative aspect-[16/9] w-full min-h-[9rem] max-h-[15rem] bg-black/40 sm:min-h-[10.5rem] sm:max-h-[17rem]">
        {images.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-300",
              i === idx ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            width={1200}
            height={675}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/55"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/55"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" strokeWidth={2} aria-hidden />
            </button>
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    i === idx ? "bg-white" : "bg-white/40 hover:bg-white/60",
                  )}
                  aria-label={`Image ${i + 1} of ${n}`}
                  aria-current={i === idx ? "true" : undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  changePct,
}: {
  label: string;
  value: string;
  changePct: number;
}) {
  const up = changePct >= 0;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 ring-1 ring-white/[0.04] sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-[11px] font-medium leading-snug sm:text-xs">
          {label}
        </span>
        <Info
          className="size-3.5 shrink-0 text-muted-foreground/70"
          aria-hidden
        />
      </div>
      <p className="mt-2.5 text-lg font-semibold tabular-nums leading-none tracking-tight sm:text-xl">
        {value}
      </p>
      <p
        className={cn(
          "mt-1.5 text-xs font-semibold tabular-nums",
          up ? "text-emerald-400" : "text-red-400",
        )}
      >
        {up ? "+" : ""}
        {changePct.toFixed(2)}%
      </p>
    </div>
  );
}

type DetailTab = "overview" | "news" | "analytics" | "about";

/** Explore / storefront app detail: DappRadar-style header, tabs, illustrative on-chain stats. */
export function AppDetailPanelBody({
  app,
  className,
}: {
  app: AppDetail;
  className?: string;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [snapshotPeriod, setSnapshotPeriod] =
    useState<SnapshotPeriod>("24h");
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>("7d");
  const [readMore, setReadMore] = useState(false);

  const analytics = useMemo(() => getExploreDemoAnalytics(app), [app]);
  const carouselImages = useMemo(() => getExploreCarouselImages(app), [app]);

  const descSnippet =
    app.description.length > 220 && !readMore
      ? `${app.description.slice(0, 220).trim()}…`
      : app.description;

  const snapshotMetrics = analytics.snapshotByPeriod[snapshotPeriod];

  return (
    <div
      className={cn(
        "flex flex-col gap-5 px-4 pb-4 pt-4 sm:gap-6 sm:px-5 sm:pb-5 sm:pt-5",
        className,
      )}
    >
      {/* Compact header (explore focus) */}
      <header className="flex gap-3 sm:gap-4">
        <img
          src={app.logo}
          alt=""
          className="size-14 shrink-0 rounded-2xl object-cover shadow-lg ring-1 ring-white/15 sm:size-16"
          width={64}
          height={64}
          loading="eager"
          decoding="async"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1
              className={cn(
                dashboardTypography.pageTitle,
                "min-w-0 flex-1 text-foreground",
              )}
            >
              {app.name}
            </h1>
            <a
              href={app.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#0A84FF] px-3 text-xs font-semibold text-white shadow-sm transition-[filter,transform] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64B5FF]/55 active:scale-[0.98]"
            >
              Install
            </a>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-0.5 text-[11px] font-semibold text-foreground/90">
              <span className="text-[10px]" aria-hidden>
                ◎
              </span>
              Solana
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {analytics.rankLabel}
            </span>
          </div>
          <p className={cn("mt-3", dashboardTypography.bodyMuted)}>
            <span>{descSnippet}</span>
            {app.description.length > 220 ? (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setReadMore((v) => !v)}
                  className="font-semibold text-[#64B5FF] hover:underline"
                >
                  {readMore ? "Show less" : "Read more"}
                </button>
              </>
            ) : null}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <nav
        className="-mx-1 flex flex-wrap gap-1 border-b border-white/10 pb-1"
        aria-label="App sections"
      >
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabButton>
        <TabButton active={tab === "news"} onClick={() => setTab("news")}>
          <span className="inline-flex items-center gap-1.5">
            <Newspaper className="size-3.5 opacity-80" aria-hidden />
            News
          </span>
        </TabButton>
        <TabButton
          active={tab === "analytics"}
          onClick={() => setTab("analytics")}
        >
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="size-3.5 opacity-80" aria-hidden />
            Analytics
          </span>
        </TabButton>
        <TabButton active={tab === "about"} onClick={() => setTab("about")}>
          About
        </TabButton>
      </nav>

      {tab === "overview" ? (
        <div className="relative -mx-4 sm:-mx-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[min(46vh,340px)] rounded-none bg-cover bg-center bg-no-repeat opacity-[0.38] sm:h-[min(42vh,360px)] sm:rounded-[1.25rem]"
            style={{ backgroundImage: `url(${EXPLORE_OVERVIEW_BANNER})` }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[min(46vh,340px)] rounded-none bg-gradient-to-b from-background/15 via-background/80 to-background sm:h-[min(42vh,360px)] sm:rounded-[1.25rem]"
          />
          <div className="relative z-[1] flex flex-col gap-4 px-4 sm:px-5">
          <OverviewImageCarousel
            key={app.slug}
            appName={app.name}
            images={carouselImages}
          />
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f18] ring-1 ring-white/[0.05] sm:rounded-3xl">
            <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
              <h2 className={dashboardTypography.sectionTitle}>
                {app.name} on-chain stats
              </h2>
              <p className="text-muted-foreground mt-1 text-[11px] leading-snug sm:text-xs">
                Illustrative metrics for discovery — verify on-chain before
                transacting.
              </p>
            </div>
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <PeriodToggle<SnapshotPeriod>
                value={snapshotPeriod}
                onChange={setSnapshotPeriod}
                options={["24h", "7d", "30d"]}
                endSlot={
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] sm:text-xs">
                    Showing data for:
                    <span className="text-foreground inline-flex items-center gap-1 font-medium">
                      <span aria-hidden>◎</span> Solana
                    </span>
                  </span>
                }
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {snapshotMetrics.map((m) => (
                  <MetricTile
                    key={m.id}
                    label={m.label}
                    value={m.value}
                    changePct={m.changePct}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] text-muted-foreground sm:text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0" aria-hidden />
                  1 hour ago
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#64B5FF]/90">
                  <Code2 className="size-3.5 shrink-0" aria-hidden />
                  Maple demo data (no API key)
                </span>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f18] ring-1 ring-white/[0.05] sm:rounded-3xl">
            <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
              <h2 className={dashboardTypography.sectionTitle}>
                Historical on-chain activity
              </h2>
            </div>
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <PeriodToggle<HistoryPeriod>
                value={historyPeriod}
                onChange={setHistoryPeriod}
                options={["7d", "30d", "90d", "1y", "All"]}
                endSlot={
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] sm:text-xs">
                    Showing data for:
                    <span className="text-foreground inline-flex items-center gap-1 font-medium">
                      <span aria-hidden>◎</span> Solana
                    </span>
                  </span>
                }
              />
              <div className="flex h-36 items-end gap-1.5 rounded-xl bg-black/25 px-3 py-4 ring-1 ring-white/5 sm:h-44 sm:gap-2 sm:px-4">
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = 20 + ((i * 17 + app.name.length * 3) % 78);
                  return (
                    <div
                      key={i}
                      className="min-w-0 flex-1 rounded-t bg-gradient-to-t from-[#0A84FF]/55 to-[#64B5FF]/30"
                      style={{ height: `${h}%` }}
                      aria-hidden
                    />
                  );
                })}
              </div>
              <p className="text-muted-foreground text-center text-[11px] sm:text-xs">
                Volume-weighted activity preview for {historyPeriod} ({analytics.historyNote})
              </p>
            </div>
          </section>
          </div>
        </div>
      ) : null}

      {tab === "news" ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-12 text-center sm:rounded-3xl sm:py-16">
          <Newspaper className="mx-auto size-10 text-muted-foreground/50" aria-hidden />
          <p className="text-muted-foreground mt-3 text-sm font-medium">
            No news yet
          </p>
          <p className={cn("mx-auto mt-1 max-w-sm", dashboardTypography.status)}>
            Project updates and announcements will show here when available.
          </p>
        </div>
      ) : null}

      {tab === "analytics" ? (
        <div className="space-y-4">
          <p className={dashboardTypography.bodyMuted}>
            Extended analytics use the same illustrative dataset as Overview.
            Wire your indexer or DappRadar-style API here for production.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {snapshotMetrics.map((m) => (
              <MetricTile
                key={`a-${m.id}`}
                label={m.label}
                value={m.value}
                changePct={m.changePct * 0.85}
              />
            ))}
          </div>
        </div>
      ) : null}

      {tab === "about" ? (
        <div className="flex flex-col gap-6">
          <section className="space-y-2">
            <h2 className={dashboardTypography.drawerSection}>Description</h2>
            <p className={dashboardTypography.bodyMuted}>{app.description}</p>
          </section>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-white/10 py-4">
            <div className="flex items-center gap-2">
              <span className={dashboardTypography.ratingScore}>
                {app.ratingAverage.toFixed(1)}
              </span>
              <div className="flex flex-col gap-0.5">
                <StarRating value={app.ratingAverage} />
                <span className={dashboardTypography.status}>
                  {app.ratingCount.toLocaleString()} ratings
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium ring-1 ring-white/10">
                {app.categoryLabel}
              </span>
              <span className={dashboardTypography.status}>
                {app.developer}
              </span>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className={dashboardTypography.drawerSection}>
                Ratings & reviews
              </h2>
              <span className={dashboardTypography.status}>
                {app.reviews.length} reviews
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {app.reviews.map((review, i) => (
                <li
                  key={`${review.user}-${i}`}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-sm sm:p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size="sm" />
                      <span className={dashboardTypography.reviewTitle}>
                        {review.title}
                      </span>
                    </div>
                    <span className={dashboardTypography.status}>
                      {review.date}
                    </span>
                  </div>
                  <p className={cn("mb-1.5", dashboardTypography.status)}>
                    @{review.user}
                  </p>
                  <p className={dashboardTypography.reviewBody}>
                    {review.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      <p className={dashboardTypography.footnote}>
        Maple listings are for discovery. Always verify programs and URLs before
        signing.
      </p>
    </div>
  );
}
