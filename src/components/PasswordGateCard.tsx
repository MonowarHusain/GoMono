"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Lock,
    Unlock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Shield,
    Check,
} from "lucide-react";

interface PasswordGateCardProps {
    alias: string;
    domain?: string;
    initialError?: boolean;
    onUnlocked?: (targetUrl?: string) => void;
}

export default function PasswordGateCard({
    alias,
    domain = "to.mono.bro.bd",
    initialError = false,
    onUnlocked,
}: PasswordGateCardProps) {
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
                headers: { "Content-Type": "application/json" },
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

            setSuccess(true);
            setLoading(false);

            if (onUnlocked) {
                onUnlocked(data.targetUrl);
                return;
            }

            // Default redirect: use query param to guarantee instant routing
            const redirectUrl = `/${alias}?pwd=${encodeURIComponent(trimmed)}`;
            setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 300);
        } catch (err) {
            console.error("Unlock error:", err);
            window.location.replace(`/${alias}?pwd=${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <div
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-900/90 transition-transform ${
                shake ? "animate-shake" : ""
            }`}
        >
            {/* Top Amber Accent */}
            <div className="pointer-events-none absolute -top-px left-1/2 h-1 w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

            {/* Lock Icon Badge */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-400 shadow-xs">
                {success ? (
                    <Unlock className="h-7 w-7 text-emerald-500 animate-in zoom-in-75 duration-200" />
                ) : (
                    <Lock className="h-7 w-7" />
                )}
            </div>

            {/* Domain & Alias Badge */}
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <Shield className="h-3 w-3 text-indigo-500" />
                <span>{domain}/{alias}</span>
            </div>

            {/* Heading */}
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                {success ? "Access Granted" : "Password Protected"}
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {success
                    ? "Redirecting you to the destination..."
                    : "Enter the passcode to view this protected destination."}
            </p>

            {/* Form */}
            {!success && (
                <form onSubmit={handleUnlock} className="mt-5 space-y-3">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder="Enter passcode..."
                            disabled={loading}
                            className={`w-full rounded-2xl border bg-white py-2.5 pl-4 pr-10 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-all dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 ${
                                error
                                    ? "border-rose-500 ring-2 ring-rose-500/10 focus:border-rose-500"
                                    : "border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800 dark:focus:border-indigo-500/50"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-left text-xs font-medium text-rose-500 animate-in fade-in">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password.trim()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span>Unlock Destination</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* Success state */}
            {success && (
                <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>Passcode verified. Unlocking...</span>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 border-t border-zinc-200/80 pt-4 text-[11px] text-zinc-400 dark:border-zinc-800/80">
                <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                    Powered by GoMono Zero-Trust Link Suite
                </Link>
            </div>
        </div>
    );
}
