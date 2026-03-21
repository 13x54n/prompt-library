import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const LINKS = [
  { label: "About", href: "/about" },
  {
    label: "Products",
    href: "#",
    children: [
      {
        label: "Analytics",
        href: "/products/analytics",
        description: "Understand your data.",
      },
      {
        label: "Automation",
        href: "/products/automation",
        description: "Streamline workflows.",
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];


export const metadata: Metadata = {
  title: "Maple",
  description: "Maple is a platform for creating and managing your business.",
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
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
