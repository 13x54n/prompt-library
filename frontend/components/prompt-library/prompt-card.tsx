import Link from "next/link";
import { Star, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagChip } from "./tag-chip";
import { PromptStats } from "./prompt-stats";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/lib/types";

type PromptCardProps = {
  prompt: Pick<Prompt, "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username">;
  className?: string;
};

export function PromptCard({ prompt, className }: PromptCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4 px-4",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground" aria-hidden>
            📂
          </span>
          <Link
            href={`/prompts/${prompt.id}`}
            className="truncate font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            {prompt.title}
          </Link>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {prompt.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <TagChip key={tag} tag={tag} href={`/explore?tag=${tag}`} />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:items-end">
        <PromptStats
          stars={prompt.stats.stars}
          forks={prompt.stats.forks}
          views={prompt.stats.views}
        />
        
      </div>
    </article>
  );
}
