"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PromptHeader, PromptCodeBlock } from "@/components/prompt-library";
import { cn } from "@/lib/utils";

export default function CreatePromptPage() {
  const [title, setTitle] = useState("Next.js SEO 2026");
  const [tags, setTags] = useState("nextjs, seo, app-router, checklist");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [primaryPrompt, setPrimaryPrompt] = useState(
    "Analyze my Next.js App Router project...\n{{paste your head tags here}}"
  );
  const [guide, setGuide] = useState("## When to use this prompt\nBest for Next.js 14+...");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Create Prompt</h1>
          <p className="mt-1 text-muted-foreground">
            Add a new prompt to the library
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Left: Form */}
          <aside className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Next.js SEO Checklist 2026"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tags <span className="text-destructive">*</span>
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, seo, app-router, checklist"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Visibility
              </label>
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
          </aside>

          {/* Right: Live Preview */}
          <main className="min-w-0">
            <div className="sticky top-8 space-y-6 rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Live Preview
              </h3>

              <div className="space-y-4">
                <PromptHeader
                  prompt={{
                    title,
                    description: "Complete technical...",
                    stats: { stars: 2300, forks: 847, views: 0 },
                    username: "you",
                  }}
                />

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Primary Prompt</h4>
                  <PromptCodeBlock content={primaryPrompt} />
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    Guide (optional)
                  </h4>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/30 p-4 font-mono text-sm text-muted-foreground">
                    {guide}
                  </pre>
                </div>
              </div>
            </div>
          </main>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Draft</Button>
          <Button>Publish</Button>
        </div>
      </div>
    </div>
  );
}
