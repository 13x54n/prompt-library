"use client";

import { useEffect } from "react";
import { GitPullRequest, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_PRS } from "@/lib/pull-requests";

type PullRequestsListModalProps = {
  promptId: string;
  onClose: () => void;
  onSelectPr: (prId: string) => void;
};

export function PullRequestsListModal({
  onClose,
  onSelectPr,
}: PullRequestsListModalProps) {
  const pullRequests = Object.values(MOCK_PRS);

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

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-border bg-background shadow-lg">
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
          <div className="space-y-2">
            {pullRequests.map((pr) => (
              <button
                key={pr.id}
                type="button"
                onClick={() => onSelectPr(pr.id)}
                className="block w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{pr.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {pr.body}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      #{pr.id} by @{pr.author} · {pr.createdAt}
                      {pr.comments.length > 0 &&
                        ` · ${pr.comments.length} comments`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      pr.status === "merged"
                        ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                        : "bg-green-500/20 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {pr.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
