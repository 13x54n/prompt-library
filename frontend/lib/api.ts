const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:5001";

export type ProfileUser = {
  uid: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  bio: string | null;
  website: string | null;
};

export async function fetchProfile(
  username: string
): Promise<{ success: true; user: ProfileUser } | { success: false; error: string }> {
  try {
    const res = await fetch(
      `${AUTH_SERVICE_URL}/api/users/profile/${encodeURIComponent(username)}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error ?? "User not found" };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { success: false, error: message };
  }
}
