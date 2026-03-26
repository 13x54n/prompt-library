import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DASHBOARD_EXPLORE_HREF } from "@/components/dashboard/dashboard-constants";

export const metadata: Metadata = {
  title: "Dashboard · Maple",
  description: "Your Maple workspace — prompts, agents, and Solana actions.",
};

export default function DashboardPage() {
  redirect(DASHBOARD_EXPLORE_HREF);
}
