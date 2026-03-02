"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PromptCard } from "@/components/prompt-library";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { fetchMyFollowingUids, fetchPromptById, fetchPrompts, type ApiPrompt } from "@/lib/api";
import { onExploreInvalidate } from "@/lib/explore-sync";
import { formatRelative } from "@/lib/utils";
import type { Prompt } from "@/lib/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

async function enrichPromptsWithParent(apis: ApiPrompt[]): Promise<PromptCardData[]> {
  const parentIds = [...new Set(apis.map((p) => p.parentPromptId).filter((id): id is string => Boolean(id)))];
  const parentMap = new Map<string, { title: string; username: string; authorUid: string | null }>();
  await Promise.all(
    parentIds.map(async (id) => {
      const res = await fetchPromptById(id).catch(() => ({ success: false as const, error: "Failed" }));
      if (res.success && res.prompt) {
        parentMap.set(id, {
          title: res.prompt.title,
          username: res.prompt.username,
          authorUid: res.prompt.authorUid ?? null,
        });
      }
    })
  );
  return apis.map((p) => {
    const parentMeta = p.parentPromptId ? parentMap.get(p.parentPromptId) : null;
    return toPromptCard(p, parentMeta ?? undefined);
  });
}

const PROMPT_POLL_INTERVAL_MS = 20_000;
const PAGE_SIZE = 20;

type ExploreFeedClientProps = {
  initialPrompts: PromptCardData[];
  initialTotal?: number;
  initialTag?: string;
};

export function ExploreFeedClient({ initialPrompts, initialTotal = 0, initialTag }: ExploreFeedClientProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") ?? initialTag ?? undefined;
  const [mode, setMode] = useState<"all" | "following">("all");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [explorePrompts, setExplorePrompts] = useState<PromptCardData[]>(initialPrompts);
  const [total, setTotal] = useState(initialTotal);
  const [followingPrompts, setFollowingPrompts] = useState<PromptCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExplorePrompts(initialPrompts);
    setTotal(initialTotal);
    setPage(1);
  }, [initialPrompts, initialTotal]);

  const refetchAll = useCallback(
    async (pageNum: number, tagFilter: string | undefined, cancelled: { current: boolean }) => {
      const res = await fetchPrompts({
        sort: "createdAt",
        limit: PAGE_SIZE,
        offset: (pageNum - 1) * PAGE_SIZE,
        ...(tagFilter && { tags: tagFilter }),
      });
      if (cancelled.current) return;
      if (res.success) {
        const enriched = await enrichPromptsWithParent(res.prompts);
        if (cancelled.current) return;
        setExplorePrompts(enriched);
        setTotal(res.total);
      }
    },
    []
  );

  const refetchFollowing = useCallback(
    async (cancelled: { current: boolean }) => {
      if (!user) return;
      const token = await user.getIdToken();
      const following = await fetchMyFollowingUids(token);
      if (cancelled.current || !following.success) return;
      if (!following.followingUids.length) {
        setFollowingPrompts([]);
        return;
      }
      const res = await fetchPrompts(
        {
          authorUids: following.followingUids,
          sort: "createdAt",
          limit: 50,
        },
        token
      );
      if (cancelled.current) return;
      if (res.success) {
        const enriched = await enrichPromptsWithParent(res.prompts);
        if (cancelled.current) return;
        setFollowingPrompts(enriched);
      }
    },
    [user]
  );

  useEffect(() => {
    const cancelled = { current: false };
    const doRefetch = () => {
      if (mode === "all") void refetchAll(page, tag, cancelled);
      else void refetchFollowing(cancelled);
    };
    doRefetch();
    const interval = setInterval(doRefetch, PROMPT_POLL_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") doRefetch();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const unsubscribe = onExploreInvalidate(doRefetch);
    return () => {
      cancelled.current = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribe();
    };
  }, [mode, page, tag, refetchAll, refetchFollowing]);

  const prompts = useMemo(() => {
    if (mode === "following") return followingPrompts ?? [];
    return explorePrompts;
  }, [mode, followingPrompts, explorePrompts]);

  const totalPages = mode === "all" ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1;

  async function handleShowFollowing() {
    setMode("following");
    setError(null);
    if (!user) {
      setFollowingPrompts([]);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const following = await fetchMyFollowingUids(token);
      if (!following.success) {
        setError(following.error);
        setFollowingPrompts([]);
        return;
      }
      if (!following.followingUids.length) {
        setFollowingPrompts([]);
        return;
      }
      const res = await fetchPrompts(
        {
          authorUids: following.followingUids,
          sort: "createdAt",
          limit: 50,
        },
        token
      );
      if (res.success) {
        const enriched = await enrichPromptsWithParent(res.prompts);
        setFollowingPrompts(enriched);
      } else {
        setError(res.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <Button
          size="sm"
          variant={mode === "all" ? "default" : "outline"}
          onClick={() => setMode("all")}
        >
          Explore
        </Button>
        <Button
          size="sm"
          variant={mode === "following" ? "default" : "outline"}
          onClick={handleShowFollowing}
        >
          Following
        </Button>
        {tag && mode === "all" && (
          <a
            href="/"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            #{tag}
            <X className="size-3.5" />
          </a>
        )}
      </div>
      {error && (
        <p className="px-4 pt-3 text-sm text-destructive">{error}</p>
      )}
      <div className="divide-y divide-border">
        {loading && (
          <p className="p-4 text-sm text-muted-foreground">Loading followed creators...</p>
        )}
        {!loading && prompts.length === 0 && mode === "following" && (
          <p className="p-4 text-sm text-muted-foreground">
            {user ? "You are not following anyone yet." : "Sign in to view prompts from people you follow."}
          </p>
        )}
        {!loading && prompts.length > 0 && prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
      {mode === "all" && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
