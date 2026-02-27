"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PromptCard } from "@/components/prompt-library";
import { ContributionActivity } from "@/components/contribution-activity";
import type { Prompt } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = ["overview", "prompts"] as const;
type Tab = (typeof TABS)[number];

function isValidTab(t: string | null): t is Tab {
  return t === "overview" || t === "prompts";
}

type ProfileTabsProps = {
  username: string;
  pinnedPrompts: Pick<
    Prompt,
    "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
  >[];
  allPrompts: Pick<
    Prompt,
    "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
  >[];
  commitsByPrompt: { promptId: string; promptTitle: string; count: number }[];
  createdPrompts: { promptId: string; promptTitle: string; tag?: string; date: string }[];
  reviewedPRs: { promptId: string; promptTitle: string; count: number }[];
};

export function ProfileTabs({
  username,
  pinnedPrompts,
  allPrompts,
  commitsByPrompt,
  createdPrompts,
  reviewedPRs,
}: ProfileTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: Tab = isValidTab(tabParam) ? tabParam : "overview";

  const [searchQuery, setSearchQuery] = useState("");

  const profileBase = `/profile/${encodeURIComponent(username)}`;

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
            <section>
              <h2 className="mb-4 text-lg font-semibold">Pinned Prompts</h2>
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

            <ContributionActivity
              username={username}
              commitsByPrompt={commitsByPrompt}
              createdPrompts={createdPrompts}
              reviewedPRs={reviewedPRs}
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
                ) : (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No prompts match your search.
                  </p>
                )}
              </div>
          </section>
        )}
      </div>
    </main>
  );
}
