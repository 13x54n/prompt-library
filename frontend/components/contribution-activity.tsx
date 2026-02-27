"use client";

import Link from "next/link";
import { useState } from "react";
import { FileCode, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommitsByPrompt = { promptId: string; promptTitle: string; count: number };
type CreatedPrompt = { promptId: string; promptTitle: string; tag?: string; date: string };
type ReviewedPR = { promptId: string; promptTitle: string; count: number };

type ContributionActivityProps = {
  username: string;
  commitsByPrompt: CommitsByPrompt[];
  createdPrompts: CreatedPrompt[];
  reviewedPRs: ReviewedPR[];
};

const YEARS = [2026, 2025, 2024, 2023];

export function ContributionActivity({
  username,
  commitsByPrompt,
  createdPrompts,
  reviewedPRs,
}: ContributionActivityProps) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const totalCommits = commitsByPrompt.reduce((sum, p) => sum + p.count, 0);
  const maxCommits = Math.max(...commitsByPrompt.map((p) => p.count), 1);

  return (
    <section className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold">Contribution activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">February {selectedYear}</p>

        {/* Created X edits in Y prompts */}
        {commitsByPrompt.length > 0 && (
          <div className="mt-6 border-b border-border pb-6">
            <p className="text-sm text-muted-foreground">
              Created {totalCommits} edits in {commitsByPrompt.length} prompt
              {commitsByPrompt.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-3 space-y-2 ml-6">
              {commitsByPrompt.map((item) => (
                <div
                  key={item.promptId}
                  className="flex items-center gap-4"
                >
                  <Link
                    href={`/prompts/${item.promptId}`}
                    className="min-w-0 flex-1 truncate text-sm text-primary hover:underline"
                  >
                    {username}/{item.promptTitle.replace(/\s+/g, "-").toLowerCase()}
                  </Link>
                  <span className="w-20 shrink-0 text-right text-sm text-muted-foreground">
                    {item.count} edit{item.count !== 1 ? "s" : ""}
                  </span>
                  <div className="flex h-2 w-32 shrink-0 items-center rounded-sm bg-green-500/20">
                    <div
                      className="h-full rounded-sm bg-green-500"
                      style={{
                        width: `${(item.count / maxCommits) * 100}%`,
                        minWidth: item.count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Created prompts */}
        {createdPrompts.length > 0 && (
          <div className="mt-4 border-b border-border pb-6">
            <p className="text-sm font-medium">Created</p>
            <div className="mt-3 space-y-2 ml-6">
              {createdPrompts.map((item) => (
                <Link
                  key={item.promptId}
                  href={`/prompts/${item.promptId}`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <FileCode className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {username}/{item.promptTitle.replace(/\s+/g, "-").toLowerCase()}
                  </span>
                  {item.tag && (
                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">
                      {item.tag}
                    </span>
                  )}
                  <span className="shrink-0 text-muted-foreground">{item.date}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed pull requests */}
        {reviewedPRs.length > 0 && (
          <div className="mt-4 border-b border-border pb-6">
            <p className="text-sm text-muted-foreground">
              Reviewed {reviewedPRs.reduce((s, p) => s + p.count, 0)} pull request
              {reviewedPRs.reduce((s, p) => s + p.count, 0) !== 1 ? "s" : ""} in{" "}
              {reviewedPRs.length} prompt{reviewedPRs.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-3 space-y-2 ml-6">
              {reviewedPRs.map((item) => (
                <Link
                  key={item.promptId}
                  href={`/prompts/${item.promptId}/pull-requests`}
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <GitPullRequest className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {username}/{item.promptTitle.replace(/\s+/g, "-").toLowerCase()}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {item.count} pull request{item.count !== 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="mt-8 w-full">
          Show more activity
        </Button>
      </div>

      {/* Year filter sidebar */}
      <aside className="hidden shrink-0 flex-col gap-1 sm:flex">
        {YEARS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setSelectedYear(year)}
            className={cn(
              "rounded-md px-3 py-1.5 text-left text-sm font-medium transition-colors",
              selectedYear === year
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {year}
          </button>
        ))}
      </aside>
    </section>
  );
}
