"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/components/auth-provider";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { fetchFollowStatus, followUser, unfollowUser } from "@/lib/api";
import type { ProfileUser } from "@/lib/api";

type ProfileCardProps = {
  profileUser: ProfileUser;
  handle: string;
};

export function ProfileCard({ profileUser, handle }: ProfileCardProps) {
  const { user, currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(profileUser.isFollowing));
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [followersCount, setFollowersCount] = useState(profileUser.followersCount ?? 0);

  const displayName = profileUser.displayName ?? profileUser.username ?? handle;
  const isOwnProfile = Boolean(currentUser && profileUser.uid === currentUser.uid);
  // Always use backend (profileUser); currentUser mirrors backend after refetch
  const photoURL = profileUser.photoURL;

  async function handleToggleFollow() {
    if (!user || isOwnProfile) return;
    setIsUpdatingFollow(true);
    try {
      const token = await user.getIdToken();
      const result = isFollowing
        ? await unfollowUser(token, profileUser.uid)
        : await followUser(token, profileUser.uid);
      if (!result.success) return;
      setIsFollowing(result.following);
      setFollowersCount((prev) => (result.following ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsUpdatingFollow(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadFollowState() {
      if (!user || isOwnProfile) return;
      const token = await user.getIdToken();
      const status = await fetchFollowStatus(profileUser.uid, token);
      if (!cancelled && status.success) {
        setIsFollowing(status.isFollowing);
      }
    }
    loadFollowState();
    return () => {
      cancelled = true;
    };
  }, [user, isOwnProfile, profileUser.uid]);

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
            <span>{followersCount} Followers</span>
            <span>{profileUser.followingCount ?? 0} Following</span>
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
        {!isOwnProfile && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              className="flex-1"
              onClick={handleToggleFollow}
              disabled={!user || isUpdatingFollow}
            >
              {isUpdatingFollow ? "Updating..." : isFollowing ? "Following" : "Follow"}
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
