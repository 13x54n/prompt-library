import Link from "next/link";
import { Star, GitFork, FileText } from "lucide-react";
import type { TrendingDeveloper } from "@/lib/types";

type TrendingDeveloperCardProps = {
  dev: TrendingDeveloper;
};

export function TrendingDeveloperCard({ dev }: TrendingDeveloperCardProps) {
  const displayName = dev.displayName ?? dev.username;

  return (
    <Link
      href={`/profile/${encodeURIComponent(dev.username)}`}
      className="group flex items-center gap-3 p-3 border-b border-border last:border-b-0 transition-colors hover:bg-muted/50"
    >
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
        {dev.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dev.avatarUrl}
            alt={displayName}
            className="size-6 rounded-full object-cover"
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">@{dev.username}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 text-amber-500/90" />
            {(dev.totalStars / 1000).toFixed(1)}k
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="size-3.5 text-blue-500/90" />
            {(dev.totalForks / 1000).toFixed(1)}k
          </span>
        </div>
      </div>
    </Link>
  );
}
