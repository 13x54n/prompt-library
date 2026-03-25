import type { ComponentType } from "react";

import type { CategoryId } from "@/components/dashboard/dapp-marketplace-category-data";
import { DaoCategoryPage } from "@/components/dashboard/category-pages/dao-category-page";
import { DefiCategoryPage } from "@/components/dashboard/category-pages/defi-category-page";
import { GamesCategoryPage } from "@/components/dashboard/category-pages/games-category-page";
import { InfraCategoryPage } from "@/components/dashboard/category-pages/infra-category-page";
import { SocialCategoryPage } from "@/components/dashboard/category-pages/social-category-page";
import type { CategoryExplorePageProps } from "@/components/dashboard/category-pages/category-marketplace-body";

export type { CategoryExplorePageProps };

export const CATEGORY_PAGE_COMPONENT: Record<
  CategoryId,
  ComponentType<CategoryExplorePageProps>
> = {
  defi: DefiCategoryPage,
  games: GamesCategoryPage,
  infra: InfraCategoryPage,
  social: SocialCategoryPage,
  dao: DaoCategoryPage,
};
