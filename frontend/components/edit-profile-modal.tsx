"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { updateProfile, checkUsernameAvailability } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { X, Check, Loader2 } from "lucide-react";

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const router = useRouter();
  const { user, currentUser, refetchBackendUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !currentUser) return;
    setDisplayName(currentUser.displayName);
    setUsername(currentUser.username ?? "");
    setPhotoURL(currentUser.photoURL ?? "");
    setBio(currentUser.bio ?? "");
    setWebsite(currentUser.website ?? "");
    setError(null);
    setUsernameStatus("idle");
    setUsernameError(null);
  }, [open, currentUser]);

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
    if (!open || !username.trim()) {
      setUsernameStatus("idle");
      setUsernameError(null);
      return;
    }
    const t = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(t);
  }, [open, username, checkUsername]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    if (username.trim().length >= 3) {
      if (usernameStatus === "checking") {
        setError("Please wait for username check to complete.");
        return;
      }
      if (usernameStatus === "taken") {
        setError("Username is not available. Please choose another.");
        return;
      }
    }
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const payload = {
        displayName: displayName.trim() || null,
        username: username.trim() || null,
        photoURL: photoURL.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
      };
      const { updated, errorMessage } = await updateProfile(token, payload);
      if (updated) {
        await refetchBackendUser();
        const profileSlug = updated.username ?? updated.displayName ?? updated.uid ?? user.uid;
        router.push(`/profile/${encodeURIComponent(profileSlug)}`);
        router.refresh();
        onClose();
      } else {
        setError(errorMessage ?? "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-background p-4 shadow-lg sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="edit-profile-title" className="text-xl font-semibold">
            Edit profile
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <UserAvatar
                photoURL={photoURL || null}
                name={displayName}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <Input
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://... (image URL)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-displayName">Display name</Label>
            <Input
              id="modal-displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ming Open Web Headquarters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-username">Username</Label>
            <div className="relative">
              <Input
                id="modal-username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                }
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
              {usernameError ?? "3–30 characters, letters, numbers, underscores, or hyphens."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-bio">Bio</Label>
            <textarea
              id="modal-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio"
              rows={3}
              className="border-input placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-website">Website</Label>
            <Input
              id="modal-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
