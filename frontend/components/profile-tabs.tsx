"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, FileX2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt-library";
import { ContributionActivity } from "@/components/contribution-activity";
import { useAuth } from "@/components/auth-provider";
import { setPromptPinned } from "@/lib/api";
import type { Prompt } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = ["overview", "prompts"] as const;
type Tab = (typeof TABS)[number];

function isValidTab(t: string | null): t is Tab {
  return t === "overview" || t === "prompts";
}

type ProfileTabsProps = {
  username: string;
  profileUid: string;
  profileCreatedAt?: string | null;
  pinnedPrompts: Pick<
    Prompt,
    | "id"
    | "title"
    | "description"
    | "tags"
    | "stats"
    | "lastUpdated"
    | "username"
    | "authorUid"
    | "isPinned"
    | "parentPromptId"
    | "parentPromptTitle"
    | "parentPromptUsername"
    | "parentPromptAuthorUid"
  >[];
  allPrompts: Pick<
    Prompt,
    | "id"
    | "title"
    | "description"
    | "tags"
    | "stats"
    | "lastUpdated"
    | "username"
    | "authorUid"
    | "isPinned"
    | "parentPromptId"
    | "parentPromptTitle"
    | "parentPromptUsername"
    | "parentPromptAuthorUid"
  >[];
  createdPrompts: { promptId: string; promptTitle: string; createdAt: string }[];
  prsByPrompt: { promptId: string; promptTitle: string; count: number }[];
  discussionQuestions: {
    id: string;
    promptId: string;
    promptTitle: string;
    title: string;
    createdAt: string;
  }[];
  answersByPrompt: { promptId: string; promptTitle: string; count: number }[];
};

export function ProfileTabs({
  username,
  profileUid,
  profileCreatedAt,
  pinnedPrompts,
  allPrompts,
  createdPrompts,
  prsByPrompt,
  discussionQuestions,
  answersByPrompt,
}: ProfileTabsProps) {
  const router = useRouter();
  const { user, currentUser } = useAuth();
  const isOwnProfile = Boolean(currentUser?.uid && currentUser.uid === profileUid);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: Tab = isValidTab(tabParam) ? tabParam : "overview";

  const [searchQuery, setSearchQuery] = useState("");
  const [isPinsModalOpen, setIsPinsModalOpen] = useState(false);
  const [draftPinnedIds, setDraftPinnedIds] = useState<string[]>([]);
  const [pinsError, setPinsError] = useState<string | null>(null);
  const [isSavingPins, setIsSavingPins] = useState(false);
  const MAX_PINNED = 10;

  const profileBase = `/profile/${encodeURIComponent(profileUid)}`;

  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return allPrompts;
    const q = searchQuery.toLowerCase().trim();
    return allPrompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [allPrompts, searchQuery]);

  function openPinsModal() {
    setDraftPinnedIds(allPrompts.filter((p) => p.isPinned).map((p) => p.id));
    setPinsError(null);
    setIsPinsModalOpen(true);
  }

  function toggleDraftPinned(promptId: string) {
    setDraftPinnedIds((prev) => {
      if (prev.includes(promptId)) return prev.filter((id) => id !== promptId);
      if (prev.length >= MAX_PINNED) {
        setPinsError(`You can pin up to ${MAX_PINNED} prompts.`);
        return prev;
      }
      setPinsError(null);
      return [...prev, promptId];
    });
  }

  async function savePins() {
    if (!user) return;
    setIsSavingPins(true);
    setPinsError(null);
    try {
      const token = await user.getIdToken();
      const next = new Set(draftPinnedIds);
      const updates = allPrompts
        .filter((p) => Boolean(p.isPinned) !== next.has(p.id))
        .map((p) => ({ id: p.id, isPinned: next.has(p.id) }));

      const results = await Promise.all(
        updates.map((u) => setPromptPinned(token, u.id, u.isPinned))
      );
      const failed = results.find((r) => !r.success);
      if (failed && !failed.success) {
        setPinsError(failed.error);
        return;
      }
      setIsPinsModalOpen(false);
      router.refresh();
    } catch (err) {
      setPinsError(err instanceof Error ? err.message : "Failed to update pinned prompts");
    } finally {
      setIsSavingPins(false);
    }
  }

  return (
    <main className="min-w-0">
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Profile sections">
          <Link
            href={profileBase}
            className={cn(
              "border-b-2 py-3 text-sm font-medium transition-colors",
              activeTab === "overview"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Overview
          </Link>
          <Link
            href={`${profileBase}?tab=prompts`}
            className={cn(
              "border-b-2 py-3 text-sm font-medium transition-colors",
              activeTab === "prompts"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Prompts
          </Link>
        </nav>
      </div>

      <div className="pt-6">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {pinnedPrompts.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Pinned Prompts</h2>
                  {isOwnProfile && (
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="gap-1" onClick={openPinsModal}>
                        <Pencil className="size-4" />
                        Edit pins
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      className="flex-col border-b-0 rounded-lg border border-border bg-card p-4 sm:flex-col"
                    />
                  ))}
                </div>
              </section>
            )}

            <ContributionActivity
              username={username}
              isOwnProfile={isOwnProfile}
              profileCreatedAt={profileCreatedAt ?? null}
              createdPrompts={createdPrompts}
              prsByPrompt={prsByPrompt}
              discussionQuestions={discussionQuestions}
              answersByPrompt={answersByPrompt}
            />
          </div>
        )}

        {activeTab === "prompts" && (
          <section>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search prompts"
                />
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredPrompts.length > 0 ? (
                filteredPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))
              ) : searchQuery.trim() ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No prompts match your search.
                </p>
              ) : isOwnProfile ? (
                <Link
                  href="/prompts/new"
                  className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Plus className="size-4 shrink-0" />
                  Start by creating one
                </Link>
              ) : (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <FileX2 className="size-4 shrink-0" />
                  They don&apos;t have any prompts yet
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      {isPinsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Edit pinned prompts</h3>
              <p className="text-xs text-muted-foreground">
                {draftPinnedIds.length}/{MAX_PINNED} selected
              </p>
            </div>
            <div className="max-h-[55dvh] overflow-y-auto p-4">
              {allPrompts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No prompts yet.</p>
              ) : (
                <div className="space-y-2">
                  {allPrompts.map((prompt) => {
                    const checked = draftPinnedIds.includes(prompt.id);
                    return (
                      <label
                        key={prompt.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-muted/40"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDraftPinned(prompt.id)}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{prompt.title}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {prompt.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {pinsError && (
                <p className="mt-3 text-sm text-destructive">{pinsError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button variant="outline" onClick={() => setIsPinsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={savePins} disabled={isSavingPins || !user}>
                {isSavingPins ? "Saving..." : "Save pins"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
