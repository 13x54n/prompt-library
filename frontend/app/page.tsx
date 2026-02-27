import Link from "next/link";
import { TrendingUp, Users } from "lucide-react";
import { PromptCard } from "@/components/prompt-library";
import { TrendingDeveloperCard } from "@/components/trending-developer-card";
import { SearchBar } from "@/components/search-bar";
import type { Prompt, TrendingDeveloper } from "@/lib/types";

const MOCK_PROMPTS: Pick<
  Prompt,
  "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
>[] = [
    {
      id: "1",
      title: "Prompt Library",
      description: "Complete Next.js App Router SEO audit + content gaps",
      tags: ["nextjs", "seo", "checklist", "2026"],
      stats: { stars: 2300, forks: 847, views: 12000 },
      lastUpdated: "2h ago",
      username: "username",
    },
    {
      id: "2",
      title: "Debug React Suspense",
      description: "Find/fix Suspense fallback hydration bugs",
      tags: ["react", "suspense", "debug", "hydration"],
      stats: { stars: 1200, forks: 234, views: 5600 },
      lastUpdated: "1d ago",
      username: "debugguru",
    },
    {
      id: "3",
      title: "AI Prompt Templates",
      description: "Curated collection of prompts for GPT, Claude, and more",
      tags: ["ai", "prompts", "llm", "templates"],
      stats: { stars: 890, forks: 156, views: 3400 },
      lastUpdated: "3d ago",
      username: "promptmaster",
    },
  ];

const MOCK_TRENDING_DEVS: TrendingDeveloper[] = [
  { username: "username", promptCount: 12, totalStars: 8500, totalForks: 2100, totalViews: 45000 },
  { username: "debugguru", promptCount: 8, totalStars: 4200, totalForks: 980, totalViews: 22000 },
  { username: "promptmaster", promptCount: 15, totalStars: 3100, totalForks: 520, totalViews: 18000 },
  { username: "seo_ninja", promptCount: 6, totalStars: 5200, totalForks: 1700, totalViews: 23400 },
];

const TRENDING_PROMPTS = [...MOCK_PROMPTS].sort(
  (a, b) => b.stats.stars + b.stats.views - (a.stats.stars + a.stats.views)
);

export default function ExplorePage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mx-auto flex h-full max-w-7xl flex-1 flex-col gap-8 overflow-hidden px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[280px_1fr_280px] lg:items-start">
          {/* Left: Trending Developers */}
          <aside className="order-2 shrink-0 lg:order-1">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Users className="size-5 text-blue-500/90" />
              Trending Developers
            </h2>
            <div className="flex flex-col border rounded-lg bg-card">
              {MOCK_TRENDING_DEVS.map((dev) => (
                <TrendingDeveloperCard key={dev.username} dev={dev} />
              ))}
            </div>
          </aside>

          {/* Middle: Main prompts */}
          <main className="order-1 min-h-0 min-w-0 flex-1 overflow-y-auto lg:order-2">
            {/* <h1 className="text-2xl font-bold">Explore</h1>
            <p className="mt-1 text-muted-foreground mb-4">
              Discover prompts and templates from the community.
            </p> */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar users={MOCK_TRENDING_DEVS} prompts={MOCK_PROMPTS} />
            </div>

            <div className="rounded-lg border border-border bg-card">
              <div className="divide-y divide-border">
                {MOCK_PROMPTS.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </div>
          </main>

          {/* Right: Trending Prompts */}
          <aside className="order-3 shrink-0">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="size-5 text-amber-500/90" />
              Trending Prompts
            </h2>
            <div className="flex flex-col gap-3">
              {TRENDING_PROMPTS.map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium truncate">{prompt.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {prompt.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>@{prompt.username}</span>
                    <span>{prompt.stats.stars.toLocaleString()} ★</span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
  );
}
