"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { type Link } from "./LinksTable";
import { type LinkAnalyticsData, type ClickLog } from "@/app/api/analytics/route";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import {
    X,
    RotateCw,
    MousePointerClick,
    Smartphone,
    Monitor,
    Tablet,
    Globe,
    Download,
    ExternalLink,
    Copy,
    Check,
    Clock,
    Activity,
    Cpu,
    Compass
} from "lucide-react";

interface LinkAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: Link | null;
}

function formatRelativeTime(dateStr?: string | null): string {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getDeviceIcon(device: string) {
    const d = device.toLowerCase();
    if (d === "mobile") return <Smartphone className="h-4 w-4" />;
    if (d === "tablet") return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
}

export default function LinkAnalyticsModal({
    isOpen,
    onClose,
    link,
}: LinkAnalyticsModalProps) {
    const [analytics, setAnalytics] = useState<LinkAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Refresh analytics on-demand (no continuous polling)
    const refreshAnalytics = useCallback(async (alias: string) => {
        setIsRefreshing(true);

        try {
            const user = auth.currentUser;
            const headers: Record<string, string> = {};
            if (user) {
                try {
                    const token = await user.getIdToken();
                    headers["Authorization"] = `Bearer ${token}`;
                } catch {
                    // ignore token fetch error
                }
            }

            const res = await fetch(`/api/analytics?alias=${encodeURIComponent(alias)}`, {
                headers,
            });

            if (!res.ok) {
                throw new Error(`Failed to load analytics: ${res.statusText}`);
            }

            const data: LinkAnalyticsData = await res.json();
            setAnalytics(data);
            toast.success("Analytics refreshed");
        } catch (err) {
            console.error("Failed to load analytics data", err);
            toast.error("Failed to refresh link analytics");
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Initial load on mount or alias change
    useEffect(() => {
        if (!isOpen || !link?.alias) return;

        let isMounted = true;
        const alias = link.alias;

        async function initFetch() {
            try {
                const user = auth.currentUser;
                const headers: Record<string, string> = {};
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        headers["Authorization"] = `Bearer ${token}`;
                    } catch {
                        // ignore
                    }
                }

                const res = await fetch(`/api/analytics?alias=${encodeURIComponent(alias)}`, {
                    headers,
                });

                if (res.ok && isMounted) {
                    const data: LinkAnalyticsData = await res.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error("Failed to load analytics data", err);
                if (isMounted) {
                    toast.error("Failed to load link analytics");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        initFetch();

        return () => {
            isMounted = false;
        };
    }, [isOpen, link?.alias]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Derived metric computations
    const { topDevice, topBrowser, devicePercents, topBrowsersList, topOsList } = useMemo(() => {
        if (!analytics) {
            return {
                topDevice: { name: "N/A", percent: 0, count: 0 },
                topBrowser: { name: "N/A", percent: 0, count: 0 },
                devicePercents: { desktop: 0, mobile: 0, tablet: 0 },
                topBrowsersList: [] as { name: string; count: number; percent: number }[],
                topOsList: [] as { name: string; count: number; percent: number }[],
            };
        }

        const dev = analytics.devices || { desktop: 0, mobile: 0, tablet: 0 };
        const totalDevClicks = (dev.desktop || 0) + (dev.mobile || 0) + (dev.tablet || 0);

        const desktopPercent = totalDevClicks > 0 ? Math.round((dev.desktop / totalDevClicks) * 100) : 0;
        const mobilePercent = totalDevClicks > 0 ? Math.round((dev.mobile / totalDevClicks) * 100) : 0;
        const tabletPercent = totalDevClicks > 0 ? Math.max(0, 100 - desktopPercent - mobilePercent) : 0;

        // Top device
        let topDevName = "Desktop";
        let topDevCount = dev.desktop || 0;
        if ((dev.mobile || 0) > topDevCount) {
            topDevName = "Mobile";
            topDevCount = dev.mobile;
        }
        if ((dev.tablet || 0) > topDevCount) {
            topDevName = "Tablet";
            topDevCount = dev.tablet;
        }
        const topDevPct = totalDevClicks > 0 ? Math.round((topDevCount / totalDevClicks) * 100) : 0;

        // Top browsers
        const browserEntries = Object.entries(analytics.browsers || {});
        const totalBrowserClicks = browserEntries.reduce((sum, [, count]) => sum + count, 0);
        const sortedBrowsers = browserEntries
            .map(([rawName, count]) => {
                const name = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/_/g, " ");
                const percent = totalBrowserClicks > 0 ? Math.round((count / totalBrowserClicks) * 100) : 0;
                return { name, count, percent };
            })
            .sort((a, b) => b.count - a.count);

        const topBrw = sortedBrowsers[0] || { name: "Chrome", count: 0, percent: 0 };

        // Top OS
        const osEntries = Object.entries(analytics.os || {});
        const totalOsClicks = osEntries.reduce((sum, [, count]) => sum + count, 0);
        const sortedOs = osEntries
            .map(([rawName, count]) => {
                const name = rawName.toUpperCase() === "IOS" ? "iOS" : rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/_/g, " ");
                const percent = totalOsClicks > 0 ? Math.round((count / totalOsClicks) * 100) : 0;
                return { name, count, percent };
            })
            .sort((a, b) => b.count - a.count);

        return {
            topDevice: { name: topDevName, percent: topDevPct, count: topDevCount },
            topBrowser: topBrw,
            devicePercents: { desktop: desktopPercent, mobile: mobilePercent, tablet: tabletPercent },
            topBrowsersList: sortedBrowsers.slice(0, 5),
            topOsList: sortedOs.slice(0, 5),
        };
    }, [analytics]);

    const fullShortUrl = useMemo(() => {
        if (!link) return "";
        const d = link.domain || "go.mono.bro.bd";
        const cleanDomain = d.replace(/^(https?:\/\/)/, "");
        return `https://${cleanDomain}/${link.alias}`;
    }, [link]);

    const handleCopy = async () => {
        if (!fullShortUrl) return;
        await navigator.clipboard.writeText(fullShortUrl);
        setCopiedLink(true);
        toast.success("Short link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleExportCsv = () => {
        if (!analytics || analytics.recentClicks.length === 0) {
            toast.error("No click data available to export");
            return;
        }

        const headers = ["Timestamp", "Device", "Browser", "OS", "Target Redirect URL", "Referer", "User Agent"];
        const rows = analytics.recentClicks.map((c: ClickLog) => [
            `"${c.timestamp}"`,
            `"${c.device}"`,
            `"${c.browser}"`,
            `"${c.os}"`,
            `"${(c.targetUrl || "").replace(/"/g, '""')}"`,
            `"${(c.referer || "").replace(/"/g, '""')}"`,
            `"${(c.userAgent || "").replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.setAttribute("download", `${analytics.alias}_traffic_analytics.csv`);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        toast.success("Activity CSV exported successfully!");
    };

    if (!isOpen || !link) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-5 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Enterprise Link Intelligence
                                </h2>
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-mono font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                    /{link.alias}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md">
                                Real-time telemetry, routing breakdowns, and visitor audit trails
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => refreshAnalytics(link.alias)}
                            disabled={isRefreshing || isLoading}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            title="Refresh Analytics"
                        >
                            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Subheader: Link Quick Info Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 bg-zinc-100/40 px-6 py-3 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200">Short Link:</span>
                        <code className="rounded bg-zinc-200/60 px-2 py-0.5 font-mono text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
                            {fullShortUrl}
                        </code>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                            title="Copy link"
                        >
                            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 truncate max-w-sm">
                        <span>Target:</span>
                        <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-blue-500 hover:underline truncate"
                        >
                            <span className="truncate">{link.originalUrl}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <RotateCw className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                Aggregating link intelligence & telemetry...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* 1. Top Metrics Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {/* Total Clicks */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                                        <span className="text-xs font-medium uppercase tracking-wider">Total Clicks</span>
                                        <MousePointerClick className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                                        {analytics?.totalClicks ?? link.totalClicks}
                                    </div>
                                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Lifetime redirects
                                    </p>
                                </div>

                                {/* Top Device */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                                        <span className="text-xs font-medium uppercase tracking-wider">Top Device</span>
                                        <span className="text-emerald-500">{getDeviceIcon(topDevice.name)}</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate">
                                        {topDevice.name}
                                    </div>
                                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {topDevice.percent}% of total traffic
                                    </p>
                                </div>

                                {/* Top Browser */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                                        <span className="text-xs font-medium uppercase tracking-wider">Top Browser</span>
                                        <Globe className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate">
                                        {topBrowser.name}
                                    </div>
                                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {topBrowser.percent}% market share
                                    </p>
                                </div>

                                {/* Last Active */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                                        <span className="text-xs font-medium uppercase tracking-wider">Last Active</span>
                                        <Clock className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">
                                        {formatRelativeTime(analytics?.lastClickedAt)}
                                    </div>
                                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {analytics?.lastClickedAt ? new Date(analytics.lastClickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "No activity"}
                                    </p>
                                </div>
                            </div>

                            {/* 2. Breakdown Visualizations (Devices, Browsers, OS) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Device Distribution Segmented Bar */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4 text-blue-500" />
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                Device Category
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono text-zinc-500">
                                            {(analytics?.devices.desktop || 0) + (analytics?.devices.mobile || 0) + (analytics?.devices.tablet || 0)} total
                                        </span>
                                    </div>

                                    {/* Segmented Progress Bar */}
                                    <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
                                        <div
                                            style={{ width: `${devicePercents.desktop}%` }}
                                            className="bg-blue-500 transition-all duration-500"
                                            title={`Desktop: ${devicePercents.desktop}%`}
                                        />
                                        <div
                                            style={{ width: `${devicePercents.mobile}%` }}
                                            className="bg-emerald-500 transition-all duration-500"
                                            title={`Mobile: ${devicePercents.mobile}%`}
                                        />
                                        <div
                                            style={{ width: `${devicePercents.tablet}%` }}
                                            className="bg-amber-500 transition-all duration-500"
                                            title={`Tablet: ${devicePercents.tablet}%`}
                                        />
                                    </div>

                                    {/* Legend Details */}
                                    <div className="mt-4 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                                <span className="text-zinc-600 dark:text-zinc-300">Desktop</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono">
                                                <span className="text-zinc-900 dark:text-white font-semibold">
                                                    {analytics?.devices.desktop || 0}
                                                </span>
                                                <span className="text-zinc-400">({devicePercents.desktop}%)</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                <span className="text-zinc-600 dark:text-zinc-300">Mobile</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono">
                                                <span className="text-zinc-900 dark:text-white font-semibold">
                                                    {analytics?.devices.mobile || 0}
                                                </span>
                                                <span className="text-zinc-400">({devicePercents.mobile}%)</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                <span className="text-zinc-600 dark:text-zinc-300">Tablet</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono">
                                                <span className="text-zinc-900 dark:text-white font-semibold">
                                                    {analytics?.devices.tablet || 0}
                                                </span>
                                                <span className="text-zinc-400">({devicePercents.tablet}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Browsers */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-purple-500" />
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                Top Browsers
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono text-zinc-500">
                                            {topBrowsersList.length} detected
                                        </span>
                                    </div>

                                    {topBrowsersList.length === 0 ? (
                                        <p className="text-xs text-zinc-400 py-6 text-center">No browser data yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topBrowsersList.map((item) => (
                                                <div key={item.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.name}</span>
                                                        <span className="font-mono text-zinc-500">{item.count} ({item.percent}%)</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                                        <div
                                                            style={{ width: `${Math.max(item.percent, 3)}%` }}
                                                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Operating Systems */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="h-4 w-4 text-emerald-500" />
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                Operating Systems
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono text-zinc-500">
                                            {topOsList.length} detected
                                        </span>
                                    </div>

                                    {topOsList.length === 0 ? (
                                        <p className="text-xs text-zinc-400 py-6 text-center">No OS telemetry yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topOsList.map((item) => (
                                                <div key={item.name} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.name}</span>
                                                        <span className="font-mono text-zinc-500">{item.count} ({item.percent}%)</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                                        <div
                                                            style={{ width: `${Math.max(item.percent, 3)}%` }}
                                                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Recent Traffic Activity Log Table */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/40 overflow-hidden shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-6 py-4 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                            Recent Traffic Activity
                                        </h3>
                                        <p className="text-xs text-zinc-500">
                                            Audit trail of the most recent redirect events
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleExportCsv}
                                        disabled={!analytics || analytics.recentClicks.length === 0}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                    >
                                        <Download className="h-3.5 w-3.5 text-blue-500" />
                                        <span>Download Activity CSV</span>
                                    </button>
                                </div>

                                {!analytics || analytics.recentClicks.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                            <Compass className="h-5 w-5" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            No clicks recorded yet
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                                            Once visitors click your short link, every event will appear here with instant device & browser breakdown.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                                        <table className="w-full text-left text-xs whitespace-nowrap">
                                            <thead className="sticky top-0 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold">Timestamp</th>
                                                    <th className="px-5 py-3 font-semibold">Device</th>
                                                    <th className="px-5 py-3 font-semibold">Browser / OS</th>
                                                    <th className="px-5 py-3 font-semibold">Redirected Destination</th>
                                                    <th className="px-5 py-3 font-semibold">Referer</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-mono">
                                                {analytics.recentClicks.map((click) => {
                                                    const isSmartRouting =
                                                        (click.os === "iOS" && link.iosUrl && click.targetUrl === link.iosUrl) ||
                                                        (click.os === "Android" && link.androidUrl && click.targetUrl === link.androidUrl);

                                                    return (
                                                        <tr
                                                            key={click.id}
                                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                                                        >
                                                            <td className="px-5 py-3 text-zinc-500">
                                                                {new Date(click.timestamp).toLocaleString(undefined, {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    second: "2-digit",
                                                                })}
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                                                    {getDeviceIcon(click.device)}
                                                                    <span>{click.device}</span>
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 font-sans">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-medium text-zinc-900 dark:text-white">
                                                                        {click.browser}
                                                                    </span>
                                                                    <span className="text-zinc-400">on</span>
                                                                    <span className="text-zinc-600 dark:text-zinc-400">
                                                                        {click.os}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex items-center gap-2 max-w-[240px] truncate">
                                                                    <span className="truncate text-zinc-600 dark:text-zinc-300" title={click.targetUrl}>
                                                                        {click.targetUrl}
                                                                    </span>
                                                                    {isSmartRouting && (
                                                                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider shrink-0">
                                                                            Smart
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3 text-zinc-500">
                                                                {click.referer ? (
                                                                    <span className="truncate max-w-[120px] inline-block" title={click.referer}>
                                                                        {click.referer.replace(/^https?:\/\//, "")}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-zinc-400 italic font-sans text-[11px]">Direct</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-zinc-200/80 px-6 py-4 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Telemetry Engine Active (On-Demand Zero Poll)</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
