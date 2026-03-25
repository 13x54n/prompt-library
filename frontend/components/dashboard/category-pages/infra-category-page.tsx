"use client";

import {
  CategoryMarketplaceBody,
  type CategoryExplorePageProps,
} from "@/components/dashboard/category-pages/category-marketplace-body";

export function InfraCategoryPage({ searchQuery }: CategoryExplorePageProps = {}) {
  return (
    <CategoryMarketplaceBody categoryId="infra" searchQuery={searchQuery} />
  );
}
