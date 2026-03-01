"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/prompt-library";
import { useAuth } from "@/components/auth-provider";
import { createPrompt } from "@/lib/api";

export default function CreatePromptPage() {
  const router = useRouter();
  const { user, currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [primaryPrompt, setPrimaryPrompt] = useState("");
  const [guide, setGuide] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxDescLen = 350;
  const descCount = description.length;

  async function handleCreate() {
    setError(null);
    if (!user || !currentUser) {
      setError("Sign in to create a prompt.");
      return;
    }
    const authorUsername = currentUser.username ?? currentUser.profileSlug;
    if (!authorUsername || !/^[a-z0-9_-]{3,30}$/.test(authorUsername)) {
      setError("Set a username in your profile first (3–30 chars, letters, numbers, underscores, or hyphens).");
      return;
    }
    if (!title.trim()) {
      setError("Prompt name is required.");
      return;
    }
    if (!primaryPrompt.trim()) {
      setError("Primary prompt is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      const result = await createPrompt(token, {
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        primaryPrompt: primaryPrompt.trim(),
        guide: guide.trim() || undefined,
        authorUsername,
      });

      if (result.success && result.prompt?.id) {
        router.push(`/prompts/${result.prompt.id}`);
      } else {
        setError(result.success ? "Something went wrong." : result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prompt");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Create a new prompt</h1>
          <p className="mt-1 text-muted-foreground">
            Prompts can be shared, forked, and discovered by the community.
            Have one elsewhere?{" "}
            <Link
              href="/requests/new"
              className="text-primary hover:underline"
            >
              Request a prompt
            </Link>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Required fields are marked with an asterisk (*).
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: General */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                1
              </span>
              General
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Owner <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt=""
                    className="size-6 rounded-full"
                  />
                ) : (
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium">
                    {currentUser?.username?.[0] ?? "?"}
                  </span>
                )}
                <span className="font-medium">
                  {currentUser?.username ?? currentUser?.displayName ?? "Sign in to create"}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Prompt name <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  {currentUser?.username ?? "you"} /
                </span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="my-awesome-prompt"
                  className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Great prompt names are short and memorable.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={maxDescLen}
                rows={3}
                placeholder="A brief description of what this prompt does..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {descCount}/{maxDescLen} characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, seo, checklist"
                className="w-full"
              />
            </div>
          </section>

          {/* Section 2: Configuration */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                2
              </span>
              Configuration
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Choose visibility <span className="text-destructive">*</span>
              </label>
              <p className="mb-2 text-sm text-muted-foreground">
                Choose who can see and fork this prompt.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={visibility === "public" ? "default" : "outline"}
                  onClick={() => setVisibility("public")}
                >
                  Public
                </Button>
                <Button
                  size="sm"
                  variant={visibility === "unlisted" ? "default" : "outline"}
                  onClick={() => setVisibility("unlisted")}
                >
                  Unlisted
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Primary prompt <span className="text-destructive">*</span>
              </label>
              <p className="mb-2 text-sm text-muted-foreground">
                The main prompt text that users will copy and use.
              </p>
              <RichTextEditor
                content={primaryPrompt}
                onChange={setPrimaryPrompt}
                placeholder="Write your prompt here..."
                minHeight="200px"
              />
            </div>


          </section>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row gap-3">
            {!user ? (
              <Button size="lg" asChild>
                <Link href="/login">Sign in to create</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create prompt"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
