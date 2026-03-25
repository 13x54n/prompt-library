import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import {
  CATEGORY_LAUNCHER,
  parseCategoryParam,
  type CategoryId,
} from "@/components/dashboard/dapp-marketplace-category-data";

type Props = { params: Promise<{ category: string }> };

const categoryLabel = (id: CategoryId) =>
  CATEGORY_LAUNCHER.find((c) => c.id === id)?.label ?? id;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: segment } = await params;
  const id = parseCategoryParam(segment);
  if (!id) {
    return { title: "Dashboard · Maple" };
  }
  return {
    title: `${categoryLabel(id)} · Dashboard · Maple`,
    description: `Browse ${categoryLabel(id)} dApps on Maple.`,
  };
}

export function generateStaticParams() {
  return CATEGORY_LAUNCHER.map((c) => ({ category: c.id }));
}

export default async function DashboardCategoryPage({ params }: Props) {
  const { category: segment } = await params;
  const id = parseCategoryParam(segment);
  if (!id) {
    notFound();
  }
  return <DashboardPageClient category={id} />;
}
