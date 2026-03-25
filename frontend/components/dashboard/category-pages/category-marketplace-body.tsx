"use client";

import { WalletIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { HoverExpand } from "@/components/unlumen-ui/hover-expand";
import {
  CATEGORY_TAB_CONTENT,
  type CategoryId,
} from "@/components/dashboard/dapp-marketplace-category-data";

/** iOS App Store–style accent (readable on dark UI) */
const STORE_BLUE = "text-[#64B5FF]";
const STORE_BLUE_BG = "bg-[#0A84FF]/18 hover:bg-[#0A84FF]/28";

/** Opens app detail modal via `?app=` on the category dashboard. */
function dashboardAppHref(categoryId: CategoryId, slug: string) {
  return `/dashboard/${categoryId}?app=${encodeURIComponent(slug)}`;
}

function GetLink({
  categoryId,
  slug,
}: {
  categoryId: CategoryId;
  slug: string;
}) {
  return (
    <Link
      href={dashboardAppHref(categoryId, slug)}
      className={cn(
        "inline-flex min-h-[44px] min-w-[4.75rem] shrink-0 items-center justify-center rounded-full px-4 text-xs font-bold transition-colors active:opacity-90 sm:min-h-8",
        STORE_BLUE_BG,
        STORE_BLUE,
      )}
    >
      GET
    </Link>
  );
}

function SectionHeader({
  title,
  headingId,
  seeAllHref,
}: {
  title: string;
  headingId?: string;
  seeAllHref?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
      <h2
        id={headingId}
        className="text-xl font-bold leading-tight tracking-tight sm:text-[1.375rem] sm:leading-none"
      >
        {title}
      </h2>
      <Link
        href={seeAllHref ?? "#"}
        className={cn(
          "min-h-[44px] shrink-0 px-1 py-2 text-sm font-semibold leading-none sm:min-h-0 sm:p-0",
          STORE_BLUE,
        )}
      >
        See All
      </Link>
    </div>
  );
}

function FeaturedStoryCard({
  label,
  logo,
  image,
  subtitle,
  href,
}: {
  label: string;
  logo: string;
  image: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative aspect-[3/4] w-[min(85vw,18rem)] max-w-sm shrink-0 snap-center overflow-hidden rounded-[1.35rem] bg-card ring-1 ring-white/10 transition-transform active:scale-[0.99] sm:aspect-[3/4] sm:w-full sm:max-w-none sm:snap-none sm:rounded-3xl sm:hover:scale-[1.01]"
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 pt-12">
        <div className="mb-3 size-[52px] overflow-hidden rounded-[0.85rem] shadow-lg ring-2 ring-white/25">
          <img
            src={logo}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="text-lg font-bold leading-tight text-white">{label}</p>
        {subtitle ? (
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/75">
            {subtitle}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function AppListRow({
  name,
  tag,
  logo,
  categoryId,
  slug,
}: {
  name: string;
  tag: string;
  logo: string;
  categoryId: CategoryId;
  slug: string;
}) {
  return (
    <div className="flex min-h-[4.75rem] items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 pr-3 backdrop-blur-sm active:bg-white/[0.06] sm:min-h-[4.5rem] sm:gap-3 sm:pr-3.5">
      <Link
        href={dashboardAppHref(categoryId, slug)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-[#64B5FF]/50"
      >
        <img src={logo} alt="" className="size-[56px] shrink-0 rounded-[1.05rem] shadow-md ring-1 ring-white/10 sm:size-[60px] sm:rounded-[1.15rem]" />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[15px] font-semibold leading-tight">
            {name}
          </p>
          <p className="text-muted-foreground mt-0.5 truncate text-[13px] sm:text-xs">{tag}</p>
        </div>
      </Link>
      <GetLink categoryId={categoryId} slug={slug} />
    </div>
  );
}

function FavouriteRow({
  name,
  cat,
  categoryId,
  slug,
}: {
  name: string;
  cat: string;
  categoryId: CategoryId;
  slug: string;
}) {
  return (
    <div className="flex min-h-[4.75rem] items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 pr-3 backdrop-blur-sm active:bg-white/[0.06] sm:min-h-[4.5rem] sm:gap-3 sm:pr-3.5">
      <Link
        href={dashboardAppHref(categoryId, slug)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-[#64B5FF]/50"
      >
        <div className="relative shrink-0">
          <div className="size-[56px] rounded-[1.05rem] bg-gradient-to-br from-white/18 to-white/6 ring-1 ring-white/12" />
          <WalletIcon className="text-muted-foreground absolute left-1/2 top-1/2 size-[22px] -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[15px] font-semibold leading-tight">
            {name}
          </p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{cat}</p>
        </div>
      </Link>
      <GetLink categoryId={categoryId} slug={slug} />
    </div>
  );
}

/**
 * Shared marketplace sections for a category — composed by per-category page components.
 */
export function CategoryMarketplaceBody({ categoryId }: { categoryId: CategoryId }) {
  const tab = CATEGORY_TAB_CONTENT[categoryId];

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <section aria-labelledby="section-top-picks">
        <SectionHeader
          title="Top picks for you"
          headingId="section-top-picks"
          seeAllHref={`/dashboard/${categoryId}`}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tab.discoverTop.map((app, i) => (
            <AppListRow
              key={`${categoryId}-discover-${i}`}
              categoryId={categoryId}
              name={app.name}
              slug={app.slug}
              tag={app.tag}
              logo={app.logo}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <HoverExpand
          items={tab.editorialItems.map((item) => ({
            label: item.label,
            sublabel: item.sublabel,
            image: item.image,
            logo: item.logo,
            description: item.description,
            ctaHref: dashboardAppHref(categoryId, item.slug),
          }))}
          className="overflow-hidden rounded-3xl ring-1 ring-white/10"
          ctaClassName={cn(
            "inline-flex h-8 min-w-[4.5rem] shrink-0 items-center justify-center rounded-full px-4 text-xs font-bold transition-colors",
            STORE_BLUE_BG,
            STORE_BLUE,
          )}
        />
      </section>

      <section>
        <SectionHeader
          title="New on Maple"
          seeAllHref={`/dashboard/${categoryId}`}
        />
        {/* Mobile: horizontal story cards like App Store; md+: grid */}
        <div
          className={cn(
            "scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-4 pb-1 pt-0.5",
            "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid-cols-3",
          )}
        >
          {tab.featuredNew.map((item) => (
            <FeaturedStoryCard
              key={`${categoryId}-${item.label}`}
              href={dashboardAppHref(categoryId, item.slug)}
              label={item.label}
              logo={item.logo}
              image={item.image}
              subtitle={item.description}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Favourites"
          seeAllHref={`/dashboard/${categoryId}`}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tab.favorites.map((app) => (
            <FavouriteRow
              key={`${categoryId}-${app.name}`}
              categoryId={categoryId}
              slug={app.slug}
              name={app.name}
              cat={app.cat}
            />
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 pt-6 sm:pt-8">
        <p className="text-muted-foreground text-center text-[11px] leading-relaxed sm:text-xs">
          The Maple dApp directory is curated for inspiration. Always verify
          contracts and links before signing.
        </p>
      </footer>
    </div>
  );
}
