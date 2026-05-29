"use client";

import { PlusCircle, BarChart3, Settings } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function QuickActions() {
    const router = useRouter();

    const handleScrollToCreate = () => {
        // Smoothly scroll to the form and focus the URL input
        const section = document.getElementById("create-link-section");
        section?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
            document.getElementById("originalUrlInput")?.focus();
        }, 500);
    };

    const handleExport = async () => {
        const loadingToast = toast.loading("Generating your CSV export...");

        try {
            const res = await fetch("/api/export-csv");
            if (!res.ok) throw new Error("Export failed");

            // Convert the response to a downloadable file in the browser
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `link-monowar-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success("Export complete!", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to export statistics.", { id: loadingToast });
        }
    };

    const handleSettings = () => {
        toast.info("Settings page coming soon!");
    };

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <button
                onClick={handleScrollToCreate}
                className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-neutral-800/50 bg-white shadow-sm dark:bg-neutral-900/50 p-4 text-left transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:border-blue-500/50"
            >
                <div className="rounded-lg bg-blue-100 dark:bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                    <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">Create Link</span>
            </button>

            <button
                onClick={handleExport}
                className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-neutral-800/50 bg-white shadow-sm dark:bg-neutral-900/50 p-4 text-left transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:border-emerald-500/50"
            >
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">Export Stats</span>
            </button>

            <button
                onClick={handleSettings}
                className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-neutral-800/50 bg-white shadow-sm dark:bg-neutral-900/50 p-4 text-left transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:border-neutral-500/50"
            >
                <div className="rounded-lg bg-slate-100 dark:bg-neutral-700/50 p-2 text-slate-600 dark:text-neutral-400">
                    <Settings className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">Settings</span>
            </button>
        </div>
    );
}