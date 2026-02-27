import type { Metadata } from "next";

// In real app: fetch prompt by id for title
const MOCK_PROMPT_TITLE = "Next.js SEO Checklist 2026";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // In real app: fetch prompt by id
  return {
    title: `Pull Requests · ${MOCK_PROMPT_TITLE}`,
    description: `View and manage pull requests for ${MOCK_PROMPT_TITLE}.`,
  };
}

export default function PullRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
