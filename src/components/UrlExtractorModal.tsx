"use client";

import { useState, useMemo } from "react";
import { X, Search, Sparkles, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { extractUrlsDetailed } from "@/lib/url-extractor";

interface UrlExtractorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExtract: (urls: string[]) => void;
    title?: string;
    description?: string;
}

export default function UrlExtractorModal({
    isOpen,
    onClose,
    onExtract,
    title = "Bulk URL Extractor",
    description = "Paste any messy text blob, email, or article. We will parse and extract all valid URLs automatically.",
}: UrlExtractorModalProps) {
    const [rawText, setRawText] = useState("");
    const [deduplicate, setDeduplicate] = useState(true);
    const [stripTrackers, setStripTrackers] = useState(true);

    const stats = useMemo(() => {
        if (!rawText.trim()) {
            return { urls: [], totalMatched: 0, duplicatesRemoved: 0, trackersRemovedCount: 0 };
        }
        return extractUrlsDetailed(rawText, {
            deduplicate,
            stripTrackers,
        });
    }, [rawText, deduplicate, stripTrackers]);

    if (!isOpen) return null;

    const handleApply = () => {
        if (stats.urls.length === 0) {
            toast.error("No valid HTTP/HTTPS URLs found in the text.");
            return;
        }

        onExtract(stats.urls);
        toast.success(`Loaded ${stats.urls.length} extracted URL(s)!`);
        setRawText("");
        onClose();
    };

    const handleCopyExtracted = async () => {
        if (stats.urls.length === 0) return;
        try {
            await navigator.clipboard.writeText(stats.urls.join("\n"));
            toast.success(`Copied ${stats.urls.length} URLs to clipboard!`);
        } catch {
            toast.error("Failed to copy URLs");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-white transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Textarea */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                                Raw Text / Document / Log Blob
                            </label>
                            {rawText && (
                                <button
                                    type="button"
                                    onClick={() => setRawText("")}
                                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <textarea
                            rows={8}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Paste unstructured text, email body, Markdown, or chat message containing links here..."
                            className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                        />
                    </div>

                    {/* Extraction Options */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={deduplicate}
                                onChange={(e) => setDeduplicate(e.target.checked)}
                                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Deduplicate Identical URLs</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={stripTrackers}
                                onChange={(e) => setStripTrackers(e.target.checked)}
                                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Strip Invasive Trackers (fbclid/gclid)</span>
                            </span>
                        </label>
                    </div>

                    {/* Live Extraction Stats Pill */}
                    {rawText.trim() && (
                        <div className="flex items-center justify-between rounded-2xl border border-zinc-200/90 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                        {stats.urls.length}
                                    </span>{" "}
                                    <span className="text-zinc-500">extracted</span>
                                </div>
                                {stats.duplicatesRemoved > 0 && (
                                    <div className="text-zinc-500">
                                        • <span className="font-semibold text-zinc-700 dark:text-zinc-300">{stats.duplicatesRemoved}</span> duplicate(s)
                                    </div>
                                )}
                                {stats.trackersRemovedCount > 0 && (
                                    <div className="text-emerald-600 dark:text-emerald-400">
                                        • <span className="font-semibold">{stats.trackersRemovedCount}</span> tracker(s) cleaned
                                    </div>
                                )}
                            </div>

                            {stats.urls.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleCopyExtracted}
                                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 transition"
                                >
                                    <Copy className="h-3 w-3 text-zinc-400" />
                                    <span>Copy List</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={stats.urls.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition shadow-xs"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Load {stats.urls.length > 0 ? `${stats.urls.length} URLs` : "URLs"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
