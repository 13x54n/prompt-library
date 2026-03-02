"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendingDeveloperCard } from "@/components/trending-developer-card";
import { PromptCard } from "@/components/prompt-library";
import { cn } from "@/lib/utils";
import type { TrendingDeveloper } from "@/lib/types";
import type { Prompt } from "@/lib/types";

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

type TrendingPageClientProps = {
  developers: (TrendingDeveloper & { uid?: string; username: string })[];
  prompts: PromptCardData[];
  pageSize: number;
};

export function TrendingPageClient({
  developers,
  prompts,
  pageSize,
}: TrendingPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "developers" ? "developers" : "prompts";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const totalDevelopers = developers.length;
  const totalPrompts = prompts.length;
  const totalPagesDevs = Math.max(1, Math.ceil(totalDevelopers / pageSize));
  const totalPagesPrompts = Math.max(1, Math.ceil(totalPrompts / pageSize));
  const totalPages = tab === "developers" ? totalPagesDevs : totalPagesPrompts;
  const currentPage = tab === "developers" ? Math.min(page, totalPagesDevs) : Math.min(page, totalPagesPrompts);

  const paginatedDevelopers = developers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedPrompts = prompts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function setTab(newTab: "developers" | "prompts") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    params.delete("page");
    router.push(`/explore/trending?${params.toString()}`);
  }

  function setPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/explore/trending?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setTab("developers")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "developers" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="size-4" />
          Developers ({totalDevelopers})
        </button>
        <button
          type="button"
          onClick={() => setTab("prompts")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "prompts" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="size-4" />
          Prompts ({totalPrompts})
        </button>
      </div>

      {tab === "developers" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            {paginatedDevelopers.map((dev) => (
              <TrendingDeveloperCard key={dev.username} dev={dev} />
            ))}
          </div>
          {paginatedDevelopers.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">No trending developers yet.</p>
          )}
        </div>
      )}

      {tab === "prompts" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            {paginatedPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
          {paginatedPrompts.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">No trending prompts yet.</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
