"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Users, FileText, MessageSquare, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Prompt, TrendingDeveloper, DiscussionQuestion } from "@/lib/types";

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
  users: TrendingDeveloper[];
  prompts: Pick<
    Prompt,
    "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username"
  >[];
  discussions?: DiscussionQuestion[];
};

const MOCK_DISCUSSIONS: DiscussionQuestion[] = [
  {
    id: "1",
    title: "How to handle edge cases in SEO audit?",
    body: "Looking for best practices...",
    author: "debugguru",
    createdAt: "2h ago",
    votes: 5,
    answerCount: 3,
  },
  {
    id: "2",
    title: "Suspense fallback not showing",
    body: "My fallback UI never appears...",
    author: "seo_ninja",
    createdAt: "1d ago",
    votes: 2,
    answerCount: 1,
  },
  {
    id: "3",
    title: "Best LLM prompt structure?",
    body: "What format works best for GPT-4?",
    author: "promptmaster",
    createdAt: "3d ago",
    votes: 8,
    answerCount: 5,
  },
];

function filterByQuery<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string
): T[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();
  return items.filter((item) => getSearchText(item).toLowerCase().includes(q));
}

export function SearchModal({
  open,
  onClose,
  users,
  prompts,
  discussions = MOCK_DISCUSSIONS,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredUsers = filterByQuery(users, query, (u) => u.username);
  const filteredPrompts = filterByQuery(
    prompts,
    query,
    (p) => `${p.title} ${p.description} ${p.tags.join(" ")}`
  );
  const filteredDiscussions = filterByQuery(
    discussions,
    query,
    (d) => `${d.title} ${d.body} ${d.author}`
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col rounded-lg border border-border bg-background shadow-lg">
        <div className="flex items-center gap-2 border-b border-border p-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search users, prompts, discussions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-label="Search"
            autoComplete="off"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="grid max-h-[60vh] overflow-y-auto sm:grid-cols-3">
          {/* Left: Users */}
          <div className="border-b sm:border-b-0 sm:border-r border-border">
            <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Users</span>
            </div>
            <div className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No users found
                </p>
              ) : (
                filteredUsers.map((dev) => (
                  <Link
                    key={dev.username}
                    href={`/profile/${encodeURIComponent(dev.username)}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {dev.displayName?.charAt(0) ?? dev.username.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">@{dev.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {dev.promptCount} prompts · {(dev.totalStars / 1000).toFixed(1)}k ★
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Middle: Prompts */}
          <div className="border-b sm:border-b-0 sm:border-r border-border">
            <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Prompts</span>
            </div>
            <div className="divide-y divide-border">
              {filteredPrompts.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No prompts found
                </p>
              ) : (
                filteredPrompts.map((prompt) => (
                  <Link
                    key={prompt.id}
                    href={`/prompts/${prompt.id}`}
                    onClick={onClose}
                    className="block px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">{prompt.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {prompt.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>@{prompt.username}</span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3" />
                        {prompt.stats.stars.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Right: Discussions */}
          <div>
            <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Discussions</span>
            </div>
            <div className="divide-y divide-border">
              {filteredDiscussions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No discussions found
                </p>
              ) : (
                filteredDiscussions.map((d) => (
                  <Link
                    key={d.id}
                    href={`/prompts/1#discussion-${d.id}`}
                    onClick={onClose}
                    className="block px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">{d.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {d.body}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>@{d.author}</span>
                      <span>{d.votes} votes</span>
                      <span>{d.answerCount} answers</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
