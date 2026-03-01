"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  GitMerge,
  ArrowUp,
  GitFork,
  MessageCircle,
  Bell,
  UserPlus,
  GitPullRequest,
  MessageSquareReply,
  HelpCircle,
} from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import {
  archiveAllNotifications,
  archiveNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api";
import { emitUnreadNotificationCount } from "@/lib/notification-sync";

const typeIcons: Record<ApiNotification["type"], React.ComponentType<{ className?: string }>> = {
  prompt_forked: GitFork,
  prompt_upvoted: ArrowUp,
  discussion_answered: MessageSquareReply,
  discussion_replied: MessageCircle,
  discussion_question_on_my_prompt: HelpCircle,
  pr_created: GitPullRequest,
  pr_commented: MessageSquareReply,
  pr_merged: GitMerge,
  user_followed: UserPlus,
};

export function NotificationsPageClient() {
  const { user, loading } = useAuth();
  const [activeItems, setActiveItems] = useState<ApiNotification[]>([]);
  const [archivedItems, setArchivedItems] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [archivingAll, setArchivingAll] = useState(false);
  const [tab, setTab] = useState<"all" | "unread" | "archived">("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) {
          setActiveItems([]);
          setArchivedItems([]);
          setIsLoading(false);
        }
        return;
      }
      const token = await user.getIdToken();
      const [activeResult, archivedResult] = await Promise.all([
        fetchNotifications(token, { limit: 100 }),
        fetchNotifications(token, { limit: 100, includeArchived: true }),
      ]);
      if (!cancelled) {
        setActiveItems(activeResult.success ? activeResult.notifications : []);
        const archivedOnly = archivedResult.success
          ? archivedResult.notifications.filter((item) => item.archived)
          : [];
        setArchivedItems(archivedOnly);
        const unread = activeResult.success
          ? activeResult.notifications.filter((item) => !item.read).length
          : 0;
        emitUnreadNotificationCount(unread);
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
        setActiveItems((prev) => {
          const next = prev.map((n) => ({ ...n, read: true }));
          emitUnreadNotificationCount(0);
          return next;
        });
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
      setActiveItems((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        const unread = next.filter((item) => !item.read).length;
        emitUnreadNotificationCount(unread);
        return next;
      });
      setArchivedItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  }

  async function handleArchive(id: string) {
    if (!user) return;
    const token = await user.getIdToken();
    const result = await archiveNotification(token, id);
    if (result.success) {
      const item = activeItems.find((notification) => notification.id === id);
      setActiveItems((prev) => {
        const next = prev.filter((n) => n.id !== id);
        const unread = next.filter((notification) => !notification.read).length;
        emitUnreadNotificationCount(unread);
        return next;
      });
      if (item) {
        setArchivedItems((prev) => [{ ...item, archived: true, read: true }, ...prev]);
      }
    }
  }

  async function handleArchiveAll() {
    if (!user) return;
    setArchivingAll(true);
    try {
      const token = await user.getIdToken();
      const result = await archiveAllNotifications(token);
      if (result.success) {
        setArchivedItems((prev) => [
          ...activeItems.map((item) => ({ ...item, archived: true, read: true })),
          ...prev,
        ]);
        setActiveItems([]);
        emitUnreadNotificationCount(0);
      }
    } finally {
      setArchivingAll(false);
    }
  }

  if (loading || isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 text-sm text-muted-foreground">Loading notifications...</div>;
  }

  const displayed =
    tab === "all"
      ? activeItems
        : archivedItems;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="size-5" />
          Notifications
        </h1>
        {user && activeItems.length > 0 && (
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

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "all" ? "bg-background font-medium" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("all")}
        >
          All {activeItems.length}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "archived" ? "bg-background font-medium" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("archived")}
        >
          Archived {archivedItems.length}
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
          <Bell className="mx-auto mb-4 size-12 opacity-50" />
          <p className="font-medium">
            {tab === "archived" ? "No archived notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm">
            When someone interacts with your prompts, you&apos;ll see updates here.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {displayed.map((n) => {
            const Icon = typeIcons[n.type];
            const metadata = n.metadata ?? {};
            const contributionPreview =
              typeof metadata.commentBodyPreview === "string"
                ? metadata.commentBodyPreview
                : typeof metadata.answerContentPreview === "string"
                  ? metadata.answerContentPreview
                : typeof metadata.questionTitle === "string"
                  ? metadata.questionTitle
                  : typeof metadata.prTitle === "string"
                    ? metadata.prTitle
                    : null;
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
                      if (!n.read && tab !== "archived") void handleMarkRead(n.id);
                    }}
                    className="flex min-w-0 flex-1 gap-3"
                  >
                    <div className="relative mt-0.5 shrink-0">
                      <UserAvatar photoURL={null} name={n.actor ?? "System"} size="sm" />
                      <span className="absolute -bottom-1 -right-1 rounded-full border border-background bg-muted p-0.5">
                        <Icon className="size-3 text-muted-foreground" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                      {n.body && <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>}
                      {contributionPreview && (
                        <div className="mt-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                          {contributionPreview}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
                    </div>
                  </Link>
                  {tab !== "archived" && (
                    <button
                      type="button"
                      onClick={() => void handleArchive(n.id)}
                      className="shrink-0 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
