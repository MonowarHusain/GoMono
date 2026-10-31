"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Lock,
    Unlock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Shield,
    AlertCircle,
    Check,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeProvider";

interface PasswordGateProps {
    alias: string;
    domain?: string;
    initialError?: boolean;
}

export default function PasswordGate({
    alias,
    domain = "to.mono.bro.bd",
    initialError = false,
}: PasswordGateProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        initialError ? "Incorrect passcode. Please try again." : null
    );
    const [success, setSuccess] = useState(false);
    const [shake, setShake] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleUnlock = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const trimmed = password.trim();
        if (!trimmed) {
            setError("Please enter the password.");
            triggerShake();
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/verify-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    alias,
                    password: trimmed,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.authorized) {
                setError(data.error || "Incorrect passcode. Please try again.");
                triggerShake();
                setPassword("");
                inputRef.current?.focus();
                setLoading(false);
                return;
            }

            // Successfully authenticated
            setSuccess(true);
            setLoading(false);

            // Redirect immediately: use query param fallback to guarantee instant routing
            const redirectUrl = `/${alias}?pwd=${encodeURIComponent(trimmed)}`;
            setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 300);

        } catch (err) {
            console.error("Unlock error:", err);
            // Fallback: submit natively via GET
            window.location.replace(`/${alias}?pwd=${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-between bg-white text-zinc-900 selection:bg-indigo-500/20 selection:text-indigo-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-indigo-500/30 dark:selection:text-white transition-colors duration-200">
            {/* Ambient Lighting & Mesh Background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.22),rgba(255,255,255,0))]" />
                <div className="absolute right-1/4 top-1/3 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e750_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e750_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Top Navigation */}
            <header className="w-full border-b border-zinc-200/80 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2.5 transition-transform">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs transition-colors group-hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:group-hover:border-zinc-700">
                            <span className="font-mono text-sm font-black tracking-tighter text-indigo-600 dark:text-indigo-400">G</span>
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">GoMono</span>
                        <span className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                            v2.0
                        </span>
                    </Link>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/50 dark:text-indigo-300">
                            <Shield className="h-3 w-3" />
                            <span className="hidden sm:inline">Passcode Protection Active</span>
                            <span className="sm:hidden">Protected</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Center Content */}
            <main className="flex w-full flex-1 items-center justify-center px-4 py-12">
                <div className="relative w-full max-w-md">
                    {/* Subtle Card Ambient Glow */}
                    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/25 dark:to-purple-600/20 opacity-80 blur-2xl transition-all duration-500" />

                    {/* The Glass Interception Card */}
                    <div
                        className={`relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/90 p-7 sm:p-9 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:shadow-2xl backdrop-blur-2xl transition-all ${
                            shake ? "animate-shake" : ""
                        }`}
                    >
                        {/* Lock Icon Emblem */}
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 shadow-xs dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400">
                            {success ? (
                                <Unlock className="h-8 w-8 text-emerald-500 animate-in zoom-in-75 duration-200" />
                            ) : (
                                <Lock className="h-8 w-8 transition-transform duration-200 hover:scale-105" />
                            )}
                        </div>

                        {/* Title & Alias Moniker */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                            Protected Link
                        </h1>

                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100/90 px-3 py-1 text-xs font-mono font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
                            <span className="text-zinc-400 dark:text-zinc-500 font-sans">{domain.replace(/^https?:\/\//, "")}/</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{alias}</span>
                        </div>

                        <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                            This destination is protected with access security. Enter the passcode below to verify and unlock.
                        </p>

                        {/* Password Entry Form */}
                        <form
                            action={`/${alias}`}
                            method="GET"
                            onSubmit={handleUnlock}
                            className="mt-6 space-y-3.5"
                        >
                            <div className="relative flex items-center">
                                <div className="pointer-events-none absolute left-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                                    <Lock className="h-4 w-4" />
                                </div>

                                <input
                                    ref={inputRef}
                                    type={showPassword ? "text" : "password"}
                                    name="pwd"
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Enter access password..."
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:focus:border-indigo-500/50 dark:focus:bg-zinc-900"
                                    disabled={loading || success}
                                    autoComplete="current-password"
                                />

                                {password.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        title={showPassword ? "Hide password" : "Show password"}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>

                            {/* Error State Banner */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Unlock Action Button */}
                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                                    success
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 dark:bg-emerald-500 dark:text-black"
                                        : "bg-zinc-950 text-white shadow-xs hover:bg-zinc-800 hover:scale-[1.01] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                } disabled:opacity-60`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Verifying passcode...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Access Granted • Redirecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Unlock Link</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back / Navigation Link */}
                        <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                            <Link
                                href="/"
                                className="group inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                                <span>GoMono URL Infrastructure</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Subtle Footer */}
            <footer className="w-full border-t border-zinc-200/60 dark:border-zinc-800/40 py-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                <span>End-to-End Link Protection • Powered by GoMono Edge</span>
            </footer>
        </div>
    );
}

