"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Check,
    Copy,
    ExternalLink,
    ArrowRight,
    Download,
    Search,
    Zap,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useLocalLinkVault } from "@/hooks/useLocalLinkVault";

interface PrefixShortenConfirmationProps {
    alias: string;
    shortUrl: string;
    originalUrl: string;
}

export default function PrefixShortenConfirmation({
    alias,
    shortUrl,
    originalUrl,
}: PrefixShortenConfirmationProps) {
    const [copied, setCopied] = useState(false);
    const { saveLink } = useLocalLinkVault();

    // Auto-copy and save to device vault on mount
    useEffect(() => {
        saveLink({ alias, shortUrl, originalUrl });

        if (typeof window !== "undefined" && navigator?.clipboard) {
            navigator.clipboard.writeText(shortUrl).then(() => {
                setCopied(true);
                toast.success("Short link auto-copied to clipboard!");
                setTimeout(() => setCopied(false), 3000);
            }).catch(() => {
                // Clipboard permissions might require user interaction
            });
        }
    }, [alias, shortUrl, originalUrl, saveLink]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleDownloadQr = () => {
        const svg = document.getElementById("prefix-qr-svg");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `GoMono-${alias}-QR.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
        toast.success("Vector QR Code (SVG) downloaded!");
    };

    return (
        <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Lighting & Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.2),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-600/5 blur-[120px]" />
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
                            Prefix Fast
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
                    >
                        <span>Dashboard</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 sm:py-16 text-center">
                {/* Instant Success Pill */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Instant Address-Bar Prefix Shortened</span>
                </div>

                <h1 className="mb-2 font-extrabold tracking-tight text-3xl sm:text-4xl text-zinc-900 dark:text-white">
                    Link Generated Instantly
                </h1>
                <p className="mb-8 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                    Shortened automatically via browser prefix. Your link is live on the edge network and ready to share.
                </p>

                {/* Primary Short Link Card */}
                <div className="w-full rounded-3xl border border-zinc-200/90 bg-white/90 p-6 sm:p-8 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur-xl text-left">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Active Short URL
                    </span>

                    {/* Short Link URL Input & Copy Action */}
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-2 sm:p-2.5 dark:border-indigo-500/30 dark:bg-indigo-950/20">
                        <span className="font-mono text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 truncate pl-2 select-all">
                            {shortUrl}
                        </span>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Destination Preview */}
                    <div className="mt-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                            Destination
                        </span>
                        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate select-all bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                            {originalUrl}
                        </p>
                    </div>

                    {/* QR Code Inline Preview */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900 shrink-0">
                                <QRCodeSVG
                                    id="prefix-qr-svg"
                                    value={shortUrl}
                                    size={64}
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">QR Code Ready</h4>
                                <p className="text-[11px] text-zinc-500">Vector SVG export for print or digital sharing</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadQr}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                        >
                            <Download className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Download SVG</span>
                        </button>
                    </div>

                    {/* Action Links */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href={`/${alias}+`}
                            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                        >
                            <Search className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Inspect Link Details (+)</span>
                        </Link>

                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                        >
                            <span>Test Redirect</span>
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                        </a>
                    </div>
                </div>

                {/* Return Home CTA */}
                <div className="mt-8 flex items-center justify-center gap-4 text-xs">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                        <span>Create another customized short link</span>
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
