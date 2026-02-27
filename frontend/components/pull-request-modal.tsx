"use client";

import Link from "next/link";
import {
  GitPullRequest,
  MessageSquare,
  GitBranch,
  Check,
  X,
  GitMerge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptCodeBlock } from "@/components/prompt-library";
import { MOCK_PRS } from "@/lib/pull-requests";
import { useEffect } from "react";

type PullRequestModalProps = {
  promptId: string;
  prId: string;
  onClose: () => void;
};

function StatusBadge({ status }: { status: "open" | "closed" | "merged" }) {
  if (status === "merged") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400">
        <GitMerge className="size-4" />
        Merged
      </span>
    );
  }
  if (status === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400">
        <X className="size-4" />
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
      <Check className="size-4" />
      Open
    </span>
  );
}

export function PullRequestModal({ promptId, prId, onClose }: PullRequestModalProps) {
  const pr = MOCK_PRS[prId];

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

  if (!pr) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pr-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal content */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="pr-modal-title" className="text-xl font-semibold">
                {pr.title}
              </h2>
              <span className="text-muted-foreground">#{pr.id}</span>
              <StatusBadge status={pr.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                <GitPullRequest className="mr-1 inline size-4" />
                {pr.author} opened this {pr.createdAt}
              </span>
              {pr.comments.length > 0 && (
                <span>
                  <MessageSquare className="mr-1 inline size-4" />
                  {pr.comments.length} comment{pr.comments.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
            <main className="min-w-0 space-y-6">
              {/* Description */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <span className="font-medium">Description</span>
                </div>
                <div className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                    {pr.body}
                  </div>
                </div>
              </div>

              {/* Changes */}
              {pr.promptDiff && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <GitBranch className="size-4 text-muted-foreground" />
                    <span className="font-medium">Changes</span>
                  </div>
                  <div className="p-4">
                    <PromptCodeBlock content={pr.promptDiff} />
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <span className="font-medium">Conversation</span>
                  {pr.comments.length > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {pr.comments.length}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {pr.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Link
                            href={`/profile/${comment.author}`}
                            className="font-medium hover:underline"
                          >
                            @{comment.author}
                          </Link>
                          <span className="text-muted-foreground">
                            commented {comment.createdAt}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                  {pr.comments.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No comments yet.
                    </div>
                  )}
                </div>
                {pr.status === "open" && (
                  <div className="border-t border-border p-4">
                    <textarea
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    />
                    <Button size="sm" className="mt-2">
                      Comment
                    </Button>
                  </div>
                )}
              </div>
            </main>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Details
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Author</dt>
                    <dd>
                      <Link
                        href={`/profile/${pr.author}`}
                        className="font-medium hover:underline"
                      >
                        @{pr.author}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Base</dt>
                    <dd className="font-mono text-xs">{pr.baseBranch}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Compare</dt>
                    <dd className="font-mono text-xs">{pr.headBranch}</dd>
                  </div>
                </dl>
              </div>
              {pr.status === "open" && (
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="w-full gap-1">
                    <Check className="size-4" />
                    Merge
                  </Button>
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <X className="size-4" />
                    Close
                  </Button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
