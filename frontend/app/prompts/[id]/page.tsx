import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { BarChart3, Users } from "lucide-react";
import {
  PromptHeader,
  PromptCodeBlock,
  DiscussionSection,
} from "@/components/prompt-library";
import { PullRequestsSidebar } from "@/components/pull-requests-sidebar";
import { UserAvatar } from "@/components/user-avatar";
import {
  fetchPromptById,
  fetchDiscussions,
  fetchPullRequests,
  fetchContributors,
  fetchProfile,
  type ApiPrompt,
} from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import type { Prompt, DiscussionQuestion, DiscussionAnswer } from "@/lib/types";

function toPrompt(api: ApiPrompt): Prompt {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? "",
    tags: api.tags ?? [],
    stats: api.stats ?? { upvotes: 0, forks: 0, views: 0, interactions: 0 },
    lastUpdated: formatRelative(api.lastUpdated),
    username: api.username,
    authorUid: api.authorUid,
    primaryPrompt: api.primaryPrompt ?? "",
    parameters: api.parameters ?? [],
    variants: api.variants ?? [],
    guide: api.guide ?? undefined,
    visibility: api.visibility ?? "public",
    isPinned: api.isPinned ?? false,
    parentPromptId: api.parentPromptId ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchPromptById(id);
  if (!result.success || !result.prompt) {
    return { title: "Prompt not found" };
  }
  const prompt = result.prompt;
  return {
    title: prompt.title,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description: prompt.description,
    },
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const idToken = cookieStore.get("pl_id_token")?.value;
  const [promptResult, discussionsResult, prsResult, contributorsResult] = await Promise.all([
    fetchPromptById(id, idToken),
    fetchDiscussions(id, idToken),
    fetchPullRequests(id, idToken),
    fetchContributors(id, idToken),
  ]);

  if (!promptResult.success || !promptResult.prompt) {
    notFound();
  }

  const prompt = toPrompt(promptResult.prompt);
  const parentPromptId = prompt.parentPromptId ?? null;
  const parentPromptResult =
    parentPromptId
      ? await fetchPromptById(parentPromptId, idToken).catch(() => ({ success: false as const, error: "Failed" }))
      : null;
  const parentPrompt =
    parentPromptResult && parentPromptResult.success && parentPromptResult.prompt
      ? {
          id: parentPromptResult.prompt.id,
          title: parentPromptResult.prompt.title,
          username: parentPromptResult.prompt.username,
          authorUid: parentPromptResult.prompt.authorUid,
        }
      : null;
  const questions: DiscussionQuestion[] = discussionsResult.success
    ? discussionsResult.questions
    : [];
  const answersByQuestion: Record<string, DiscussionAnswer[]> =
    discussionsResult.success ? discussionsResult.answersByQuestion : {};
  const pullRequests =
    prsResult.success
      ? prsResult.pullRequests
      : [];
  const rawContributors =
    contributorsResult.success
      ? contributorsResult.contributors.map((c) => ({
          uid: c.uid,
          username: c.username,
          contributions: c.contributions,
        }))
      : [];
  const contributors = await Promise.all(
    rawContributors.map(async (c) => {
      const profile = await fetchProfile(c.uid).catch(() => ({ success: false as const, error: "Failed" }));
      return {
        ...c,
        username: profile.success ? (profile.user.username ?? c.username) : c.username,
        avatar: profile.success ? profile.user.photoURL : null,
      };
    })
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden bg-background">
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-1 flex-col gap-8 overflow-hidden px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[200px_1fr_240px] lg:grid-rows-[1fr] lg:items-stretch">
          {/* Left sidebar: Pull requests - fixed, does not scroll */}
          <div className="order-2 shrink-0 self-start lg:order-1">
            <PullRequestsSidebar
              promptId={id}
              pullRequests={pullRequests}
            />
          </div>

          {/* Main content - only this scrolls */}
          <main className="order-1 min-h-0 min-w-0 flex-1 overflow-y-auto lg:order-2 sm:min-w-[min(100%,360px)] lg:min-w-[min(40vw,640px)]">
            {/* Overview */}
            <div id="overview" className="scroll-mt-8 space-y-8">
              <PromptHeader
                prompt={prompt}
                promptId={id}
                promptAuthorUid={promptResult.prompt.authorUid}
                parentPrompt={parentPrompt}
                initialPinned={promptResult.prompt.isPinned ?? false}
              />

              <section>
                <h2 className="mb-3 text-lg font-semibold">Primary Prompt</h2>
                <PromptCodeBlock content={prompt.primaryPrompt} />
              </section>
            </div>

            {/* Discussion */}
            <div id="discussion" className="scroll-mt-8 mt-5">
              <DiscussionSection
                promptId={id}
                promptAuthorUid={promptResult.prompt.authorUid}
                initialQuestions={questions}
                initialAnswersByQuestion={answersByQuestion}
              />
            </div>
          </main>

          {/* Right sidebar: Contributors & Insights - fixed, does not scroll */}
          <aside className="order-3 shrink-0 self-start space-y-6 lg:sticky lg:top-0">
            
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BarChart3 className="size-4" />
                Insights
              </h3>
              <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Views (7d)</span>
                  <span className="font-medium">{prompt.stats.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Forks</span>
                  <span className="font-medium">{prompt.stats.forks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Upvotes</span>
                  <span className="font-medium">{prompt.stats.upvotes.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="size-4" />
                Contributors
              </h3>
              <div className="rounded-lg border border-border bg-card">
                <div className="divide-y divide-border">
                  {contributors.length > 0 ? contributors.map((c) => (
                    <Link
                      key={c.uid}
                      href={`/profile/${c.uid}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <UserAvatar
                        photoURL={c.avatar ?? null}
                        name={c.username}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">@{c.username}</p>
                        <p className="text-xs text-muted-foreground">{c.contributions} contributions</p>
                      </div>
                    </Link>
                  )) : (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No contributors yet</p>
                  )}
                </div>
              </div>
            </div>

            {/*
              Temporarily hidden sponsor CTA.
              Keep this block here so it can be restored quickly later.
            */}
            {/*
            <a
              href={`https://buymeacoffee.com/${prompt.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/15"
            >
              <Coffee className="size-4" />
              Sponsor @{prompt.username}
            </a>
            */}
          </aside>
      </div>
    </div>
  );
}
