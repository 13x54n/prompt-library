"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppDetail } from "@/components/dashboard/dapp-app-registry";

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
              <p className="text-base font-bold leading-tight text-white sm:text-lg">
                {app.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/80 sm:text-sm">
                {app.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums leading-none">
            {app.ratingAverage.toFixed(1)}
          </span>
          <div className="flex flex-col gap-0.5">
            <StarRating value={app.ratingAverage} />
            <span className="text-muted-foreground text-xs">
              {app.ratingCount.toLocaleString()} ratings
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium ring-1 ring-white/10">
            {app.categoryLabel}
          </span>
          <span className="text-muted-foreground text-xs">{app.developer}</span>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold tracking-tight sm:text-lg">About</h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          {app.description}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight sm:text-lg">
            Ratings & reviews
          </h2>
          <span className="text-muted-foreground text-xs">
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
                  <span className="truncate text-sm font-semibold">{review.title}</span>
                </div>
                <span className="text-muted-foreground text-xs">{review.date}</span>
              </div>
              <p className="text-muted-foreground mb-1.5 text-xs">@{review.user}</p>
              <p className="text-[14px] leading-relaxed sm:text-[15px]">{review.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,860px)] w-[min(calc(100vw-1.5rem),36rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:w-full"
      >
        <DialogTitle className="sr-only">{app.name} — app details</DialogTitle>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AppDetailScrollBody app={app} />
        </div>
        <div className="shrink-0 border-t border-white/10 bg-background/95 px-4 py-3 backdrop-blur-md sm:py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              "flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition-colors",
              STORE_BLUE_BG,
              STORE_BLUE,
            )}
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
