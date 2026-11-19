"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    ShieldAlert,
    ExternalLink,
    Lock,
    Clock,
    MousePointerClick,
    Copy,
    Check,
    Sparkles,
    Smartphone,
    ArrowRight,
    Globe,
    Calendar,
    Tag,
} from "lucide-react";
import { toast } from "sonner";

export interface LinkInspectorData {
    alias: string;
    originalUrl: string;
    domain?: string;
    totalClicks?: number;
    createdAt?: string | Date | null;
    expiresAt?: string | Date | null;
    isProtected?: boolean;
    iosUrl?: string | null;
    androidUrl?: string | null;
    tags?: string[];
}

interface LinkInspectorCardProps {
    link: LinkInspectorData;
}

export default function LinkInspectorCard({ link }: LinkInspectorCardProps) {
    const [copied, setCopied] = useState(false);

    const isHttps = /^https:\/\//i.test(link.originalUrl);
    let hostname = "";
    try {
        hostname = new URL(link.originalUrl).hostname;
    } catch {
        hostname = link.originalUrl;
    }

    const shortDomain = link.domain || "to.mono.bro.bd";
    const cleanDomain = shortDomain.replace(/^(https?:\/\/)/, "");
    const fullShortUrl = `https://${cleanDomain}/${link.alias}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullShortUrl);
            setCopied(true);
            toast.success("Short link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    // Calculate expiration info
    let isExpired = false;
    let formattedExpiresAt = "";
    if (link.expiresAt) {
        const expDate = new Date(link.expiresAt);
        if (!isNaN(expDate.getTime())) {
            isExpired = expDate < new Date();
            formattedExpiresAt = expDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    }

    // Format creation date
    let formattedCreatedAt = "";
    if (link.createdAt) {
        const cDate = new Date(link.createdAt);
        if (!isNaN(cDate.getTime())) {
            formattedCreatedAt = cDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    }

    return (
        <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Background Grid */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.2),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e750_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e750_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Header */}
            <header className="border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <Link href="/" className="group flex items-center gap-2.5 transition-transform">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">
                            <span className="font-mono text-sm font-black tracking-tighter text-indigo-600 dark:text-indigo-400">G</span>
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">GoMono</span>
                        <span className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                            Inspector
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Shorten a Link</span>
                    </Link>
                </div>
            </header>

            {/* Main Inspection Container */}
            <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12 sm:py-16">
                {/* Status Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 shadow-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Destination Safety & Link Inspector</span>
                </div>

                <div className="w-full rounded-3xl border border-zinc-200/90 bg-white/90 p-6 sm:p-8 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur-xl">
                    {/* Header Row: Alias & Copy Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-800/60">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                                Short Link Alias
                            </span>
                            <h1 className="mt-0.5 font-mono text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                                /{link.alias}
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy Short URL</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Destination URL & Safety Badge */}
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                Destination Target
                            </span>

                            {isHttps ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Verified HTTPS Secure</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    <span>Insecure HTTP (No TLS)</span>
                                </span>
                            )}
                        </div>

                        {/* Destination URL Display Box */}
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 font-mono text-xs text-zinc-800 break-all select-all dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                            {link.originalUrl}
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {/* Domain Host */}
                        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <Globe className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Host</span>
                            </div>
                            <p className="mt-1 font-mono text-xs font-semibold text-zinc-900 dark:text-white truncate" title={hostname}>
                                {hostname}
                            </p>
                        </div>

                        {/* Human Clicks */}
                        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <MousePointerClick className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Clicks</span>
                            </div>
                            <p className="mt-1 font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                                {(link.totalClicks || 0).toLocaleString()} human
                            </p>
                        </div>

                        {/* Security Gate */}
                        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <Lock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Passcode</span>
                            </div>
                            <p className="mt-1 font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                                {link.isProtected ? "Protected" : "Public"}
                            </p>
                        </div>

                        {/* Expiration Status */}
                        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                            </div>
                            <p className={`mt-1 font-mono text-xs font-semibold ${isExpired ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {isExpired ? "Expired" : "Active"}
                            </p>
                        </div>
                    </div>

                    {/* Dates & Smart Routing Details if Present */}
                    {(formattedCreatedAt || formattedExpiresAt || link.iosUrl || link.androidUrl) && (
                        <div className="mt-4 space-y-2 rounded-2xl border border-zinc-100 bg-zinc-50/40 p-3.5 text-xs text-zinc-500 dark:border-zinc-800/50 dark:bg-zinc-900/30">
                            {formattedCreatedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>Created On</span>
                                    </span>
                                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formattedCreatedAt}</span>
                                </div>
                            )}

                            {formattedExpiresAt && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <Clock className="h-3 w-3" />
                                        <span>Expires On</span>
                                    </span>
                                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formattedExpiresAt}</span>
                                </div>
                            )}

                            {(link.iosUrl || link.androidUrl) && (
                                <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                        <Smartphone className="h-3 w-3" />
                                        <span>Device-Based Smart Routing Active</span>
                                    </div>
                                    {link.iosUrl && (
                                        <p className="text-[10px] text-zinc-500 font-mono truncate">iOS: {link.iosUrl}</p>
                                    )}
                                    {link.androidUrl && (
                                        <p className="text-[10px] text-zinc-500 font-mono truncate">Android: {link.androidUrl}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tag Pills */}
                    {link.tags && link.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            <Tag className="h-3 w-3 text-zinc-400 mr-1" />
                            {link.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                        <a
                            href={link.originalUrl}
                            rel="noopener noreferrer"
                            className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:scale-[0.99] transition-all"
                        >
                            <span>Proceed to Destination</span>
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        <Link
                            href="/"
                            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-100/80 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
                        >
                            <span>Shorten New Link</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Footer disclaimer */}
                <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600 max-w-md">
                    Inspection mode allows previewing target URLs safely without triggering click trackers or automated redirects.
                </p>
            </main>
        </div>
    );
}
