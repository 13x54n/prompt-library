"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X, Users, FileText, MessageSquare, ArrowUp, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { fetchPopularTags, fetchPrompts, searchDiscussions, searchUsers } from "@/lib/api";
import type { SearchDiscussion, SearchUser } from "@/lib/api";
import type { Prompt } from "@/lib/types";

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [prompts, setPrompts] = useState<
    Pick<Prompt, "id" | "title" | "description" | "tags" | "stats" | "lastUpdated" | "username">[]
  >([]);
  const [discussions, setDiscussions] = useState<SearchDiscussion[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedQuery = query.trim();
  const shouldSearch = open && trimmedQuery.length > 0;

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
    if (!shouldSearch) return;

    const timer = setTimeout(async () => {
      const [usersRes, promptsRes, discussionsRes, tagsRes] = await Promise.all([
        searchUsers(trimmedQuery, 8),
        fetchPrompts({ q: trimmedQuery, sort: "createdAt", limit: 8 }),
        searchDiscussions(trimmedQuery, 8),
        fetchPopularTags(15, trimmedQuery),
      ]);

      setUsers(usersRes.success ? usersRes.users : []);
      setPrompts(promptsRes.success ? promptsRes.prompts : []);
      setDiscussions(discussionsRes.success ? discussionsRes.discussions : []);
      setTopics(tagsRes.success ? tagsRes.tags : []);
    }, 250);

    return () => clearTimeout(timer);
  }, [shouldSearch, trimmedQuery]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-3 pb-6 pt-[10vh] sm:px-4 sm:pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className="absolute inset-0 bg-background"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 flex max-h-[85dvh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <div className="flex shrink-0 items-center gap-2 border-b border-border p-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search users, prompts, discussions, topics..."
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

        <div className="grid min-h-0 flex-1 overflow-y-auto sm:grid-cols-4">
          {/* Left: Users */}
          <div className="border-b sm:border-b-0 sm:border-r border-border">
            <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Users</span>
            </div>
            <div className="divide-y divide-border">
              {!shouldSearch || users.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No users found
                </p>
              ) : (
                users.map((dev) => (
                  <Link
                    key={dev.uid}
                    href={`/profile/${encodeURIComponent(dev.uid ?? dev.username ?? "")}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <UserAvatar
                      photoURL={dev.photoURL ?? null}
                      name={dev.displayName ?? dev.username ?? "User"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">@{dev.username ?? dev.uid}</p>
                      <p className="truncate text-xs text-muted-foreground">{dev.bio || "Developer profile"}</p>
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
              {!shouldSearch || prompts.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No prompts found
                </p>
              ) : (
                prompts.map((prompt) => (
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
                        <ArrowUp className="size-3" />
                        {prompt.stats.upvotes.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Third: Discussions */}
          <div className="border-b sm:border-b-0 sm:border-r border-border">
            <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Discussions</span>
            </div>
            <div className="divide-y divide-border">
              {!shouldSearch || discussions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No discussions found
                </p>
              ) : (
                discussions.map((d) => (
                  <Link
                    key={d.id}
                    href={`/prompts/${d.promptId}#discussion-${d.id}`}
                    onClick={onClose}
                    className="block px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">{d.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {d.matchedAnswerSnippet ?? d.body}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="min-w-0 truncate sm:max-w-[120px]">{d.promptTitle}</span>
                      <span>@{d.author}</span>
                      <span>{d.votes} votes</span>
                      <span>{d.answerCount} answers</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Fourth: Topics */}
          <div>
            <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
              <Hash className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Topics</span>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {!shouldSearch || topics.length === 0 ? (
                <p className="w-full py-4 text-center text-sm text-muted-foreground">
                  No topics found
                </p>
              ) : (
                topics.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    onClick={onClose}
                    className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    #{tag}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
