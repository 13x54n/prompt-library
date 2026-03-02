import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Users, Hash } from "lucide-react";
import { TrendingDeveloperCard } from "@/components/trending-developer-card";
import { ExploreFeedClient } from "@/components/explore-feed-client";
import { TagChip } from "@/components/prompt-library";
import { fetchPopularTags, fetchProfile, fetchPromptById, fetchPrompts, type ApiPrompt } from "@/lib/api";
import type { Prompt, TrendingDeveloper } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Explore | Prompt Library" },
  description:
    "Browse trending AI prompts and developers. Discover prompts for Next.js, React, TypeScript, and more. Fork, upvote, and contribute to the community.",
};

type PromptCardData = Pick<
  Prompt,
  | "id"
  | "title"
  | "description"
  | "tags"
  | "stats"
  | "lastUpdated"
  | "username"
  | "authorUid"
  | "parentPromptId"
  | "parentPromptTitle"
  | "parentPromptUsername"
  | "parentPromptAuthorUid"
>;

function toPromptCard(
  api: ApiPrompt,
  parentMeta?: { title: string; username: string; authorUid: string | null } | null
): PromptCardData {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? "",
    tags: api.tags ?? [],
    stats: api.stats ?? { upvotes: 0, forks: 0, views: 0, interactions: 0 },
    lastUpdated: formatRelative(api.lastUpdated),
    username: api.username,
    authorUid: api.authorUid,
    parentPromptId: api.parentPromptId ?? null,
    parentPromptTitle: parentMeta?.title ?? null,
    parentPromptUsername: parentMeta?.username ?? null,
    parentPromptAuthorUid: parentMeta?.authorUid ?? null,
  };
}

