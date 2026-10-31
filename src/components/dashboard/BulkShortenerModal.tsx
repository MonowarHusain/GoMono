"use client";

import { useState, useRef, useId } from "react";
import Link from "next/link";
import {
    X,
    Layers,
    UploadCloud,
    FileText,
    Check,
    Copy,
    Download,
    QrCode,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
    ExternalLink,
    RefreshCw,
    Sparkles,
    Globe,
    Tag,
    Trash2,
    Table,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import QRCodeModal from "./QRCodeModal";
import { notifyLinkCreated } from "@/lib/events";

const MAX_BATCH_LIMIT = 50;

export interface BulkItemResult {
    id: string;
    originalUrl: string;
    formattedUrl: string;
    status: "pending" | "processing" | "success" | "error";
    alias?: string;
    shortUrl?: string;
    error?: string;
    createdAt?: string;
}

interface BulkShortenerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLinksCreated?: () => void;
}

export default function BulkShortenerModal({
    isOpen,
    onClose,
    onLinksCreated,
}: BulkShortenerModalProps) {
    const fileInputId = useId();
    // Modal View State: 'input' | 'processing' | 'results'
    const [view, setView] = useState<"input" | "processing" | "results">("input");

    // Input States
    const [rawUrls, setRawUrls] = useState("");
    const [domain, setDomain] = useState("to.mono.bro.bd");
    const [tags, setTags] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Processing & Results State
    const [results, setResults] = useState<BulkItemResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressCount, setProgressCount] = useState(0);
    const [totalToProcess, setTotalToProcess] = useState(0);

    // Filter in Results View
    const [resultFilter, setResultFilter] = useState<"all" | "success" | "error">("all");

    // QR Code Modal
    const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);

    // Clipboard Copy Feedback
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

    if (!isOpen) return null;

    // Helper: Parse lines from textarea
    const getCleanUrlsList = (): string[] => {
        return rawUrls
            .split("\n")
            .map((u) => u.trim())
            .filter((u) => u.length > 0);
    };

    const parsedUrls = getCleanUrlsList();
    const urlCount = parsedUrls.length;
    const isOverLimit = urlCount > MAX_BATCH_LIMIT;

    // Sample URLs for quick testing
    const handleLoadSampleData = () => {
        const samples = [
            "https://github.com/monowarhusain/gomono",
            "https://nextjs.org/docs/app/building-your-application",
            "https://tailwindcss.com/docs/styling-with-utility-classes",
            "https://firebase.google.com/docs/firestore",
            "https://developer.mozilla.org/en-US/docs/Web/API",
        ];
        setRawUrls(samples.join("\n"));
        toast.info("Loaded 5 sample URLs");
    };

    const handleClearInput = () => {
        setRawUrls("");
    };

    // File Upload / Drag & Drop Handler
    const handleFileUpload = (file: File) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (extension !== "txt" && extension !== "csv") {
            toast.error("Please upload a .txt or .csv file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                toast.error("File appears to be empty");
                return;
            }

            const extractedUrls: string[] = [];

            if (extension === "txt") {
                const lines = content.split(/\r?\n/);
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith("#")) {
                        extractedUrls.push(trimmed);
                    }
                }
            } else if (extension === "csv") {
                const lines = content.split(/\r?\n/);
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // CSV cell parser handling commas inside quotes
                    const cells: string[] = [];
                    let currentCell = "";
                    let inQuotes = false;

                    for (let charIdx = 0; charIdx < line.length; charIdx++) {
                        const char = line[charIdx];
                        if (char === '"' || char === "'") {
                            inQuotes = !inQuotes;
                        } else if (char === "," && !inQuotes) {
                            cells.push(currentCell.trim());
                            currentCell = "";
                        } else {
                            currentCell += char;
                        }
                    }
                    cells.push(currentCell.trim());

                    // Check if line 0 is a header (e.g. contains 'url', 'destination', 'original')
                    if (i === 0) {
                        const isHeader = cells.some((c) =>
                            /^(url|original url|original_url|link|destination|target|long url)$/i.test(
                                c.replace(/["']/g, "")
                            )
                        );
                        if (isHeader) continue;
                    }

                    // Look for a cell that looks like a URL
                    const urlCell = cells.find((cell) => {
                        const clean = cell.replace(/["']/g, "").trim();
                        return (
                            /^https?:\/\//i.test(clean) ||
                            /^www\./i.test(clean) ||
                            (clean.includes(".") && !clean.includes(" ") && clean.length > 4)
                        );
                    });

                    if (urlCell) {
                        extractedUrls.push(urlCell.replace(/["']/g, "").trim());
                    } else if (cells[0]) {
                        // Fallback to first cell if non-empty
                        const fallback = cells[0].replace(/["']/g, "").trim();
                        if (fallback && !fallback.includes(" ")) {
                            extractedUrls.push(fallback);
                        }
                    }
                }
            }

            if (extractedUrls.length === 0) {
                toast.error("No valid URLs found in the uploaded file");
                return;
            }

            let finalUrls = extractedUrls;
            if (finalUrls.length > MAX_BATCH_LIMIT) {
                toast.warning(
                    `Loaded ${finalUrls.length} URLs. Limited to the first ${MAX_BATCH_LIMIT} per batch.`
                );
                finalUrls = finalUrls.slice(0, MAX_BATCH_LIMIT);
            } else {
                toast.success(`Imported ${finalUrls.length} URLs from ${file.name}`);
            }

            setRawUrls(finalUrls.join("\n"));
        };

        reader.readAsText(file);
    };

    // Format & Validate a single URL
    const formatAndValidateUrl = (
        raw: string
    ): { valid: boolean; formatted: string; error?: string } => {
        let trimmed = raw.trim();
        if (!trimmed) {
            return { valid: false, formatted: "", error: "Empty URL" };
        }

        if (!/^https?:\/\//i.test(trimmed)) {
            trimmed = `https://${trimmed}`;
        }

        try {
            const parsed = new URL(trimmed);
            if (!parsed.hostname || !parsed.hostname.includes(".")) {
                return { valid: false, formatted: trimmed, error: "Invalid hostname" };
            }
            return { valid: true, formatted: parsed.toString() };
        } catch {
            return { valid: false, formatted: trimmed, error: "Malformed URL structure" };
        }
    };

    // Main Batch Processing Flow
    const handleGenerateLinks = async () => {
        const urlsToProcess = parsedUrls.slice(0, MAX_BATCH_LIMIT);
        if (urlsToProcess.length === 0) {
            toast.error("Please enter at least one URL to shorten");
            return;
        }

        setIsProcessing(true);
        setView("processing");
        setProgressCount(0);
        setTotalToProcess(urlsToProcess.length);

        // Initialize state items
        const initialItems: BulkItemResult[] = urlsToProcess.map((url, idx) => ({
            id: `bulk-${Date.now()}-${idx}`,
            originalUrl: url,
            formattedUrl: url,
            status: "pending",
        }));
        setResults(initialItems);

        // Resolve auth token (if logged in as admin/demo, otherwise acts as public)
        let token: string | null = null;
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                token = await currentUser.getIdToken();
            } catch (err) {
                console.warn("Could not retrieve Firebase ID token, falling back to public link creation", err);
            }
        }

        const cleanDomain = domain.replace(/^(https?:\/\/)/, "");
        const commonTags = tags.trim();

        // Process queue with concurrency = 3
        const CONCURRENCY = 3;
        const updatedResults: BulkItemResult[] = [...initialItems];
        let completed = 0;

        const processItem = async (index: number) => {
            const item = updatedResults[index];
            item.status = "processing";
            setResults([...updatedResults]);

            const validation = formatAndValidateUrl(item.originalUrl);
            item.formattedUrl = validation.formatted;

            if (!validation.valid) {
                item.status = "error";
                item.error = validation.error || "Invalid URL";
                completed++;
                setProgressCount(completed);
                setResults([...updatedResults]);
                return;
            }

            try {
                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                };
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const payload = {
                    originalUrl: validation.formatted,
                    domain: cleanDomain,
                    tags: commonTags || undefined,
                };

                const res = await fetch("/api/links", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Server responded with ${res.status}`);
                }

                item.status = "success";
                item.alias = data.alias;
                item.shortUrl = `https://${cleanDomain}/${data.alias}`;
                item.createdAt = new Date().toISOString();
            } catch (err: unknown) {
                item.status = "error";
                item.error = err instanceof Error ? err.message : "Failed to shorten link";
            } finally {
                completed++;
                setProgressCount(completed);
                setResults([...updatedResults]);
            }
        };

        // Worker Pool execution
        let currentIndex = 0;
        const workers = Array.from({ length: Math.min(CONCURRENCY, urlsToProcess.length) }, async () => {
            while (currentIndex < urlsToProcess.length) {
                const nextIdx = currentIndex++;
                await processItem(nextIdx);
            }
        });

        await Promise.all(workers);

        setIsProcessing(false);
        setView("results");

        const successCount = updatedResults.filter((r) => r.status === "success").length;
        const failCount = updatedResults.filter((r) => r.status === "error").length;

        if (failCount === 0) {
            toast.success(`Successfully generated all ${successCount} short links!`);
        } else {
            toast.info(`Batch finished: ${successCount} succeeded, ${failCount} failed.`);
        }

        // Notify and sync dashboard views
        if (successCount > 0) {
            const firstSuccess = updatedResults.find((r) => r.status === "success" && r.alias);
            if (firstSuccess) {
                notifyLinkCreated({
                    alias: firstSuccess.alias!,
                    originalUrl: firstSuccess.formattedUrl || firstSuccess.originalUrl,
                    domain: cleanDomain,
                });
            } else {
                notifyLinkCreated();
            }
        }

        // Trigger parent dashboard refresh if available
        if (onLinksCreated) {
            onLinksCreated();
        }
    };

    // Export CSV of batch results
    const handleDownloadCSV = () => {
        if (results.length === 0) return;

        const headers = ["#", "Original URL", "Short URL", "Alias", "Status", "Error", "Created At"];
        const rows = results.map((r, idx) => [
            idx + 1,
            `"${(r.formattedUrl || r.originalUrl).replace(/"/g, '""')}"`,
            r.shortUrl ? `"${r.shortUrl}"` : '""',
            r.alias ? `"${r.alias}"` : '""',
            r.status,
            r.error ? `"${r.error.replace(/"/g, '""')}"` : '""',
            r.createdAt ? `"${r.createdAt}"` : `"${new Date().toISOString()}"`,
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GoMono-bulk-links-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("CSV export downloaded!");
    };

    // Copy All Successful Links
    const handleCopyAllLinks = async () => {
        const successfulLinks = results
            .filter((r) => r.status === "success" && r.shortUrl)
            .map((r) => r.shortUrl as string);

        if (successfulLinks.length === 0) {
            toast.error("No successful links to copy");
            return;
        }

        try {
            await navigator.clipboard.writeText(successfulLinks.join("\n"));
            setCopiedAll(true);
            toast.success(`Copied ${successfulLinks.length} short links to clipboard!`);
            setTimeout(() => setCopiedAll(false), 2500);
        } catch {
            toast.error("Failed to copy links to clipboard");
        }
    };

    // Copy single short link
    const handleCopySingle = async (item: BulkItemResult) => {
        if (!item.shortUrl) return;
        try {
            await navigator.clipboard.writeText(item.shortUrl);
            setCopiedRowId(item.id);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopiedRowId(null), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    // Reset to start a new batch
    const handleResetAll = () => {
        setView("input");
        setRawUrls("");
        setResults([]);
        setProgressCount(0);
        setTotalToProcess(0);
    };

    // Filtered results
    const filteredResults = results.filter((r) => {
        if (resultFilter === "success") return r.status === "success";
        if (resultFilter === "error") return r.status === "error";
        return true;
    });

    const successTotal = results.filter((r) => r.status === "success").length;
    const errorTotal = results.filter((r) => r.status === "error").length;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-5 dark:border-neutral-800/80">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                        Bulk URL Shortener
                                    </h2>
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                        BATCH ENGINE
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Shorten up to {MAX_BATCH_LIMIT} URLs in seconds with high-speed concurrency
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard/csv-studio"
                                onClick={onClose}
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 transition shadow-xs"
                                title="Open CSV Studio for multi-column editing, deduplication, and batch QR generation"
                            >
                                <Table className="h-3.5 w-3.5 text-indigo-500" />
                                <span>CSV Studio</span>
                            </Link>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* ========================================================= */}
                        {/* VIEW 1: INPUT VIEW */}
                        {/* ========================================================= */}
                        {view === "input" && (
                            <div className="space-y-6">
                                {/* Configuration Row */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                                            <span>Destination Domain</span>
                                        </label>
                                        <select
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-sm font-medium text-neutral-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        >
                                            <option value="to.mono.bro.bd">to.mono.bro.bd (Personal)</option>
                                            <option value="go.mono.bro.bd">go.mono.bro.bd (Tech)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                            <Tag className="h-3.5 w-3.5 text-purple-500" />
                                            <span>Batch Tags (optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            placeholder="e.g. bulk, campaign, social"
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-sm font-medium text-neutral-800 outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>
                                </div>

                                {/* Main Textarea Area */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                                            <span>Paste Long URLs (One per line)</span>
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleLoadSampleData}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                <span>Load Samples</span>
                                            </button>

                                            {rawUrls && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearInput}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-red-500 dark:text-neutral-400"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span>Clear</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            rows={8}
                                            value={rawUrls}
                                            onChange={(e) => setRawUrls(e.target.value)}
                                            placeholder={"https://example.com/long-page-1\nhttps://example.com/long-page-2\nhttps://github.com/monowarhusain"}
                                            className="w-full resize-y rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 font-mono text-xs text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-200 dark:placeholder-neutral-600 dark:focus:bg-neutral-900"
                                        />

                                        {/* Status / Count Tag inside bottom right */}
                                        <div className="pointer-events-none absolute bottom-3 right-3">
                                            <span
                                                className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold ${
                                                    isOverLimit
                                                        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                                                        : urlCount > 0
                                                        ? "bg-neutral-200/80 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                                                        : "bg-neutral-200/50 text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-500"
                                                }`}
                                            >
                                                {urlCount} / {MAX_BATCH_LIMIT} URLs
                                            </span>
                                        </div>
                                    </div>

                                    {isOverLimit && (
                                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            <span>
                                                You pasted {urlCount} URLs. Only the first {MAX_BATCH_LIMIT} will be processed per batch.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Drag & Drop or File Upload Box */}
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                                        isDragging
                                            ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-500/10"
                                            : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/30 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/50"
                                    }`}
                                >
                                    <input
                                        id={fileInputId}
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt,.csv"
                                        aria-label="Upload .csv or .txt file containing URLs"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file);
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-400">
                                        <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        Drop your <span className="font-mono text-blue-600 dark:text-blue-400">.csv</span> or{" "}
                                        <span className="font-mono text-blue-600 dark:text-blue-400">.txt</span> file here, or click to browse
                                    </p>
                                    <p className="mt-1 text-[11px] text-neutral-400">
                                        Automatically parses URL columns and line-delimited lists
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* VIEW 2: PROCESSING STATE */}
                        {/* ========================================================= */}
                        {view === "processing" && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="relative mb-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
                                        <Loader2 className="h-10 w-10 animate-spin" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    Shortening Your Links...
                                </h3>
                                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    Processing concurrent requests across edge endpoints
                                </p>

                                {/* Progress Bar */}
                                <div className="mt-8 w-full max-w-md">
                                    <div className="mb-2 flex items-center justify-between text-xs font-medium">
                                        <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {progressCount} / {totalToProcess} (
                                            {totalToProcess > 0
                                                ? Math.round((progressCount / totalToProcess) * 100)
                                                : 0}
                                            %)
                                        </span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                                            style={{
                                                width: `${totalToProcess > 0 ? (progressCount / totalToProcess) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* VIEW 3: RESULTS DASHBOARD */}
                        {/* ========================================================= */}
                        {view === "results" && (
                            <div className="space-y-6">
                                {/* Summary Metric Cards & Actions */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            Total Batch
                                        </span>
                                        <p className="mt-1 font-mono text-2xl font-bold text-neutral-900 dark:text-white">
                                            {results.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                Generated
                                            </span>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                            {successTotal}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Failed / Skipped
                                            </span>
                                            {errorTotal > 0 && <XCircle className="h-4 w-4 text-red-500" />}
                                        </div>
                                        <p
                                            className={`mt-1 font-mono text-2xl font-bold ${
                                                errorTotal > 0
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-neutral-900 dark:text-white"
                                            }`}
                                        >
                                            {errorTotal}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons: Download CSV & Copy All Links */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-100 py-3 dark:border-neutral-800">
                                    {/* Filter Tabs */}
                                    <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900">
                                        <button
                                            type="button"
                                            onClick={() => setResultFilter("all")}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                                resultFilter === "all"
                                                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                                                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                                            }`}
                                        >
                                            All ({results.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setResultFilter("success")}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                                resultFilter === "success"
                                                    ? "bg-white text-emerald-700 shadow-sm dark:bg-neutral-800 dark:text-emerald-400"
                                                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                                            }`}
                                        >
                                            Success ({successTotal})
                                        </button>
                                        {errorTotal > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setResultFilter("error")}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                                    resultFilter === "error"
                                                        ? "bg-white text-red-600 shadow-sm dark:bg-neutral-800 dark:text-red-400"
                                                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                                                }`}
                                            >
                                                Failed ({errorTotal})
                                            </button>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCopyAllLinks}
                                            disabled={successTotal === 0}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                        >
                                            {copiedAll ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span>Copied All</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5 text-neutral-500" />
                                                    <span>Copy All Links</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDownloadCSV}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span>Download CSV</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/60">
                                    <div className="max-h-[380px] overflow-x-auto overflow-y-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/95 font-semibold text-neutral-600 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-400">
                                                <tr>
                                                    <th className="py-3 px-4">Status</th>
                                                    <th className="py-3 px-4">Original URL</th>
                                                    <th className="py-3 px-4">Short Link</th>
                                                    <th className="py-3 px-4 text-center">QR Code</th>
                                                    <th className="py-3 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 font-mono dark:divide-neutral-800/80">
                                                {filteredResults.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-8 text-center text-neutral-400">
                                                            No results match the selected filter.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredResults.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
                                                        >
                                                            {/* Status */}
                                                            <td className="py-3 px-4 whitespace-nowrap">
                                                                {item.status === "success" ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        OK
                                                                    </span>
                                                                ) : item.status === "error" ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                                        <XCircle className="h-3 w-3" />
                                                                        Failed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Original URL */}
                                                            <td className="py-3 px-4 max-w-[220px] truncate font-sans text-neutral-700 dark:text-neutral-300">
                                                                <span title={item.originalUrl}>
                                                                    {item.originalUrl}
                                                                </span>
                                                                {item.error && (
                                                                    <p className="mt-0.5 text-[10px] font-sans text-red-500">
                                                                        {item.error}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            {/* Short Link */}
                                                            <td className="py-3 px-4 whitespace-nowrap">
                                                                {item.shortUrl ? (
                                                                    <a
                                                                        href={item.shortUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                                                    >
                                                                        <span>{item.shortUrl}</span>
                                                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-neutral-400">—</span>
                                                                )}
                                                            </td>

                                                            {/* QR Option */}
                                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                                {item.shortUrl ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveQrUrl(item.shortUrl || null)}
                                                                        title="View & Download QR Code"
                                                                        className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-1.5 text-neutral-600 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-purple-500/50 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                                                                    >
                                                                        <QrCode className="h-3.5 w-3.5" />
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-neutral-400">—</span>
                                                                )}
                                                            </td>

                                                            {/* Row Actions */}
                                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                                {item.shortUrl ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopySingle(item)}
                                                                        title="Copy short link"
                                                                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-sans font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                                    >
                                                                        {copiedRowId === item.id ? (
                                                                            <>
                                                                                <Check className="h-3 w-3 text-emerald-500" />
                                                                                <span>Copied</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Copy className="h-3 w-3" />
                                                                                <span>Copy</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-neutral-400">—</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800/80 dark:bg-neutral-900/30">
                        {view === "input" && (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={urlCount === 0 || isProcessing}
                                    onClick={handleGenerateLinks}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-40"
                                >
                                    <span>
                                        Generate {urlCount > 0 ? `${Math.min(urlCount, MAX_BATCH_LIMIT)} Links` : "Links"}
                                    </span>
                                </button>
                            </>
                        )}

                        {view === "processing" && (
                            <div className="flex w-full items-center justify-center text-xs text-neutral-400">
                                <span>Please keep this window open while links are being processed</span>
                            </div>
                        )}

                        {view === "results" && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Shorten Another Batch</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Embedded QR Code Modal for viewing/downloading individual QR */}
            {activeQrUrl && (
                <QRCodeModal
                    url={activeQrUrl}
                    onClose={() => setActiveQrUrl(null)}
                />
            )}
        </>
    );
}

