"use client";

import { useState } from "react";

import { Minus, Send, X } from "lucide-react";

import type { CreateProject } from "@/components/dashboard/create-projects-data";
import { dashboardTypography } from "@/components/dashboard/dashboard-typography";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export function DashboardCreateAiChatPanel({
  project,
  onMinimize,
  onClose,
}: {
  project: CreateProject;
  onMinimize: () => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: `Hi — I’m your Maple build assistant for ${project.name}. Ask me to tweak copy, add screens, or explain your last deploy.`,
    },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: t,
    };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "This is a demo reply. Wire your model endpoint here to power real responses.",
        },
      ]);
    }, 400);
  };

  return (
    <div className="flex min-h-[min(70dvh,640px)] flex-col border-b border-white/[0.08] bg-[#121212] p-2.5 lg:min-h-[min(calc(100dvh-10rem),900px)] lg:border-b-0 lg:border-r">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-[0_8px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06]">
        <div className="flex h-11 shrink-0 items-center gap-1 rounded-t-xl border-b border-white/10 bg-[#2c2c2e] px-1.5 dark:bg-[#1e1e1e]">
          <button
            type="button"
            onClick={onMinimize}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground/85 transition-colors hover:bg-white/10"
            aria-label="Minimize"
          >
            <Minus className="size-5" strokeWidth={2.25} />
          </button>
          <h2 className="min-w-0 flex-1 truncate px-1 text-center text-[13px] font-medium tracking-tight text-foreground/95">
            Chat with AI
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground/85 transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="border-b border-white/[0.08] px-4 py-2.5 sm:px-5">
          <p className="text-muted-foreground text-xs leading-snug">
            Iterate on {project.name} — prompts, UI copy, and flows.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-black/25">
          <div className="h-full space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[95%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[90%]",
                  m.role === "user"
                    ? "ml-auto bg-[#0A84FF]/22 text-foreground ring-1 ring-[#64B5FF]/20"
                    : "bg-white/[0.06] text-foreground/90 ring-1 ring-white/[0.12]",
                )}
              >
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 rounded-b-xl border-t border-white/[0.08] p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-2 ring-1 ring-white/[0.05]">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything about your app…"
              rows={2}
              className={cn(
                "max-h-32 min-h-[2.75rem] shrink-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/75",
                dashboardTypography.input,
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              type="button"
              onClick={send}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0A84FF]/25 text-[#64B5FF] ring-1 ring-[#64B5FF]/35 transition-colors hover:bg-[#0A84FF]/35"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
