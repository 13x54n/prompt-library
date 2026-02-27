import type { Prompt, TrendingDeveloper } from "./types";

export const MOCK_PROMPTS: Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
>[] = [
  {
    id: "1",
    title: "Prompt Library",
    description: "Complete Next.js App Router SEO audit + content gaps",
    tags: ["nextjs", "seo", "checklist", "2026"],
    stats: { upvotes: 2300, forks: 847, views: 12000 },
    lastUpdated: "2h ago",
    username: "username",
  },
  {
    id: "2",
    title: "Debug React Suspense",
    description: "Find/fix Suspense fallback hydration bugs",
    tags: ["react", "suspense", "debug", "hydration"],
    stats: { upvotes: 1200, forks: 234, views: 5600 },
    lastUpdated: "1d ago",
    username: "debugguru",
  },
  {
    id: "3",
    title: "AI Prompt Templates",
    description: "Curated collection of prompts for GPT, Claude, and more",
    tags: ["ai", "prompts", "llm", "templates"],
    stats: { upvotes: 890, forks: 156, views: 3400 },
    lastUpdated: "3d ago",
    username: "promptmaster",
  },
];

export const MOCK_TRENDING_DEVS: TrendingDeveloper[] = [
  {
    username: "username",
    promptCount: 12,
    totalUpvotes: 8500,
    totalForks: 2100,
    totalViews: 45000,
  },
  {
    username: "debugguru",
    promptCount: 8,
    totalUpvotes: 4200,
    totalForks: 980,
    totalViews: 22000,
  },
  {
    username: "promptmaster",
    promptCount: 15,
    totalUpvotes: 3100,
    totalForks: 520,
    totalViews: 18000,
  },
  {
    username: "seo_ninja",
    promptCount: 6,
    totalUpvotes: 5200,
    totalForks: 1700,
    totalViews: 23400,
  },
];
