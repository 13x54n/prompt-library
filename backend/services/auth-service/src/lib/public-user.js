export function toPublicUser(user, options = {}) {
  return {
    uid: user.uid,
    username: user.username,
    displayName: user.displayName,
    photoURL: user.photoURL,
    bio: user.bio,
    website: user.website,
    createdAt: user.createdAt ?? null,
    followersCount: options.followersCount ?? 0,
    followingCount: options.followingCount ?? 0,
    isFollowing: options.isFollowing ?? false,
  };
}
