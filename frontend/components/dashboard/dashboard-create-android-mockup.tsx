"use client";

import type { CreateProject } from "@/components/dashboard/create-projects-data";
import { cn } from "@/lib/utils";

type Props = {
  project: CreateProject;
  className?: string;
};

/**
 * Android-style phone frame with status bar and app preview area.
 */
export function DashboardCreateAndroidMockup({ project, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-6 lg:py-8",
        className,
      )}
    >
      <div className="relative w-full max-w-[280px]">
        <div
          className="relative aspect-[9/19.5] w-full rounded-[2.35rem] border-[3px] border-zinc-600/90 bg-zinc-900 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
          aria-hidden
        >
          <div className="absolute left-1/2 top-2.5 z-10 h-6 w-[5.5rem] -translate-x-1/2 rounded-full bg-black/90" />
          <div className="absolute inset-[9px] flex flex-col overflow-hidden rounded-[1.85rem] bg-[#0d0d0f] ring-1 ring-white/[0.06]">
            <div className="flex h-7 shrink-0 items-center justify-between px-3 pt-0.5 text-[10px] font-medium tabular-nums text-zinc-500">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span className="opacity-70">5G</span>
                <div className="h-2.5 w-6 rounded-sm border border-zinc-600">
                  <div className="ml-auto h-full w-4/5 rounded-sm bg-zinc-500" />
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 pb-6 pt-2 text-center">
              <div className="size-16 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <img
                  src={project.icon}
                  alt=""
                  className="size-full object-cover"
                  width={64}
                  height={64}
                />
              </div>
              <p className="text-sm font-semibold text-zinc-100">{project.name}</p>
              <p className="text-xs text-zinc-500">{project.slug}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                Live preview of your build appears here. Connect a build pipeline to
                stream the real UI.
              </p>
            </div>
            <div className="h-1 w-1/3 shrink-0 self-center rounded-full bg-zinc-700/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
