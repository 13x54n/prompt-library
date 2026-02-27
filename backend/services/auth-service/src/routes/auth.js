import { Router } from "express";
import { User } from "../models/User.js";
import { verifyIdToken, getFirebaseAdmin } from "../lib/firebase-admin.js";

const router = Router();

/**
 * GET /api/auth/me
 * Returns current user from MongoDB. Requires Authorization: Bearer <firebase-id-token>.
 * If Firebase Admin is not configured, returns 503 and frontend should use Firebase user only.
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, error: "Missing token" });
    }

    if (!getFirebaseAdmin()) {
      return res.status(503).json({
        success: false,
        error: "Server auth not configured",
      });
    }

    const uid = await verifyIdToken(token);
    if (!uid) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const user = await User.findOne({ uid }).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        bio: user.bio,
        website: user.website,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    console.error("[auth-service] GET /me error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to get user" });
  }
});

/**
 * PATCH /api/auth/me
 * Update current user profile.
 * Auth: Bearer <firebase-id-token> when Firebase Admin is configured.
 * When Firebase Admin is not configured (dev): body must include uid + email to identify the user.
 */
router.patch("/me", async (req, res) => {
  try {
    const { displayName, username: bodyUsername, photoURL, bio, website, uid: bodyUid, email: bodyEmail } = req.body;
    let uid = null;

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const firebaseConfigured = getFirebaseAdmin();

    if (firebaseConfigured && token) {
      uid = await verifyIdToken(token);
    }
    // Dev fallback: when Firebase Admin is not configured, accept uid + email in body
    if (!uid && !firebaseConfigured && bodyUid && bodyEmail) {
      const existing = await User.findOne({ uid: bodyUid }).lean();
      if (existing && existing.email === bodyEmail) {
        uid = bodyUid;
      }
    }

    if (!uid) {
      if (!token && (!bodyUid || !bodyEmail)) {
        return res.status(401).json({ success: false, error: "Missing token or uid/email" });
      }
      if (firebaseConfigured && token) {
        return res.status(401).json({ success: false, error: "Invalid token" });
      }
      return res.status(503).json({
        success: false,
        error: "Server auth not configured. Send uid and email in body for dev.",
      });
    }

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName?.trim() || null;
    if (photoURL !== undefined) updates.photoURL = photoURL?.trim() || null;
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (website !== undefined) updates.website = website?.trim() || null;
    if (bodyUsername !== undefined) {
      const raw = (bodyUsername ?? "").trim().toLowerCase();
      if (!raw) {
        updates.username = null;
      } else {
        if (!/^[a-z0-9_-]{3,30}$/.test(raw)) {
          return res.status(400).json({
            success: false,
            error: "Username must be 3–30 characters, letters, numbers, underscores, or hyphens.",
          });
        }
        const taken = await User.findOne({ username: raw }).lean();
        if (taken && taken.uid !== uid) {
          return res.status(409).json({ success: false, error: "Username is already taken." });
        }
        updates.username = raw;
      }
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        bio: user.bio,
        website: user.website,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    console.error("[auth-service] PATCH /me error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to update profile" });
  }
});

/**
 * POST /api/auth/record-login
 * Called by frontend after successful Firebase/Google login.
 * Creates or updates user record in MongoDB.
 */
router.post("/record-login", async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, emailVerified } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        error: "uid and email are required",
      });
    }

    const record = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          uid,
          email,
          displayName: displayName ?? null,
          photoURL: photoURL ?? null,
          emailVerified: emailVerified ?? false,
          provider: "google",
          lastLoginAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: record._id,
        uid: record.uid,
        email: record.email,
        displayName: record.displayName,
      },
    });
  } catch (err) {
    console.error("[auth-service] record-login error:", err);
    res.status(500).json({
      success: false,
      error: err.message ?? "Failed to record login",
    });
  }
});

export default router;
