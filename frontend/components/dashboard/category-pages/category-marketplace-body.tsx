"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { HoverExpand } from "@/components/unlumen-ui/hover-expand";
import { getAppDetail } from "@/components/dashboard/dapp-app-registry";
import {
  CATEGORY_TAB_CONTENT,
  type CategoryId,
} from "@/components/dashboard/dapp-marketplace-category-data";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";

/** Props from `DappMarketplaceDashboard` → per-category page → this body. */
export type CategoryExplorePageProps = {
  searchQuery?: string;
};

function matchesExploreQuery(query: string, ...parts: string[]): boolean {
  const t = query.trim().toLowerCase();
  if (!t) return true;
  return parts.some((p) => p.toLowerCase().includes(t));
}

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
      scroll={false}
      className={cn(
        "inline-flex min-h-[44px] min-w-[4.75rem] shrink-0 items-center justify-center rounded-full px-4 transition-colors active:opacity-90 sm:min-h-8",
        dashboardTypography.cta,
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
}: {
  title: string;
  headingId?: string;
}) {
  return (
    <div className="mb-2 px-0.5">
      <h2 id={headingId} className={dashboardTypography.sectionTitle}>
        {title}
      </h2>
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
      scroll={false}
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
        <p className={dashboardTypography.featuredHeadline}>{label}</p>
        {subtitle ? (
          <p className={dashboardTypography.featuredSub}>
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
        scroll={false}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-[#64B5FF]/50"
      >
        <img src={logo} alt="" className="size-[56px] shrink-0 rounded-[1.05rem] shadow-md ring-1 ring-white/10 sm:size-[60px] sm:rounded-[1.15rem]" />
        <div className="min-w-0 flex-1 text-left">
          <p className={dashboardTypography.listPrimary}>{name}</p>
          <p className={dashboardTypography.listMeta}>{tag}</p>
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
  logo,
}: {
  name: string;
  cat: string;
  categoryId: CategoryId;
  slug: string;
  logo: string;
}) {
  return (
    <div className="flex min-h-[4.75rem] items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 pr-3 backdrop-blur-sm active:bg-white/[0.06] sm:min-h-[4.5rem] sm:gap-3 sm:pr-3.5">
      <Link
        href={dashboardAppHref(categoryId, slug)}
        scroll={false}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-[#64B5FF]/50"
      >
        <img src={logo} alt="" className="size-[56px] shrink-0 rounded-[1.05rem] shadow-md ring-1 ring-white/10 sm:size-[60px] sm:rounded-[1.15rem]" />
        <div className="min-w-0 flex-1 text-left">
          <p className={dashboardTypography.listPrimary}>{name}</p>
          <p className={dashboardTypography.listMeta}>{cat}</p>
        </div>
      </Link>
      <GetLink categoryId={categoryId} slug={slug} />
    </div>
  );
}

/**
 * Shared marketplace sections for a category — composed by per-category page components.
 */
export function CategoryMarketplaceBody({
  categoryId,
  searchQuery = "",
}: {
  categoryId: CategoryId;
  searchQuery?: string;
}) {
  const tab = CATEGORY_TAB_CONTENT[categoryId];
  const q = searchQuery;

  const discoverTop = tab.discoverTop.filter((row) =>
    matchesExploreQuery(q, row.name, row.tag),
  );
  const editorialItems = tab.editorialItems.filter((row) =>
    matchesExploreQuery(q, row.label, row.sublabel, row.description),
  );
  const featuredNew = tab.featuredNew.filter((row) =>
    matchesExploreQuery(q, row.label, row.sublabel, row.description),
  );
  const favorites = tab.favorites.filter((row) =>
    matchesExploreQuery(q, row.name, row.cat),
  );

  const hasQuery = q.trim().length > 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section aria-labelledby="section-top-picks">
        <SectionHeader title="Top picks for you" headingId="section-top-picks" />
        {discoverTop.length === 0 && hasQuery ? (
          <p className={dashboardTypography.empty}>
            No apps match “{q.trim()}”.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {discoverTop.map((app, i) => (
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
        )}
      </section>

      {editorialItems.length > 0 ? (
        <section className="hidden space-y-2 sm:block">
          <HoverExpand
            items={editorialItems.map((item) => ({
              label: item.label,
              sublabel: item.sublabel,
              image: item.image,
              logo: item.logo,
              description: item.description,
              ctaHref: dashboardAppHref(categoryId, item.slug),
            }))}
            className="overflow-hidden rounded-3xl ring-1 ring-white/10"
            ctaClassName={cn(
              "inline-flex h-8 min-w-[4.5rem] shrink-0 items-center justify-center rounded-full px-4 transition-colors",
              dashboardTypography.cta,
              STORE_BLUE_BG,
              STORE_BLUE,
            )}
          />
        </section>
      ) : null}

      {featuredNew.length > 0 ? (
        <section>
          <SectionHeader title="New on Maple" />
          {/* Mobile: horizontal story cards like App Store; md+: grid */}
          <div
            className={cn(
              "scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden px-4 pb-1 pt-0.5",
              "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid-cols-3",
            )}
          >
            {featuredNew.map((item) => (
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
      ) : null}

      {favorites.length > 0 ? (
        <section>
          <SectionHeader title="Favourites" />
          <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((app) => {
              const logo = getAppDetail(app.slug)?.logo ?? "";
              return (
                <FavouriteRow
                  key={`${categoryId}-${app.name}`}
                  categoryId={categoryId}
                  slug={app.slug}
                  name={app.name}
                  cat={app.cat}
                  logo={logo}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <footer className="border-t border-white/10 pt-4 sm:pt-6">
        <p className={dashboardTypography.footnote}>
          The Maple dApp directory is curated for inspiration. Always verify
          contracts and links before signing.
        </p>
      </footer>
    </div>
  );
}
