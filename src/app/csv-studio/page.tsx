import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, QrCode, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeProvider";
import CsvStudio from "@/components/csv-studio/CsvStudio";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Enterprise CSV Studio & Data Grid • GoMono",
    description: "High-performance, 100% in-browser CSV and tabular data grid engine. Zero server storage, inline cell editing, deduplication, batch shortening, and ZIP QR code generation.",
};

export default function PublicCsvStudioPage() {
    return (
        <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Lighting & Minimal Grid Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.09),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-600/5 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e750_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e750_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl transition-colors">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
                    {/* Logo & Navigation Links */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/" className="group flex items-center gap-2.5 transition-transform">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs transition-colors group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:group-hover:border-zinc-700">
                                <span className="font-mono text-sm font-black tracking-tighter text-indigo-600 dark:text-indigo-400">G</span>
                            </div>
                            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">GoMono</span>
                        </Link>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

                        <nav className="flex items-center gap-1.5 sm:gap-2">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                <span className="hidden sm:inline">Shortener</span>
                            </Link>

                            <Link
                                href="/qr"
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            >
                                <QrCode className="h-3 w-3 text-indigo-500" />
                                <span className="hidden sm:inline">QR Studio</span>
                            </Link>

                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-white">
                                <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
                                <span>CSV Studio</span>
                                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    Pro
                                </span>
                            </div>
                        </nav>
                    </div>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>100% In-Browser Privacy</span>
                        </div>

                        <ThemeToggle />

                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-md transition-all hover:border-zinc-300 hover:bg-zinc-200/60 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                            <span>Admin Portal</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:pt-12 sm:pb-28">
                {/* Section Header */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 shadow-xs">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Enterprise Data Engine</span>
                        <span>•</span>
                        <span>Zero Server Storage</span>
                        <span>•</span>
                        <span>60 FPS Virtualized Grid</span>
                    </div>

                    <h1 className="mb-3 font-extrabold tracking-tight text-3xl sm:text-5xl text-zinc-950 dark:text-white">
                        Enterprise CSV Studio & Data Grid
                    </h1>
                    <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base leading-relaxed">
                        High-performance tabular workbench running 100% client-side in your browser. Clean and standardize datasets, perform batch short link generation, inject campaign UTM parameters, and generate high-res QR code ZIP archives with zero server storage.
                    </p>
                </div>

                {/* Studio Card Container */}
                <div className="rounded-3xl border border-zinc-200/90 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-950/80 p-4 sm:p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl">
                    <CsvStudio />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-950 py-8 text-xs text-zinc-500 transition-colors">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-400">GoMono</span>
                        <span>•</span>
                        <span>Zero-Storage Client-Side Data Grid & URL Engine</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Shortener
                        </Link>
                        <Link href="/qr" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                            QR Studio
                        </Link>
                        <Link href="/csv-studio" className="text-zinc-900 dark:text-white font-semibold transition-colors">
                            CSV Studio
                        </Link>
                        <Link href="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Admin Portal
                        </Link>
                        <span className="text-zinc-400 dark:text-zinc-600">© {new Date().getFullYear()} GoMono</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

