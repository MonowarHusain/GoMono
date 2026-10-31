"use client";

import { deleteLink } from "@/app/dashboard/actions";
import { useState, useMemo } from "react";
import QRCodeModal from "./QRCodeModal";
import EditLinkModal from "./EditLinkModal";
import LinkAnalyticsModal from "./LinkAnalyticsModal";
import { toast } from "sonner";
import {
    Copy, QrCode, Trash2, ExternalLink, MousePointerClick,
    ShieldAlert, Pencil, Globe, ShieldCheck, Search, X, Smartphone, BarChart2
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

    // Filter and search links
    const filteredLinks = useMemo(() => {
        return initialLinks.filter((link) => {
            const isPub = isPublicLink(link);
            if (filter === "admin" && isPub) return false;
            if (filter === "public" && !isPub) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchAlias = link.alias.toLowerCase().includes(query);
                const matchUrl = link.originalUrl.toLowerCase().includes(query);
                const matchTag = link.tags?.some((t) => t.toLowerCase().includes(query));
                return matchAlias || matchUrl || matchTag;
            }
            return true;
        });
    }, [initialLinks, filter, searchQuery]);

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

                <div className="flex items-center gap-3">
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
                                    return (
                                        <tr
                                            key={link.alias}
                                            className={`group transition-all duration-500 ${
                                                isNew
                                                    ? "bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/40"
                                                    : "hover:bg-slate-50 dark:hover:bg-neutral-800/30"
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 dark:text-white">/{link.alias}</span>
                                                    {isNew && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                                                            NEW
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
                                                    {link.maxClicks && link.totalClicks >= link.maxClicks && (
                                                        <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                                            Burned
                                                        </span>
                                                    )}
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

                                                {/* Tag Pills */}
                                                {link.tags && link.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {link.tags.map((tag) => (
                                                            <span key={tag} className="rounded-md border border-slate-300/50 dark:border-neutral-700/50 bg-slate-100 dark:bg-neutral-800/50 px-2 py-0.5 text-[10px] text-slate-500 dark:text-neutral-400">
                                                                #{tag}
                                                            </span>
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
                                                <div className="max-w-[200px] md:max-w-[300px] truncate text-slate-700 dark:text-neutral-300">
                                                    {link.originalUrl}
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