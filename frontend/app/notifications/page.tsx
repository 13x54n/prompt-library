import type { Metadata } from "next";
import { NotificationsPageClient } from "@/components/notifications-page-client";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your Prompt Library notifications. PR reviews, upvotes, comments, and more.",
  robots: { index: false, follow: true },
};

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
