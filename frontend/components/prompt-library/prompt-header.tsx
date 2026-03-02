"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowUp, GitFork, Pin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptStats } from "./prompt-stats";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  upvotePrompt,
  forkPrompt,
  fetchUpvoteStatus,
  setPromptPinned,
  updatePrompt,
  deletePrompt,
} from "@/lib/api";
import type { Prompt } from "@/lib/types";

type PromptHeaderProps = {
  prompt: Pick<
    Prompt,
    "title" | "description" | "stats" | "username" | "tags" | "primaryPrompt" | "guide" | "parentPromptId" | "visibility"
  >;
  promptId: string;
  promptAuthorUid?: string;
  parentPrompt?: {
    id: string;
    title: string;
    username: string;
    authorUid?: string;
  } | null;
  initialPinned?: boolean;
  className?: string;
};

export function PromptHeader({
  prompt,
  promptId,
  promptAuthorUid,
  parentPrompt = null,
  initialPinned = false,
  className,
}: PromptHeaderProps) {
  const router = useRouter();
  const { user, currentUser } = useAuth();
  const [upvotes, setUpvotes] = useState(prompt.stats.upvotes);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [forkLoading, setForkLoading] = useState(false);
  const [forkError, setForkError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [pinLoading, setPinLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(prompt.title);
  const [editDescription, setEditDescription] = useState(prompt.description);
  const [editPrimaryPrompt, setEditPrimaryPrompt] = useState(prompt.primaryPrompt ?? "");
  const [editGuide, setEditGuide] = useState(prompt.guide ?? "");
  const [editTags, setEditTags] = useState((prompt.tags ?? []).join(", "));
  const [editVisibility, setEditVisibility] = useState<"public" | "unlisted">(prompt.visibility ?? "public");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) => {
      fetchUpvoteStatus(promptId, token).then((r) => {
        if (r.success) setUpvoted(r.upvoted);
      });
    });
  }, [user, promptId]);

  const isOwner = Boolean(user?.uid && promptAuthorUid && user.uid === promptAuthorUid);

  async function handleUpvote() {
    if (!user) {
      router.push("/login");
      return;
    }
    setUpvoteLoading(true);
    try {
      const token = await user.getIdToken();
      const result = await upvotePrompt(token, promptId, currentUser?.username ?? currentUser?.profileSlug ?? undefined);
      if (result.success) {
        setUpvoted(result.upvoted);
        setUpvotes(result.upvotes);
      }
    } finally {
      setUpvoteLoading(false);
    }
  }

  async function handleFork() {
    if (!user || !currentUser) {
      router.push("/login");
      return;
    }
    const authorUsername = currentUser.username ?? currentUser.profileSlug;
    if (!authorUsername || !/^[a-z0-9_-]{3,30}$/.test(authorUsername)) {
      router.push("/profile/edit");
      return;
    }
    setForkLoading(true);
    setForkError(null);
    try {
      const token = await user.getIdToken();
      const result = await forkPrompt(token, promptId, authorUsername);
      if (result.success && result.prompt?.id) {
        const { emitExploreInvalidate } = await import("@/lib/explore-sync");
        emitExploreInvalidate();
        router.push(`/prompts/${result.prompt.id}`);
      } else if (!result.success && result.error) {
        setForkError(result.error);
      }
    } finally {
      setForkLoading(false);
    }
  }

  async function handleTogglePin() {
    if (!user || !isOwner) return;
    setPinLoading(true);
    try {
      const token = await user.getIdToken();
      const result = await setPromptPinned(token, promptId, !isPinned);
      if (result.success) {
        setIsPinned(result.prompt?.isPinned ?? !isPinned);
      }
    } finally {
      setPinLoading(false);
    }
  }

  async function handleSaveEdit() {
    if (!user || !isOwner) return;
    if (!editTitle.trim() || !editPrimaryPrompt.trim()) {
      setEditError("Title and primary prompt are required.");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const token = await user.getIdToken();
      const result = await updatePrompt(token, promptId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        primaryPrompt: editPrimaryPrompt.trim(),
        guide: editGuide.trim() ? editGuide.trim() : null,
        visibility: editVisibility,
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      if (!result.success) {
        setEditError(result.error);
        return;
      }
      setIsEditing(false);
      router.refresh();
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeletePrompt() {
    if (!user || !isOwner) return;
    const confirmed = window.confirm(
      "Delete this prompt permanently? This action cannot be undone."
    );
    if (!confirmed) return;
    setDeleteLoading(true);
    setEditError(null);
    try {
      const token = await user.getIdToken();
      const result = await deletePrompt(token, promptId);
      if (!result.success || !result.deleted) {
        setEditError(result.success ? "Failed to delete prompt" : result.error);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-2xl font-bold tracking-tight">{prompt.title}</h1>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-3">
            <PromptStats
              upvotes={upvotes}
              forks={prompt.stats.forks}
              views={prompt.stats.views}
              size="md"
            />
            <span className="min-w-0 truncate text-muted-foreground">by {prompt.username}</span>
            {prompt.parentPromptId && (
              <Link
                href={`/prompts/${prompt.parentPromptId}`}
                className="min-w-0 break-words text-xs text-muted-foreground hover:underline"
              >
                {parentPrompt
                  ? `Forked from ${parentPrompt.title} by @${parentPrompt.username}`
                  : "Forked from original prompt"}
              </Link>
            )}
          </div>
        </div>
      </div>
      <p className="min-w-0 break-words text-muted-foreground">{prompt.description}</p>
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {!isOwner && (
          <Button
            size="sm"
            variant={upvoted ? "default" : "outline"}
            className="gap-1"
            onClick={handleUpvote}
            disabled={upvoteLoading}
          >
            <ArrowUp className="size-4" />
            {upvoted ? "Upvoted" : "Upvote"}
          </Button>
        )}
        {!isOwner && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleFork}
              disabled={forkLoading}
            >
              <GitFork className="size-4" />
              Fork
            </Button>
            {forkError && (
              <span className="w-full text-xs text-destructive">{forkError}</span>
            )}
          </>
        )}
        {isOwner && (
          <Button
            size="sm"
            variant={isPinned ? "default" : "outline"}
            className="gap-1"
            onClick={handleTogglePin}
            disabled={pinLoading}
          >
            <Pin className="size-4" />
            {pinLoading ? "Updating..." : isPinned ? "Unpin project" : "Pin project"}
          </Button>
        )}
        {isOwner && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setIsEditing(true)}>
            <Pencil className="size-4" />
            Edit prompt
          </Button>
        )}
        {isOwner && (
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={handleDeletePrompt}
            disabled={deleteLoading}
          >
            <Trash2 className="size-4" />
            {deleteLoading ? "Deleting..." : "Delete prompt"}
          </Button>
        )}
      </div>
      {isEditing && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Edit prompt</h3>
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div>
              <p className="mb-2 text-sm font-medium">Visibility</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={editVisibility === "public" ? "default" : "outline"}
                  onClick={() => setEditVisibility("public")}
                >
                  Public
                </Button>
                <Button
                  size="sm"
                  variant={editVisibility === "unlisted" ? "default" : "outline"}
                  onClick={() => setEditVisibility("unlisted")}
                >
                  Unlisted
                </Button>
              </div>
            </div>
            <textarea
              rows={6}
              value={editPrimaryPrompt}
              onChange={(e) => setEditPrimaryPrompt(e.target.value)}
              placeholder="Primary prompt"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
            <textarea
              rows={4}
              value={editGuide}
              onChange={(e) => setEditGuide(e.target.value)}
              placeholder="Guide (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {editError && <p className="mt-2 text-sm text-destructive">{editError}</p>}
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
