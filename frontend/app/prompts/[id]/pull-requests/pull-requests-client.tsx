"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, GitPullRequest, GitMerge, X } from "lucide-react";
import { PullRequestModal } from "@/components/pull-request-modal";
import { fetchPullRequests, type ApiPullRequestSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

type PullRequestsClientProps = {
  promptId: string;
};

export function PullRequestsClient({ promptId }: PullRequestsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openPrId, setOpenPrId] = useState<string | null>(null);
  const [pullRequests, setPullRequests] = useState<ApiPullRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "closed">("open");

  const prFromUrl = searchParams.get("pr");
  const commentFromUrl = searchParams.get("comment");
  const activePrId = openPrId ?? prFromUrl;

  useEffect(() => {
    fetchPullRequests(promptId).then((result) => {
      if (result.success) setPullRequests(result.pullRequests);
      setLoading(false);
    });
  }, [promptId]);

  const openPrs = pullRequests.filter((p) => p.status === "open");
  const closedPrs = pullRequests.filter((p) => p.status === "closed" || p.status === "merged");
  const displayedPrs = tab === "open" ? openPrs : closedPrs;

  const handleOpenPr = (prId: string) => {
    setOpenPrId(prId);
  };

  const handleCloseModal = () => {
    setOpenPrId(null);
    if (prFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("pr");
      params.delete("comment");
      const qs = params.toString();
      const href = `/prompts/${promptId}/pull-requests${qs ? `?${qs}` : ""}`;
      router.replace(href, { scroll: false });
    }
  };

  const handleMergeOrClose = () => {
    fetchPullRequests(promptId).then((result) => {
      if (result.success) setPullRequests(result.pullRequests);
    });
    router.refresh();
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href={`/prompts/${promptId}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to prompt
          </Link>

          <header className="mb-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <GitPullRequest className="size-6" />
              Pull requests
            </h1>
            <p className="mt-1 text-muted-foreground">
              Proposed changes and improvements to this prompt
            </p>
          </header>

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

          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : displayedPrs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {tab === "open" ? "No open pull requests" : "No closed pull requests"}
              </p>
            ) : (
              displayedPrs.map((pr) => (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => handleOpenPr(pr.id)}
                  className="block w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-medium">{pr.title}</h2>
                      <p className="mt-2 text-xs text-muted-foreground">
                        #{pr.id} by @{pr.author} · {pr.createdAt}
                        {(pr.discussionCount ?? 0) > 0 &&
                          ` · ${pr.discussionCount} comment${(pr.discussionCount ?? 0) === 1 ? "" : "s"}`}
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
                      ) : pr.status === "closed" ? (
                        <span className="inline-flex items-center gap-1">
                          <X className="size-3" /> Closed
                        </span>
                      ) : (
                        pr.status
                      )}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {activePrId && (
        <PullRequestModal
          promptId={promptId}
          prId={activePrId}
          highlightedCommentId={commentFromUrl ?? undefined}
          onClose={handleCloseModal}
          onMergeOrClose={handleMergeOrClose}
        />
      )}
    </>
  );
}
