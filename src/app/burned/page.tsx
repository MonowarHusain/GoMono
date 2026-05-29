import { Flame, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Link Destroyed",
    description: "This link has self-destructed.",
};

export default function BurnedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans dark:bg-neutral-950">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-orange-500/10 blur-[100px] pointer-events-none"></div>

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-orange-500/20 bg-white p-8 text-center shadow-2xl dark:border-orange-500/10 dark:bg-neutral-900">
                {/* Header Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <Flame className="h-10 w-10 text-orange-500" />
                </div>

                <h1 className="mb-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                    Link Self-Destructed
                </h1>

                <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                    This link had a strict "burn after reading" limit. The maximum number of allowed visits has been reached, and the destination URL has been permanently wiped from access.
                </p>

                {/* Security Badge */}
                <div className="mx-auto mb-8 flex max-w-[250px] items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 py-2 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span>Privacy protection active</span>
                </div>

                {/* Return Button */}
                <Link
                    href="/"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Return Home
                </Link>
            </div>
        </div>
    );
}