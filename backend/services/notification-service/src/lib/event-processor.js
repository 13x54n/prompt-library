import { Notification } from "../models/Notification.js";
import { mapEventToNotifications } from "./notification-mapper.js";

export async function processDomainEvent(event, { notificationModel = Notification } = {}) {
  const notifications = mapEventToNotifications(event);
  if (!notifications.length) return { success: true, inserted: 0 };

  try {
    const inserted = await notificationModel.insertMany(notifications, { ordered: false });
    return { success: true, inserted: Array.isArray(inserted) ? inserted.length : notifications.length };
  } catch (err) {
    if (err?.code === 11000 || err?.writeErrors?.every((e) => e.code === 11000)) {
      return { success: true, inserted: 0 };
    }
    throw err;
  }
}
