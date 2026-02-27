import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
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
};

async function recordLoginToBackend(user: User) {
  try {
    await fetch(`${AUTH_SERVICE_URL}/api/auth/record-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        emailVerified: user.emailVerified ?? false,
      }),
    });
  } catch (err) {
    console.warn("[auth] Failed to record login to backend:", err);
  }
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await recordLoginToBackend(result.user);
  return result;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function fetchBackendUser(idToken: string): Promise<BackendUser | null> {
  const res = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ?? null;
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

/** Optional dev fallback: when backend returns 503 (no Firebase Admin), retry with uid + email in body */
export async function updateProfile(
  idToken: string,
  payload: UpdateProfilePayload,
  fallback?: { uid: string; email: string }
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
  // Dev fallback: backend may return 503 when Firebase Admin is not configured
  if (res.status === 503 && fallback?.uid && fallback?.email) {
    const retryRes = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        uid: fallback.uid,
        email: fallback.email,
      }),
    });
    if (retryRes.ok) {
      const data = await retryRes.json();
      return { updated: data?.user ?? null };
    }
    return { updated: null, errorMessage: await getError(retryRes) };
  }
  return { updated: null, errorMessage: await getError(res) };
}
