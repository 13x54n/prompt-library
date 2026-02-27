import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, BarChart3, Users, Coffee } from "lucide-react";
import {
  PromptHeader,
  VariantCard,
  PromptCodeBlock,
  DiscussionSection,
} from "@/components/prompt-library";
import { PullRequestsSidebar } from "@/components/pull-requests-sidebar";
import { UserAvatar } from "@/components/user-avatar";
import type { Prompt, DiscussionQuestion, DiscussionAnswer } from "@/lib/types";

// Mock data - replace with API/fetch
const MOCK_PROMPT: Prompt = {
  id: "1",
  title: "Next.js SEO Checklist 2026",
  description:
    "Complete technical + content SEO audit for Next.js App Router projects. Covers meta tags, structured data, sitemaps, and content gaps.",
  tags: ["nextjs", "seo", "app-router", "checklist"],
  stats: { upvotes: 2300, forks: 847, views: 12000 },
  lastUpdated: "2h ago",
  username: "seo_ninja",
  primaryPrompt: `Analyze my Next.js App Router project for SEO issues.

1. Technical checklist:
   - Meta tags (title, description, OG, Twitter)
   - Canonical URLs
   - Sitemap and robots.txt
   - Structured data (JSON-LD)

2. Content checklist:
   - Heading hierarchy
   - Image alt text
   - Internal linking

{{paste your head tags here}}`,
  parameters: [
    { name: "Project", placeholder: "Project path or URL" },
    { name: "Head tags", placeholder: "Paste your head tags" },
    {
      name: "Tone",
      type: "select",
      placeholder: "Detailed",
    },
  ],
  variants: [
    {
      id: "v1",
      content: `Shorter version for quick audits, focuses on meta + canonical.
{{head_tags}}`,
      author: "nextguru",
      votes: 847,
      accepted: true,
    },
    {
      id: "v2",
      content: `Extended version with Core Web Vitals...`,
      author: "perfpro",
      votes: 234,
    },
  ],
  guide: `## When to use this prompt

Best for Next.js 14+ App Router sites. Use before launch or during quarterly audits.

## Example Output

\`\`\`markdown
✅ Meta title present
❌ Missing canonical tags
⚠️ Consider adding JSON-LD for Article
\`\`\``,
};

const MOCK_QUESTIONS: DiscussionQuestion[] = [
  {
    id: "q1",
    title: "How do I add custom meta tags for social sharing?",
    body: "I'm using the App Router and want to add Open Graph and Twitter card meta tags. What's the recommended approach?",
    author: "nextdev",
    createdAt: "2 days ago",
    votes: 12,
    answerCount: 2,
    acceptedAnswerId: "a1",
  },
  {
    id: "q2",
    title: "Does this work with Next.js 15?",
    body: "I see the prompt mentions Next.js 14+. Has anyone tested with the latest Next.js 15?",
    author: "early_adopter",
    createdAt: "1 day ago",
    votes: 5,
    answerCount: 1,
  },
];

const MOCK_ANSWERS: Record<string, DiscussionAnswer[]> = {
  q1: [
    {
      id: "a1",
      questionId: "q1",
      content: "Use the Metadata API in your layout.tsx or page.tsx. Export a metadata object or generateMetadata function. For dynamic OG images, use the ImageResponse API.",
      author: "seo_ninja",
      createdAt: "1 day ago",
      votes: 24,
      accepted: true,
    },
    {
      id: "a2",
      questionId: "q1",
      content: "You can also use next-seo or similar packages, but the built-in Metadata API is now the recommended approach.",
      author: "nextguru",
      createdAt: "1 day ago",
      votes: 8,
    },
  ],
  q2: [
    {
      id: "a3",
      questionId: "q2",
      content: "Yes, works great with Next.js 15. The Metadata API hasn't changed significantly.",
      author: "seo_ninja",
      createdAt: "12h ago",
      votes: 3,
    },
  ],
};

const MOCK_CONTRIBUTORS = [
  { username: "seo_ninja", contributions: 12, avatar: null },
  { username: "nextguru", contributions: 8, avatar: null },
  { username: "perfpro", contributions: 4, avatar: null },
];

const MOCK_PULL_REQUESTS = [
  { id: "pr1", title: "Add Core Web Vitals section", author: "perfpro", status: "open", createdAt: "3d ago" },
  { id: "pr2", title: "Support for i18n meta tags", author: "i18n_dev", status: "open", createdAt: "1w ago" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const prompt = MOCK_PROMPT; // In real app: fetch by id
  return {
    title: prompt.title,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description: prompt.description,
    },
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prompt = MOCK_PROMPT; // In real app: fetch by id

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden bg-background">
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-1 flex-col gap-8 overflow-hidden px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[200px_1fr_240px] lg:grid-rows-[1fr] lg:items-stretch">
          {/* Left sidebar: Pull requests - fixed, does not scroll */}
          <div className="order-2 shrink-0 self-start lg:order-1">
            <PullRequestsSidebar
              promptId={id}
              pullRequests={MOCK_PULL_REQUESTS}
            />
          </div>

          {/* Main content - only this scrolls */}
          <main className="order-1 min-h-0 min-w-0 flex-1 overflow-y-auto lg:order-2">
            {/* Overview */}
            <div id="overview" className="scroll-mt-8 space-y-8">
              <PromptHeader prompt={prompt} />

              <section>
                <h2 className="mb-3 text-lg font-semibold">Primary Prompt</h2>
                <PromptCodeBlock content={prompt.primaryPrompt} />
              </section>
            </div>

            {/* Discussion */}
            <div id="discussion" className="scroll-mt-8 mt-5">
              <DiscussionSection
                questions={MOCK_QUESTIONS}
                answersByQuestion={MOCK_ANSWERS}
              />
            </div>
          </main>

          {/* Right sidebar: Contributors & Insights - fixed, does not scroll */}
          <aside className="order-3 shrink-0 self-start space-y-6 lg:sticky lg:top-0">
            
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BarChart3 className="size-4" />
                Insights
              </h3>
              <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Views (7d)</span>
                  <span className="font-medium">{prompt.stats.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Forks</span>
                  <span className="font-medium">{prompt.stats.forks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Upvotes</span>
                  <span className="font-medium">{prompt.stats.upvotes.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="size-4" />
                Contributors
              </h3>
              <div className="rounded-lg border border-border bg-card">
                <div className="divide-y divide-border">
                  {MOCK_CONTRIBUTORS.map((c) => (
                    <Link
                      key={c.username}
                      href={`/profile/${c.username}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <UserAvatar
                        photoURL={c.avatar ?? null}
                        name={c.username}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">@{c.username}</p>
                        <p className="text-xs text-muted-foreground">{c.contributions} contributions</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={`https://buymeacoffee.com/${prompt.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/15"
            >
              <Coffee className="size-4" />
              Sponsor @{prompt.username}
            </a>
          </aside>
      </div>
    </div>
  );
}
