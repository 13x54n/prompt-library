"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
};

export function MarkdownEditor({
  content,
  onChange,
  placeholder = "Write your prompt...",
  className,
  minRows = 8,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div className={cn("rounded-lg border border-input", className)}>
      <div className="flex border-b border-input">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "edit"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "preview"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Preview
        </button>
      </div>
      <div className="min-h-[180px]">
        {activeTab === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={minRows}
            className="w-full resize-none rounded-b-lg border-0 bg-transparent px-3 py-3 text-sm font-mono focus:outline-none focus:ring-0"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto rounded-b-lg px-3 py-3">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
