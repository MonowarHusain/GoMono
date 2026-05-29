"use client";

import { useState } from "react";
import {
    Link2, Sparkles, Tag, Flame, Clock, Lock,
    ChevronDown, ChevronUp, Share2, Navigation,
    Megaphone, Search, LayoutTemplate, Copy, Check, Download, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateLinkForm() {
    const router = useRouter();

    // UI Toggles
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isUtmOpen, setIsUtmOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Success State
    const [createdData, setCreatedData] = useState<{ shortUrl: string; originalUrl: string; alias: string } | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setCreatedData(null); // Clear previous success state
        const toastId = toast.loading("Creating short link...");

        const form = e.currentTarget;
        const formData = new FormData(form);

        let finalOriginalUrl = formData.get("originalUrl") as string;
        const selectedDomain = (formData.get("domain") as string) || "to.mono.bro.bd";

        // --- UTM Builder Logic ---
        const utmSource = formData.get("utmSource");
        const utmMedium = formData.get("utmMedium");
        const utmCampaign = formData.get("utmCampaign");
        const utmTerm = formData.get("utmTerm");
        const utmContent = formData.get("utmContent");

        if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent) {
            try {
                const urlObj = new URL(finalOriginalUrl);
                if (utmSource) urlObj.searchParams.set("utm_source", utmSource as string);
                if (utmMedium) urlObj.searchParams.set("utm_medium", utmMedium as string);
                if (utmCampaign) urlObj.searchParams.set("utm_campaign", utmCampaign as string);
                if (utmTerm) urlObj.searchParams.set("utm_term", utmTerm as string);
                if (utmContent) urlObj.searchParams.set("utm_content", utmContent as string);
                finalOriginalUrl = urlObj.toString();
            } catch (error) {
                toast.error("Please enter a valid URL to attach UTM parameters.", { id: toastId });
                setLoading(false);
                return;
            }
        }

        const data = {
            originalUrl: finalOriginalUrl,
            customAlias: formData.get("customAlias"),
            domain: selectedDomain, // NEW: Include domain in the payload
            tags: formData.get("tags"),
            maxClicks: formData.get("maxClicks"),
            expiresAt: formData.get("expiresAt"),
            password: formData.get("password"),
        };

        try {
            const res = await fetch("/api/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Failed to create link");
            }

            toast.success("Link shortened successfully!", { id: toastId });

            // Calculate the full short URL based on the SELECTED domain
            const fullShortUrl = `https://${selectedDomain}/${responseData.alias}`;

            // Show the success panel
            setCreatedData({
                shortUrl: fullShortUrl,
                originalUrl: finalOriginalUrl,
                alias: responseData.alias
            });

            form.reset();
            setIsAdvancedOpen(false);
            setIsUtmOpen(false);
            router.refresh();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message === "Alias already taken"
                ? "That custom alias is already in use!"
                : "Error creating link. Check the console.",
                { id: toastId }
            );
        } finally {
            setLoading(false);
        }
    }

    // Handle Copy to Clipboard
    const handleCopy = () => {
        if (!createdData) return;
        navigator.clipboard.writeText(createdData.shortUrl);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle QR Code Download
    const handleDownloadQR = async () => {
        if (!createdData) return;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(createdData.shortUrl)}`;

        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `QR-${createdData.alias}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(qrUrl, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Destination URL */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Link2 className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                        id="originalUrlInput"
                        name="originalUrl"
                        type="url"
                        required
                        placeholder="https://example.com/very-long-url"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500/50"
                    />
                </div>

                {/* Domain & Alias Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* NEW: Domain Selection */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Globe className="h-5 w-5 text-neutral-400" />
                        </div>
                        <select
                            name="domain"
                            className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500/50"
                        >
                            <option value="to.mono.bro.bd">to.mono.bro.bd (Personal)</option>
                            <option value="go.mono.bro.bd">go.mono.bro.bd (Tech)</option>
                        </select>
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Sparkles className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                            name="customAlias"
                            type="text"
                            placeholder="Custom Alias (optional)"
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-purple-500/50"
                        />
                    </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/30">
                    <button
                        type="button"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="flex w-full items-center justify-between p-4 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Advanced Settings</span>
                        {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isAdvancedOpen && (
                        <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 p-4 md:grid-cols-2 dark:border-neutral-800">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Tag className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input name="tags" type="text" placeholder="Tags (e.g. event, personal)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Flame className="h-4 w-4 text-red-400" />
                                </div>
                                <input name="maxClicks" type="number" min="1" placeholder="Burn limit (e.g. 100)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-red-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                </div>
                                <input name="expiresAt" type="datetime-local" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:focus:border-amber-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input name="password" type="password" placeholder="Require Password" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-neutral-500/50 focus:ring-4 focus:ring-neutral-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-500/50" />
                            </div>
                        </div>
                    )}
                </div>

                {/* UTM Builder Toggle */}
                <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/30">
                    <button
                        type="button"
                        onClick={() => setIsUtmOpen(!isUtmOpen)}
                        className="flex w-full items-center justify-between p-4 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">UTM Builder</span>
                        {isUtmOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isUtmOpen && (
                        <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 p-4 md:grid-cols-2 dark:border-neutral-800">
                            <div className="relative md:col-span-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Share2 className="h-4 w-4 text-indigo-400" />
                                </div>
                                <input name="utmSource" type="text" placeholder="Campaign Source (e.g. facebook, newsletter)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-indigo-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Navigation className="h-4 w-4 text-indigo-400" />
                                </div>
                                <input name="utmMedium" type="text" placeholder="Campaign Medium (e.g. cpc, email)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-indigo-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Megaphone className="h-4 w-4 text-indigo-400" />
                                </div>
                                <input name="utmCampaign" type="text" placeholder="Campaign Name (e.g. spring_sale)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-indigo-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Search className="h-4 w-4 text-indigo-400" />
                                </div>
                                <input name="utmTerm" type="text" placeholder="Campaign Term (e.g. running+shoes)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-indigo-500/50" />
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <LayoutTemplate className="h-4 w-4 text-indigo-400" />
                                </div>
                                <input name="utmContent" type="text" placeholder="Campaign Content (e.g. logolink, textlink)" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-indigo-500/50" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-[160px] items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                    {loading ? "Shortening..." : "Shorten Link"}
                </button>
            </form>

            {/* ========================================== */}
            {/* SUCCESS PANEL (Appears after link creation) */}
            {/* ========================================== */}
            {createdData && (
                <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-6 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                    <h3 className="mb-4 text-sm font-bold text-emerald-700 dark:text-emerald-400">Link Successfully Created!</h3>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={createdData.shortUrl}
                                    className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-neutral-800 outline-none dark:border-emerald-900/50 dark:bg-neutral-900 dark:text-neutral-100"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 p-3 text-white transition-all hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="max-w-[300px] truncate text-xs text-neutral-500 lg:max-w-md dark:text-neutral-400">
                                Target: {createdData.originalUrl}
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-center gap-3 border-l border-emerald-200/50 pl-6 dark:border-emerald-900/50">
                            <div className="rounded-lg bg-white p-1 shadow-sm">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(createdData.shortUrl)}`}
                                    alt="QR Code"
                                    className="h-20 w-20"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadQR}
                                className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}