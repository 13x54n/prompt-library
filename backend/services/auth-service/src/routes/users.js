import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

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

    res.json({
      success: true,
      user: {
        uid: user.uid,
        username: user.username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        bio: user.bio,
        website: user.website,
      },
    });
  } catch (err) {
    console.error("[auth-service] GET profile error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to get profile" });
  }
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;
