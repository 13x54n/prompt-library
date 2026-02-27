import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptVariant } from "@/lib/types";

type VariantCardProps = {
  variant: PromptVariant;
  className?: string;
};

export function VariantCard({ variant, className }: VariantCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-4",
        variant.accepted
          ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
          : "border-border bg-card",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            variant.accepted
              ? "text-green-600 dark:text-green-400"
              : "text-muted-foreground"
          )}
        >
          {variant.accepted && <Check className="size-4" aria-hidden />}
          {variant.accepted ? "Accepted" : "Variant"} by @{variant.author}
        </span>
        <span className="text-sm text-muted-foreground">
          +{variant.votes} votes
        </span>
      </div>
      <pre className="overflow-x-auto rounded-md bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
        <code>{variant.content}</code>
      </pre>
    </article>
  );
}
