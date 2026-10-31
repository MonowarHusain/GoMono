"use client";

import { useState } from "react";
import {
    Link2, Sparkles, Globe, ChevronDown, ChevronUp,
    Flame, Clock, Lock, Copy, Check, Download, ExternalLink,
    ArrowRight, Loader2, RefreshCw, Layers
} from "lucide-react";
import { toast } from "sonner";
import BulkShortenerModal from "@/components/dashboard/BulkShortenerModal";

interface ShortenResult {
    shortUrl: string;
    originalUrl: string;
    alias: string;
}

export default function PublicShortener() {
    const [loading, setLoading] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [originalUrl, setOriginalUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("to.mono.bro.bd");
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    // Advanced options
    const [maxClicks, setMaxClicks] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [password, setPassword] = useState("");

    // Success State
    const [result, setResult] = useState<ShortenResult | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!originalUrl.trim()) {
            toast.error("Please enter a valid destination URL");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Shortening your link...");

        try {
            const payload = {
                originalUrl: originalUrl.trim(),
                customAlias: customAlias.trim() || undefined,
                domain: selectedDomain,
                maxClicks: maxClicks ? parseInt(maxClicks, 10) : undefined,
                expiresAt: expiresAt || undefined,
                password: password.trim() || undefined,
            };

            const res = await fetch("/api/links", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409 || data.error?.includes("already taken")) {
                    throw new Error("That custom alias is already in use. Please choose another.");
                }
                throw new Error(data.error || "Failed to shorten link");
            }

            const cleanDomain = selectedDomain.replace(/^(https?:\/\/)/, "");
            const fullShortUrl = `https://${cleanDomain}/${data.alias}`;

            setResult({
                shortUrl: fullShortUrl,
                originalUrl: originalUrl.trim(),
                alias: data.alias,
            });

            toast.success("Short link ready!", { id: toastId });
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Something went wrong while shortening the link.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.shortUrl);
            setCopied(true);
            toast.success("Short URL copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    };

    const handleDownloadQR = async () => {
        if (!result) return;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(result.shortUrl)}`;

        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `GoMono-${result.alias}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("QR code downloaded!");
        } catch {
            window.open(qrUrl, "_blank");
        }
    };

    const resetForm = () => {
        setResult(null);
        setOriginalUrl("");
        setCustomAlias("");
        setMaxClicks("");
        setExpiresAt("");
        setPassword("");
        setIsAdvancedOpen(false);
    };

    return (
        <div className="w-full max-w-2xl">
            {!result ? (
                <div className="relative rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    {/* Glowing highlight */}
                    <div className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                    {/* Mode Switcher Banner */}
                    <div className="mb-5 flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                                Single Link Mode
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsBulkOpen(true)}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 transition-all hover:border-blue-500/60 hover:bg-blue-500/20 hover:text-white"
                        >
                            <Layers className="h-3.5 w-3.5 text-blue-400 transition-transform group-hover:scale-110" />
                            <span>Bulk Shortener</span>
                            <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[10px] font-bold text-blue-300">
                                Up to 50
                            </span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* URL Input Box */}
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                                <Link2 className="h-5 w-5" />
                            </div>
                            <input
                                id="publicOriginalUrl"
                                type="url"
                                required
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                                placeholder="Paste long destination URL (e.g., https://example.com/docs/...)"
                                className="w-full rounded-2xl border border-neutral-700/80 bg-neutral-950/80 py-4 pl-12 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 sm:text-base"
                            />
                        </div>

                        {/* Domain & Custom Alias Options */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* Domain Selector */}
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-10 pr-8 text-xs font-medium text-neutral-300 outline-none transition-all focus:border-blue-500/60 sm:text-sm"
                                >
                                    <option value="to.mono.bro.bd">to.mono.bro.bd</option>
                                    <option value="go.mono.bro.bd">go.mono.bro.bd</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>

                            {/* Custom Alias */}
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    value={customAlias}
                                    onChange={(e) => setCustomAlias(e.target.value)}
                                    placeholder="Custom alias (optional)"
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 pl-10 pr-4 text-xs text-neutral-200 placeholder-neutral-500 outline-none transition-all focus:border-purple-500/60 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Optional Advanced Settings Toggle */}
                        <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/40">
                            <button
                                type="button"
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-200"
                            >
                                <span>Optional link security & expiration</span>
                                {isAdvancedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            {isAdvancedOpen && (
                                <div className="grid grid-cols-1 gap-3 border-t border-neutral-800/80 p-4 sm:grid-cols-3">
                                    {/* Burn limit */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-red-400">
                                            <Flame className="h-3.5 w-3.5" />
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            value={maxClicks}
                                            onChange={(e) => setMaxClicks(e.target.value)}
                                            placeholder="Max clicks (burn)"
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-red-500/50"
                                        />
                                    </div>

                                    {/* Expiration date */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400">
                                            <Clock className="h-3.5 w-3.5" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={expiresAt}
                                            onChange={(e) => setExpiresAt(e.target.value)}
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-200 outline-none focus:border-amber-500/50"
                                        />
                                    </div>

                                    {/* Password protection */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                                            <Lock className="h-3.5 w-3.5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password protect"
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-blue-500/30 active:scale-[0.99] disabled:opacity-50 sm:text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Generating Link...</span>
                                </>
                            ) : (
                                <>
                                    <span>Shorten Link Free</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Secondary bulk prompt */}
                    <div className="mt-4 pt-3 border-t border-neutral-800 text-center">
                        <button
                            type="button"
                            onClick={() => setIsBulkOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-blue-400"
                        >
                            <Layers className="h-3.5 w-3.5 text-blue-400" />
                            <span>Need to shorten up to 50 links at once? Try Bulk Shortener →</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* Success Card */
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    {/* Glowing Accent */}
                    <div className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                Public Link Created Successfully
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Shorten Another</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        {/* URL Copy Box & Details */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={result.shortUrl}
                                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 font-mono text-sm font-semibold text-emerald-400 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    title="Copy to clipboard"
                                    className="flex shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-black font-semibold transition-all hover:bg-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                                >
                                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                </button>
                                <a
                                    href={result.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open link"
                                    className="flex shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </div>

                            <p className="max-w-[400px] truncate text-xs text-neutral-400">
                                <span className="text-neutral-500">Destination:</span> {result.originalUrl}
                            </p>
                        </div>

                        {/* QR Code Section */}
                        <div className="flex shrink-0 flex-col items-center gap-2.5 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                            <div className="rounded-lg bg-white p-1.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(result.shortUrl)}`}
                                    alt="QR Code"
                                    className="h-20 w-20"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadQR}
                                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download QR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Shortener Modal */}
            <BulkShortenerModal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
            />
        </div>
    );
}
