"use client";

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
import { LogOut, User, Bell, Plus } from "lucide-react";

function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 border border-border" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-3 text-center text-sm text-muted-foreground">
          No notifications yet
        </div>
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
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <NotificationDropdown />
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
      <NotificationDropdown />
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
            <Link href={`/profile/${encodeURIComponent(currentUser.profileSlug)}`} className="flex items-center gap-2">
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
