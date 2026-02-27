import Link from "next/link";
import { ArrowUp, GitFork, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagChip } from "./tag-chip";
import { PromptStats } from "./prompt-stats";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/lib/types";

type PromptHeaderProps = {
  prompt: Pick<Prompt, "title" | "description" | "stats" | "username">;
  className?: string;
};

export function PromptHeader({ prompt, className }: PromptHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{prompt.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <PromptStats
              upvotes={prompt.stats.upvotes}
              forks={prompt.stats.forks}
              views={prompt.stats.views}
              size="md"
            />
            <span className="text-muted-foreground">by {prompt.username}</span>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground">{prompt.description}</p>
      <div className="flex flex-wrap items-center gap-2 mt-6">
        <Button size="sm" className="gap-1">
          <ArrowUp className="size-4" />
          Upvote
        </Button>
        <Button size="sm" variant="outline" className="gap-1">
          <GitFork className="size-4" />
          Fork
        </Button>
        <Button size="sm" variant="outline"><Save className="size-4" /> Save to Library</Button>
      </div>
    </header>
  );
}
