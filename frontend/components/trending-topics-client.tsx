"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagChip } from "@/components/prompt-library";

type TrendingTopicsClientProps = {
  topics: string[];
};

export function TrendingTopicsClient({ topics }: TrendingTopicsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const trimmed = filter.trim().toLowerCase();
  const filtered = trimmed
    ? topics.filter((t) => t.toLowerCase().includes(trimmed))
    : topics;

  function handleApplyTag(tag: string) {
    router.push(`/?tag=${encodeURIComponent(tag)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && trimmed) {
      e.preventDefault();
      handleApplyTag(trimmed);
    }
  }

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
        <Hash className="size-5 shrink-0 text-emerald-500/90" />
        <span className="truncate">Trending Topics</span>
      </h2>
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search or type topic..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 pl-8 text-sm"
          aria-label="Search topics"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {trimmed ? "No matching topics" : "No topics yet"}
          </p>
        ) : (
          filtered.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              variant="subtle"
            />
          ))
        )}
      </div>
    </div>
  );
}
