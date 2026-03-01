"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/lib/auth";
import { fetchNotifications, fetchUnreadNotificationCount, type ApiNotification } from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import { LogOut, User, Bell, Plus } from "lucide-react";

function NotificationDropdown({ user }: { user: { getIdToken: () => Promise<string> } | null }) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      if (!user) {
        if (!cancelled) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }
      const token = await user.getIdToken();
      const [listRes, countRes] = await Promise.all([
        fetchNotifications(token, { limit: 5 }),
        fetchUnreadNotificationCount(token),
      ]);
      if (cancelled) return;
      setNotifications(listRes.success ? listRes.notifications : []);
      setUnreadCount(countRes.success ? countRes.unreadCount : 0);
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8 border border-border" aria-label="Notifications">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="px-2 py-3 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={n.link} className="flex flex-col items-start gap-0.5 py-2">
                <span className="line-clamp-1 text-sm">{n.title}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{n.body ?? formatRelative(n.createdAt)}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center justify-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  const { user, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <NotificationDropdown user={user} />
        <Button variant="ghost" size="icon" className="size-8 border border-border" asChild>
          <Link href="/prompts/new" aria-label="Create prompt">
            <Plus className="size-4" />
          </Link>
        </Button>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <NotificationDropdown user={user} />
      <Button variant="ghost" size="icon" className="size-8 border border-border" asChild>
        <Link href="/prompts/new" aria-label="Create prompt">
          <Plus className="size-4" />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative size-8 rounded-full p-0">
            <UserAvatar photoURL={currentUser.photoURL} name={currentUser.displayName} size="sm" className="size-8" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/profile/${encodeURIComponent(currentUser.uid)}`} className="flex items-center gap-2">
              <User className="size-4" />
              My profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut()}
            className="flex items-center gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
