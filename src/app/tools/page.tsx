import Link from "next/link";
import {
    Link2,
    QrCode,
    FileSpreadsheet,
    Sparkles,
    SlidersHorizontal,
    Globe,
    Flame,
    Search,
    ArrowRight,
    Wrench,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

interface ToolItem {
    id: string;
    title: string;
    category: string;
    description: string;
    features: string[];
    href: string;
    badge?: string;
    badgeColor?: string;
    icon: React.ReactNode;
    actionText: string;
}

const TOOLS: ToolItem[] = [
    {
        id: "shortener",
        title: "Enterprise URL Shortener & Privacy Cleaner",
        category: "Core Routing",
        description: "Lightning-fast URL shortening with automatic tracking parameter stripping (fbclid, gclid, utm), memorable alias generation, and device-smart redirects.",
        features: ["One-Click Tracker Stripper", "Magic Dice Memorable Alias", "Deep Link App Opener", "Custom Splash Screen"],
        href: "/",
        badge: "Zero-Cost",
        badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        icon: <Link2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
        actionText: "Open Shortener",
    },
    {
        id: "qr-studio",
        title: "Zero-Storage Vector QR Studio & Decoder",
        category: "Visual Branding",
        description: "High-resolution vector and raster QR generator supporting URLs, Wi-Fi auto-connect, vCard digital business cards, plus client-side drag-and-drop QR decoding.",
        features: ["Vector SVG & PNG Export", "Wi-Fi & vCard Encoding", "Browser QR Image Decoder", "Custom Brand Colors & Logos"],
        href: "/qr",
        badge: "Vector & Decoder",
        badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        icon: <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
        actionText: "Launch QR Studio",
    },
    {
        id: "csv-studio",
        title: "CSV Studio & Client-Side Data Grid",
        category: "Data Processing",
        description: "High-performance in-browser spreadsheet engine for batch link generation, CSV transformations, regex URL extraction, and zero-storage data operations.",
        features: ["100% In-Browser Memory", "Bulk Regex URL Extractor", "Batch Shorten & Export", "Zero Database Bloat"],
        href: "/csv-studio",
        badge: "Pro Engine",
        badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
        actionText: "Open CSV Studio",
    },
    {
        id: "bio-builder",
        title: "Zero-Storage Link-in-Bio Page Builder",
        category: "Creator Suite",
        description: "Design sleek, mobile-first bio link landing pages with custom themes, social profile links, and live preview—stored entirely client-side with zero hosting fees.",
        features: ["Live Mobile Device Preview", "Instant 1-Click Publishing", "Multiple Modern Themes", "Zero Server Storage"],
        href: "/bio-builder",
        badge: "No Hosting Required",
        badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        icon: <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
        actionText: "Build Bio Page",
    },
    {
        id: "ab-rotator",
        title: "A/B Traffic Split & Multi-Destination Link Rotator",
        category: "Optimization",
        description: "Distribute incoming visitors across multiple destination URLs using mathematical weighted probability or round-robin rotation pools.",
        features: ["Weighted Probability Distribution", "Up to 6 Rotator Destinations", "Instant Landing Page Testing", "Zero Latency Overhead"],
        href: "/",
        badge: "Split Engine",
        badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: <SlidersHorizontal className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
        actionText: "Configure in Shortener",
    },
    {
        id: "locale-router",
        title: "Zero-API Browser Locale & Geo Router",
        category: "Smart Routing",
        description: "Route international visitors based on native browser Accept-Language headers without paying costly GeoIP subscription fees.",
        features: ["Supports 10+ Global Languages", "Zero External API Costs", "Instant Native Header Resolution", "Fallback Control"],
        href: "/",
        badge: "$0 External APIs",
        badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        icon: <Globe className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
        actionText: "Configure in Shortener",
    },
    {
        id: "burn-security",
        title: "Burn-After-Reading & Password Security Gates",
        category: "Security & Privacy",
        description: "Create self-destructing one-time links that immediately deactivate after first visit, or gate links behind bcrypt-hashed password protection.",
        features: ["1-Time Self-Destruct Links", "Bcrypt-Hashed Passwords", "Click Quota Limits", "Live Expiry Countdown Badges"],
        href: "/",
        badge: "Encrypted & Ephemeral",
        badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        icon: <Flame className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
        actionText: "Configure in Shortener",
    },
    {
        id: "link-inspector",
        title: "Transparent Link Inspector & Safety Auditor",
        category: "Security & Verification",
        description: "Append '+' to any short URL (e.g. to.mono.bro.bd/launch+) to preview the final destination, check domain security, and view click statistics before opening.",
        features: ["Phishing & Malware Protection", "Destination Uncloaking", "Audit Trail & Creation Time", "Direct Safety Verification"],
        href: "/demo+",
        badge: "Append '+' to Any Link",
        badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        icon: <Search className="h-6 w-6 text-sky-600 dark:text-sky-400" />,
        actionText: "Try Demo Inspector",
    },
];

export default function ToolsHubPage() {
    return (
        <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Background Grid */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e750_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e750_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl transition-colors">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
                    <Link href="/" className="group flex items-center gap-2.5 transition-transform">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs transition-colors group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:group-hover:border-zinc-700">
                            <span className="font-mono text-sm font-black tracking-tighter text-indigo-600 dark:text-indigo-400">G</span>
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">GoMono</span>
                        <span className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                            Tools Hub
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-md transition-all hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
                        >
                            <Link2 className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Shortener</span>
                        </Link>
                        <ThemeToggle />
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition"
                        >
                            <span>Admin</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300">
                        <Wrench className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Zero-Cost Enterprise Utilities</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        Public Browser Power Tools
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                        High-performance, client-side tools running 100% in your browser. Zero server file storage, zero paid third-party APIs, and complete user privacy.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TOOLS.map((tool) => (
                        <div
                            key={tool.id}
                            className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-950/70 p-6 sm:p-7 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all backdrop-blur-xl"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
                                        {tool.icon}
                                    </div>
                                    {tool.badge && (
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tool.badgeColor}`}>
                                            {tool.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                                        {tool.category}
                                    </div>
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {tool.title}
                                    </h2>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                                        {tool.features.map((feat) => (
                                            <div key={feat} className="flex items-center gap-1.5 truncate">
                                                <span className="h-1 w-1 rounded-full bg-indigo-500 shrink-0" />
                                                <span className="truncate">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                                <span className="text-[11px] text-zinc-400 font-mono">
                                    Free & Unlimited
                                </span>
                                <Link
                                    href={tool.href}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                                >
                                    <span>{tool.actionText}</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
