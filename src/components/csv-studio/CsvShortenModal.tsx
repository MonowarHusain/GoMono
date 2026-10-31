"use client";

import { useState } from "react";
import { X, Link2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { CsvColumn, CsvRow } from "@/lib/csv-studio/types";

interface CsvShortenModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: CsvColumn[];
    rows: CsvRow[];
    onApplyShortenedColumn: (newColumnName: string, updatedRows: CsvRow[]) => void;
}

const DOMAIN_OPTIONS = [
    "go.mono.bro.bd",
    "to.mono.bro.bd",
    "mono.bro.bd",
];

export default function CsvShortenModal({
    isOpen,
    onClose,
    columns,
    rows,
    onApplyShortenedColumn,
}: CsvShortenModalProps) {
    const urlCols = columns.filter((c) => c.type === "url" || /url|link|href|site/i.test(c.name));
    const defaultCol = urlCols[0]?.id || columns[0]?.id || "";

    const [targetColumnId, setTargetColumnId] = useState<string>(defaultCol);
    const [selectedDomain, setSelectedDomain] = useState(DOMAIN_OPTIONS[0]);
    const [tagsInput, setTagsInput] = useState("csv-import");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, status: "" });

    if (!isOpen) return null;

    const handleExecuteShorten = async () => {
        if (!targetColumnId) {
            toast.error("Please select a target column containing URLs.");
            return;
        }

        const validUrls = rows.map((r, i) => ({
            rowIndex: i,
            url: (r[targetColumnId] || "").trim(),
        })).filter((item) => Boolean(item.url));

        if (validUrls.length === 0) {
            toast.error("No valid URLs found in the selected column.");
            return;
        }

        setIsProcessing(true);
        const total = validUrls.length;
        setProgress({ current: 0, total, status: `Preparing ${total} URLs for shortening...` });

        // Retrieve auth token if logged in
        let token: string | null = null;
        if (auth.currentUser) {
            try {
                token = await auth.currentUser.getIdToken();
            } catch {
                // public fallback
            }
        }

        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const newShortUrlsMap = new Map<number, string>();
        let completed = 0;
        let failed = 0;

        // Process sequentially or small chunks of 3 for concurrency without rate limit
        const CHUNK_SIZE = 3;
        for (let i = 0; i < validUrls.length; i += CHUNK_SIZE) {
            const chunk = validUrls.slice(i, i + CHUNK_SIZE);
            await Promise.all(
                chunk.map(async (item) => {
                    try {
                        const headers: Record<string, string> = {
                            "Content-Type": "application/json",
                        };
                        if (token) {
                            headers["Authorization"] = `Bearer ${token}`;
                        }

                        const res = await fetch("/api/links", {
                            method: "POST",
                            headers,
                            body: JSON.stringify({
                                originalUrl: item.url,
                                domain: selectedDomain,
                                tags,
                            }),
                        });

                        if (res.ok) {
                            const data = await res.json();
                            const cleanDomain = (data.domain || selectedDomain).replace(/^https?:\/\//, "");
                            const shortUrl = `https://${cleanDomain}/${data.alias}`;
                            newShortUrlsMap.set(item.rowIndex, shortUrl);
                        } else {
                            failed++;
                        }
                    } catch {
                        failed++;
                    } finally {
                        completed++;
                        setProgress({
                            current: completed,
                            total,
                            status: `Shortening ${completed} of ${total} URLs...`,
                        });
                    }
                })
            );
        }

        // Apply new column to rows
        const targetColObj = columns.find((c) => c.id === targetColumnId);
        const newColName = `${targetColObj?.name || "URL"}_GoMono_Short`;

        const updatedRows = rows.map((row, idx) => {
            return {
                ...row,
                [newColName]: newShortUrlsMap.get(idx) || "",
            };
        });

        setIsProcessing(false);
        onApplyShortenedColumn(newColName, updatedRows);
        toast.success(`Successfully shortened ${completed - failed} URLs!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-150">
            <div
                className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                            <Link2 className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Shorten Column URLs
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Native GoMono edge shortening pipeline
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Target URL Column *
                        </label>
                        <select
                            value={targetColumnId}
                            onChange={(e) => setTargetColumnId(e.target.value)}
                            disabled={isProcessing}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                            {columns.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name} ({col.type.toUpperCase()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Short Domain
                        </label>
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            disabled={isProcessing}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 font-mono"
                        >
                            {DOMAIN_OPTIONS.map((dom) => (
                                <option key={dom} value={dom}>
                                    {dom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Tags (Comma-separated)
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            disabled={isProcessing}
                            placeholder="marketing, campaign-q4, bulk"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        />
                    </div>

                    {isProcessing && (
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 p-4 dark:bg-blue-500/10 space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
                                <span className="flex items-center gap-1.5">
                                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                                    {progress.status}
                                </span>
                                <span className="font-mono">
                                    {Math.round((progress.current / Math.max(1, progress.total)) * 100)}%
                                </span>
                            </div>

                            <div className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-950 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-200"
                                    style={{
                                        width: `${(progress.current / Math.max(1, progress.total)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleExecuteShorten}
                            disabled={isProcessing || !targetColumnId}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md"
                        >
                            {isProcessing ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    <span>Processing Batch...</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="h-4 w-4 text-blue-400" />
                                    <span>Shorten URLs & Append Column</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
