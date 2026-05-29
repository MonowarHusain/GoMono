"use client";

import { PlusCircle, BarChart3, Settings } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. Added this import

export default function QuickActions() {
    const router = useRouter(); // 2. Initialized the router here

    const handleScrollToCreate = () => {
        // Smoothly scroll to the form and focus the URL input
        const section = document.getElementById("create-link-section");
        section?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
            // Ensure you have an id="originalUrlInput" on your CreateLinkForm input!
            document.getElementById("originalUrlInput")?.focus();
        }, 500);
    };

    const handleExport = async () => {
        const loadingToast = toast.loading("Generating your CSV export...");

        try {
            // Target the route handler we just created
            const res = await fetch("/api/export");
            if (!res.ok) throw new Error("Export failed");

            // Convert the response to a downloadable file in the browser
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mononode-export-${new Date().toISOString().split('T')[0]}.csv`;
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
        router.push("/dashboard/settings"); // This will now work perfectly
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Create Link */}
            <button
                onClick={handleScrollToCreate}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-500/50 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-blue-500/50 dark:hover:bg-neutral-800"
            >
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Create Link</span>
            </button>

            {/* Export Stats */}
            <button
                onClick={handleExport}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-500/50 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-emerald-500/50 dark:hover:bg-neutral-800"
            >
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Export Stats</span>
            </button>

            {/* Settings */}
            <button
                onClick={handleSettings}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-500/50 dark:hover:bg-neutral-800"
            >
                <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    <Settings className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Settings</span>
            </button>
        </div>
    );
}