import Link from "next/link";
import {
    Link2,
    Wrench,
    Flame,
    Clock,
    Search,
    ShieldAlert,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-between bg-white text-zinc-900 selection:bg-indigo-500/20 selection:text-indigo-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Mesh Lighting Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(239,68,68,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-rose-600/5 blur-[120px]" />
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
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-md hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 transition"
                        >
                            <Wrench className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Tools Hub</span>
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content Recovery Card */}
            <main className="flex w-full flex-1 items-center justify-center px-4 py-12">
                <div className="relative w-full max-w-lg">
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 dark:from-rose-600/20 dark:via-amber-600/20 dark:to-indigo-600/20 opacity-80 blur-2xl" />

                    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 p-8 sm:p-10 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-2xl backdrop-blur-2xl space-y-6">
                        {/* 404 Badge */}
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-200/80 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/50 shadow-inner">
                            <ShieldAlert className="h-10 w-10 text-rose-500 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                HTTP 404 • Resource Missing
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                                Link Not Found or Expired
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                                The link you are trying to visit does not exist, has expired, or was already burned after its first visit.
                            </p>
                        </div>

                        {/* Diagnostics / Reasons Checklist */}
                        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/60 p-4 text-left dark:border-zinc-800/60 dark:bg-zinc-900/40 space-y-2.5 text-xs">
                            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                <span><strong>Typo in custom alias:</strong> Check the spelling in the URL bar.</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                <Flame className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                <span><strong>Burn-After-Reading link:</strong> Destroyed immediately after 1st click.</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span><strong>Expired or quota exceeded:</strong> Link closed automatically.</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-3 px-4 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition"
                            >
                                <Link2 className="h-4 w-4" />
                                <span>Create Short Link</span>
                            </Link>

                            <Link
                                href="/tools"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 px-4 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                            >
                                <Wrench className="h-4 w-4 text-indigo-500" />
                                <span>Open Tools Hub</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-zinc-200/60 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800/60 font-mono">
                GoMono Enterprise Suite • Zero-Storage Architecture
            </footer>
        </div>
    );
}
