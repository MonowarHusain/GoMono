"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // 1. Get the allowed emails and split them into an array
            const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",");
            const userEmail = user?.email || "";

            // 2. Check if user exists AND if their email is in the array
            if (user && allowedEmails.includes(userEmail)) {
                setIsAuthorized(true);
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
                Verifying admin credentials...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-50">
            {/* Top navigation bar across all dashboard pages */}
            <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <span className="font-bold tracking-tight text-slate-900 dark:text-white">
                        GoMono / admin
                    </span>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <button
                            onClick={() => auth.signOut()}
                            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
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