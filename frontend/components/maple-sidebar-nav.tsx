"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DASHBOARD_HOME_HREF } from "@/components/dashboard/dashboard-constants";
import {
  LayoutDashboardIcon,
  CompassIcon,
  BookOpenIcon,
} from "lucide-react";

const mainLinks = [
  {
    title: "Discover",
    href: DASHBOARD_HOME_HREF,
    icon: LayoutDashboardIcon,
  },
  {
    title: "Explore",
    href: "/explore",
    icon: CompassIcon,
  },
  {
    title: "Lightpaper",
    href: "/whitepaper",
    icon: BookOpenIcon,
  },
] as const;

export function MapleSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Maple</SidebarGroupLabel>
      <SidebarMenu>
        {mainLinks.map(({ title, href, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={
                href === DASHBOARD_HOME_HREF
                  ? pathname === DASHBOARD_HOME_HREF ||
                    pathname === "/dashboard"
                  : pathname.startsWith(href)
              }
              tooltip={title}
            >
              <Link href={href}>
                <Icon />
                <span>{title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
