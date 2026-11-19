"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface ExpiryCountdownBadgeProps {
    expiresAt?: string | Date | null;
    className?: string;
    showIcon?: boolean;
    compact?: boolean;
    onExpire?: () => void;
}

interface TimeRemaining {
    isExpired: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    text: string;
}

function calculateRemaining(expiryDate: Date): TimeRemaining {
    const diffMs = expiryDate.getTime() - Date.now();

    if (diffMs <= 0) {
        return {
            isExpired: true,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            text: "Expired",
        };
    }

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    let text: string;
    if (days > 0) {
        text = `Expires in ${days}d ${hours}h`;
    } else if (hours > 0) {
        text = `Expires in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        text = `Expires in ${minutes}m ${seconds}s`;
    } else {
        text = `Expires in ${seconds}s`;
    }

    return {
        isExpired: false,
        days,
        hours,
        minutes,
        seconds,
        text,
    };
}

const emptySubscribe = () => () => {};

export default function ExpiryCountdownBadge({
    expiresAt,
    className = "",
    showIcon = true,
    compact = false,
    onExpire,
}: ExpiryCountdownBadgeProps) {
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!expiresAt) return;

        const targetDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
        if (isNaN(targetDate.getTime())) return;

        // Tick every 1s if less than 1 hour remains, otherwise tick every 30s to conserve CPU
        const diffMs = targetDate.getTime() - Date.now();
        const intervalMs = diffMs < 3600000 ? 1000 : 30000;

        const timer = setInterval(() => {
            setTick((prev) => prev + 1);
        }, intervalMs);

        return () => clearInterval(timer);
    }, [expiresAt]);

    if (!expiresAt || !mounted) return null;

    const targetDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
    if (isNaN(targetDate.getTime())) return null;

    // suppress unused variable warning by referencing tick
    if (tick < 0) return null;

    const remaining = calculateRemaining(targetDate);

    if (remaining.isExpired) {
        onExpire?.();
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 uppercase tracking-wider ${className}`}
                title="This link has expired"
            >
                {showIcon && <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />}
                <span>Expired</span>
            </span>
        );
    }

    const isUrgent = remaining.days === 0 && remaining.hours === 0;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                isUrgent
                    ? "border border-amber-500/30 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400"
            } ${className}`}
            title={`Full Expiration Date: ${new Date(expiresAt).toLocaleString()}`}
        >
            {showIcon && <Clock className={`h-3 w-3 shrink-0 ${isUrgent ? "text-amber-500" : "text-zinc-400"}`} />}
            <span className="font-mono">
                {compact ? remaining.text.replace("Expires in ", "") : remaining.text}
            </span>
        </span>
    );
}
