import Link from "next/link";
import { Clock, Calendar, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface LinkScheduleNoticeProps {
    alias: string;
    domain: string;
    reason: string;
    nextAvailableText?: string;
    details?: string;
}

export default function LinkScheduleNotice({
    alias,
    domain,
    reason,
    nextAvailableText,
    details,
}: LinkScheduleNoticeProps) {
    const getReasonTitle = () => {
        switch (reason) {
            case "not_started":
                return "Link Has Not Launched Yet";
            case "expired":
                return "Campaign Window Has Ended";
            case "outside_days":
                return "Inactive on This Day";
            case "outside_hours":
                return "Outside Operating Hours";
            default:
                return "Link Currently Unavailable";
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 sm:p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 p-6 sm:p-8 text-center shadow-xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-900/90 animate-in fade-in zoom-in-95 duration-200">
                {/* Top Subtle Amber/Indigo Gradient Accent */}
                <div className="pointer-events-none absolute -top-px left-1/2 h-1 w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                {/* Animated Schedule Clock Badge */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-400 shadow-xs">
                    <Clock className="h-7 w-7 animate-pulse" />
                </div>

                {/* Link Alias Pill */}
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    <span>{domain}/{alias}</span>
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                    {getReasonTitle()}
                </h1>

                {/* Next Available Timing Banner */}
                {nextAvailableText && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span>{nextAvailableText}</span>
                    </div>
                )}

                {/* Details Description */}
                <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {details || "The author of this short link has placed it inside a strict scheduling window. Please return during active hours."}
                </p>

                {/* Safety & Integrity Note */}
                <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>GoMono Time-Window Governance</span>
                </div>

                {/* Action CTA Button */}
                <div className="mt-6 border-t border-zinc-200/80 pt-5 dark:border-zinc-800/80">
                    <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
                    >
                        <span>Shorten Your Own Links with GoMono</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
