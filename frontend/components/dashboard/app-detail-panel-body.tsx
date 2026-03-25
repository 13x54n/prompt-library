"use client";

import { Star } from "lucide-react";

import type { AppDetail } from "@/components/dashboard/dapp-app-registry";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { cn } from "@/lib/utils";

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

/** Shared scrollable storefront content for app detail dialog or home drawer stack. */
export function AppDetailPanelBody({
  app,
  className,
}: {
  app: AppDetail;
  /** Merged onto the root; use for sheet handle spacing, etc. */
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 px-4 pb-4 pt-4 sm:gap-6 sm:px-5 sm:pb-5 sm:pt-5",
        className,
      )}
    >
      <section className="overflow-hidden rounded-2xl ring-1 ring-white/10 sm:rounded-3xl">
        <div className="relative aspect-[21/9] min-h-[120px] w-full sm:aspect-[2.4/1]">
          <img
            src={app.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-3 sm:gap-4 sm:p-5">
            <img
              src={app.logo}
              alt=""
              className="size-[3.75rem] shrink-0 rounded-[1rem] shadow-lg ring-2 ring-white/25 sm:size-[4.25rem]"
              loading="eager"
              decoding="async"
            />
            <div className="min-w-0 flex-1 pb-0.5">
              <p className={dashboardTypography.modalHeroTitle}>{app.name}</p>
              <p className={dashboardTypography.modalHeroTagline}>
                {app.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 pb-4">
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
          <span className={dashboardTypography.status}>{app.developer}</span>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className={dashboardTypography.drawerSection}>About</h2>
        <p className={dashboardTypography.bodyMuted}>{app.description}</p>
      </section>

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
                <span className={dashboardTypography.status}>{review.date}</span>
              </div>
              <p className={cn("mb-1.5", dashboardTypography.status)}>
                @{review.user}
              </p>
              <p className={dashboardTypography.reviewBody}>{review.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className={dashboardTypography.footnote}>
        Maple listings are for discovery. Always verify programs and URLs before signing.
      </p>
    </div>
  );
}
