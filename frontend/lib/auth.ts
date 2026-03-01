import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:5001";

export type BackendUser = {
  id: string;
  uid: string;
  email: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio: string | null;
  website: string | null;
  emailVerified: boolean;
  lastLoginAt?: string;
  /** "google" | "password" – distinguishes OAuth vs backend auth */
  provider?: string;
};

/** Derive provider from Firebase user (google.com -> "google", password -> "password") */
function getProviderFromUser(user: User): string {
  const providerId = user.providerData?.[0]?.providerId ?? "";
  if (providerId === "password") return "password";
  return "google";
}

/** Ensures backend has the user record; call before fetchBackendUser to avoid 404 race. */
export async function recordLoginToBackend(user: User) {
  try {
    const token = await user.getIdToken();
    await fetch(`${AUTH_SERVICE_URL}/api/auth/record-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        emailVerified: user.emailVerified ?? false,
        provider: getProviderFromUser(user),
      }),
    });
  } catch (err) {
    console.warn("[auth] Failed to record login to backend:", err);
  }
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  // Auth listener will also call recordLoginToBackend before fetch; this ensures backend has user ASAP
  await recordLoginToBackend(result.user);
  return result;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onIdTokenChanged(auth, callback);
}

export async function fetchBackendUser(idToken: string): Promise<BackendUser | null> {
  const res = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ?? null;
}

/** Check if a username is available (no one has it, or it's the current user's). Requires auth token. */
export async function checkUsernameAvailability(
  idToken: string,
  username: string
): Promise<{ available: boolean; error?: string }> {
  const raw = username.trim().toLowerCase();
  if (!raw) return { available: false, error: "Username is required" };
  if (!/^[a-z0-9_-]{3,30}$/.test(raw)) {
    return { available: false, error: "3–30 characters, letters, numbers, underscores, or hyphens." };
  }
  try {
    const res = await fetch(
      `${AUTH_SERVICE_URL}/api/auth/check-username?username=${encodeURIComponent(raw)}`,
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { available: false, error: data?.error ?? "Check failed" };
    return { available: !!data.available };
  } catch {
    return { available: false, error: "Check failed" };
  }
}

export type UpdateProfilePayload = {
  displayName?: string | null;
  username?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  website?: string | null;
};

export type UpdateProfileResult = {
  updated: BackendUser | null;
  errorMessage?: string;
};

export async function updateProfile(
  idToken: string,
  payload: UpdateProfilePayload
): Promise<UpdateProfileResult> {
  const res = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  const getError = async (r: Response) => {
    const data = await r.json().catch(() => ({}));
    return (data?.error as string) || "Failed to update profile";
  };
  if (res.ok) {
    const data = await res.json();
    return { updated: data?.user ?? null };
  }
  return { updated: null, errorMessage: await getError(res) };
}
