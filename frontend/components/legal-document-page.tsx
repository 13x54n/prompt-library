import type { ReactNode } from "react";

import { HeroHeader } from "@/components/header";

type LegalDocumentPageProps = {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalDocumentPage({
  title,
  lastUpdated,
  children,
}: LegalDocumentPageProps) {
  return (
    <>
      <HeroHeader />
      <main className="min-h-screen bg-background px-6 pb-20 pt-28 lg:px-12">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          {lastUpdated ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          ) : null}
          <div
            className={
              "mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground " +
              "[&_h2]:mt-10 [&_h2]:text-balance [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground " +
              "[&_h2:first-of-type]:mt-0 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:marker:text-muted-foreground " +
              "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-medium [&_strong]:text-foreground"
            }
          >
            {children}
          </div>
        </article>
      </main>
    </>
  );
}
