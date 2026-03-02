"use client";

import { useEffect, useState } from "react";
import { GitPullRequest, X, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPullRequests, type ApiPullRequestSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

type PullRequestsListModalProps = {
  promptId: string;
  onClose: () => void;
  onSelectPr: (prId: string) => void;
};

export function PullRequestsListModal({
  promptId,
  onClose,
  onSelectPr,
}: PullRequestsListModalProps) {
  const [pullRequests, setPullRequests] = useState<ApiPullRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "closed">("open");

  const openPrs = pullRequests.filter((p) => p.status === "open");
  const closedPrs = pullRequests.filter((p) => p.status === "closed" || p.status === "merged");
  const displayedPrs = tab === "open" ? openPrs : closedPrs;

  useEffect(() => {
    fetchPullRequests(promptId).then((result) => {
      if (result.success) setPullRequests(result.pullRequests);
      setLoading(false);
    });
  }, [promptId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pr-list-modal-title"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2
            id="pr-list-modal-title"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <GitPullRequest className="size-5" />
            Pull requests
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Proposed changes and improvements to this prompt
          </p>
          <div className="mb-4 flex gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => setTab("open")}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === "open"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Open ({openPrs.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("closed")}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === "closed"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Closed ({closedPrs.length})
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : displayedPrs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {tab === "open" ? "No open pull requests" : "No closed pull requests"}
            </p>
          ) : (
            <div className="space-y-2">
            {displayedPrs.map((pr) => (
              <button
                key={pr.id}
                type="button"
                onClick={() => onSelectPr(pr.id)}
                className="block w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{pr.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      #{pr.id} by @{pr.author} · {pr.createdAt}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pr.discussionCount ?? 0} discussion{(pr.discussionCount ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      pr.status === "merged" &&
                        "bg-purple-500/20 text-purple-600 dark:text-purple-400",
                      pr.status === "closed" &&
                        "bg-red-500/20 text-red-600 dark:text-red-400",
                      pr.status === "open" &&
                        "bg-green-500/20 text-green-600 dark:text-green-400"
                    )}
                  >
                    {pr.status === "merged" ? (
                      <span className="inline-flex items-center gap-1">
                        <GitMerge className="size-3" /> Merged
                      </span>
                    ) : pr.status}
                  </span>
                </div>
              </button>
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
