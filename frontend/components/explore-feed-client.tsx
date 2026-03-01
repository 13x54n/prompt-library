"use client";

import { useMemo, useState } from "react";
import { PromptCard } from "@/components/prompt-library";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { fetchMyFollowingUids, fetchPrompts, type ApiPrompt } from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import type { Prompt } from "@/lib/types";

type PromptCardData = Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username" | "authorUid" | "parentPromptId"
>;

function toPromptCard(api: ApiPrompt): PromptCardData {
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
  };
}

type ExploreFeedClientProps = {
  initialPrompts: PromptCardData[];
};

export function ExploreFeedClient({ initialPrompts }: ExploreFeedClientProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"all" | "following">("all");
  const [loading, setLoading] = useState(false);
  const [followingPrompts, setFollowingPrompts] = useState<PromptCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prompts = useMemo(() => {
    if (mode === "following") return followingPrompts ?? [];
    return initialPrompts;
  }, [mode, followingPrompts, initialPrompts]);

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
      const res = await fetchPrompts({
        authorUids: following.followingUids,
        sort: "createdAt",
        limit: 50,
      });
      setFollowingPrompts(res.success ? res.prompts.map(toPromptCard) : []);
      if (!res.success) setError(res.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
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
    </div>
  );
}
