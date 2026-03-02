"use client";

import { diffLines } from "diff";
import { cn } from "@/lib/utils";

type ChangePart =
  | { type: "context"; oldLine: number; newLine: number; content: string }
  | { type: "removed"; oldLine: number; content: string }
  | { type: "added"; newLine: number; content: string };

function diffToSideBySide(oldText: string, newText: string): ChangePart[] {
  const changes = diffLines(oldText || "\n", newText || "\n");
  const result: ChangePart[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const change of changes) {
    const lines = change.value.split(/\n/);
    if (lines[lines.length - 1] === "" && change.value.endsWith("\n")) {
      lines.pop();
    }
    for (let i = 0; i < lines.length; i++) {
      const content = lines[i];
      if (change.added) {
        result.push({ type: "added", newLine: newLineNum++, content });
      } else if (change.removed) {
        result.push({ type: "removed", oldLine: oldLineNum++, content });
      } else {
        result.push({
          type: "context",
          oldLine: oldLineNum++,
          newLine: newLineNum++,
          content,
        });
      }
    }
  }

  return result;
}

function alignForSideBySide(parts: ChangePart[]): { left: (ChangePart | null)[]; right: (ChangePart | null)[] } {
  const left: (ChangePart | null)[] = [];
  const right: (ChangePart | null)[] = [];

  for (const p of parts) {
    if (p.type === "context") {
      left.push(p);
      right.push(p);
    } else if (p.type === "removed") {
      left.push(p);
      right.push(null);
    } else {
      left.push(null);
      right.push(p);
    }
  }

  return { left, right };
}

type PromptDiffViewProps = {
  oldText: string;
  newText: string;
  className?: string;
};

export function PromptDiffView({ oldText, newText, className }: PromptDiffViewProps) {
  const parts = diffToSideBySide(oldText, newText);
  const { left, right } = alignForSideBySide(parts);

  if (parts.length === 0 || (oldText === newText && oldText === "")) {
    return (
      <div className={cn("rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground", className)}>
        No changes to display.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-muted/20 font-mono text-sm",
        className
      )}
      role="table"
      aria-label="Prompt diff"
    >
      {/* Column headers */}
      <div className="flex border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
        <div className="flex min-w-0 flex-1 items-center gap-1 border-r border-border px-3 py-2">
          <span className="rounded bg-red-500/20 px-1 text-red-600 dark:text-red-400">−</span>
          Original
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1 px-3 py-2">
          <span className="rounded bg-green-500/20 px-1 text-green-600 dark:text-green-400">+</span>
          Proposed
        </div>
      </div>
      {/* Side-by-side diff */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-auto">
        {/* Left: original (removed in red) */}
        <div className="flex min-w-0 flex-1 overflow-x-auto border-r border-border">
          <div className="shrink-0 select-none border-r border-border bg-muted/50 px-2 py-3 text-right text-muted-foreground">
            {left.map((item, i) => (
              <div key={`left-num-${i}`} className="h-[1.4em] leading-[1.4]">
                {item?.type === "context" ? item.oldLine : item?.type === "removed" ? item.oldLine : ""}
              </div>
            ))}
          </div>
          <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-words px-3 py-3">
            {left.map((item, i) => (
              <div
                key={`left-${i}`}
                className={cn(
                  "h-[1.4em] leading-[1.4]",
                  item?.type === "removed" && "bg-red-500/20 text-red-700 dark:text-red-400"
                )}
              >
                {item?.type !== "added" ? (item ? `${item.type === "removed" ? "− " : "  "}${item.content}` : "") : ""}
              </div>
            ))}
          </pre>
        </div>
        {/* Right: proposed (added in green) */}
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          <div className="shrink-0 select-none border-r border-border bg-muted/50 px-2 py-3 text-right text-muted-foreground">
            {right.map((item, i) => (
              <div key={`right-num-${i}`} className="h-[1.4em] leading-[1.4]">
                {item?.type === "context" ? item.newLine : item?.type === "added" ? item.newLine : ""}
              </div>
            ))}
          </div>
          <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-words px-3 py-3">
            {right.map((item, i) => (
              <div
                key={`right-${i}`}
                className={cn(
                  "h-[1.4em] leading-[1.4]",
                  item?.type === "added" && "bg-green-500/20 text-green-700 dark:text-green-400"
                )}
              >
                {item?.type !== "removed" ? (item ? `${item.type === "added" ? "+ " : "  "}${item.content}` : "") : ""}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
