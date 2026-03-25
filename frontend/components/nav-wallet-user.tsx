"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, LogOutIcon, CopyIcon } from "lucide-react";

function shortAddress(pk: string) {
  return `${pk.slice(0, 4)}…${pk.slice(-4)}`;
}

export function NavWalletUser() {
  const { isMobile } = useSidebar();
  const { publicKey, disconnect } = useWallet();

  if (!publicKey) return null;

  const full = publicKey.toBase58();
  const label = shortAddress(full);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg font-mono text-xs">
                  {full.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Wallet</span>
                <span className="truncate font-mono text-xs">{label}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-1 px-2 py-1.5 text-left text-sm">
                <span className="text-muted-foreground text-xs">Connected</span>
                <span className="font-mono text-xs break-all">{full}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void navigator.clipboard.writeText(full)}
            >
              <CopyIcon className="size-4" />
              Copy address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void disconnect();
              }}
            >
              <LogOutIcon className="size-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
