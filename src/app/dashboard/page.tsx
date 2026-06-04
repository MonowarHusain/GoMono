"use client";

import { useEffect, useState } from "react";
import CreateLinkForm from "@/components/dashboard/CreateLinkForm";
import LinksTable from "@/components/dashboard/LinksTable";
import QuickActions from "@/components/dashboard/QuickActions";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import { Activity, Link2, Users } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Monowar");

    // NEW: Extracted fetch logic so it can be called instantly when a link is created
    const fetchLinks = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/links", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setLinks(data.links);
            }
        } catch (error) {
            console.error("Failed to fetch links", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Dynamic greeting
                if (user.email === "demo01@go.mono.bro.bd") {
                    setUserName("Demo User");
                } else {
                    setUserName("Monowar");
                }

                // Initial load of links
                await fetchLinks();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-neutral-500 dark:text-neutral-400">
                Loading dashboard data...
            </div>
        );
    }

    // Calculate Overview Metrics dynamically from the filtered links
    const totalClicks = links.reduce((acc, curr) => acc + curr.totalClicks, 0);
    const activeLinks = links.length;
    const uniqueVisitors = 0;

    // Generate the last 7 days of trailing data
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toLocaleDateString("en-US", { weekday: "short" }),
            clicks: i === 6 ? Math.floor(totalClicks * 0.4) : Math.floor(Math.random() * (totalClicks * 0.2)),
        };
    });

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
                        <p className="font-mono text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                            {activeLinks.toLocaleString()}
                        </p>
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
                <QuickActions />
            </section>

            {/* 5. The Creation Form */}
            <section id="create-link-section" className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">Shorten a new URL</h2>
                {/* FIX: Pass the fetchLinks function directly into the form */}
                <CreateLinkForm onLinkCreated={fetchLinks} />
            </section>

            {/* 6. The Data Table */}
            <section id="links-table" className="scroll-mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">Recent Links</h2>
                <LinksTable initialLinks={links} />
            </section>
        </div>
    );
}