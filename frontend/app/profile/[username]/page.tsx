import { Suspense } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileTabs } from "@/components/profile-tabs";
import type { Prompt } from "@/lib/types";
import Image from "next/image";

// Mock data
const MOCK_USER = {
  username: "seo_ninja",
  stars: 5200,
  forks: 1700,
  views: 23400,
};

const MOCK_PROMPTS: Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
>[] = [
    {
      id: "1",
      title: "Next.js SEO Checklist",
      stats: { stars: 2300, forks: 847, views: 12000 },
      description: "Complete Next.js App Router SEO audit",
      tags: ["nextjs", "seo"],
      lastUpdated: "2h ago",
      username: "seo_ninja",
    },
    {
      id: "2",
      title: "React Suspense Debugging",
      stats: { stars: 1200, forks: 234, views: 5600 },
      description: "Find/fix Suspense fallback hydration bugs",
      tags: ["react", "suspense"],
      lastUpdated: "1d ago",
      username: "seo_ninja",
    },
    {
      id: "3",
      title: "TypeScript Migration Guide",
      stats: { stars: 892, forks: 156, views: 3400 },
      description: "Step-by-step JS to TS migration prompts",
      tags: ["typescript", "migration"],
      lastUpdated: "3d ago",
      username: "seo_ninja",
    },
  ];

// Full list for Prompts tab (includes pinned + more)
const MOCK_ALL_PROMPTS: Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
>[] = [
  ...MOCK_PROMPTS,
  {
    id: "4",
    title: "AI Prompt Templates",
    stats: { stars: 890, forks: 156, views: 3400 },
    description: "Curated collection of prompts for GPT, Claude, and more",
    tags: ["ai", "prompts", "llm"],
    lastUpdated: "5d ago",
    username: "seo_ninja",
  },
  {
    id: "5",
    title: "Core Web Vitals Audit",
    stats: { stars: 450, forks: 89, views: 2100 },
    description: "LCP, FID, CLS analysis and optimization prompts",
    tags: ["performance", "web-vitals"],
    lastUpdated: "1w ago",
    username: "seo_ninja",
  },
];

const MOCK_COMMITS_BY_PROMPT = [
  { promptId: "1", promptTitle: "Next.js SEO Checklist", count: 23 },
  { promptId: "2", promptTitle: "React Suspense Debugging", count: 7 },
  { promptId: "3", promptTitle: "TypeScript Migration Guide", count: 3 },
  { promptId: "4", promptTitle: "AI Prompt Templates", count: 2 },
  { promptId: "5", promptTitle: "Core Web Vitals Audit", count: 1 },
];

const MOCK_CREATED_PROMPTS = [
  { promptId: "1", promptTitle: "Next.js SEO Checklist", tag: "nextjs", date: "Feb 27" },
  { promptId: "2", promptTitle: "React Suspense Debugging", tag: "react", date: "Feb 18" },
  { promptId: "4", promptTitle: "AI Prompt Templates", tag: "ai", date: "Feb 8" },
  { promptId: "3", promptTitle: "TypeScript Migration Guide", tag: "typescript", date: "Feb 3" },
];

const MOCK_REVIEWED_PRS = [
  { promptId: "1", promptTitle: "Next.js SEO Checklist", count: 1 },
  { promptId: "2", promptTitle: "React Suspense Debugging", count: 1 },
];

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = MOCK_USER;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Left: Profile card */}
          <aside className="space-y-4">
            <div>
              <div className="flex size-48 items-center justify-center overflow-hidden rounded-full bg-muted">
                <Image src="https://images.unsplash.com/photo-1719342193714-472e327b4ada?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt={user.username} width={192} height={192} className="size-48 rounded-full object-cover" />
              </div>

              <h1 className="mt-4 text-2xl font-bold">{user.username}</h1>
              <div>
                <h2 className="font-semibold">@{user.username}</h2>
              </div>

              <p className="text-muted-foreground mt-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Edit Profile
              </Button>
            </div>
            <div className="mt-4 flex gap-2 text-sm text-muted-foreground">
              <p className="text-muted-foreground">22 Followers</p>
              <p className="text-muted-foreground">22 Following</p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="size-4" />  https://github.com/username
            </div>
          </aside>

          {/* Right: Tabs */}
          <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-lg bg-muted" />}>
            <ProfileTabs
              username={user.username}
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
