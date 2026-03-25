"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  smoothDrawerItemVariants,
  smoothDrawerVariants,
} from "@/components/kokonutui/smooth-drawer";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { AppDetail } from "@/components/dashboard/dapp-app-registry";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";

const STORE_BLUE = "text-[#64B5FF]";
const STORE_BLUE_BG = "bg-[#0A84FF]/18 hover:bg-[#0A84FF]/28";

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

function AppDetailScrollBody({ app }: { app: AppDetail }) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-6 pt-3 sm:gap-6 sm:px-5 sm:pb-8">
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
          <span className="rounded-full bg-white/[0.06] px-3 py-1 ring-1 ring-white/10 text-xs font-medium">
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

export function DappAppDetailModal({
  open,
  onOpenChange,
  app,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: AppDetail | null;
}) {
  if (!app) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "mx-auto flex max-h-[min(92dvh,860px)] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-t-3xl border-t p-0",
          "bg-background",
        )}
      >
        <DrawerTitle className="sr-only">{app.name} — app details</DrawerTitle>
        <motion.div
          key={app.slug}
          animate="visible"
          className="flex min-h-0 flex-1 flex-col"
          initial="hidden"
          variants={smoothDrawerVariants}
        >
          <motion.div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            variants={smoothDrawerItemVariants}
          >
            <AppDetailScrollBody app={app} />
          </motion.div>
          <motion.div
            className="shrink-0 border-t border-white/10 bg-background/95 px-4 py-3 backdrop-blur-md sm:py-4"
            variants={smoothDrawerItemVariants}
          >
            <DrawerClose asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-center rounded-full py-3 transition-colors",
                  dashboardTypography.cta,
                  STORE_BLUE_BG,
                  STORE_BLUE,
                )}
              >
                Done
              </button>
            </DrawerClose>
          </motion.div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
