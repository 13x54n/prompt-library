import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Request a Prompt",
  description:
    "Ask the community for a prompt. Describe what you need, your tech stack, and get help from other developers.",
};

export default function NewRequestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Request a Prompt</h1>
          <p className="mt-1 text-muted-foreground">
            Ask the community for a prompt. Describe what you need and the tech stack.
          </p>
        </header>

        <form className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Need SEO prompt for SvelteKit + Prismic"
              className="text-lg"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Details <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder="Looking for a prompt that audits SvelteKit + Prismic setups..."
              rows={6}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Tech stack</label>
            <Input placeholder="SvelteKit 2.0, Prismic, Vercel Edge" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              What you need
            </label>
            <Input placeholder="checklist, prioritized fixes" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Post Request</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
