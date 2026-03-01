"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GitMerge, ArrowUp, GitFork, MessageCircle, Bell, UserPlus } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  archiveAllNotifications,
  archiveNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api";

const typeIcons: Record<ApiNotification["type"], React.ComponentType<{ className?: string }>> = {
  prompt_forked: GitFork,
  prompt_upvoted: ArrowUp,
  discussion_answered: MessageCircle,
  discussion_replied: MessageCircle,
  discussion_question_on_my_prompt: MessageCircle,
  pr_created: MessageCircle,
  pr_commented: MessageCircle,
  pr_merged: GitMerge,
  user_followed: UserPlus,
};

export function NotificationsPageClient() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [archivingAll, setArchivingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) {
          setItems([]);
          setIsLoading(false);
        }
        return;
      }
      const token = await user.getIdToken();
      const result = await fetchNotifications(token, { limit: 50 });
      if (!cancelled) {
        setItems(result.success ? result.notifications : []);
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleMarkAllRead() {
    if (!user) return;
    setMarkingAll(true);
    try {
      const token = await user.getIdToken();
      const result = await markAllNotificationsRead(token);
      if (result.success) {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkRead(id: string) {
    if (!user) return;
    const token = await user.getIdToken();
    const result = await markNotificationRead(token, id);
    if (result.success) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  }

  async function handleArchive(id: string) {
    if (!user) return;
    const token = await user.getIdToken();
    const result = await archiveNotification(token, id);
    if (result.success) {
      setItems((prev) => prev.filter((n) => n.id !== id));
    }
  }

  async function handleArchiveAll() {
    if (!user) return;
    setArchivingAll(true);
    try {
      const token = await user.getIdToken();
      const result = await archiveAllNotifications(token);
      if (result.success) {
        setItems([]);
      }
    } finally {
      setArchivingAll(false);
    }
  }

  if (loading || isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 text-sm text-muted-foreground">Loading notifications...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="size-5" />
          Notifications
        </h1>
        {user && items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
            <button
              type="button"
              onClick={handleArchiveAll}
              disabled={archivingAll}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {archivingAll ? "Archiving..." : "Archive all"}
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
          <Bell className="mx-auto mb-4 size-12 opacity-50" />
          <p className="font-medium">No notifications yet</p>
          <p className="mt-1 text-sm">When someone interacts with your prompts, you&apos;ll see updates here.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((n) => {
            const Icon = typeIcons[n.type];
            return (
              <li key={n.id}>
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50",
                    n.read ? "border-transparent bg-transparent" : "border-border bg-muted/30"
                  )}
                >
                  <Link
                    href={n.link}
                    onClick={() => {
                      if (!n.read) void handleMarkRead(n.id);
                    }}
                    className="flex min-w-0 flex-1 gap-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                      {n.body && <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleArchive(n.id)}
                    className="shrink-0 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Archive
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
