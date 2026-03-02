import Link from "next/link";
import { TagChip } from "./tag-chip";
import { PromptStats } from "./prompt-stats";
import { ActivityLineChart } from "./activity-line-chart";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/lib/types";

type PromptCardProps = {
  prompt: Pick<
    Prompt,
    | "id"
    | "title"
    | "description"
    | "tags"
    | "stats"
    | "lastUpdated"
    | "username"
    | "authorUid"
    | "parentPromptId"
    | "parentPromptTitle"
    | "parentPromptUsername"
    | "parentPromptAuthorUid"
  >;
  className?: string;
};

function buildInteractionSeries(totalInteractions: number, points = 11): number[] {
  if (totalInteractions <= 0) return Array(points).fill(0);
  const series = [];
  for (let i = 0; i < points; i += 1) {
    const progress = i / (points - 1);
    const value = Math.round(totalInteractions * progress);
    series.push(value);
  }
  return series;
}

export function PromptCard({ prompt, className }: PromptCardProps) {
  const interactions = Math.max(0, prompt.stats.interactions ?? 0);
  const chartData = buildInteractionSeries(interactions);

  const authorProfileHref = `/profile/${encodeURIComponent(prompt.authorUid ?? prompt.username)}`;
  const parentAuthorHref = prompt.parentPromptAuthorUid
    ? `/profile/${encodeURIComponent(prompt.parentPromptAuthorUid)}`
    : prompt.parentPromptUsername
      ? `/profile/${encodeURIComponent(prompt.parentPromptUsername)}`
      : null;

  return (
    <article
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-center sm:gap-4 px-4",
        className
      )}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="min-w-0 overflow-hidden">
          <Link
            href={`/prompts/${prompt.id}`}
            className="block font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded line-clamp-2"
          >
            {prompt.title}
          </Link>
        </div>
        <p className="mt-0.5 line-clamp-2 min-w-0 overflow-hidden text-sm text-muted-foreground">
          {prompt.description}
        </p>
        <div className="mt-2 flex min-w-0 flex-wrap gap-1.5 overflow-hidden">
          {prompt.tags.map((tag) => (
            <TagChip key={tag} tag={tag} href={`/?tag=${encodeURIComponent(tag)}`} />
          ))}
        </div>
        {/* contributor */}
        <div className="mt-2 flex min-w-0 items-center gap-2 overflow-hidden">
          <p className="text-xs text-muted-foreground truncate">
            Contributed by{" "}
            <Link href={authorProfileHref} className="text-muted-foreground hover:underline">
              @{prompt.username}
            </Link>
          </p>
        </div>
        {prompt.parentPromptId && prompt.parentPromptTitle && (
          <p className="mt-1 line-clamp-2 min-w-0 overflow-hidden text-xs text-muted-foreground">
            Forked from{" "}
            <Link href={`/prompts/${prompt.parentPromptId}`} className="hover:underline">
              {prompt.parentPromptTitle}
            </Link>
            {prompt.parentPromptUsername && (
              <>
                {" "}by{" "}
                <Link href={parentAuthorHref ?? "#"} className="hover:underline">
                  @{prompt.parentPromptUsername}
                </Link>
              </>
            )}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 w-fit">
        <PromptStats
          upvotes={prompt.stats.upvotes}
          forks={prompt.stats.forks}
          views={prompt.stats.views}
        />
        {chartData.length >= 2 && Math.min(...chartData) !== Math.max(...chartData) && (
          <div className="w-full min-w-0">
            <ActivityLineChart data={chartData} />
          </div>
        )}
      </div>
    </article>
  );
}
