import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from "sonner";
import CommandPalette from "@/components/CommandPalette";
import ShortcutsModal from "@/components/ShortcutsModal";

// Optimize font loading
const inter = Inter({ subsets: ["latin"] });

// Pro-level metadata for SEO, PWA, and link sharing
export const metadata: Metadata = {
  title: "GoMono | Premium Link Management",
  description: "Lightning-fast, zero-storage enterprise URL shortener, custom QR studio, and intelligence suite.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GoMono",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

// Ensures the app looks good on mobile devices
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is strictly required for next-themes to work without React errors
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <CommandPalette />
          <ShortcutsModal />

          {/* Global toast notifications with rich colors and a close button for better UX */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            theme="system"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}