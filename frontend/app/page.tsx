import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Users } from "lucide-react";
import { PromptCard } from "@/components/prompt-library";
import { TrendingDeveloperCard } from "@/components/trending-developer-card";
import { MOCK_PROMPTS, MOCK_TRENDING_DEVS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: { absolute: "Explore | Prompt Library" },
  description:
    "Browse trending AI prompts and developers. Discover prompts for Next.js, React, TypeScript, and more. Fork, upvote, and contribute to the community.",
};

const TRENDING_PROMPTS = [...MOCK_PROMPTS].sort(
  (a, b) => b.stats.upvotes + b.stats.views - (a.stats.upvotes + a.stats.views)
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
                    <span>{prompt.stats.upvotes.toLocaleString()} ↑</span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
  );
}
