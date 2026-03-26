import { DEFAULT_CATEGORY_ID } from "@/components/dashboard/dapp-marketplace-category-data";

/** In-app home: full app directory (see `app/dashboard/home/page.tsx`). */
export const DASHBOARD_HOME_HREF = "/dashboard/home" as const;

/** Create flow placeholder (see `app/dashboard/create/page.tsx`). */
export const DASHBOARD_CREATE_HREF = "/dashboard/create" as const;

/** Explore / category marketplace entry (see `app/dashboard/[category]/page.tsx`). */
export const DASHBOARD_EXPLORE_HREF =
  `/dashboard/${DEFAULT_CATEGORY_ID}` as const;
