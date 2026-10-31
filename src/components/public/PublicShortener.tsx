"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import {
    Link2,
    Sparkles,
    ChevronDown,
    Flame,
    Clock,
    Lock,
    Copy,
    Check,
    Download,
    ExternalLink,
    ArrowRight,
    Loader2,
    RefreshCw,
    Layers,
    QrCode,
    SlidersHorizontal,
    CornerDownLeft,
    Smartphone,
    Shield,
    Eye,
    EyeOff,
    FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import BulkShortenerModal from "@/components/dashboard/BulkShortenerModal";
import QrStudioModal from "@/components/qr/QrStudio";
import { notifyLinkCreated } from "@/lib/events";

interface ShortenResult {
    shortUrl: string;
    originalUrl: string;
    alias: string;
}

const DOMAIN_OPTIONS = [
    { value: "to.mono.bro.bd", label: "to.mono.bro.bd", badge: "Personal" },
    { value: "go.mono.bro.bd", label: "go.mono.bro.bd", badge: "Tech" },
];

export default function PublicShortener() {
    const qrCanvasId = useId();
    const [loading, setLoading] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [studioUrl, setStudioUrl] = useState("");
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isDomainOpen, setIsDomainOpen] = useState(false);
    const [showQrDrawer, setShowQrDrawer] = useState(false);

    // Form inputs
    const [originalUrl, setOriginalUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("to.mono.bro.bd");
    const [maxClicks, setMaxClicks] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [password, setPassword] = useState("");
    const [iosUrl, setIosUrl] = useState("");
    const [androidUrl, setAndroidUrl] = useState("");

    // Result & feedback state
    const [result, setResult] = useState<ShortenResult | null>(null);
    const [copied, setCopied] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const domainDropdownRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setResult(null);
        setOriginalUrl("");
        setCustomAlias("");
        setMaxClicks("");
        setExpiresAt("");
        setPassword("");
        setIosUrl("");
        setAndroidUrl("");
        setIsSecurityOpen(false);
        setIsAdvancedOpen(false);
        setShowPassword(false);
        setShowQrDrawer(false);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleOpenStudio = (targetUrl?: string) => {
        setStudioUrl(targetUrl || result?.shortUrl || originalUrl.trim() || "https://to.mono.bro.bd");
        setIsStudioOpen(true);
    };

    // Global keyboard shortcut: Press '/' to focus input, 'Esc' to reset on result view
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
                e.preventDefault();
                inputRef.current?.focus();
            } else if (e.key === "Escape") {
                if (isDomainOpen) setIsDomainOpen(false);
                if (result) resetForm();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isDomainOpen, result]);

    // Close domain dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (domainDropdownRef.current && !domainDropdownRef.current.contains(e.target as Node)) {
                setIsDomainOpen(false);
            }
        };

        if (isDomainOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isDomainOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!originalUrl.trim()) {
            toast.error("Please enter a destination URL");
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Generating your short link...");

        try {
            const payload = {
                originalUrl: originalUrl.trim(),
                iosUrl: iosUrl.trim() || undefined,
                androidUrl: androidUrl.trim() || undefined,
                customAlias: customAlias.trim() || undefined,
                domain: selectedDomain,
                maxClicks: maxClicks ? parseInt(maxClicks, 10) : undefined,
                expiresAt: expiresAt || undefined,
                password: password.trim() || undefined,
            };

            const res = await fetch("/api/links", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409 || data.error?.includes("already taken")) {
                    throw new Error("That custom alias is already taken. Please choose another.");
                }
                throw new Error(data.error || "Failed to shorten link");
            }

            const cleanDomain = selectedDomain.replace(/^(https?:\/\/)/, "");
            const fullShortUrl = `https://${cleanDomain}/${data.alias}`;

            setResult({
                shortUrl: fullShortUrl,
                originalUrl: originalUrl.trim(),
                alias: data.alias,
            });

            // Broadcast link creation to instantly update open admin dashboard views
            notifyLinkCreated({
                alias: data.alias,
                originalUrl: originalUrl.trim(),
                iosUrl: iosUrl.trim() || null,
                androidUrl: androidUrl.trim() || null,
                domain: cleanDomain,
                totalClicks: 0,
                createdAt: new Date().toISOString(),
                isProtected: Boolean(password.trim()),
                password: password.trim() || null,
                expiresAt: expiresAt || null,
                maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
                isPublic: true,
                createdBy: "public",
                isDemo: false,
            });

            toast.success("Short link created successfully!", { id: toastId });
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Something went wrong while shortening the link.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.shortUrl);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2200);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleDownloadQR = () => {
        if (!result) return;
        const canvas = document.getElementById(qrCanvasId) as HTMLCanvasElement;
        if (!canvas) return;

        // Create high-res framed PNG canvas
        const masterCanvas = document.createElement("canvas");
        const ctx = masterCanvas.getContext("2d");
        if (!ctx) return;

        const qrSize = 512;
        const padding = 48;
        const textHeight = 72;

        masterCanvas.width = qrSize + padding * 2;
        masterCanvas.height = qrSize + padding * 2 + textHeight;

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, masterCanvas.width, masterCanvas.height);

        // Draw QR
        ctx.drawImage(canvas, padding, padding, qrSize, qrSize);

        // Draw Domain text at bottom
        ctx.fillStyle = "#09090b";
        ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(result.shortUrl.replace(/^https?:\/\//, ""), masterCanvas.width / 2, masterCanvas.height - 30);

        const link = document.createElement("a");
        link.href = masterCanvas.toDataURL("image/png");
        link.download = `GoMono-${result.alias}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("High-res QR code downloaded!");
    };

    const activeDomainObj = DOMAIN_OPTIONS.find((d) => d.value === selectedDomain) || DOMAIN_OPTIONS[0];
    const hasSecurityOptions = Boolean(password || expiresAt || maxClicks);
    const hasRoutingOptions = Boolean(customAlias || iosUrl || androidUrl);

    return (
        <div className="w-full max-w-2xl px-2 sm:px-0">
            {!result ? (
                <div className="relative">
                    {/* Ambient Glow behind the Command Bar */}
                    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 opacity-70 blur-2xl transition-all duration-500 group-hover:opacity-100" />

                    <div className="relative rounded-3xl border border-zinc-200/90 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-950/80 p-2 sm:p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:shadow-2xl backdrop-blur-2xl transition-all">
                        {/* THE COMMAND BAR: Unified Single-Line Pill */}
                        <form
                            onSubmit={handleSubmit}
                            className="relative flex flex-col gap-2 rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-1.5 transition-all focus-within:border-zinc-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/15 dark:border-zinc-800/60 dark:bg-zinc-900/60 dark:focus-within:border-zinc-700 dark:focus-within:bg-zinc-900/90 dark:focus-within:ring-indigo-500/20 sm:flex-row sm:items-center sm:gap-2 sm:p-2"
                        >
                            {/* Input Field with Leading Icon */}
                            <div className="relative flex flex-1 items-center">
                                <div className="pointer-events-none absolute left-3.5 flex items-center text-zinc-400 transition-colors group-focus-within:text-indigo-600 dark:text-zinc-500 dark:group-focus-within:text-indigo-400">
                                    <Link2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <input
                                    ref={inputRef}
                                    type="url"
                                    required
                                    value={originalUrl}
                                    onChange={(e) => setOriginalUrl(e.target.value)}
                                    placeholder="Paste long link to shorten..."
                                    className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:py-2.5 sm:text-base font-normal tracking-normal"
                                />
                            </div>

                            {/* Actions Group (Domain Pill + CTA Button) */}
                            <div className="flex items-center justify-between gap-1.5 border-t border-zinc-200/80 pt-2 sm:border-t-0 sm:pt-0 dark:border-zinc-800/60">
                                {/* Sleek Custom Domain Pill Dropdown */}
                                <div ref={domainDropdownRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDomainOpen(!isDomainOpen)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-200/60 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-200 hover:text-zinc-950 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
                                        title="Select short link domain"
                                    >
                                        <span>{activeDomainObj.label.split(".")[0]}</span>
                                        <ChevronDown className={`h-3 w-3 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${isDomainOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDomainOpen && (
                                        <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 dark:border-zinc-800 dark:bg-zinc-900/95">
                                            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                                Select Domain
                                            </div>
                                            {DOMAIN_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDomain(opt.value);
                                                        setIsDomainOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-mono transition-colors ${
                                                        selectedDomain === opt.value
                                                            ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-600/20 dark:text-indigo-300"
                                                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                                                    }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    <span className="text-[10px] font-sans text-zinc-400 dark:text-zinc-500">{opt.badge}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Primary CTA Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-zinc-950 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin text-white dark:text-zinc-950" />
                                            <span>Shortening...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Shorten</span>
                                            <CornerDownLeft className="h-3 w-3 text-zinc-400 dark:text-zinc-500 opacity-60 transition-opacity group-hover:opacity-100 hidden sm:inline" />
                                            <ArrowRight className="h-3.5 w-3.5 sm:hidden" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* SUBTLE UTILITY BAR BELOW THE COMMAND PILL */}
                        <div className="mt-2.5 flex items-center justify-between px-2 text-xs">
                            <div className="flex items-center gap-1.5">
                                {/* Sleek Collapsible Security & Expiration Accordion Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setIsSecurityOpen(!isSecurityOpen)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                                        isSecurityOpen || hasSecurityOptions
                                            ? "text-indigo-600 bg-indigo-50 border border-indigo-200/80 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/30"
                                            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    }`}
                                >
                                    <Shield className="h-3 w-3" />
                                    <span>Security & Expiration</span>
                                    {hasSecurityOptions && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                                    )}
                                    <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isSecurityOpen ? "rotate-180" : ""}`} />
                                </button>

                                {/* Routing & Custom Alias Accordion Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                                        isAdvancedOpen || hasRoutingOptions
                                            ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10"
                                            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    }`}
                                >
                                    <SlidersHorizontal className="h-3 w-3" />
                                    <span>Routing & Alias</span>
                                    {hasRoutingOptions && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                    )}
                                    <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isAdvancedOpen ? "rotate-180" : ""}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {/* QR Studio Trigger */}
                                <button
                                    type="button"
                                    onClick={() => handleOpenStudio()}
                                    className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-zinc-500 hover:text-zinc-800 transition-colors dark:text-zinc-400 dark:hover:text-zinc-200"
                                    title="Open Custom QR Code Studio"
                                >
                                    <QrCode className="h-3 w-3 text-zinc-400 group-hover:scale-110 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400 transition-transform" />
                                    <span>QR Studio</span>
                                </button>

                                {/* Bulk Shortener Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setIsBulkOpen(true)}
                                    className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-zinc-500 hover:text-zinc-800 transition-colors dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    <Layers className="h-3 w-3 text-zinc-400 group-hover:scale-110 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400 transition-transform" />
                                    <span>Bulk Mode</span>
                                    <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                                        50 max
                                    </span>
                                </button>

                                {/* Standalone CSV Studio Link */}
                                <Link
                                    href="/csv-studio"
                                    className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-emerald-600 hover:text-emerald-700 transition-colors dark:text-emerald-400 dark:hover:text-emerald-300"
                                    title="Open Standalone CSV Studio & Data Grid"
                                >
                                    <FileSpreadsheet className="h-3 w-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span>CSV Studio</span>
                                    <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                                        Pro
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* SLEEK COLLAPSIBLE "SECURITY & EXPIRATION" SECTION */}
                        {isSecurityOpen && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-50/90 dark:border-zinc-800/80 dark:bg-zinc-900/50 p-3.5 sm:p-4 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="mb-3 flex items-center justify-between border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800/60">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                            <Shield className="h-3.5 w-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Security & Expiration</h4>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Configure password protection, expiration date, and max click limit</p>
                                        </div>
                                    </div>
                                    {hasSecurityOptions && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPassword("");
                                                setExpiresAt("");
                                                setMaxClicks("");
                                            }}
                                            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {/* Password Field */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                                            <span>Password</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Set access password"
                                                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-3 pr-8 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-indigo-500/50"
                                            />
                                            {password && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                    title={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </button>
                                            )}
                                        </div>
                                        <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">Requires password to unlock</span>
                                    </div>

                                    {/* Expiration Date Field */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                            <span>Expiration Date</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="expiresAt"
                                            value={expiresAt}
                                            onChange={(e) => setExpiresAt(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:focus:border-amber-500/50 [color-scheme:light] dark:[color-scheme:dark]"
                                        />
                                        <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">Auto-expires after this time</span>
                                    </div>

                                    {/* Max Click Limit Field */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                            <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                                            <span>Max Click Limit</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="maxClicks"
                                            min="1"
                                            value={maxClicks}
                                            onChange={(e) => setMaxClicks(e.target.value)}
                                            placeholder="Burn limit (e.g. 50)"
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-orange-500/50"
                                        />
                                        <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">Deactivates after N clicks</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* COMPANION COLLAPSIBLE "ROUTING & ALIAS" SECTION */}
                        {isAdvancedOpen && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-50/90 dark:border-zinc-800/80 dark:bg-zinc-900/40 p-3.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="mb-2.5 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Custom Alias & Smart Device Routing
                                    </span>
                                    {hasRoutingOptions && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCustomAlias("");
                                                setIosUrl("");
                                                setAndroidUrl("");
                                            }}
                                            className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    {/* Custom Alias */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                                            <Sparkles className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={customAlias}
                                            onChange={(e) => setCustomAlias(e.target.value)}
                                            placeholder="Custom alias (e.g. launch)"
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-purple-500 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-purple-500/50"
                                        />
                                    </div>

                                    {/* Device Smart Routing: iOS Target */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                                            <Smartphone className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <input
                                            type="url"
                                            value={iosUrl}
                                            onChange={(e) => setIosUrl(e.target.value)}
                                            placeholder="iOS URL (App Store / deep link)"
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-blue-500 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-blue-500/50"
                                        />
                                    </div>

                                    {/* Device Smart Routing: Android Target */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                                            <Smartphone className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <input
                                            type="url"
                                            value={androidUrl}
                                            onChange={(e) => setAndroidUrl(e.target.value)}
                                            placeholder="Android URL (Play Store / deep link)"
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-emerald-500 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* INSTANT RESULT CARD: Minimalist, High-Conversion */
                <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-950/90 p-5 shadow-xl dark:shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 sm:p-7">
                    {/* Subtle Top Glow Accent */}
                    <div className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

                    {/* Status Header */}
                    <div className="mb-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-3.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Short Link Ready
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/80 px-3 py-1 text-xs text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>New Link</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline">(Esc)</span>
                        </button>
                    </div>

                    {/* Main Short Link Presentation */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/70 p-3 sm:p-3.5">
                                <span className="block font-mono text-base font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-lg select-all">
                                    {result.shortUrl}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-semibold transition-all active:scale-95 ${
                                        copied
                                            ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black shadow-lg shadow-emerald-500/20"
                                            : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>

                                <a
                                    href={result.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 p-3 text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                                    title="Open link in new tab"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setShowQrDrawer(!showQrDrawer)}
                                    className={`inline-flex items-center justify-center rounded-2xl border p-3 transition-colors ${
                                        showQrDrawer
                                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                            : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                                    }`}
                                    title="Toggle QR Code"
                                >
                                    <QrCode className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Destination Indicator */}
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="text-zinc-400 dark:text-zinc-500 shrink-0">Target:</span>
                            <span className="truncate font-mono text-zinc-600 dark:text-zinc-400 max-w-[450px]" title={result.originalUrl}>
                                {result.originalUrl}
                            </span>
                        </div>

                        {/* Security & Expiration Badges */}
                        {(password || expiresAt || maxClicks) && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                {password && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300">
                                        <Lock className="h-3 w-3" />
                                        <span>Password Protected</span>
                                    </span>
                                )}
                                {expiresAt && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
                                        <Clock className="h-3 w-3" />
                                        <span>Expires {new Date(expiresAt).toLocaleDateString()}</span>
                                    </span>
                                )}
                                {maxClicks && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-2.5 py-1 text-[11px] font-medium text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-300">
                                        <Flame className="h-3 w-3" />
                                        <span>Max {maxClicks} clicks</span>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* QR Code Accordion Drawer */}
                        {showQrDrawer && (
                            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/90 dark:border-zinc-800/80 dark:bg-zinc-900/60 p-5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 sm:flex-row sm:justify-between sm:gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-white p-2.5 shadow-md border border-zinc-200/50 dark:border-transparent">
                                        <QRCodeCanvas
                                            id={qrCanvasId}
                                            value={result.shortUrl}
                                            size={120}
                                            level="H"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Instant QR Code</h4>
                                        <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[220px]">
                                            High-resolution QR code for print, merchandise, or live displays.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 sm:mt-0 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenStudio(result.shortUrl)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                    >
                                        <QrCode className="h-3.5 w-3.5" />
                                        <span>Customize in Studio</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDownloadQR}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-200/80 px-3.5 py-2 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Quick PNG</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bulk Shortener Modal Integration */}
            <BulkShortenerModal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
            />

            {/* Public QR Code Studio Modal */}
            <QrStudioModal
                isOpen={isStudioOpen}
                onClose={() => setIsStudioOpen(false)}
                url={studioUrl}
            />
        </div>
    );
}
