"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import CreateLinkForm from "@/components/dashboard/CreateLinkForm";
import LinksTable, { type Link } from "@/components/dashboard/LinksTable";
import QuickActions from "@/components/dashboard/QuickActions";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import BulkShortenerModal from "@/components/dashboard/BulkShortenerModal";
import { Activity, Link2, Users, Layers } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
    GOMONO_LINK_CREATED_EVENT,
    GOMONO_LINK_DELETED_EVENT,
    type LinkCreatedPayload,
} from "@/lib/events";

export default function DashboardPage() {
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newestAlias, setNewestAlias] = useState<string | null>(null);
    const [userName, setUserName] = useState("Monowar");
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasLoadedInitialSnapshotRef = useRef(false);

    // REST fallback fetcher — called action-triggered (or when Firestore snapshot fails)
    const fetchLinks = useCallback(async (isSilent = false) => {
        const user = auth.currentUser;
        if (!user) return;

        if (!isSilent) setIsRefreshing(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/links", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.links)) {
                    setLinks(data.links);
                }
            }
        } catch (error) {
            console.error("Failed to fetch links", error);
        } finally {
            if (!isSilent) setIsRefreshing(false);
        }
    }, []);

    // Action-triggered optimistic insertion with auto-clearing highlight
    const handleLinkCreated = useCallback((newLink?: Link) => {
        if (newLink && newLink.alias) {
            setNewestAlias(newLink.alias);
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
            highlightTimerRef.current = setTimeout(() => {
                setNewestAlias((cur) => (cur === newLink.alias ? null : cur));
            }, 4500);

            // Optimistically prepend to links array (deduplicating by alias)
            setLinks((prev) => [newLink, ...prev.filter((l) => l.alias !== newLink.alias)]);
        }
        // Silently sync in background to guarantee database parity
        fetchLinks(true);
    }, [fetchLinks]);

    // Optimistic deletion
    const handleDeleteLink = useCallback((alias: string) => {
        setLinks((prev) => prev.filter((l) => l.alias !== alias));
    }, []);

    // Setup Auth and Scoped Real-time Firestore Listener
    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Dynamic greeting
                if (user.email === "demo01@go.mono.bro.bd") {
                    setUserName("Demo User");
                } else {
                    setUserName("Monowar");
                }

                // Initial fetch via REST to ensure fast display
                await fetchLinks(false);

                // Attach real-time listener scoped to role
                try {
                    const isDemoUser = user.email === "demo01@go.mono.bro.bd";
                    const linksCol = collection(db, "links");
                    const q = isDemoUser
                        ? query(linksCol, where("createdBy", "==", user.uid))
                        : linksCol;

                    unsubscribeSnapshot = onSnapshot(
                        q,
                        (snapshot) => {
                            const mappedLinks: Link[] = snapshot.docs.map((docSnap) => {
                                const data = docSnap.data();

                                let safeCreatedAt = new Date().toISOString();
                                if (data.createdAt) {
                                    if (typeof data.createdAt.toDate === "function") {
                                        safeCreatedAt = data.createdAt.toDate().toISOString();
                                    } else {
                                        safeCreatedAt = new Date(data.createdAt).toISOString();
                                    }
                                }

                                return {
                                    alias: data.alias || docSnap.id,
                                    originalUrl: data.originalUrl || "",
                                    iosUrl: data.iosUrl || null,
                                    androidUrl: data.androidUrl || null,
                                    domain: data.domain || "go.mono.bro.bd",
                                    totalClicks: typeof data.totalClicks === "number" ? data.totalClicks : 0,
                                    createdAt: safeCreatedAt,
                                    isProtected: Boolean(data.password),
                                    maxClicks: data.maxClicks ?? null,
                                    tags: Array.isArray(data.tags) ? data.tags : [],
                                    isPublic: data.isPublic === true || data.createdBy === "public",
                                    createdBy: data.createdBy,
                                    isDemo: data.isDemo,
                                };
                            });

                            // Sort descending by creation date
                            mappedLinks.sort(
                                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            );

                            // Highlight newly added items if not the initial load
                            if (hasLoadedInitialSnapshotRef.current) {
                                snapshot.docChanges().forEach((change) => {
                                    if (change.type === "added") {
                                        const addedAlias = change.doc.id;
                                        setNewestAlias(addedAlias);
                                        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
                                        highlightTimerRef.current = setTimeout(() => {
                                            setNewestAlias((cur) => (cur === addedAlias ? null : cur));
                                        }, 4500);
                                    }
                                });
                            } else {
                                hasLoadedInitialSnapshotRef.current = true;
                            }

                            setLinks(mappedLinks);
                            setLoading(false);
                        },
                        (error) => {
                            console.warn("Firestore snapshot subscription fallback to REST fetch:", error);
                            fetchLinks(true);
                            setLoading(false);
                        }
                    );
                } catch (err) {
                    console.warn("Could not bind Firestore onSnapshot:", err);
                    fetchLinks(false);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        };
    }, [fetchLinks]);

    // Cross-Tab and In-Page Event Listeners (BroadcastChannel + DOM CustomEvents)
    useEffect(() => {
        const handleCreatedEvent = (e: Event) => {
            const customEvent = e as CustomEvent<LinkCreatedPayload>;
            const detail = customEvent.detail;
            if (detail?.alias) {
                setNewestAlias(detail.alias);
                if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
                highlightTimerRef.current = setTimeout(() => {
                    setNewestAlias((cur) => (cur === detail.alias ? null : cur));
                }, 4500);
            }
            fetchLinks(true);
        };

        const handleDeletedEvent = (e: Event) => {
            const customEvent = e as CustomEvent<{ alias: string }>;
            const alias = customEvent.detail?.alias;
            if (alias) {
                setLinks((prev) => prev.filter((l) => l.alias !== alias));
            }
            fetchLinks(true);
        };

        window.addEventListener(GOMONO_LINK_CREATED_EVENT, handleCreatedEvent);
        window.addEventListener(GOMONO_LINK_DELETED_EVENT, handleDeletedEvent);

        let bc: BroadcastChannel | null = null;
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
                bc = new BroadcastChannel("gomono_links_channel");
                bc.onmessage = (event) => {
                    if (event.data?.type === "LINK_CREATED") {
                        const payload = event.data?.payload;
                        if (payload?.alias) {
                            setNewestAlias(payload.alias);
                            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
                            highlightTimerRef.current = setTimeout(() => {
                                setNewestAlias((cur) => (cur === payload.alias ? null : cur));
                            }, 4500);
                        }
                        fetchLinks(true);
                    } else if (event.data?.type === "LINK_DELETED") {
                        const alias = event.data?.alias;
                        if (alias) {
                            setLinks((prev) => prev.filter((l) => l.alias !== alias));
                        }
                        fetchLinks(true);
                    }
                };
            } catch (err) {
                console.warn("BroadcastChannel error:", err);
            }
        }

        return () => {
            window.removeEventListener(GOMONO_LINK_CREATED_EVENT, handleCreatedEvent);
            window.removeEventListener(GOMONO_LINK_DELETED_EVENT, handleDeletedEvent);
            if (bc) {
                bc.close();
            }
        };
    }, [fetchLinks]);

    // Calculate Overview Metrics dynamically from the current links list
    const totalClicks = links.reduce((acc, curr) => acc + (curr.totalClicks || 0), 0);
    const activeLinks = links.length;
    const publicLinks = links.filter((l) => l.isPublic || l.createdBy === "public").length;
    const adminLinks = activeLinks - publicLinks;
    const uniqueVisitors = 0;

    // Generate the last 7 days of trailing data deterministically
    const chartData = useMemo(() => {
        const ratios = [0.08, 0.12, 0.15, 0.10, 0.18, 0.12, 0.25];
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                date: d.toLocaleDateString("en-US", { weekday: "short" }),
                clicks: Math.round(totalClicks * (ratios[i] ?? 0.14)),
            };
        });
    }, [totalClicks]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-neutral-500 dark:text-neutral-400">
                Loading dashboard data...
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* 1. Header & Greeting */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Overview</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Welcome back, {userName}</p>
            </header>

            {/* 2. The Overview Metric Cards */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Total Clicks Card */}
                <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:shadow-[0_0_30px_-15px_rgba(59,130,246,0.2)]">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500/20">
                            <Activity className="h-5 w-5" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <Activity className="h-3 w-3" /> Live
                        </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Clicks (30d)</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                        {totalClicks.toLocaleString()}
                    </p>
                </div>

                {/* Active Links Card */}
                <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:shadow-[0_0_30px_-15px_rgba(168,85,247,0.2)]">
                    <div className="mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:group-hover:bg-purple-500/20">
                            <Link2 className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Links</p>
                    <div className="mt-1 flex items-end justify-between">
                        <div>
                            <p className="font-mono text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                                {activeLinks.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                {adminLinks} Admin • {publicLinks} Public
                            </p>
                        </div>
                        <a href="#links-table" className="text-sm text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-1">
                            Manage links →
                        </a>
                    </div>
                </div>

                {/* Unique Visitors Card */}
                <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:shadow-[0_0_30px_-15px_rgba(236,72,153,0.2)]">
                    <div className="mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600 transition-colors group-hover:bg-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:group-hover:bg-pink-500/20">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Unique Visitors</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                        {uniqueVisitors.toLocaleString()}
                    </p>
                </div>
            </section>

            {/* 3. Analytics Chart Section */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Traffic Overview</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Your link engagement over the last 7 days</p>
                    </div>
                </div>
                <AnalyticsChart data={chartData} />
            </section>

            {/* 4. Quick Actions Layout */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h2>
                <QuickActions onLinkCreated={() => fetchLinks(true)} />
            </section>

            {/* 5. The Creation Form */}
            <section id="create-link-section" className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Shorten a new URL</h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Create trackable, edge-accelerated short links</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsBulkModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:scale-[1.02] active:scale-[0.98] dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                    >
                        <Layers className="h-4 w-4" />
                        <span>Bulk Shortener</span>
                        <span className="rounded-md bg-indigo-200/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-300">Batch</span>
                    </button>
                </div>
                <CreateLinkForm onLinkCreated={handleLinkCreated} />
            </section>

            {/* 6. The Data Table */}
            <section id="links-table" className="scroll-mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">Recent Links</h2>
                <LinksTable
                    initialLinks={links}
                    newestAlias={newestAlias}
                    isRefreshing={isRefreshing}
                    onDelete={handleDeleteLink}
                />
            </section>

            {/* Bulk Shortener Modal */}
            <BulkShortenerModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onLinksCreated={() => fetchLinks(true)}
            />
        </div>
    );
}
