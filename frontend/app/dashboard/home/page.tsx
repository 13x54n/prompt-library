import type { Metadata } from "next";

import { DashboardHomePageClient } from "@/components/dashboard/dashboard-home-page-client";

export const metadata: Metadata = {
  title: "Home · Dashboard · Maple",
  description: "Browse all apps in the Maple directory.",
};

export default function DashboardHomePage() {
  return <DashboardHomePageClient />;
}