const EXPLORE_PAGE_SIZE = 20;
const TRENDING_TOPICS_COUNT = 10;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: tagParam } = await searchParams;
  const filterTag = typeof tagParam === "string" ? tagParam.trim() : undefined;

  const [newestRes, poolRes, tagsRes] = await Promise.all([
    fetchPrompts({
      sort: "createdAt",
      limit: EXPLORE_PAGE_SIZE,
      offset: 0,
      ...(filterTag && { tags: filterTag }),
    }),
    fetchPrompts({ sort: "upvotes", limit: 100 }),
    fetchPopularTags(TRENDING_TOPICS_COUNT),
  ]);

  const rankingPool = poolRes.success ? poolRes.prompts : newestRes.success ? newestRes.prompts : [];

  const parentPromptMetaById = new Map<string, { title: string; username: string; authorUid: string | null }>();
  const allPromptsForEnrichment = [
    ...(newestRes.success ? newestRes.prompts : []),
    ...rankingPool,
  ];
  const parentIds = [
    ...new Set(
      allPromptsForEnrichment
        .map((p) => p.parentPromptId)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const parentResults = await Promise.all(
    parentIds.map(async (parentId) => {
      const result = await fetchPromptById(parentId).catch(() => ({ success: false as const, error: "Failed" }));
      return { parentId, result };
    })
  );
  for (const { parentId, result } of parentResults) {
    if (result.success && result.prompt) {
      parentPromptMetaById.set(parentId, {
        title: result.prompt.title,
        username: result.prompt.username,
        authorUid: result.prompt.authorUid ?? null,
      });
    }
  }

  const newestPrompts: PromptCardData[] = newestRes.success
    ? newestRes.prompts.map((p) => {
        const parentMeta = p.parentPromptId ? parentPromptMetaById.get(p.parentPromptId) : null;
        return toPromptCard(p, parentMeta ?? undefined);
      })
    : [];
  const newestTotal = newestRes.success ? newestRes.total : 0;

  const trendingPrompts = [...rankingPool]
    .sort((a, b) => {
      const aScore = (a.stats?.interactions ?? 0) + (a.stats?.upvotes ?? 0);
      const bScore = (b.stats?.interactions ?? 0) + (b.stats?.upvotes ?? 0);
      return bScore - aScore;
    })
    .slice(0, 4)
    .map((p) => {
      const parentMeta = p.parentPromptId ? parentPromptMetaById.get(p.parentPromptId) : null;
      return toPromptCard(p, parentMeta ?? undefined);
    });

  const devMap = new Map<string, TrendingDeveloper>();
  for (const p of rankingPool) {
    const key = p.authorUid ?? p.username?.toLowerCase();
    if (!key) continue;
    const existing = devMap.get(key) ?? {
      uid: p.authorUid,
      username: p.username,
      promptCount: 0,
      totalUpvotes: 0,
      totalForks: 0,
      totalViews: 0,
      totalActivity: 0,
    };
    existing.promptCount += 1;
    existing.totalUpvotes += p.stats?.upvotes ?? 0;
    existing.totalForks += p.stats?.forks ?? 0;
    existing.totalViews += p.stats?.views ?? 0;
    existing.totalActivity = (existing.totalActivity ?? 0) + (p.stats?.interactions ?? 0);
    devMap.set(key, existing);
  }
  const trendingDevelopers = [...devMap.values()]
    .sort((a, b) => {
      const aScore = a.totalUpvotes + a.totalForks + (a.totalActivity ?? 0);
      const bScore = b.totalUpvotes + b.totalForks + (b.totalActivity ?? 0);
      return bScore - aScore;
    })
    .slice(0, 5);

  const trendingDevelopersWithProfile = await Promise.all(
    trendingDevelopers.map(async (dev) => {
      const profile = await fetchProfile(dev.uid ?? dev.username);
      if (!profile.success) return dev;
      return {
        ...dev,
        uid: profile.user.uid ?? dev.uid,
        username: profile.user.username ?? dev.username,
        displayName: profile.user.displayName ?? dev.displayName,
        avatarUrl: profile.user.photoURL ?? dev.avatarUrl,
        bio: profile.user.bio ?? null,
      };
    })
  );

  const trendingTopics = tagsRes.success ? tagsRes.tags : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:h-full">
      <div className="mx-auto flex min-h-0 max-h-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch lg:gap-8">
          {/* Left: Trending Developers - desktop first column, mobile after prompts */}
          <aside className="order-2 min-w-0 shrink-0 lg:order-1">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
              <Users className="size-5 shrink-0 text-blue-500/90" />
              <span className="truncate">Trending Developers</span>
            </h2>
            <div className="flex flex-col rounded-lg border border-border bg-card">
              {trendingDevelopersWithProfile.map((dev) => (
                <TrendingDeveloperCard key={dev.username} dev={dev} />
              ))}
            </div>
            <Link
              href="/explore/trending?tab=developers"
              className="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              See all
            </Link>

            <h2 className="mb-3 mt-6 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
              <Hash className="size-5 shrink-0 text-emerald-500/90" />
              <span className="truncate">Trending Topics</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  variant="subtle"
                />
              ))}
            </div>
          </aside>

          {/* Middle: Main prompts - only this section scrolls on desktop */}
          <main className="order-1 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden lg:order-2 lg:min-h-0">
            <ExploreFeedClient
              initialPrompts={newestPrompts}
              initialTotal={newestTotal}
              initialTag={filterTag}
            />
          </main>

          {/* Right: Trending Prompts */}
          <aside className="order-3 min-w-0 shrink-0">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
              <TrendingUp className="size-5 shrink-0 text-amber-500/90" />
              <span className="truncate">Trending Prompts</span>
            </h2>
            <div className="flex min-w-0 flex-col gap-3">
              {trendingPrompts.map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50 sm:p-4"
                >
                  <p className="truncate font-medium">{prompt.title}</p>
                  <p className="line-clamp-2 min-w-0 text-sm text-muted-foreground">
                    {prompt.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>@{prompt.username}</span>
                    <span>{prompt.stats.upvotes.toLocaleString()} ↑</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/explore/trending?tab=prompts"
              className="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              See all
            </Link>
          </aside>
        </div>
      </div>
  );
}
