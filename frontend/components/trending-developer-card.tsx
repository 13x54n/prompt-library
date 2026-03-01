import Link from "next/link";
import { ArrowUp, GitFork, Activity } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import type { TrendingDeveloper } from "@/lib/types";

type TrendingDeveloperCardProps = {
  dev: TrendingDeveloper;
};

export function TrendingDeveloperCard({ dev }: TrendingDeveloperCardProps) {
  const displayName = dev.displayName ?? dev.username;
  const profileHref = `/profile/${encodeURIComponent(dev.uid ?? dev.username)}`;

  return (
    <Link
      href={profileHref}
      className="group flex items-center gap-3 p-3 border-b border-border last:border-b-0 transition-colors hover:bg-muted/50"
    >
      <UserAvatar
        photoURL={dev.avatarUrl ?? null}
        name={displayName}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">@{dev.username}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {dev.bio?.trim() || "No bio yet"}
        </p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="size-3.5 text-amber-500/90" />
            {(dev.totalUpvotes / 1000).toFixed(1)}k
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="size-3.5 text-blue-500/90" />
            {(dev.totalForks / 1000).toFixed(1)}k
          </span>
          <span className="flex items-center gap-1">
            <Activity className="size-3.5 text-emerald-500/90" />
            {(dev.totalActivity ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
