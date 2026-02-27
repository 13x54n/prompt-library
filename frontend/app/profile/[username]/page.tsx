import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileTabs } from "@/components/profile-tabs";
import { ProfileCard } from "@/components/profile-card";
import type { Prompt } from "@/lib/types";
import { notFound } from "next/navigation";
import { fetchProfile } from "@/lib/api";

// Mock prompts until prompts API exists (filtered by username in tabs)
const MOCK_PROMPTS: Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
>[] = [];
const MOCK_ALL_PROMPTS: Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
>[] = [];
const MOCK_COMMITS_BY_PROMPT: { promptId: string; promptTitle: string; count: number }[] = [];
const MOCK_CREATED_PROMPTS: { promptId: string; promptTitle: string; tag?: string; date: string }[] = [];
const MOCK_REVIEWED_PRS: { promptId: string; promptTitle: string; count: number }[] = [];

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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const result = await fetchProfile(username);

  if (!result.success) {
    notFound();
  }

  const profileUser = result.user;
  const handle = profileUser.username ?? profileUser.displayName ?? username;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <ProfileCard profileUser={profileUser} handle={handle} />

          {/* Right: Tabs */}
          <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-lg bg-muted" />}>
            <ProfileTabs
              username={handle}
              pinnedPrompts={MOCK_PROMPTS}
              allPrompts={MOCK_ALL_PROMPTS}
              commitsByPrompt={MOCK_COMMITS_BY_PROMPT}
              createdPrompts={MOCK_CREATED_PROMPTS}
              reviewedPRs={MOCK_REVIEWED_PRS}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
