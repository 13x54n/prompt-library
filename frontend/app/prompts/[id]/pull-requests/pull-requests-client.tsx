"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, GitPullRequest } from "lucide-react";
import { PullRequestModal } from "@/components/pull-request-modal";

const MOCK_PULL_REQUESTS = [
  {
    id: "pr1",
    title: "Add Core Web Vitals section",
    body: "Adds a new section to the checklist for Core Web Vitals (LCP, FID, CLS). Includes prompts for analyzing and improving each metric.",
    author: "perfpro",
    status: "open",
    createdAt: "3d ago",
    comments: 4,
  },
  {
    id: "pr2",
    title: "Support for i18n meta tags",
    body: "Extends the meta tags section to include hreflang and alternate language support for internationalized sites.",
    author: "i18n_dev",
    status: "open",
    createdAt: "1w ago",
    comments: 2,
  },
  {
    id: "pr3",
    title: "Fix typo in structured data example",
    body: "Corrects a typo in the JSON-LD example.",
    author: "copy_fix",
    status: "merged",
    createdAt: "2w ago",
    comments: 0,
  },
];

type PullRequestsClientProps = {
  promptId: string;
};

export function PullRequestsClient({ promptId }: PullRequestsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openPrId, setOpenPrId] = useState<string | null>(null);

  const prFromUrl = searchParams.get("pr");
  const commentFromUrl = searchParams.get("comment");
  const activePrId = openPrId ?? prFromUrl;

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

          <div className="space-y-2">
            {MOCK_PULL_REQUESTS.map((pr) => (
              <button
                key={pr.id}
                type="button"
                onClick={() => handleOpenPr(pr.id)}
                className="block w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium">{pr.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {pr.body}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      #{pr.id} by @{pr.author} · {pr.createdAt}
                      {pr.comments > 0 && ` · ${pr.comments} comments`}
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

      {activePrId && (
        <PullRequestModal
          promptId={promptId}
          prId={activePrId}
          highlightedCommentId={commentFromUrl ?? undefined}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
