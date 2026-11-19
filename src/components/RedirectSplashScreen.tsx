"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

interface RedirectSplashScreenProps {
    alias: string;
    destinationUrl: string;
    message?: string | null;
    countdownSeconds?: number;
    domain?: string;
}

export default function RedirectSplashScreen({
    alias,
    destinationUrl,
    message,
    countdownSeconds = 3,
    domain = "to.mono.bro.bd",
}: RedirectSplashScreenProps) {
    const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
    const cleanDomain = domain.replace(/^https?:\/\//, "");

    useEffect(() => {
        if (secondsLeft <= 0) {
            window.location.href = destinationUrl;
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = destinationUrl;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, destinationUrl]);

    // Progress circle percentage
    const progress = ((countdownSeconds - secondsLeft) / countdownSeconds) * 100;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-between bg-white text-zinc-900 selection:bg-indigo-500/20 selection:text-indigo-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Lighting Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e750_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e750_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Header */}
            <header className="w-full border-b border-zinc-200/80 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="group flex items-center gap-2.5 transition-transform">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs transition-colors group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:group-hover:border-zinc-700">
                            <span className="font-mono text-sm font-black tracking-tighter text-indigo-600 dark:text-indigo-400">G</span>
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">GoMono</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Verified Redirect</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content Card */}
            <main className="flex w-full flex-1 items-center justify-center px-4 py-12">
                <div className="relative w-full max-w-lg">
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 opacity-80 blur-2xl" />

                    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 p-8 sm:p-10 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-2xl backdrop-blur-2xl space-y-6">
                        {/* Countdown Badge / Circle */}
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-zinc-200 dark:text-zinc-800"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-linear"
                                    strokeDasharray={`${progress}, 100`}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute font-mono text-2xl font-black text-zinc-900 dark:text-white">
                                {secondsLeft}
                            </span>
                        </div>

                        {/* Title & Short Link Identifier */}
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/90 px-3 py-1 text-xs font-mono font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
                                <span>{cleanDomain}/</span>
                                <span className="font-bold text-zinc-900 dark:text-white">{alias}</span>
                            </div>

                            <h1 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                                Redirecting you in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}...
                            </h1>
                        </div>

                        {/* Custom Announcement Message if provided */}
                        {message && (
                            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-4 text-xs sm:text-sm text-indigo-900 dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:text-indigo-200 leading-relaxed text-left flex items-start gap-2.5">
                                <Sparkles className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                                <div>
                                    <span className="font-semibold block mb-0.5">Note from Link Creator:</span>
                                    <span>{message}</span>
                                </div>
                            </div>
                        )}

                        {/* Destination Preview */}
                        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-3.5 text-left text-xs dark:border-zinc-800/60 dark:bg-zinc-900/50">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                Destination
                            </span>
                            <p className="font-mono text-zinc-700 dark:text-zinc-300 truncate" title={destinationUrl}>
                                {destinationUrl}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <a
                                href={destinationUrl}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition"
                            >
                                <span>Open Destination Now</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                                title="Back to GoMono Homepage"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-zinc-200/60 bg-white/40 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800/40 dark:bg-zinc-950/40 backdrop-blur-md">
                Secured by GoMono Enterprise Edge Routing
            </footer>
        </div>
    );
}
