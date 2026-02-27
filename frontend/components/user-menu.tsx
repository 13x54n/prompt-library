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
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/lib/auth";
import { LogOut, User, Bell, Plus } from "lucide-react";

function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Notifications">
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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <NotificationDropdown />
        <Button variant="ghost" size="icon" className="size-8" asChild>
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

  const displayName = user.displayName ?? user.email ?? "User";
  // const photoURL = user?.photoURL;
  const photoURL = "https://images.unsplash.com/photo-1719342193714-472e327b4ada?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="flex items-center gap-1">
      <NotificationDropdown />
      <Button variant="ghost" size="icon" className="size-8" asChild>
        <Link href="/prompts/new" aria-label="Create prompt">
          <Plus className="size-4" />
        </Link>
      </Button>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full p-0">
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoURL}
              alt={displayName}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          {user.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${encodeURIComponent(user.displayName ?? user.uid)}`} className="flex items-center gap-2">
            <User className="size-4" />
            Profile
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
