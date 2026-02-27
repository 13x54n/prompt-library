import Link from "next/link";
import { cn } from "@/lib/utils";

type TagChipProps = {
  tag: string;
  href?: string;
  variant?: "default" | "subtle";
  className?: string;
};

export function TagChip({ tag, href, variant = "default", className }: TagChipProps) {
  const baseStyles =
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors";
  const variantStyles = {
    default:
      "bg-muted text-muted-foreground hover:bg-muted/80",
    subtle:
      "bg-muted/60 text-muted-foreground/90 hover:bg-muted/80",
  };

  const content = (
    <span className={cn(baseStyles, variantStyles[variant], className)}>
      {tag}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
