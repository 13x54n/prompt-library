import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { UserMenu } from "@/components/user-menu";
import { SearchBar } from "@/components/search-bar";
import { Footer } from "@/components/footer";
import "./globals.css";
import { GalleryVerticalEnd } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptlibrary.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prompt Library — Discover & Share AI Prompts",
    template: "%s | Prompt Library",
  },
  description:
    "Discover, fork, and share AI prompts. A community-driven library of prompts for GPT, Claude, and more. Find trending prompts, contribute variants, and collaborate with developers.",
  keywords: ["AI prompts", "prompt library", "GPT prompts", "Claude prompts", "LLM", "developer tools"],
  authors: [{ name: "Prompt Library" }],
  creator: "Prompt Library",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Prompt Library",
    title: "Prompt Library — Discover & Share AI Prompts",
    description:
      "Discover, fork, and share AI prompts. A community-driven library for developers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Library — Discover & Share AI Prompts",
    description: "Discover, fork, and share AI prompts. A community-driven library for developers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col overflow-x-hidden supports-[height:100dvh]:min-h-dvh">
            <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6" aria-label="Main">
                <div className="flex min-w-0 shrink-0 items-center gap-4 sm:gap-6">
                  <Link
                    href="/"
                    className="font-semibold hover:text-muted-foreground flex items-center gap-2"
                  >
                    <GalleryVerticalEnd className="size-4" />
                    Prompt Library
                  </Link>
                  {/* <div className="hidden items-center gap-1 md:flex">
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Explore
                    </Link>
                    <Link
                      href="/requests"
                      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Requests
                    </Link>
                  </div> */}
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <div className="hidden min-w-0 flex-1 sm:block sm:max-w-xs">
                    <SearchBar />
                  </div>
                  <UserMenu />
                </div>
              </nav>
            </header>
            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
