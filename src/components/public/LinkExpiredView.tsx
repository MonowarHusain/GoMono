"use client";

import Link from "next/link";
import { Clock, Flame, ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

interface LinkExpiredViewProps {
    alias: string;
    domain?: string;
    isExpired?: boolean;
    isLimitReached?: boolean;
    expirationDate?: Date | null;
    maxClicks?: number | null;
    totalClicks?: number;
}

export default function LinkExpiredView({
    alias,
    domain = "to.mono.bro.bd",
    isExpired = false,
    isLimitReached = false,
    expirationDate = null,
    maxClicks = null,
    totalClicks = 0,
}: LinkExpiredViewProps) {
    const cleanDomain = domain.replace(/^https?:\/\//, "");

    // Determine primary icon and theme accent
    const isBoth = isExpired && isLimitReached;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-between bg-white text-zinc-900 selection:bg-amber-500/20 selection:text-amber-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-amber-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Lighting & Mesh Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-orange-600/5 dark:bg-orange-600/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e750_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e750_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Top Navigation Bar */}
            <header className="w-full border-b border-zinc-200/80 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    {/* GoMono Logo Link */}
                    <Link href="/" className="group flex items-center gap-2.5 transition-transform">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs transition-colors group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:group-hover:border-zinc-700">
                            <span className="font-mono text-sm font-black tracking-tighter text-indigo-600 dark:text-indigo-400">G</span>
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">GoMono</span>
                        <span className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                            v2.0
                        </span>
                    </Link>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Link Inactive</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex w-full flex-1 items-center justify-center px-4 py-12">
                <div className="relative w-full max-w-lg">
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-red-500/10 dark:from-amber-600/20 dark:via-orange-600/20 dark:to-red-600/20 opacity-80 blur-2xl transition-all" />

                    {/* Card Container */}
                    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 p-7 sm:p-10 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-2xl backdrop-blur-2xl">
                        {/* Emblem Icon */}
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 border border-amber-200/60 text-amber-600 shadow-xs dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                            {isBoth ? (
                                <ShieldAlert className="h-10 w-10" />
                            ) : isLimitReached ? (
                                <Flame className="h-10 w-10 text-orange-500" />
                            ) : (
                                <Clock className="h-10 w-10" />
                            )}
                        </div>

                        {/* Title Requirement: "This link has expired or reached its click limit" */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                            This link has expired or reached its click limit
                        </h1>

                        {/* Moniker Badge */}
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/90 px-3.5 py-1 text-xs font-mono font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
                            <span className="text-zinc-400 dark:text-zinc-500 font-sans">{cleanDomain}/</span>
                            <span className="font-semibold text-zinc-900 dark:text-white">{alias}</span>
                        </div>

                        {/* Subtitle / Context */}
                        <p className="mt-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                            The creator of this short link configured automated expiration policies. Access to the destination has been securely deactivated.
                        </p>

                        {/* Status Breakdown Badges */}
                        <div className="mt-6 flex flex-col gap-2.5 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 text-left text-xs dark:border-zinc-800/60 dark:bg-zinc-900/50">
                            {isExpired && (
                                <div className="flex items-start gap-2.5">
                                    <Clock className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            Time Limit Exceeded:
                                        </span>{" "}
                                        <span className="text-zinc-600 dark:text-zinc-400">
                                            {expirationDate
                                                ? `Expired on ${expirationDate.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}.`
                                                : "This link has passed its scheduled expiration timestamp."}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {isLimitReached && (
                                <div className="flex items-start gap-2.5">
                                    <Flame className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            Click Limit Exhausted:
                                        </span>{" "}
                                        <span className="text-zinc-600 dark:text-zinc-400">
                                            {maxClicks
                                                ? `Reached the burn limit of ${maxClicks} ${maxClicks === 1 ? "click" : "clicks"} (${totalClicks} recorded).`
                                                : "This link has reached its maximum allowed click visits."}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/"
                                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span>Return to GoMono</span>
                            </Link>

                            <Link
                                href="/"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-100/80 px-5 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-200/70 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                            >
                                <span>Create a Short Link</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-zinc-200/60 dark:border-zinc-800/40 py-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                <span>GoMono Automated Link Security • Zero Broken Redirects</span>
            </footer>
        </div>
    );
}

