import { verifyIdToken, getFirebaseAdmin } from "../lib/firebase-admin.js";

/**
 * Middleware that requires valid Firebase Bearer token.
 * Sets req.uid when successful. Returns 401/503 on failure.
 */
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

/**
 * Optional auth: sets req.uid when token is valid. Does not reject if missing/invalid.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || !getFirebaseAdmin()) {
    req.uid = null;
    return next();
  }
  const uid = await verifyIdToken(token);
  req.uid = uid ?? null;
  next();
}
