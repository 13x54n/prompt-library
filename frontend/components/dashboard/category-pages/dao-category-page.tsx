"use client";

import {
  CategoryMarketplaceBody,
  type CategoryExplorePageProps,
} from "@/components/dashboard/category-pages/category-marketplace-body";

export function DaoCategoryPage({ searchQuery }: CategoryExplorePageProps = {}) {
  return (
    <CategoryMarketplaceBody categoryId="dao" searchQuery={searchQuery} />
  );
}
