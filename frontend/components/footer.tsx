import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { GalleryVerticalEnd } from "lucide-react";

export function Footer() {
  return (
    <footer className="shrink-0 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <GalleryVerticalEnd className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Prompt Library</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground" aria-label="Footer">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/explore/trending" className="hover:text-foreground transition-colors">
              Trending
            </Link>
          </nav>
        </div>
        <Separator className="my-4" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Prompt Library. Discover and share AI prompts.
        </p>
      </div>
    </footer>
  );
}
