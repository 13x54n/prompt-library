"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitPullRequest, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { createPullRequest } from "@/lib/api";

type CreatePullRequestModalProps = {
  promptId: string;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreatePullRequestModal({
  promptId,
  onClose,
  onCreated,
}: CreatePullRequestModalProps) {
  const router = useRouter();
  const { user, currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [promptDiff, setPromptDiff] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user || !currentUser) {
      router.push("/login");
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const authorUsername = currentUser.username ?? currentUser.profileSlug ?? "unknown";
      const result = await createPullRequest(token, promptId, {
        title: title.trim(),
        body: body.trim() || undefined,
        authorUsername,
        promptDiff: promptDiff.trim() || undefined,
      });
      if (result.success && result.pullRequest) {
        onClose();
        onCreated?.();
        router.refresh();
      } else {
        setError(result.success ? "Something went wrong" : result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <GitPullRequest className="size-5" />
            New pull request
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              placeholder="Brief description of changes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description (optional)</label>
            <textarea
              placeholder="Describe your changes in detail..."
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Prompt diff (optional)</label>
            <textarea
              placeholder="Show the proposed changes to the prompt (e.g. + New line\n- Old line)"
              rows={6}
              value={promptDiff}
              onChange={(e) => setPromptDiff(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? "Creating…" : "Create pull request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
