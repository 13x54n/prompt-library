import Link from "next/link";
import { GitMerge, Star, GitFork, MessageCircle, AtSign, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "pr_review",
    title: "PR review requested",
    body: "seo_ninja requested your review on a pull request for Next.js SEO Checklist",
    link: "/prompts/1/pull-requests/1",
    read: false,
    createdAt: "5m ago",
    actor: "seo_ninja",
  },
  {
    id: "2",
    type: "star",
    title: "New star on your prompt",
    body: "debugguru starred Prompt Library",
    link: "/prompts/1",
    read: false,
    createdAt: "1h ago",
    actor: "debugguru",
  },
  {
    id: "3",
    type: "merge",
    title: "Pull request merged",
    body: "Your PR to React Suspense Debugging was merged by promptmaster",
    link: "/prompts/2/pull-requests/3",
    read: true,
    createdAt: "3h ago",
    actor: "promptmaster",
  },
  {
    id: "4",
    type: "comment",
    title: "New comment on discussion",
    body: "promptmaster replied to your question on AI Prompt Templates",
    link: "/prompts/3#discussion",
    read: true,
    createdAt: "1d ago",
    actor: "promptmaster",
  },
];

const typeIcons: Record<Notification["type"], React.ComponentType<{ className?: string }>> = {
  pr_review: MessageCircle,
  star: Star,
  fork: GitFork,
  comment: MessageCircle,
  mention: AtSign,
  merge: GitMerge,
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <Bell className="size-5" />
        Notifications
      </h1>

      {MOCK_NOTIFICATIONS.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
          <Bell className="mx-auto mb-4 size-12 opacity-50" />
          <p className="font-medium">No notifications yet</p>
          <p className="mt-1 text-sm">
            When someone stars your prompt, comments, or requests a review, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {MOCK_NOTIFICATIONS.map((n) => {
            const Icon = typeIcons[n.type];
            return (
              <li key={n.id}>
                <Link
                  href={n.link}
                  className={cn(
                    "flex gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50",
                    n.read ? "border-transparent bg-transparent" : "border-border bg-muted/30"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{n.createdAt}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
