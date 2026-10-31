"use client";

import { useState } from "react";
import { X, Navigation } from "lucide-react";
import { toast } from "sonner";
import { CsvColumn, UtmOptions } from "@/lib/csv-studio/types";

interface CsvUtmModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: CsvColumn[];
    onApplyUtm: (options: UtmOptions) => void;
}

export default function CsvUtmModal({
    isOpen,
    onClose,
    columns,
    onApplyUtm,
}: CsvUtmModalProps) {
    const urlCols = columns.filter((c) => c.type === "url" || /url|link|site/i.test(c.name));
    const defaultCol = urlCols[0]?.id || columns[0]?.id || "";

    const [targetColumnId, setTargetColumnId] = useState<string>(defaultCol);
    const [source, setSource] = useState("google");
    const [medium, setMedium] = useState("cpc");
    const [campaign, setCampaign] = useState("q4_promo");
    const [term, setTerm] = useState("");
    const [content, setContent] = useState("");
    const [overwriteExisting, setOverwriteExisting] = useState(true);

    if (!isOpen) return null;

    const previewUrl = `https://example.com/page?utm_source=${source || "source"}&utm_medium=${medium || "medium"}&utm_campaign=${campaign || "campaign"}${term ? `&utm_term=${term}` : ""}${content ? `&utm_content=${content}` : ""}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetColumnId) {
            toast.error("Please select a target URL column.");
            return;
        }

        onApplyUtm({
            targetColumnId,
            source: source.trim(),
            medium: medium.trim(),
            campaign: campaign.trim(),
            term: term.trim() || undefined,
            content: content.trim() || undefined,
            overwriteExisting,
        });

        toast.success("UTM tracking parameters injected!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-150">
            <div
                className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <Navigation className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Batch UTM Parameter Injector
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Automatically append campaign analytics tracking to URLs
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Target Column containing URLs *
                        </label>
                        <select
                            value={targetColumnId}
                            onChange={(e) => setTargetColumnId(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                            {columns.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name} ({col.type.toUpperCase()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">utm_source *</label>
                            <input
                                type="text"
                                required
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="google, newsletter"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">utm_medium *</label>
                            <input
                                type="text"
                                required
                                value={medium}
                                onChange={(e) => setMedium(e.target.value)}
                                placeholder="cpc, email, social"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">utm_campaign *</label>
                            <input
                                type="text"
                                required
                                value={campaign}
                                onChange={(e) => setCampaign(e.target.value)}
                                placeholder="black_friday_2026"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">utm_term (Optional)</label>
                            <input
                                type="text"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                placeholder="keywords"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">utm_content (Optional)</label>
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="banner_a"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
                        <input
                            type="checkbox"
                            checked={overwriteExisting}
                            onChange={(e) => setOverwriteExisting(e.target.checked)}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Overwrite existing UTM query parameters</span>
                    </label>

                    {/* Preview Strip */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="block text-[10px] font-mono text-zinc-400 uppercase">Live Output Sample:</span>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-700 dark:text-zinc-300" title={previewUrl}>
                            {previewUrl}
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md"
                        >
                            Inject UTMs into Column
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
