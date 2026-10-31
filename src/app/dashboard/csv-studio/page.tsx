import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import CsvStudio from "@/components/csv-studio/CsvStudio";

export const metadata: Metadata = {
    title: "CSV Studio & Data Grid • GoMono",
    description: "High-performance, 100% in-browser CSV and tabular data grid engine. Zero server storage, inline cell editing, deduplication, batch shortening, and ZIP QR code generation.",
};

export default function CsvStudioPage() {
    return (
        <div className="space-y-6">
            {/* Header intro */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                CSV Studio & Data Grid Engine
                            </h1>
                            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                Client-Only
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Zero server storage • 60 FPS Virtualized 10,000+ Row Editor • Native Link Shortening & QR Batch Export
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Zero-Storage Guarantee</span>
                    </div>
                </div>
            </div>

            {/* Studio Workspace */}
            <CsvStudio />
        </div>
    );
}
