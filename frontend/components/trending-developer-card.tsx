import Link from "next/link";
import { ArrowUp, GitFork } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
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
      <UserAvatar
        photoURL={dev.avatarUrl ?? null}
        name={displayName}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">@{dev.username}</p>
        <p className="text-xs text-muted-foreground">
          description...
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
        </div>
      </div>
    </Link>
  );
}
