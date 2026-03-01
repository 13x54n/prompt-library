import { verifyIdToken, getFirebaseAdmin } from "../lib/firebase-admin.js";

export async function requireAuth(req, res, next) {
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

  req.uid = uid;
  next();
}
