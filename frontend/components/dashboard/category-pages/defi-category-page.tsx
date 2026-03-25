"use client";

import { CategoryMarketplaceBody } from "@/components/dashboard/category-pages/category-marketplace-body";

/** DeFi category route — customize this tree independently from other categories. */
export function DefiCategoryPage() {
  return <CategoryMarketplaceBody categoryId="defi" />;
}
