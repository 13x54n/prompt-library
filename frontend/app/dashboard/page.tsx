import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DEFAULT_CATEGORY_ID } from "@/components/dashboard/dapp-marketplace-category-data";

export const metadata: Metadata = {
  title: "Dashboard · Maple",
  description: "Your Maple workspace — prompts, agents, and Solana actions.",
};

export default function DashboardPage() {
  redirect(`/dashboard/${DEFAULT_CATEGORY_ID}`);
}
