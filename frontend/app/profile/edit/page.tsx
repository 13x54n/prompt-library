"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { updateProfile, checkUsernameAvailability } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2 } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, currentUser, loading, refetchBackendUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    setDisplayName(currentUser.displayName);
    setUsername(currentUser.username ?? "");
    setBio(currentUser.bio ?? "");
    setWebsite(currentUser.website ?? "");
  }, [loading, currentUser, router]);

  const checkUsername = useCallback(
    async (value: string) => {
      const raw = value.trim().toLowerCase();
      if (!raw || raw.length < 3) {
        setUsernameStatus("idle");
        setUsernameError(raw ? "At least 3 characters" : null);
        return;
      }
      if (!/^[a-z0-9_-]{3,30}$/.test(raw)) {
        setUsernameStatus("taken");
        setUsernameError("Only letters, numbers, underscores, hyphens");
        return;
      }
      if (!user) return;
      setUsernameStatus("checking");
      setUsernameError(null);
      const { available, error: err } = await checkUsernameAvailability(await user.getIdToken(), raw);
      setUsernameStatus(available ? "available" : "taken");
      setUsernameError(err ?? (available ? null : "Username is taken"));
    },
    [user]
  );

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus("idle");
      setUsernameError(null);
      return;
    }
    const t = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(t);
  }, [username, checkUsername]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const token = await user.getIdToken();
      if (username.trim().length >= 3) {
        if (usernameStatus === "checking") {
          setError("Please wait for username check to complete.");
          setSaving(false);
          return;
        }
        if (usernameStatus === "taken") {
          setError("Username is not available. Please choose another.");
          setSaving(false);
          return;
        }
      }
      const payload = {
        displayName: displayName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
      };
      const { updated, errorMessage } = await updateProfile(token, payload);
      if (updated) {
        await refetchBackendUser();
        const slug = updated.username ?? updated.displayName ?? user.uid;
        router.push(`/profile/${encodeURIComponent(slug)}`);
      } else {
        setError(errorMessage ?? "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <Link
            href={`/profile/${encodeURIComponent(currentUser.profileSlug)}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to profile
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="mt-1 text-muted-foreground">
          Update your display name, username (handle), bio, and website.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ming Open Web Headquarters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="e.g. ming_open_web"
                minLength={3}
                maxLength={30}
                className={usernameStatus === "taken" ? "border-destructive" : ""}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {usernameStatus === "checking" && <Loader2 className="size-4 animate-spin" />}
                {usernameStatus === "available" && <Check className="size-4 text-green-600" />}
                {usernameStatus === "taken" && <X className="size-4 text-destructive" />}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {usernameError
                ? usernameError
                : "3–30 characters, letters, numbers, underscores, or hyphens. Used for your profile URL and @mention."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio"
              rows={3}
              className="border-input placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/profile/${encodeURIComponent(currentUser.profileSlug)}`)
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
