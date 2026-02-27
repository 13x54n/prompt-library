"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/components/auth-provider";
import { EditProfileModal } from "@/components/edit-profile-modal";
import type { ProfileUser } from "@/lib/api";

type ProfileCardProps = {
  profileUser: ProfileUser;
  handle: string;
};

export function ProfileCard({ profileUser, handle }: ProfileCardProps) {
  const { currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const displayName = profileUser.displayName ?? profileUser.username ?? handle;
  const isOwnProfile =
    currentUser &&
    (profileUser.uid === currentUser.uid || currentUser.profileSlug === handle);
  const photoURL =
    isOwnProfile && currentUser
      ? (currentUser.photoURL ?? profileUser.photoURL)
      : profileUser.photoURL;

  return (
    <>
      <aside className="space-y-4">
        <div>
          <div className="flex size-60 items-center justify-center rounded-full bg-muted-foreground/20 p-2">
            <UserAvatar photoURL={photoURL} name={displayName} size="xl" />
          </div>

          <h1 className="mt-4 text-2xl font-bold">{displayName}</h1>
          <div>
            <h2 className="font-semibold text-muted-foreground">@{handle}</h2>
          </div>

          <div className="mt-4 flex gap-2 text-sm text-muted-foreground">
            <span>0 Followers</span>
            <span>0 Following</span>
          </div>

          {profileUser.bio && (
            <p className="text-muted-foreground mt-2 text-sm">{profileUser.bio}</p>
          )}
        </div>

        {isOwnProfile && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        )}

        {profileUser.website && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="size-4 shrink-0" />
            <a
              href={profileUser.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-foreground"
            >
              {profileUser.website}
            </a>
          </div>
        )}
      </aside>

      <EditProfileModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
