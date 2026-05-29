import { adminDb } from "@/lib/firebase-admin";
import CreateLinkForm from "@/components/dashboard/CreateLinkForm";
import LinksTable from "@/components/dashboard/LinksTable";
import QuickActions from "@/components/dashboard/QuickActions";
import { Activity, Link2, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const linksSnapshot = await adminDb
        .collection("links")
        .orderBy("createdAt", "desc")
        .get();

    const links = linksSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            alias: data.alias,
            originalUrl: data.originalUrl,
            isProtected: data.isProtected,
            totalClicks: data.totalClicks || 0,
            createdAt: data.createdAt?.toDate().toISOString(),
            expiresAt: data.expiresAt?.toDate().toISOString() || null,
            // NEW: Pass down the tags and maxClicks
            maxClicks: data.maxClicks || null,
            tags: data.tags || [],
        };
    });

    // Calculate Overview Metrics
    const totalClicks = links.reduce((acc, curr) => acc + curr.totalClicks, 0);
    const activeLinks = links.length;
    const uniqueVisitors = 0;

    return (
        <div className="space-y-10 pb-12">

            {/* 1. Header & Greeting */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h1>
                <p className="text-slate-500 dark:text-neutral-400">Welcome back, Monowar</p>
            </header>

            {/* 2. The Overview Metric Cards */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Total Clicks Card */}
                <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6 transition-all hover:bg-slate-50 dark:hover:bg-neutral-900/60 hover:shadow-[0_0_30px_-15px_rgba(59,130,246,0.2)]">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            <Activity className="h-5 w-5" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                            <Activity className="h-3 w-3" /> Live
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Total Clicks (30d)</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        {totalClicks.toLocaleString()}
                    </p>
                </div>

                {/* Active Links Card */}
                <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6 transition-all hover:bg-slate-50 dark:hover:bg-neutral-900/60 hover:shadow-[0_0_30px_-15px_rgba(168,85,247,0.2)]">
                    <div className="mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-colors group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                            <Link2 className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Active Links</p>
                    <div className="mt-1 flex items-end justify-between">
                        <p className="font-mono text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            {activeLinks.toLocaleString()}
                        </p>
                        <span className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-colors mb-1">
                            Manage links →
                        </span>
                    </div>
                </div>

                {/* Unique Visitors Card */}
                <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6 transition-all hover:bg-slate-50 dark:hover:bg-neutral-900/60 hover:shadow-[0_0_30px_-15px_rgba(236,72,153,0.2)]">
                    <div className="mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 transition-colors group-hover:bg-pink-200 dark:group-hover:bg-pink-500/20 group-hover:text-pink-700 dark:group-hover:text-pink-300">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Unique Visitors</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        {uniqueVisitors.toLocaleString()}
                    </p>
                </div>
            </section>

            {/* 3. Quick Actions Layout */}
            <section className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                <QuickActions />
            </section>

            {/* 4. The Creation Form */}
            <section id="create-link-section" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6 backdrop-blur-xl">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Shorten a new URL</h2>
                <CreateLinkForm />
            </section>

            {/* 5. The Data Table */}
            <section className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6 backdrop-blur-xl">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Recent Links</h2>
                <LinksTable initialLinks={links} />
            </section>

        </div>
    );
}