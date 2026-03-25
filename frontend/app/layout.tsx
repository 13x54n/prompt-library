import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import FooterSection from "@/components/sections/footer/default";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ConnectedDashboardRedirect } from "@/components/wallet/connected-dashboard-redirect";
import { SolanaWalletProvider } from "@/components/wallet/solana-wallet-provider";
import { TooltipProvider } from "@/components/ui/tooltip";


const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  // Avoid Chrome “preloaded but not used” when LCP is WebGL/canvas-heavy (e.g. globe on home).
  preload: false,
});

export const metadata: Metadata = {
  applicationName: "Maple",
  title: "Maple",
  description: "Maple is a platform for creating and managing your business.",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Maple",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  /** Dark chrome for storefront-style UI (matches --background) */
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
    { color: "#f5f5f5" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${openSans.variable} dark h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <ServiceWorkerRegister />
          <ThemeProvider>
            <SolanaWalletProvider>
              <ConnectedDashboardRedirect />
              {children}
            </SolanaWalletProvider>
          </ThemeProvider>
          {/* <FooterSection /> */}
        </TooltipProvider>
      </body>
    </html>
  );
}
