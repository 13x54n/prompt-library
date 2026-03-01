"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthState, fetchBackendUser, recordLoginToBackend, type BackendUser } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";

/** Unified logged-in user. Profile data (photo, name, slug) comes from backend only; Google is used for authentication only. */
export type CurrentUser = {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  username: string | null;
  /** Slug for /profile/[slug] links (from backend; falls back to uid when no backend profile yet). */
  profileSlug: string;
  bio: string | null;
  website: string | null;
  /** "google" | "password" – distinguishes OAuth vs backend auth */
  provider: string;
};

/** Build currentUser: backend is source of truth for profile. No Google fallback for photo/name. */
function toCurrentUser(user: User, backendUser: BackendUser | null): CurrentUser {
  const displayName =
    backendUser?.displayName ?? user.email ?? "User";
  const profileSlug =
    backendUser?.username ?? backendUser?.displayName ?? user.uid;
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName,
    photoURL: backendUser?.photoURL ?? null,
    username: backendUser?.username ?? null,
    profileSlug,
    bio: backendUser?.bio ?? null,
    website: backendUser?.website ?? null,
    provider: backendUser?.provider ?? "google",
  };
}

type AuthContextValue = {
  user: User | null;
  backendUser: BackendUser | null;
  /** Unified context for logged-in user (photoURL, displayName, profileSlug, etc.). Null when not logged in. */
  currentUser: CurrentUser | null;
  loading: boolean;
  refetchBackendUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(
    () => (user ? toCurrentUser(user, backendUser) : null),
    [user, backendUser]
  );

  const refetchBackendUser = async () => {
    const firebaseUser = user;
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      let backend = await fetchBackendUser(token);
      if (!backend) {
        const profile = await fetchProfile(firebaseUser.uid);
        if (profile.success && profile.user) {
          backend = {
            id: "",
            uid: profile.user.uid,
            email: profile.user.email ?? firebaseUser.email ?? "",
            username: profile.user.username,
            displayName: profile.user.displayName,
            photoURL: profile.user.photoURL,
            bio: profile.user.bio,
            website: profile.user.website,
            emailVerified: false,
            provider: "google",
          };
        }
      }
      setBackendUser(backend);
    } catch {
      setBackendUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setBackendUser(null);
      } else {
        try {
          await recordLoginToBackend(firebaseUser);
          const token = await firebaseUser.getIdToken();
          let backend = await fetchBackendUser(token);
          if (!backend) {
            const profile = await fetchProfile(firebaseUser.uid);
            if (profile.success && profile.user) {
              backend = {
                id: "",
                uid: profile.user.uid,
                email: profile.user.email ?? firebaseUser.email ?? "",
                username: profile.user.username,
                displayName: profile.user.displayName,
                photoURL: profile.user.photoURL,
                bio: profile.user.bio,
                website: profile.user.website,
                emailVerified: false,
                provider: "google",
              };
            }
          }
          setBackendUser(backend);
        } catch {
          setBackendUser(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, backendUser, currentUser, loading, refetchBackendUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
