"use client";

import {
  CategoryMarketplaceBody,
  type CategoryExplorePageProps,
} from "@/components/dashboard/category-pages/category-marketplace-body";

/** DeFi category route — customize this tree independently from other categories. */
export function DefiCategoryPage({ searchQuery }: CategoryExplorePageProps = {}) {
  return (
    <CategoryMarketplaceBody categoryId="defi" searchQuery={searchQuery} />
  );
}
