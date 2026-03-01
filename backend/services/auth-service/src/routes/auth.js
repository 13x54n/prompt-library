import { Router } from "express";
import admin from "firebase-admin";
import { User } from "../models/User.js";
import { verifyIdToken, getFirebaseAdmin } from "../lib/firebase-admin.js";

const router = Router();
const PROMPT_SERVICE_URL =
  process.env.PROMPT_SERVICE_URL ?? "http://localhost:5002";

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
        provider: user.provider ?? "google",
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
 * Auth: Bearer <firebase-id-token> required when Firebase Admin is configured.
 * No uid/email fallback - that would allow impersonation.
 */
router.patch("/me", async (req, res) => {
  try {
    const { displayName, username: bodyUsername, photoURL, bio, website } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const firebaseConfigured = getFirebaseAdmin();

    if (!firebaseConfigured) {
      return res.status(503).json({
        success: false,
        error: "Server auth not configured. Configure Firebase Admin to use this endpoint.",
      });
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Missing token" });
    }

    const uid = await verifyIdToken(token);
    if (!uid) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Blank/empty fields = keep existing data; only update fields with non-empty values
    const updates = {};
    const setIfNotEmpty = (key, val) => {
      const trimmed = typeof val === "string" ? val.trim() : val;
      if (val !== undefined && val !== null && trimmed !== "") {
        updates[key] = typeof trimmed === "string" ? trimmed : null;
      }
    };
    setIfNotEmpty("displayName", displayName);
    setIfNotEmpty("photoURL", photoURL);
    setIfNotEmpty("bio", bio);
    setIfNotEmpty("website", website);
    if (bodyUsername !== undefined) {
      const raw = (bodyUsername ?? "").trim().toLowerCase();
      if (!raw) {
        // Blank = keep existing, don't update
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

    // Best-effort propagation: keep authored content discoverable after username changes.
    // Uses same verified ID token so prompt-service can trust uid ownership.
    if (user?.username) {
      try {
        const syncRes = await fetch(`${PROMPT_SERVICE_URL}/api/prompts/sync-username`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: user.username }),
        });
        if (!syncRes.ok) {
          const syncData = await syncRes.json().catch(() => ({}));
          console.warn(
            "[auth-service] Username sync rejected by prompt-service:",
            syncData?.error ?? syncRes.status
          );
        }
      } catch (syncErr) {
        console.warn("[auth-service] Username sync to prompt-service failed:", syncErr);
      }
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
        provider: user.provider ?? "google",
      },
    });
  } catch (err) {
    console.error("[auth-service] PATCH /me error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to update profile" });
  }
});

/**
 * GET /api/auth/check-username?username=xxx
 * Returns whether the username is available for the current user.
 * Requires Authorization: Bearer <firebase-id-token> when Firebase Admin is configured.
 */
