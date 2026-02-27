"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

type ProfileEditButtonProps = {
  profileIdentifier: string;
};

export function ProfileEditButton({ profileIdentifier }: ProfileEditButtonProps) {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.profileSlug !== profileIdentifier) return null;

  return (
    <Button size="sm" variant="outline" className="flex-1" asChild>
      <Link href="/profile/edit">Edit Profile</Link>
    </Button>
  );
}
