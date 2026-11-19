"use client";

import { deleteLink } from "@/app/dashboard/actions";
import { useState, useMemo } from "react";
import QRCodeModal from "./QRCodeModal";
import EditLinkModal from "./EditLinkModal";
import LinkAnalyticsModal from "./LinkAnalyticsModal";
import { toast } from "sonner";
import {
    Copy, QrCode, Trash2, ExternalLink, MousePointerClick,
    ShieldAlert, Pencil, Globe, ShieldCheck, Search, X, Smartphone, BarChart2,
    Activity, Loader2, Flame, Pin, Tag
} from "lucide-react";
import { notifyLinkDeleted } from "@/lib/events";
import type { Link } from "@/types/link";

export type { Link };

type FilterType = "all" | "admin" | "public";

export interface LinksTableProps {
    initialLinks: Link[];
    newestAlias?: string | null;
    isRefreshing?: boolean;
    onDelete?: (alias: string) => void;
}

export default function LinksTable({
    initialLinks,
    newestAlias,
    isRefreshing = false,
    onDelete,
}: LinksTableProps) {
    const [activeQR, setActiveQR] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [analyticsLink, setAnalyticsLink] = useState<Link | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [pinnedAliases, setPinnedAliases] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set();
        try {
            const raw = localStorage.getItem("gomono_pinned_links");
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch {
            return new Set();
        }
    });

    const togglePin = (alias: string) => {
        setPinnedAliases((prev) => {
            const next = new Set(prev);
            if (next.has(alias)) next.delete(alias);
            else next.add(alias);
            try {
                localStorage.setItem("gomono_pinned_links", JSON.stringify(Array.from(next)));
            } catch {
                // ignore
            }
            return next;
        });
    };
    const [healthMap, setHealthMap] = useState<Record<string, { status: number; ok: boolean; statusText: string; latencyMs: number }>>({});
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);

    const handleCheckHealth = async () => {
        const urlsToCheck = Array.from(new Set(filteredLinks.map((l) => l.originalUrl))).slice(0, 25);
        if (urlsToCheck.length === 0) {
            toast.info("No URLs found to check");
            return;
        }

        setIsCheckingHealth(true);
        const toastId = toast.loading(`Checking health for ${urlsToCheck.length} destination URLs...`);

        try {
            const res = await fetch("/api/health-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: urlsToCheck }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Health check failed");

            const nextMap: Record<string, { status: number; ok: boolean; statusText: string; latencyMs: number }> = {};
            let okCount = 0;
            let failCount = 0;

            for (const r of data.results || []) {
                nextMap[r.url] = {
                    status: r.status,
                    ok: r.ok,
                    statusText: r.statusText,
                    latencyMs: r.latencyMs,
                };
                if (r.ok) okCount++;
                else failCount++;
            }

            setHealthMap((prev) => ({ ...prev, ...nextMap }));
            toast.success(`Health check complete: ${okCount} OK, ${failCount} issues`, { id: toastId });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Health check failed";
            toast.error(msg, { id: toastId });
        } finally {
            setIsCheckingHealth(false);
        }
    };

    // Helper to evaluate public ownership reliably
    const isPublicLink = (l: Link) =>
        l.isPublic === true ||
        l.creatorType === "public" ||
        l.createdBy === "public" ||
        (l.isAdminOnly === false && !l.userId);

    // Calculate count totals
    const counts = useMemo(() => {
        let admin = 0;
        let pub = 0;
        initialLinks.forEach((l) => {
            if (isPublicLink(l)) {
                pub++;
            } else {
                admin++;
            }
        });
        return {
            all: initialLinks.length,
            admin,
            public: pub,
        };
    }, [initialLinks]);

    // Extract all unique color-tag categories across links
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        initialLinks.forEach((l) => {
            if (Array.isArray(l.tags)) {
                l.tags.forEach((t) => {
                    const clean = t.trim();
                    if (clean) tagSet.add(clean);
                });
            }
        });
        return Array.from(tagSet).sort();
    }, [initialLinks]);

    // Filter, search, and sort links (with pinned links floating to top)
    const filteredLinks = useMemo(() => {
        const list = initialLinks.filter((link) => {
            const isPub = isPublicLink(link);
            if (filter === "admin" && isPub) return false;
            if (filter === "public" && !isPub) return false;

            if (selectedTag && (!Array.isArray(link.tags) || !link.tags.includes(selectedTag))) {
                return false;
            }

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchAlias = link.alias.toLowerCase().includes(query);
                const matchUrl = link.originalUrl.toLowerCase().includes(query);
                const matchTag = link.tags?.some((t) => t.toLowerCase().includes(query));
                return matchAlias || matchUrl || matchTag;
            }
            return true;
        });

        return list.sort((a, b) => {
            const aPinned = pinnedAliases.has(a.alias) || Boolean(a.isPinned);
            const bPinned = pinnedAliases.has(b.alias) || Boolean(b.isPinned);
            if (aPinned === bPinned) return 0;
            return aPinned ? -1 : 1;
        });
    }, [initialLinks, filter, searchQuery, selectedTag, pinnedAliases]);

    // Updated to accept the specific link object being copied
    const handleCopy = async (linkToCopy: Link) => {
        const linkDomain = linkToCopy.domain || "go.mono.bro.bd";
        const cleanDomain = linkDomain.replace(/^(https?:\/\/)/, "");
        const fullLink = `https://${cleanDomain}/${linkToCopy.alias}`;

        await navigator.clipboard.writeText(fullLink);
        toast.success("Copied to clipboard!");
    };

    const handleDelete = async (alias: string) => {
        setIsDeleting(alias);
        const result = await deleteLink(alias);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`Link /${alias} deleted successfully`);
            notifyLinkDeleted(alias);
            onDelete?.(alias);
        }
        setIsDeleting(null);
    };

    return (
        <div className="space-y-4">
            {/* Filter Tabs, Live Sync Indicator and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Tabs */}
                <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900/60">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filter === "all"
                                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                    >
                        <span>All Links</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            filter === "all"
                                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white"
                                : "bg-neutral-200/80 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}>
                            {counts.all}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("admin")}
                        className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filter === "admin"
                                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                    >
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                        <span>Admin Links</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            filter === "admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                : "bg-neutral-200/80 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}>
                            {counts.admin}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("public")}
                        className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            filter === "public"
                                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                    >
                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Public / Anonymous Links</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            filter === "public"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-neutral-200/80 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}>
                            {counts.public}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Check Link Health Action Button */}
                    <button
                        type="button"
                        onClick={handleCheckHealth}
                        disabled={isCheckingHealth || filteredLinks.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
                        title="Run HTTP HEAD health check on current URLs"
                    >
                        {isCheckingHealth ? (
                            <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                        ) : (
                            <Activity className="h-3 w-3 text-indigo-500" />
                        )}
                        <span>Check Health</span>
                    </button>

                    {/* Live Sync Status Indicator */}
                    <div
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
                        title="Real-time link synchronization active"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isRefreshing ? "animate-ping" : "animate-pulse"}`} />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span>{isRefreshing ? "Syncing..." : "Live"}</span>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-56">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search alias or URL..."
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-8 text-xs outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Color-Coded Tag Filter Bar */}
            {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 flex items-center gap-1 shrink-0">
                        <Tag className="h-3 w-3" />
                        <span>Filter Tags:</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
                            selectedTag === null
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                    >
                        All ({initialLinks.length})
                    </button>
                    {allTags.map((tag) => {
                        const count = initialLinks.filter((l) => Array.isArray(l.tags) && l.tags.includes(tag)).length;
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
                                    selectedTag === tag
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                                }`}
                            >
                                <span>#{tag}</span>
                                <span className={`rounded-full px-1 text-[9px] ${
                                    selectedTag === tag
                                        ? "bg-white/20 text-white"
                                        : "bg-indigo-200/60 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Table or Empty State */}
            {initialLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl bg-white shadow-sm dark:bg-neutral-900/50">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800/50 flex items-center justify-center mb-4">
                        <ExternalLink className="h-6 w-6 text-slate-600 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-neutral-400 font-medium">No links created yet</p>
                    <p className="text-sm text-slate-600 mt-1">Use the form above to shorten your first URL.</p>
                </div>
            ) : filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl bg-white shadow-sm dark:bg-neutral-900/50">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-800/50 flex items-center justify-center mb-3">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-slate-700 dark:text-neutral-300 font-medium">No links match current filter</p>
                    <p className="text-xs text-slate-500 mt-1">
                        {filter === "public"
                            ? "No public or anonymous links match this filter."
                            : filter === "admin"
                            ? "No admin-created links match this filter."
                            : "Try clearing your search query."}
                    </p>
                </div>
            ) : (
                <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="border-b border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 text-slate-500 dark:text-neutral-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Alias & Details</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Destination</th>
                                    <th className="px-6 py-4 font-medium">Analytics</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {filteredLinks.map((link) => {
                                    const isPub = isPublicLink(link);
                                    const isNew = link.alias === newestAlias;
                                    const isPinned = pinnedAliases.has(link.alias) || Boolean(link.isPinned);
                                    return (
                                        <tr
                                            key={link.alias}
                                            className={`group transition-all duration-500 ${
                                                isNew
                                                    ? "bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/40"
                                                    : isPinned
                                                    ? "bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10"
                                                    : "hover:bg-slate-50 dark:hover:bg-neutral-800/30"
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePin(link.alias)}
                                                        className={`rounded-md p-1 transition ${
                                                            isPinned
                                                                ? "text-amber-500 bg-amber-500/15 hover:bg-amber-500/25"
                                                                : "text-neutral-300 hover:text-amber-500 dark:text-neutral-600 dark:hover:text-amber-400"
                                                        }`}
                                                        title={isPinned ? "Unpin link" : "Pin link to top"}
                                                    >
                                                        <Pin className={`h-3.5 w-3.5 ${isPinned ? "rotate-45 fill-amber-500 text-amber-500" : ""}`} />
                                                    </button>
                                                    <span className="font-semibold text-slate-900 dark:text-white">/{link.alias}</span>
                                                    {isNew && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                                                            NEW
                                                        </span>
                                                    )}
                                                    {isPinned && (
                                                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                                                            Pinned
                                                        </span>
                                                    )}
                                                    {link.isProtected && (
                                                        <span title="Password Protected" className="flex items-center">
                                                            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                                        </span>
                                                    )}
                                                    {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                                                        <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                                            Expired
                                                        </span>
                                                    )}
                                                    {(link.isBurned || (link.burnAfterRead && link.totalClicks >= 1)) ? (
                                                        <span className="flex items-center gap-1 rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider animate-pulse">
                                                            <Flame className="h-3 w-3" />
                                                            <span>Burned</span>
                                                        </span>
                                                    ) : link.burnAfterRead ? (
                                                        <span className="flex items-center gap-1 rounded bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                                                            <Flame className="h-3 w-3" />
                                                            <span>1-Time Only</span>
                                                        </span>
                                                    ) : link.maxClicks && link.totalClicks >= link.maxClicks ? (
                                                        <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                                            Limit Reached
                                                        </span>
                                                    ) : null}
                                                    {Boolean(link.iosUrl || link.androidUrl) && (
                                                        <span
                                                            title={`Smart Device Routing:\n${link.iosUrl ? `iOS: ${link.iosUrl}\n` : ''}${link.androidUrl ? `Android: ${link.androidUrl}` : ''}`}
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400"
                                                        >
                                                            <Smartphone className="h-3 w-3" />
                                                            <span>Smart Routing</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Tag Pills (Clickable Category Filters) */}
                                                {link.tags && link.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {link.tags.map((tag) => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                                                className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                                                                    selectedTag === tag
                                                                        ? "bg-indigo-600 text-white shadow-xs"
                                                                        : "border border-indigo-200/50 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                                }`}
                                                                title={`Filter by #${tag}`}
                                                            >
                                                                #{tag}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="text-xs text-slate-600 dark:text-slate-500 mt-2">
                                                    {new Date(link.createdAt).toLocaleDateString()}
                                                    {link.maxClicks && ` • Limit: ${link.maxClicks} clicks`}
                                                    {link.expiresAt && ` • Expires: ${new Date(link.expiresAt).toLocaleDateString()}`}
                                                </div>
                                            </td>

                                            {/* Creator Classifier Badge */}
                                            <td className="px-6 py-4">
                                                {isPub ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <Globe className="h-3 w-3" />
                                                        <span>Public</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        <span>Admin</span>
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <div className="max-w-[200px] md:max-w-[300px] truncate text-slate-700 dark:text-neutral-300">
                                                        {link.originalUrl}
                                                    </div>
                                                    {healthMap[link.originalUrl] && (
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                                                healthMap[link.originalUrl].ok
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                    : healthMap[link.originalUrl].status >= 300 && healthMap[link.originalUrl].status < 400
                                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                            }`}
                                                            title={`Status: ${healthMap[link.originalUrl].status} ${healthMap[link.originalUrl].statusText} (${healthMap[link.originalUrl].latencyMs}ms)`}
                                                        >
                                                            {healthMap[link.originalUrl].ok
                                                                ? `● 200 OK (${healthMap[link.originalUrl].latencyMs}ms)`
                                                                : healthMap[link.originalUrl].status >= 300 && healthMap[link.originalUrl].status < 400
                                                                ? `● ${healthMap[link.originalUrl].status} Redirect`
                                                                : `● ${healthMap[link.originalUrl].status || "Broken"}`}
                                                        </span>
                                                    )}
                                                </div>
                                                {(link.iosUrl || link.androidUrl) && (
                                                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                                                        {link.iosUrl && (
                                                            <span title={link.iosUrl} className="truncate max-w-[150px]">
                                                                iOS: {link.iosUrl.replace(/^https?:\/\//, "")}
                                                            </span>
                                                        )}
                                                        {link.androidUrl && (
                                                            <span title={link.androidUrl} className="truncate max-w-[150px]">
                                                                Android: {link.androidUrl.replace(/^https?:\/\//, "")}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setAnalyticsLink(link)}
                                                    className="flex items-center gap-2 rounded-full bg-slate-100 hover:bg-blue-500/10 hover:border-blue-500/40 dark:bg-neutral-800/50 dark:hover:bg-blue-500/15 dark:hover:border-blue-500/40 px-3 py-1 w-fit border border-slate-300/50 dark:border-neutral-700/50 transition-all cursor-pointer group/analytics"
                                                    title="View detailed link intelligence & traffic logs"
                                                >
                                                    <MousePointerClick className="h-3.5 w-3.5 text-blue-500 group-hover/analytics:scale-110 transition-transform" />
                                                    <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">{link.totalClicks}</span>
                                                    <span className="text-[10px] text-blue-500 font-medium opacity-0 group-hover/analytics:opacity-100 transition-opacity hidden sm:inline">
                                                        Insights
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        onClick={() => setAnalyticsLink(link)}
                                                        className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                                        title="View Analytics & Telemetry"
                                                    >
                                                        <BarChart2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingLink(link)}
                                                        className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                                        title="Edit Link"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        // Updated to pass the full link object
                                                        onClick={() => handleCopy(link)}
                                                        className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all"
                                                        title="Copy URL"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        // Updated QR code to use the correct domain dynamically
                                                        onClick={() => {
                                                             const d = link.domain || "go.mono.bro.bd";
                                                             const cleanD = d.replace(/^(https?:\/\/)/, "");
                                                             setActiveQR(`https://${cleanD}/${link.alias}`);
                                                         }}
                                                         className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-green-400 hover:bg-green-400/10 transition-all"
                                                         title="Generate QR Code"
                                                     >
                                                         <QrCode className="h-4 w-4" />
                                                     </button>
                                                     <button
                                                         onClick={() => handleDelete(link.alias)}
                                                         disabled={isDeleting === link.alias}
                                                         className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                                                         title="Delete Link"
                                                     >
                                                         <Trash2 className="h-4 w-4" />
                                                     </button>
                                                 </div>
                                             </td>
                                         </tr>
                                     );
                                 })}
                             </tbody>
                         </table>
                     </div>

                     {activeQR && (
                         <QRCodeModal url={activeQR} onClose={() => setActiveQR(null)} />
                     )}

                     {editingLink && (
                         <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} />
                     )}

                     {analyticsLink && (
                         <LinkAnalyticsModal
                             key={analyticsLink.alias}
                             isOpen={!!analyticsLink}
                             onClose={() => setAnalyticsLink(null)}
                             link={analyticsLink}
                         />
                     )}
                 </div>
             )}
         </div>
     );
}