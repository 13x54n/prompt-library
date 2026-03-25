"use client";

import Link from "next/link";
import { MoreVertical, Package, Upload } from "lucide-react";

import { CREATE_PROJECTS } from "@/components/dashboard/create-projects-data";
import { DASHBOARD_CREATE_HREF } from "@/components/dashboard/dashboard-constants";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function StatusIcon({ kind }: { kind: "upload" | "package" }) {
  const Icon = kind === "upload" ? Upload : Package;
  return (
    <Icon
      className="size-3.5 shrink-0 text-muted-foreground/90"
      aria-hidden
    />
  );
}

export function DashboardCreateHome() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={dashboardTypography.pageTitle}>Your projects</h1>
      </div>

      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Projects"
      >
        {CREATE_PROJECTS.map((project) => (
          <li key={project.id}>
            <div
              className={cn(
                "relative flex flex-col rounded-xl border border-white/[0.1] bg-[#1c1c1e] p-4 shadow-sm ring-1 ring-white/[0.04]",
                "transition-[box-shadow,transform] hover:ring-white/10",
              )}
            >
              <div className="absolute right-2 top-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex size-9 items-center justify-center rounded-lg text-foreground/70 outline-none transition-colors hover:bg-white/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#64B5FF]/50"
                      aria-label={`Actions for ${project.name}`}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xl border border-white/10 bg-[#1c1c1e] p-1 shadow-xl"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={`${DASHBOARD_CREATE_HREF}/${project.id}`}
                        className="cursor-pointer rounded-lg"
                      >
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="rounded-lg opacity-50">
                      Duplicate (soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="rounded-lg opacity-50">
                      Archive (soon)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link
                href={`${DASHBOARD_CREATE_HREF}/${project.id}`}
                className="flex flex-col items-center gap-3 pt-1 outline-none focus-visible:ring-2 focus-visible:ring-[#64B5FF]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1e]"
              >
                <div className="size-[4.5rem] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/12 sm:size-[3.75rem]">
                  <img
                    src={project.icon}
                    alt=""
                    className="size-full object-cover"
                    width={72}
                    height={72}
                  />
                </div>
                <div className="w-full text-center">
                  <p className="truncate text-sm font-semibold text-white">
                    {project.name}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {project.slug}
                  </p>
                </div>
              </Link>

              <div className="mt-4 border-t border-white/[0.08] pt-3">
                <div className="flex items-start gap-2">
                  <StatusIcon kind={project.statusKind} />
                  <p className="text-muted-foreground text-left text-[11px] leading-snug sm:text-xs">
                    {project.statusLabel}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
