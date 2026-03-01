import { Router } from "express";
import { User } from "../models/User.js";
import { Follow } from "../models/Follow.js";
import { toPublicUser } from "../lib/public-user.js";
import { getFirebaseAdmin, verifyIdToken } from "../lib/firebase-admin.js";
import { publishDomainEvent } from "../lib/event-publisher.js";

const router = Router();

async function readAuthUid(req) {
  if (!getFirebaseAdmin()) return null;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  return verifyIdToken(token);
}

async function requireAuthUid(req, res) {
  if (!getFirebaseAdmin()) {
    res.status(503).json({ success: false, error: "Server auth not configured" });
    return null;
  }
  const uid = await readAuthUid(req);
  if (!uid) {
    res.status(401).json({ success: false, error: "Invalid or missing token" });
    return null;
  }
  return uid;
}

/**
 * GET /api/users/search?q=...
 * Public user search by username/displayName/email prefix.
 */
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const limit = Math.min(Number(req.query.limit) || 8, 25);
    if (!q) {
      return res.json({ success: true, users: [] });
    }

    const escaped = escapeRegex(q);
    const users = await User.find({
      $or: [
        { username: { $regex: escaped, $options: "i" } },
        { displayName: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ],
    })
      .select("uid username displayName photoURL bio")
      .limit(limit)
      .lean();

    res.json({
      success: true,
      users: users.map((u) => ({
        uid: u.uid,
        username: u.username,
        displayName: u.displayName,
        photoURL: u.photoURL,
        bio: u.bio ?? null,
      })),
    });
  } catch (err) {
    console.error("[auth-service] GET users/search error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to search users" });
  }
});

router.get("/me/following-uids", async (req, res) => {
  try {
    const uid = await requireAuthUid(req, res);
    if (!uid) return;

    const follows = await Follow.find({ followerUid: uid })
      .select("followeeUid")
      .lean();
    const followingUids = follows
      .map((f) => f.followeeUid)
      .filter(Boolean);
    res.json({ success: true, followingUids });
  } catch (err) {
    console.error("[auth-service] GET me/following-uids error:", err);
    res.status(500).json({ success: false, error: "Failed to get following list" });
  }
});

router.get("/:uid/follow-status", async (req, res) => {
  try {
    const viewerUid = await readAuthUid(req);
    const targetUid = String(req.params.uid ?? "").trim();
    if (!targetUid) {
      return res.status(400).json({ success: false, error: "uid is required" });
    }
    if (!viewerUid) return res.json({ success: true, isFollowing: false });
    const existing = await Follow.findOne({ followerUid: viewerUid, followeeUid: targetUid })
      .select("_id")
      .lean();
    res.json({ success: true, isFollowing: Boolean(existing) });
  } catch (err) {
    console.error("[auth-service] GET follow-status error:", err);
    res.status(500).json({ success: false, error: "Failed to get follow status" });
  }
});

router.post("/:uid/follow", async (req, res) => {
  try {
    const followerUid = await requireAuthUid(req, res);
    if (!followerUid) return;
    const followeeUid = String(req.params.uid ?? "").trim();
    if (!followeeUid) {
      return res.status(400).json({ success: false, error: "uid is required" });
    }
    if (followerUid === followeeUid) {
      return res.status(400).json({ success: false, error: "You cannot follow yourself" });
    }

    const target = await User.findOne({ uid: followeeUid }).select("uid username").lean();
    if (!target) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const actor = await User.findOne({ uid: followerUid }).select("uid username").lean();

    await Follow.updateOne(
      { followerUid, followeeUid },
      { $setOnInsert: { followerUid, followeeUid } },
      { upsert: true }
    );

    await publishDomainEvent("user.followed", {
      followerUid,
      followeeUid,
      actorUid: followerUid,
      actorUsername: actor?.username ?? null,
    });

    res.status(201).json({ success: true, following: true });
  } catch (err) {
    console.error("[auth-service] POST follow error:", err);
    res.status(500).json({ success: false, error: "Failed to follow user" });
  }
});

router.delete("/:uid/follow", async (req, res) => {
  try {
    const followerUid = await requireAuthUid(req, res);
    if (!followerUid) return;
    const followeeUid = String(req.params.uid ?? "").trim();
    if (!followeeUid) {
      return res.status(400).json({ success: false, error: "uid is required" });
    }

    await Follow.deleteOne({ followerUid, followeeUid });
    res.json({ success: true, following: false });
  } catch (err) {
    console.error("[auth-service] DELETE follow error:", err);
    res.status(500).json({ success: false, error: "Failed to unfollow user" });
  }
});

