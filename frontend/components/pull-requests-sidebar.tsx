"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitPullRequest, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PullRequestModal } from "@/components/pull-request-modal";
import { PullRequestsListModal } from "@/components/pull-requests-list-modal";
import { CreatePullRequestModal } from "@/components/create-pull-request-modal";

type PullRequestSummary = {
  id: string;
  title: string;
  author: string;
  authorUid?: string | null;
  status: string;
  createdAt: string;
  discussionCount?: number;
};

type PullRequestsSidebarProps = {
  promptId: string;
  promptAuthorUid?: string;
  pullRequests: PullRequestSummary[];
};

export function PullRequestsSidebar({
  promptId,
  promptAuthorUid,
  pullRequests,
}: PullRequestsSidebarProps) {
  const router = useRouter();
  const [openPrId, setOpenPrId] = useState<string | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function handleRefresh() {
    router.refresh();
  }

  return (
    <>
      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <GitPullRequest className="size-4" />
          Pull requests
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start gap-1"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="size-4" />
          New PR
        </Button>
        <div className="flex flex-col gap-2">
          {pullRequests.map((pr) => (
            <button
              key={pr.id}
              type="button"
              onClick={() => setOpenPrId(pr.id)}
              className="group rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
            >
              <p className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                {pr.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                @{pr.author} · {pr.createdAt}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pr.discussionCount ?? 0} discussion{(pr.discussionCount ?? 0) === 1 ? "" : "s"}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                  pr.status === "merged"
                    ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                    : pr.status === "closed"
                      ? "bg-red-500/20 text-red-600 dark:text-red-400"
                      : "bg-green-500/20 text-green-600 dark:text-green-400"
                }`}
              >
                {pr.status}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          View all pull requests
          <ChevronRight className="size-4" />
        </button>
      </aside>

      {openPrId && (
        <PullRequestModal
          promptId={promptId}
          promptAuthorUid={promptAuthorUid}
          prId={openPrId}
          onClose={() => setOpenPrId(null)}
          onMergedOrClosed={handleRefresh}
        />
      )}

      {showCreateModal && (
        <CreatePullRequestModal
          promptId={promptId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRefresh}
        />
      )}

      {showAllModal && (
        <PullRequestsListModal
          promptId={promptId}
          onClose={() => setShowAllModal(false)}
          onSelectPr={(prId) => {
            setShowAllModal(false);
            setOpenPrId(prId);
          }}
        />
      )}
    </>
  );
}
