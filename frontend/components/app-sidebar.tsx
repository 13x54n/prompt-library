"use client";

import * as React from "react";
import { MapleSidebarBrand } from "@/components/maple-sidebar-brand";
import { MapleSidebarNav } from "@/components/maple-sidebar-nav";
import { NavWalletUser } from "@/components/nav-wallet-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <MapleSidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <MapleSidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <NavWalletUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
