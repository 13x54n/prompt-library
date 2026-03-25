import type { Metadata } from "next";

import { DashboardCreatePageClient } from "@/components/dashboard/dashboard-create-page-client";

export const metadata: Metadata = {
  title: "Create · Dashboard · Maple",
  description: "Create prompts and agents on Maple.",
};

export default function DashboardCreatePage() {
  return <DashboardCreatePageClient />;
}
