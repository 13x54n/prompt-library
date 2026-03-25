import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard · Maple",
  description: "Your Maple workspace — prompts, agents, and Solana actions.",
};

export default function DashboardPage() {
  redirect("/dashboard/home");
}
