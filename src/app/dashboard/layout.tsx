"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ThemeToggle } from "@/components/ui/ThemeProvider";
import { Link2, FileSpreadsheet, QrCode } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [role, setRole] = useState("admin"); // NEW: Track if they are admin or demo
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // 1. Get the allowed emails, split them, and trim whitespace
            const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
            const userEmail = user?.email || "";

            // 2. Check if user exists AND if their email is in the array
            if (user && allowedEmails.includes(userEmail)) {
                setIsAuthorized(true);

                // NEW: Set the dynamic role for the top navbar
                if (userEmail === "demo01@go.mono.bro.bd") {
                    setRole("demo");
                } else {
                    setRole("admin");
                }
            } else {
                // If they fail the check, boot them to the login page immediately
                setIsAuthorized(false);
                router.push("/login");
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    // Prevent layout shift/flash of content before auth is verified
    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-neutral-950 dark:text-neutral-400">
                Verifying credentials...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-50">
            {/* Top navigation bar across all dashboard pages */}
            <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 p-3 sm:p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="font-bold tracking-tight text-slate-900 dark:text-white">
                                GoMono
                            </span>
                            <span className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                                {role}
                            </span>
                        </Link>

                        <div className="flex items-center gap-1">
                            <Link
                                href="/dashboard"
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                    pathname === "/dashboard"
                                        ? "bg-slate-100 text-slate-900 dark:bg-neutral-800 dark:text-white"
                                        : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                                }`}
                            >
                                <Link2 className="h-3.5 w-3.5" />
                                <span>Links</span>
                            </Link>

                            <Link
                                href="/dashboard/csv-studio"
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                    pathname.startsWith("/dashboard/csv-studio")
                                        ? "bg-slate-100 text-slate-900 dark:bg-neutral-800 dark:text-white"
                                        : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                                }`}
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>CSV Studio</span>
                                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    Pro
                                </span>
                            </Link>

                            <Link
                                href="/qr"
                                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition"
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>QR Studio</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <button
                            onClick={() => auth.signOut()}
                            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl p-6">
                {children}
            </main>
        </div>
    );
}