router.get("/check-username", async (req, res) => {
  try {
    const raw = (req.query.username ?? "").trim().toLowerCase();
    if (!raw) {
      return res.status(400).json({ success: false, available: false, error: "username is required" });
    }
    if (!/^[a-z0-9_-]{3,30}$/.test(raw)) {
      return res.json({
        success: true,
        available: false,
        error: "Username must be 3–30 characters, letters, numbers, underscores, or hyphens.",
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const firebaseConfigured = getFirebaseAdmin();

    if (!firebaseConfigured) {
      return res.status(503).json({ success: false, available: false, error: "Server auth not configured" });
    }
    if (!token) {
      return res.status(401).json({ success: false, available: false, error: "Missing token" });
    }

    const currentUid = await verifyIdToken(token);
    if (!currentUid) {
      return res.status(401).json({ success: false, available: false, error: "Invalid token" });
    }

    const taken = await User.findOne({ username: raw }).lean();
    const available = !taken || (currentUid && taken.uid === currentUid);

    res.json({ success: true, available });
  } catch (err) {
    console.error("[auth-service] check-username error:", err);
    res.status(500).json({ success: false, available: false, error: err.message ?? "Check failed" });
  }
});

/**
 * Generate a unique username from email/displayName.
 * Format: lowercase alphanumeric + underscore/hyphen, 3–30 chars.
 */
async function generateUniqueUsername(email, displayName) {
  const base =
    (email && typeof email === "string" ? email.split("@")[0] : null) ||
    (displayName && typeof displayName === "string" ? displayName : null) ||
    "user";
  const raw = String(base)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 27) || "user";
  let candidate = raw.length >= 3 ? raw : raw + "12";
  let attempts = 0;
  while (attempts < 20) {
    const exists = await User.findOne({ username: candidate }).lean();
    if (!exists) return candidate;
    candidate = `${raw}_${Math.random().toString(36).slice(2, 8)}`;
    if (candidate.length > 30) candidate = candidate.slice(0, 30);
    attempts++;
  }
  return `user_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Consolidate duplicate user documents for same uid/email into one canonical record.
 * Keeps the oldest document id for stability, merges non-empty profile fields, deletes the rest.
 */
async function consolidateDuplicateUsers(uid, email) {
  const matches = await User.find({ $or: [{ uid }, { email }] })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  if (matches.length <= 1) return matches[0] ?? null;

  const canonical = matches[0];
  const others = matches.slice(1);
  const firstWith = (key) =>
    canonical[key] ??
    others.find((u) => u[key] !== null && u[key] !== undefined && u[key] !== "")?.[key] ??
    null;

  const updates = {
    uid,
    email,
    username: firstWith("username"),
    displayName: firstWith("displayName"),
    photoURL: firstWith("photoURL"),
    bio: firstWith("bio"),
    website: firstWith("website"),
    emailVerified: Boolean(firstWith("emailVerified")),
    provider: firstWith("provider") ?? "google",
    lastLoginAt: new Date(),
  };

  if (!updates.username) {
    updates.username = await generateUniqueUsername(email, updates.displayName);
  }

  await User.findByIdAndUpdate(canonical._id, { $set: updates }, { new: true });
  await User.deleteMany({ _id: { $in: others.map((u) => u._id) } });

  return User.findById(canonical._id).lean();
}

/**
 * POST /api/auth/record-login
 * Called by frontend after successful Firebase (Google, etc.) or backend (email/password) login.
 * Creates or updates user record in MongoDB.
 * Auth: Bearer <firebase-id-token> required. Server verifies token and uses uid/email from token - body is ignored for auth.
 * - provider: "google" | "password" | etc. (from body, from Firebase providerData)
 * - For new users: auto-generates unique username from email/displayName
 */
router.post("/record-login", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const firebaseConfigured = getFirebaseAdmin();
    if (!firebaseConfigured) {
      return res.status(503).json({
        success: false,
        error: "Server auth not configured",
      });
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Missing token" });
    }

    const uid = await verifyIdToken(token);
    if (!uid) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const { displayName, photoURL, emailVerified, provider: bodyProvider } = req.body;
    const displayNameFromBody = typeof displayName === "string" ? displayName : null;
    const provider = bodyProvider === "password" ? "password" : "google";

    // Get email from Firebase user (verified) - body.email is untrusted
    const firebaseUser = await admin.auth().getUser(uid).catch(() => null);
    const email = String(firebaseUser?.email ?? req.body.email ?? "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "User has no verified email",
      });
    }

    let record = await consolidateDuplicateUsers(uid, email);
    if (!record) {
      const username = await generateUniqueUsername(email, displayNameFromBody);
      const now = new Date();
      try {
        // Atomic upsert prevents duplicate rows under concurrent logins.
        record = await User.findOneAndUpdate(
          { uid },
          {
            $set: {
              email,
              emailVerified: emailVerified === true,
              provider,
              lastLoginAt: now,
            },
            $setOnInsert: {
              uid,
              username,
              displayName: displayNameFromBody ?? null,
              photoURL: typeof photoURL === "string" ? photoURL : null,
              createdAt: now,
            },
          },
          { new: true, upsert: true }
        ).lean();
      } catch (err) {
        if (err?.code === 11000) {
          // Another request inserted first; read canonical and continue.
          record = await User.findOne({ $or: [{ uid }, { email }] }).lean();
        } else {
          throw err;
        }
      }
    } else {
      record = await User.findOneAndUpdate(
        { _id: record._id },
        {
          $set: {
            uid,
            email,
            lastLoginAt: new Date(),
          },
        },
        { new: true }
      ).lean();
    }

    res.status(200).json({
      success: true,
      user: {
        id: record._id,
        uid: record.uid,
        email: record.email,
        displayName: record.displayName,
        username: record.username,
        provider: record.provider,
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
