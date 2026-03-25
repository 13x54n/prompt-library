"use client";

import {
  CategoryMarketplaceBody,
  type CategoryExplorePageProps,
} from "@/components/dashboard/category-pages/category-marketplace-body";

export function GamesCategoryPage({ searchQuery }: CategoryExplorePageProps = {}) {
  return (
    <CategoryMarketplaceBody categoryId="games" searchQuery={searchQuery} />
  );
}
