import { Suspense } from "react";
import { PullRequestsClient } from "./pull-requests-client";

export default async function PullRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: promptId } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PullRequestsClient promptId={promptId} />
    </Suspense>
  );
}
