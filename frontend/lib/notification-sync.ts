"use client";

const NOTIFICATION_UNREAD_UPDATED_EVENT = "pl:notifications:unread-updated";

type UnreadUpdatedDetail = {
  unreadCount: number;
};

export function emitUnreadNotificationCount(unreadCount: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<UnreadUpdatedDetail>(NOTIFICATION_UNREAD_UPDATED_EVENT, {
      detail: { unreadCount: Math.max(0, unreadCount) },
    })
  );
}

export function onUnreadNotificationCountUpdated(
  handler: (unreadCount: number) => void
) {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<UnreadUpdatedDetail>;
    const unreadCount = customEvent.detail?.unreadCount;
    if (typeof unreadCount !== "number") return;
    handler(unreadCount);
  };

  window.addEventListener(NOTIFICATION_UNREAD_UPDATED_EVENT, listener);
  return () => window.removeEventListener(NOTIFICATION_UNREAD_UPDATED_EVENT, listener);
}