router.get("/:uid/followers", async (req, res) => {
  try {
    const uid = String(req.params.uid ?? "").trim();
    if (!uid) return res.status(400).json({ success: false, error: "uid is required" });
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const docs = await Follow.find({ followeeUid: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const followerUids = docs.map((d) => d.followerUid).filter(Boolean);
    const users = followerUids.length
      ? await User.find({ uid: { $in: followerUids } })
          .select("uid username displayName photoURL bio website createdAt")
          .lean()
      : [];
    const userByUid = new Map(users.map((u) => [u.uid, u]));
    const followers = followerUids
      .map((fuid) => userByUid.get(fuid))
      .filter(Boolean)
      .map((u) => toPublicUser(u));
    const total = await Follow.countDocuments({ followeeUid: uid });
    res.json({ success: true, users: followers, total });
  } catch (err) {
    console.error("[auth-service] GET followers error:", err);
    res.status(500).json({ success: false, error: "Failed to get followers" });
  }
});

router.get("/:uid/following", async (req, res) => {
  try {
    const uid = String(req.params.uid ?? "").trim();
    if (!uid) return res.status(400).json({ success: false, error: "uid is required" });
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const docs = await Follow.find({ followerUid: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const followeeUids = docs.map((d) => d.followeeUid).filter(Boolean);
    const users = followeeUids.length
      ? await User.find({ uid: { $in: followeeUids } })
          .select("uid username displayName photoURL bio website createdAt")
          .lean()
      : [];
    const userByUid = new Map(users.map((u) => [u.uid, u]));
    const following = followeeUids
      .map((fuid) => userByUid.get(fuid))
      .filter(Boolean)
      .map((u) => toPublicUser(u));
    const total = await Follow.countDocuments({ followerUid: uid });
    res.json({ success: true, users: following, total });
  } catch (err) {
    console.error("[auth-service] GET following error:", err);
    res.status(500).json({ success: false, error: "Failed to get following" });
  }
});

/**
 * GET /api/users/profile/:identifier
 * Public profile by username (unique handle), uid, or displayName.
 * Lookup order: username (lowercase), uid, then displayName (case-insensitive).
 */
router.get("/profile/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const decoded = decodeURIComponent(identifier).trim();
    const byUsername = decoded.toLowerCase();

    const viewerUid = await readAuthUid(req);
    const user = await User.findOne({
      $or: [
        { username: byUsername },
        { uid: decoded },
        { displayName: { $regex: new RegExp(`^${escapeRegex(decoded)}$`, "i") } },
      ],
    }).lean();

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const [followersCount, followingCount, followDoc] = await Promise.all([
      Follow.countDocuments({ followeeUid: user.uid }),
      Follow.countDocuments({ followerUid: user.uid }),
      viewerUid
        ? Follow.findOne({ followerUid: viewerUid, followeeUid: user.uid }).select("_id").lean()
        : Promise.resolve(null),
    ]);

    res.json({
      success: true,
      user: toPublicUser(user, {
        followersCount,
        followingCount,
        isFollowing: Boolean(followDoc),
      }),
    });
  } catch (err) {
    console.error("[auth-service] GET profile error:", err);
    res.status(500).json({ success: false, error: "Failed to get profile" });
  }
});

/**
 * GET /api/users/profiles?usernames=a,b,c
 * Public batch profile lookup by username.
 */
router.get("/profiles", async (req, res) => {
  try {
    const usernamesRaw = String(req.query.usernames ?? "")
      .split(",")
      .map((u) => u.trim().toLowerCase())
      .filter(Boolean);
    const usernames = [...new Set(usernamesRaw)].slice(0, 50);
    if (!usernames.length) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({ username: { $in: usernames } })
      .select("uid username displayName photoURL bio website createdAt")
      .lean();

    const uids = users.map((u) => u.uid).filter(Boolean);
    const [followerAgg, followingAgg] = await Promise.all([
      uids.length
        ? Follow.aggregate([
            { $match: { followeeUid: { $in: uids } } },
            { $group: { _id: "$followeeUid", count: { $sum: 1 } } },
          ])
        : [],
      uids.length
        ? Follow.aggregate([
            { $match: { followerUid: { $in: uids } } },
            { $group: { _id: "$followerUid", count: { $sum: 1 } } },
          ])
        : [],
    ]);
    const followersByUid = new Map(followerAgg.map((a) => [a._id, a.count]));
    const followingByUid = new Map(followingAgg.map((a) => [a._id, a.count]));

    res.json({
      success: true,
      users: users.map((u) =>
        toPublicUser(u, {
          followersCount: followersByUid.get(u.uid) ?? 0,
          followingCount: followingByUid.get(u.uid) ?? 0,
        })
      ),
    });
  } catch (err) {
    console.error("[auth-service] GET profiles error:", err);
    res.status(500).json({ success: false, error: "Failed to get profiles" });
  }
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;
