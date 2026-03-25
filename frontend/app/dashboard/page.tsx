import type { Metadata } from "next";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export const metadata: Metadata = {
  title: "Dashboard · Maple",
  description: "Your Maple workspace — prompts, agents, and Solana actions.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
