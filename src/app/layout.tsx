import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from "sonner";

// Optimize font loading
const inter = Inter({ subsets: ["latin"] });

// Pro-level metadata for SEO and link sharing
export const metadata: Metadata = {
  title: "GoMono | Premium Link Management",
  description: "GoMono | Premium Link Management",
  icons: {
    icon: "/favicon.ico",
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
        className={`${inter.className} antialiased bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}

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