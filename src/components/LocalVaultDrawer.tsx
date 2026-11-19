"use client";

import { useState } from "react";
import Link from "next/link";
import {
    History,
    X,
    Copy,
    Check,
    Search,
    ExternalLink,
    Trash2,
    HardDrive,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import { useLocalLinkVault } from "@/hooks/useLocalLinkVault";
import { toast } from "sonner";

interface LocalVaultDrawerProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function LocalVaultDrawer({
    isOpen: controlledIsOpen,
    onClose: controlledOnClose,
}: LocalVaultDrawerProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    const handleClose = isControlled ? (controlledOnClose || (() => {})) : () => setInternalIsOpen(false);
    const handleOpen = () => setInternalIsOpen(true);

    const { links, isLoaded, removeLink, clearVault, count } = useLocalLinkVault();

    const handleCopy = async (shortUrl: string, alias: string) => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopiedAlias(alias);
            toast.success("Short link copied to clipboard!");
            setTimeout(() => setCopiedAlias(null), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleRemove = (alias: string) => {
        removeLink(alias);
        toast.info(`/${alias} removed from local device vault`);
    };

    const handleClearAll = () => {
        if (links.length === 0) return;
        if (confirm("Clear all locally stored links from this browser?")) {
            clearVault();
            toast.success("Device link vault cleared");
        }
    };

    const formatTimeAgo = (isoString: string) => {
        try {
            const date = new Date(isoString);
            const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            if (seconds < 60) return "Just now";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        } catch {
            return "Recently";
        }
    };

    return (
        <>
            {/* Uncontrolled Trigger Button (Available when used standalone) */}
            {!isControlled && (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-md transition-all hover:border-zinc-300 hover:bg-zinc-200/60 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                    title="View links created on this device (Stored privately in browser)"
                >
                    <History className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Device History</span>
                    {count > 0 && (
                        <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                            {count}
                        </span>
                    )}
                </button>
            )}

            {/* Slide-over Drawer Backdrop & Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={handleClose} />

                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="w-screen max-w-md transform border-l border-zinc-200 bg-white p-6 shadow-2xl transition-transform dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:p-7 flex flex-col">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        <HardDrive className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                Local Link Vault
                                            </h3>
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                0 Reads
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Privately saved to this device • {count} / 25
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {count > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearAll}
                                            className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-xs"
                                            title="Clear entire device vault"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Privacy Guarantee Banner */}
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-zinc-50/70 p-2.5 text-[11px] text-zinc-600 dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-zinc-400">
                                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Zero-server storage. Your links stay in this browser&apos;s localStorage.</span>
                            </div>

                            {/* Links List Container */}
                            <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
                                {!isLoaded ? (
                                    <div className="py-12 text-center text-xs text-zinc-400">
                                        Loading device history...
                                    </div>
                                ) : links.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 p-6">
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-zinc-900 flex items-center justify-center text-indigo-500 mb-3">
                                            <History className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                            No device links yet
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px]">
                                            Links you create in this browser will automatically appear here for one-click access.
                                        </p>
                                    </div>
                                ) : (
                                    links.map((link) => {
                                        const isCopied = copiedAlias === link.alias;
                                        return (
                                            <div
                                                key={link.alias}
                                                className="group rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700 transition"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                                        /{link.alias}
                                                    </span>

                                                    <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                                                        {formatTimeAgo(link.createdAt)}
                                                    </span>
                                                </div>

                                                <p
                                                    className="mt-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate"
                                                    title={link.originalUrl}
                                                >
                                                    {link.originalUrl}
                                                </p>

                                                {/* Action Bar */}
                                                <div className="mt-3 flex items-center justify-between border-t border-zinc-200/50 pt-2 dark:border-zinc-800/50 text-[11px]">
                                                    <div className="flex items-center gap-1">
                                                        {/* Copy Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(link.shortUrl, link.alias)}
                                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition"
                                                        >
                                                            {isCopied ? (
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

                                                        {/* Inspect '+' Button */}
                                                        <Link
                                                            href={`/${link.alias}+`}
                                                            onClick={handleClose}
                                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition"
                                                            title="Inspect destination safety and click metrics"
                                                        >
                                                            <Search className="h-3 w-3 text-indigo-500" />
                                                            <span>Inspect (+)</span>
                                                        </Link>

                                                        {/* Test Open */}
                                                        <a
                                                            href={link.shortUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                                                            title="Test short link"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>

                                                    {/* Delete single link */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(link.alias)}
                                                        className="rounded-lg p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                                        title="Remove from device vault"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Drawer Footer CTA */}
                            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 text-center">
                                <Link
                                    href="/"
                                    onClick={handleClose}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    <span>Create a new short link</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
