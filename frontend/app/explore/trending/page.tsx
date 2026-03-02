import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchProfile, fetchPromptById, fetchPrompts, type ApiPrompt } from "@/lib/api";
import type { TrendingDeveloper } from "@/lib/types";
import { formatRelative } from "@/lib/utils";
import { TrendingPageClient } from "@/components/trending-page-client";
import type { Prompt } from "@/lib/types";

export const metadata: Metadata = {
  title: "Trending | Prompt Library",
  description:
    "View all trending prompts and developers on Prompt Library. Discover what the community is building.",
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

const TRENDING_PAGE_SIZE = 20;

export default async function TrendingPage() {
  const poolRes = await fetchPrompts({ sort: "upvotes", limit: 500 });
  const rankingPool = poolRes.success ? poolRes.prompts : [];

  const parentPromptMetaById = new Map<string, { title: string; username: string; authorUid: string | null }>();
  const parentIds = [
    ...new Set(
      rankingPool
        .map((p) => p.parentPromptId)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  await Promise.all(
    parentIds.map(async (parentId) => {
      const result = await fetchPromptById(parentId).catch(() => ({ success: false as const, error: "Failed" }));
      if (result.success && result.prompt) {
        parentPromptMetaById.set(parentId, {
          title: result.prompt.title,
          username: result.prompt.username,
          authorUid: result.prompt.authorUid ?? null,
        });
      }
    })
  );

  const sortedPrompts = [...rankingPool]
    .sort((a, b) => {
      const aScore = (a.stats?.interactions ?? 0) + (a.stats?.upvotes ?? 0);
      const bScore = (b.stats?.interactions ?? 0) + (b.stats?.upvotes ?? 0);
      return bScore - aScore;
    })
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
  const sortedDevelopers = [...devMap.values()]
    .sort((a, b) => {
      const aScore = a.totalUpvotes + a.totalForks + (a.totalActivity ?? 0);
      const bScore = b.totalUpvotes + b.totalForks + (b.totalActivity ?? 0);
      return bScore - aScore;
    });

  const developersWithProfile = await Promise.all(
    sortedDevelopers.map(async (dev) => {
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

  return (
    <div className="min-h-0 flex-1">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold">Trending</h1>
        <p className="mb-6 text-muted-foreground">Trending prompts and developers on Prompt Library. Discover what the community is building.</p>
        <Suspense fallback={<div className="animate-pulse rounded-lg bg-muted p-8" />}>
          <TrendingPageClient
          developers={developersWithProfile}
          prompts={sortedPrompts}
          pageSize={TRENDING_PAGE_SIZE}
        />
        </Suspense>
      </div>
    </div>
  );
}
