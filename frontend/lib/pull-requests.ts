// Shared PR data - replace with API/fetch
export const MOCK_PRS: Record<
  string,
  {
    id: string;
    title: string;
    body: string;
    author: string;
    status: "open" | "closed" | "merged";
    createdAt: string;
    baseBranch: string;
    headBranch: string;
    promptDiff?: string;
    comments: { id: string; author: string; body: string; createdAt: string }[];
  }
> = {
  pr1: {
    id: "pr1",
    title: "Add Core Web Vitals section",
    body: `Adds a new section to the checklist for Core Web Vitals (LCP, FID, CLS).

## Changes
- New "Core Web Vitals" section in the technical checklist
- Prompts for analyzing LCP, FID, and CLS metrics
- Recommendations for improving each metric

## Motivation
Many Next.js projects need to meet Core Web Vitals for SEO. This extends the existing SEO checklist to cover performance metrics.`,
    author: "perfpro",
    status: "open",
    createdAt: "3 days ago",
    baseBranch: "main",
    headBranch: "perfpro/cwv-section",
    promptDiff: `+ ## Core Web Vitals
+ 
+ 3. Performance checklist:
+    - Largest Contentful Paint (LCP)
+    - First Input Delay (FID)
+    - Cumulative Layout Shift (CLS)
+    - Use \`next/image\` and \`next/font\` for optimization`,
    comments: [
      {
        id: "c1",
        author: "seo_ninja",
        body: "Great addition! Should we also include INP (Interaction to Next Paint) since it replaces FID?",
        createdAt: "2 days ago",
      },
      {
        id: "c2",
        author: "perfpro",
        body: "Good point! I'll add INP to the next commit.",
        createdAt: "1 day ago",
      },
    ],
  },
  pr2: {
    id: "pr2",
    title: "Support for i18n meta tags",
    body: `Extends the meta tags section to include hreflang and alternate language support for internationalized sites.

## Changes
- Add hreflang tag validation
- Alternate language link checks
- Locale-specific meta tag recommendations`,
    author: "i18n_dev",
    status: "open",
    createdAt: "1 week ago",
    baseBranch: "main",
    headBranch: "i18n_dev/i18n-meta",
    comments: [
      {
        id: "c3",
        author: "seo_ninja",
        body: "LGTM! This would be helpful for our multi-region site.",
        createdAt: "5 days ago",
      },
    ],
  },
  pr3: {
    id: "pr3",
    title: "Fix typo in structured data example",
    body: "Corrects a typo in the JSON-LD example (Article -> article).",
    author: "copy_fix",
    status: "merged",
    createdAt: "2 weeks ago",
    baseBranch: "main",
    headBranch: "copy_fix/typo-fix",
    promptDiff: `- "@type": "Article"
+ "@type": "article"`,
    comments: [],
  },
};
