import Link from "next/link";
import { MessageCircle, Eye } from "lucide-react";
import type { PromptRequest } from "@/lib/types";

const MOCK_REQUESTS: PromptRequest[] = [
  {
    id: "1",
    title: "Need SEO prompt for SvelteKit + Prismic",
    body: "Looking for a prompt that audits SvelteKit + Prismic setups for SEO. Tech: SvelteKit 2.0, Prismic, Vercel Edge. Desired: checklist + prioritized fixes.",
    author: "newbie_dev",
    createdAt: "2h ago",
    views: 127,
    comments: 3,
    tech: ["SvelteKit 2.0", "Prismic", "Vercel Edge"],
    desired: ["checklist", "prioritized fixes"],
    answers: [
      {
        id: "a1",
        content: `Audit SvelteKit + Prismic SEO...
1. Check meta generation...
{{paste your +layout.svelte}}`,
        author: "sveltepro",
        createdAt: "1h ago",
        votes: 23,
        accepted: true,
      },
      {
        id: "a2",
        content: "Shorter version that focuses on meta tags only...",
        author: "anotherdev",
        createdAt: "30m ago",
        votes: 8,
      },
    ],
  },
];

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Request Prompt</h1>
          <p className="mt-1 text-muted-foreground">
            Ask the community for prompts. Stack Overflow-style Q&A.
          </p>
        </header>

        <div className="space-y-6">
          {MOCK_REQUESTS.map((request) => (
            <article
              key={request.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <div className="p-6">
                <div className="mb-2 flex items-start gap-2">
                  <span className="text-muted-foreground" aria-hidden>
                    ❓
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/requests/${request.id}`}
                      className="font-semibold hover:underline"
                    >
                      {request.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      by @{request.author} · {request.createdAt} ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-4" />
                        {request.views}
                      </span>{" "}
                      ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="size-4" />
                        {request.comments}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-muted-foreground">{request.body}</p>

                {request.tech && request.tech.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tech: {request.tech.join(", ")}
                  </p>
                )}
                {request.desired && request.desired.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Desired: {request.desired.join(", ")}
                  </p>
                )}
              </div>

              {request.answers && request.answers.length > 0 && (
                <div className="border-t border-border">
                  {request.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`border-t border-border p-6 ${
                        answer.accepted
                          ? "border-l-4 border-l-green-500 bg-green-500/5"
                          : ""
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`flex items-center gap-2 text-sm font-medium ${
                            answer.accepted
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {answer.accepted && "🟢"} @{answer.author} ·{" "}
                          {answer.createdAt}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ⭐ {answer.votes}
                        </span>
                      </div>
                      <pre className="overflow-x-auto rounded-md bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
                        <code>{answer.content}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
