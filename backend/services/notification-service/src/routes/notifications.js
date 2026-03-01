import { Router } from "express";
import { Types } from "mongoose";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function encodeCursor(createdAt, id) {
  return Buffer.from(JSON.stringify({ createdAt, id })).toString("base64");
}

function decodeCursor(cursor) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
    if (!parsed?.createdAt || !parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function formatNotification(n) {
  return {
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    link: n.link,
    read: Boolean(n.read),
    archived: Boolean(n.archived),
    createdAt: n.createdAt,
    actor: n.actorUsername ?? undefined,
    actorUid: n.actorUid ?? undefined,
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const includeArchived = String(req.query.includeArchived ?? "false").toLowerCase() === "true";
    const cursor = typeof req.query.cursor === "string" ? decodeCursor(req.query.cursor) : null;

    const filter = { recipientUid: uid, ...(includeArchived ? {} : { archived: false }) };
    if (cursor) {
      const cursorDate = new Date(cursor.createdAt);
      if (!Number.isNaN(cursorDate.valueOf()) && Types.ObjectId.isValid(cursor.id)) {
        filter.$or = [
          { createdAt: { $lt: cursorDate } },
          { createdAt: cursorDate, _id: { $lt: new Types.ObjectId(cursor.id) } },
        ];
      }
    }

    const docs = await Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const page = hasMore ? docs.slice(0, limit) : docs;
    const next = hasMore ? page[page.length - 1] : null;

    res.json({
      success: true,
      notifications: page.map(formatNotification),
      nextCursor: next ? encodeCursor(next.createdAt.toISOString(), next._id.toString()) : null,
      hasMore,
    });
  } catch (err) {
    console.error("[notification-service] GET /notifications error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch notifications" });
  }
});

router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientUid: req.uid,
      read: false,
      archived: false,
    });
    res.json({ success: true, unreadCount: count });
  } catch (err) {
    console.error("[notification-service] GET unread-count error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to get unread count" });
  }
});

router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid notification id" });
    }
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipientUid: req.uid },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, notification: formatNotification(updated) });
  } catch (err) {
    console.error("[notification-service] POST read error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to mark notification as read" });
  }
});

router.post("/read-all", requireAuth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientUid: req.uid, read: false, archived: false },
      { $set: { read: true, readAt: new Date() } }
    );
    res.json({ success: true, updated: result.modifiedCount ?? 0 });
  } catch (err) {
    console.error("[notification-service] POST read-all error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to mark notifications as read" });
  }
});

router.post("/:id/archive", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid notification id" });
    }
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipientUid: req.uid },
      { $set: { archived: true, archivedAt: new Date(), read: true, readAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, notification: formatNotification(updated) });
  } catch (err) {
    console.error("[notification-service] POST archive error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to archive notification" });
  }
});

router.post("/archive-all", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      { recipientUid: req.uid, archived: false },
      { $set: { archived: true, archivedAt: now, read: true, readAt: now } }
    );
    res.json({ success: true, updated: result.modifiedCount ?? 0 });
  } catch (err) {
    console.error("[notification-service] POST archive-all error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to archive notifications" });
  }
});

export default router;
