"use client";

import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DASHBOARD_HOME_HREF } from "@/components/dashboard/dashboard-constants";

export function MapleSidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={DASHBOARD_HOME_HREF} className="gap-0">
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg text-sidebar-primary-foreground">
              <img
                src="/logo.png"
                alt=""
                width={24}
                height={24}
                className="size-6 object-contain"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Maple</span>
             
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
