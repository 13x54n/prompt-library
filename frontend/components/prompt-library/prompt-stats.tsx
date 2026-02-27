import { ArrowUp, GitFork, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type PromptStatsProps = {
  upvotes: number;
  forks: number;
  views?: number;
  size?: "sm" | "md";
  className?: string;
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function PromptStats({
  upvotes,
  forks,
  views = 0,
  size = "sm",
  className,
}: PromptStatsProps) {
  const iconClass = size === "sm" ? "size-4" : "size-4";
  const textClass = size === "sm" ? "text-sm" : "text-base";

  return (
    <div
      className={cn(
        "flex items-center gap-4 text-muted-foreground",
        textClass,
        className
      )}
    >
      <span className="flex items-center gap-1 [&>svg]:text-amber-500/90 dark:[&>svg]:text-amber-400/90">
        <ArrowUp className={iconClass} aria-hidden />
        {formatCount(upvotes)}
      </span>
      <span className="flex items-center gap-1 [&>svg]:text-blue-500/90 dark:[&>svg]:text-blue-400/90">
        <GitFork className={iconClass} aria-hidden />
        {formatCount(forks)}
      </span>
      {views > 0 && (
        <span className="flex items-center gap-1">
          <Eye className={iconClass} aria-hidden />
          {formatCount(views)} views
        </span>
      )}
    </div>
  );
}
