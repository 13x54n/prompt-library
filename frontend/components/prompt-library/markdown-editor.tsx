"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MessageSquareQuote,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  submitLabel?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  submitDisabled?: boolean;
};

export function MarkdownEditor({
  content,
  onChange,
  placeholder = "Write your prompt...",
  className,
  minRows = 8,
  submitLabel = "Submit",
  onSubmit,
  onCancel,
  disabled = false,
  submitDisabled = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function applyMarkdown(
    syntax: { prefix: string; suffix?: string; placeholder?: string },
    options?: { multiline?: boolean }
  ) {
    const textarea = textareaRef.current;
    const selectedText = textarea
      ? content.slice(textarea.selectionStart, textarea.selectionEnd)
      : "";
    const text = selectedText || syntax.placeholder || "text";

    let value = "";
    if (options?.multiline) {
      const lines = text.split("\n");
      value = lines.map((line) => `${syntax.prefix}${line}`).join("\n");
    } else {
      value = `${syntax.prefix}${text}${syntax.suffix ?? ""}`;
    }

    if (textarea) {
      const next =
        content.slice(0, textarea.selectionStart) + value + content.slice(textarea.selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        const cursor = textarea.selectionStart + value.length;
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
      return;
    }

    onChange(`${content}${content ? "\n" : ""}${value}`);
  }

  return (
    <div className={cn("rounded-lg border border-input", className)}>
      <div className="flex border-b border-input">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "write"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Write
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
      {activeTab === "write" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-input px-2 py-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "**", suffix: "**", placeholder: "bold" })}
            title="Bold"
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "_", suffix: "_", placeholder: "italic" })}
            title="Italic"
          >
            <Italic className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "`", suffix: "`", placeholder: "code" })}
            title="Inline code"
          >
            <Code className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "> ", placeholder: "quote" }, { multiline: true })}
            title="Quote"
          >
            <MessageSquareQuote className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "- ", placeholder: "list item" }, { multiline: true })}
            title="Bullet list"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "1. ", placeholder: "list item" }, { multiline: true })}
            title="Numbered list"
          >
            <ListOrdered className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => applyMarkdown({ prefix: "[", suffix: "](https://example.com)", placeholder: "label" })}
            title="Link"
          >
            <LinkIcon className="size-4" />
          </Button>
        </div>
      )}
      <div className="min-h-[180px]">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={minRows}
            disabled={disabled}
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
      {(onSubmit || onCancel) && (
        <div className="flex justify-end gap-2 border-t border-input px-3 py-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
              Cancel
            </Button>
          )}
          {onSubmit && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={disabled || submitDisabled || !content.trim()}
            >
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
