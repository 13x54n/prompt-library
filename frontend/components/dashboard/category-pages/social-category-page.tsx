"use client";

import {
  CategoryMarketplaceBody,
  type CategoryExplorePageProps,
} from "@/components/dashboard/category-pages/category-marketplace-body";

export function SocialCategoryPage({ searchQuery }: CategoryExplorePageProps = {}) {
  return (
    <CategoryMarketplaceBody categoryId="social" searchQuery={searchQuery} />
  );
}
