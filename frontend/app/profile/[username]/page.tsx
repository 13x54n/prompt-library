import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { ProfileTabs } from "@/components/profile-tabs";
import { ProfileCard } from "@/components/profile-card";
import { notFound } from "next/navigation";
import {
  fetchProfile,
  fetchPromptById,
  fetchPromptsByAuthorUid,
  fetchUserContributionActivityByUid,
} from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import type { Prompt } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const result = await fetchProfile(username);
  const handle = result.success
    ? (result.user.username ?? result.user.displayName ?? username)
    : username;
  return {
    title: `@${handle}`,
    description: `View @${handle}'s prompts, contributions, and activity on Prompt Library.`,
    openGraph: {
      title: `@${handle} | Prompt Library`,
      description: `View @${handle}'s prompts and contributions.`,
    },
  };
}

function toPromptCard(api: {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stats: { upvotes: number; forks: number; views: number };
  lastUpdated: string;
  username: string;
  authorUid?: string;
  isPinned?: boolean;
  parentPromptId?: string | null;
  parentPromptTitle?: string | null;
  parentPromptUsername?: string | null;
  parentPromptAuthorUid?: string | null;
}): Pick<
  Prompt,
  | "id"
  | "title"
  | "description"
  | "tags"
  | "stats"
  | "lastUpdated"
  | "username"
  | "authorUid"
  | "isPinned"
  | "parentPromptId"
  | "parentPromptTitle"
  | "parentPromptUsername"
  | "parentPromptAuthorUid"
> {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    tags: api.tags,
    stats: api.stats,
    lastUpdated: formatRelative(api.lastUpdated),
    username: api.username,
    authorUid: api.authorUid,
    isPinned: api.isPinned ?? false,
    parentPromptId: api.parentPromptId ?? null,
    parentPromptTitle: api.parentPromptTitle ?? null,
    parentPromptUsername: api.parentPromptUsername ?? null,
    parentPromptAuthorUid: api.parentPromptAuthorUid ?? null,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const cookieStore = await cookies();
  const idToken = cookieStore.get("pl_id_token")?.value;
  const profileResult = await fetchProfile(username);
  if (!profileResult.success) {
    notFound();
  }

  const profileUser = profileResult.user;
  const handle = profileUser.username ?? profileUser.displayName ?? profileUser.uid;
  const [promptsResult, activityResult] = await Promise.all([
    fetchPromptsByAuthorUid(profileUser.uid, idToken).catch(() => ({
      success: false as const,
      error: "Failed",
    })),
    fetchUserContributionActivityByUid(profileUser.uid, idToken).catch(() => ({
      success: false as const,
      error: "Failed",
    })),
  ]);
  const parentPromptMetaById = new Map<string, { title: string; username: string; authorUid: string | null }>();
  if (promptsResult.success) {
    const parentIds = [...new Set(
      promptsResult.prompts
        .map((p) => p.parentPromptId)
        .filter((id): id is string => Boolean(id))
    )];
    const parentResults = await Promise.all(
      parentIds.map(async (parentId) => {
        const result = await fetchPromptById(parentId, idToken).catch(() => ({ success: false as const, error: "Failed" }));
        return { parentId, result };
      })
    );
    for (const { parentId, result } of parentResults) {
      if (result.success && result.prompt) {
        parentPromptMetaById.set(parentId, {
          title: result.prompt.title,
          username: result.prompt.username,
          authorUid: result.prompt.authorUid ?? null,
        });
      }
    }
  }

  const prompts = promptsResult.success
    ? promptsResult.prompts.map((p) => {
        const parentMeta = p.parentPromptId ? parentPromptMetaById.get(p.parentPromptId) : null;
        return toPromptCard({
          ...p,
          parentPromptTitle: parentMeta?.title ?? null,
          parentPromptUsername: parentMeta?.username ?? null,
          parentPromptAuthorUid: parentMeta?.authorUid ?? null,
        });
      })
    : [];
  const pinnedPrompts = prompts.filter((p) => p.isPinned);
  const allPrompts = prompts;
  const activity = activityResult.success
    ? activityResult.activity
    : { createdPrompts: [], prsByPrompt: [], discussionQuestions: [], answersByPrompt: [] };

  return (
    <div className="min-h-0 flex-1 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <ProfileCard profileUser={profileUser} handle={handle} />

          {/* Right: Tabs */}
          <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-lg bg-muted" />}>
            <ProfileTabs
              username={handle}
              profileUid={profileUser.uid}
              profileCreatedAt={profileUser.createdAt ?? null}
              pinnedPrompts={pinnedPrompts}
              allPrompts={allPrompts}
              createdPrompts={activity.createdPrompts ?? []}
              prsByPrompt={activity.prsByPrompt ?? []}
              discussionQuestions={activity.discussionQuestions ?? []}
              answersByPrompt={activity.answersByPrompt ?? []}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
