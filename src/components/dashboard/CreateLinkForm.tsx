"use client";

import { useState } from "react";
import { createLink } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { Link2, Shield, Clock, Loader2, Sparkles, Flame, Tags } from "lucide-react";

export default function CreateLinkForm() {
    const [isProtected, setIsProtected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleAction(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createLink(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`Success! /${result?.alias} is now active.`);
            // @ts-ignore
            e.target.reset();
            setIsProtected(false);
        }

        setIsLoading(false);
    }

    return (
        <form onSubmit={handleAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* URL Input */}
                <div className="group relative">
                    <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600 dark:text-slate-500 transition-colors group-focus-within:text-blue-500" />
                    <input
                        id="originalUrlInput"
                        name="originalUrl"
                        type="url"
                        required
                        disabled={isLoading}
                        placeholder="https://example.com/very-long-url"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500/50 focus:bg-neutral-900 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                    />
                </div>

                {/* Alias Input */}
                <div className="group relative">
                    <Sparkles className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600 dark:text-slate-500 transition-colors group-focus-within:text-blue-500" />
                    <input
                        name="alias"
                        type="text"
                        disabled={isLoading}
                        placeholder="Custom Alias (optional)"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500/50 focus:bg-neutral-900 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200/50 dark:border-neutral-800/50 bg-white shadow-sm dark:bg-neutral-900/50 p-4">
                {/* Advanced Settings Panel */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200/50 dark:border-neutral-800/50 bg-white shadow-sm dark:bg-neutral-900/50 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">Advanced Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tags Input */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800 pb-2 md:border-none md:pb-0">
                            <Tags className="h-4 w-4 shrink-0" />
                            <input
                                name="tags"
                                type="text"
                                disabled={isLoading}
                                placeholder="Tags (e.g. mlsa, thesis, personal)"
                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-neutral-600 outline-none transition-all focus:text-blue-400"
                            />
                        </div>

                        {/* Burn After Reading */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400">
                            <Flame className="h-4 w-4 shrink-0 text-orange-500" />
                            <input
                                name="maxClicks"
                                type="number"
                                min="1"
                                disabled={isLoading}
                                placeholder="Burn limit (leave empty for ∞)"
                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-neutral-600 outline-none transition-all focus:text-orange-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Expiration Input */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400">
                            <Clock className="h-4 w-4 shrink-0" />
                            <input
                                name="expiresAt"
                                type="datetime-local"
                                disabled={isLoading}
                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none transition-all focus:text-blue-400 [color-scheme:dark]"
                            />
                        </div>

                        {/* Password Toggle */}
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-500 dark:text-neutral-400 transition-colors hover:text-slate-900 dark:hover:text-white">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="isProtected"
                                    checked={isProtected}
                                    onChange={(e) => setIsProtected(e.target.checked)}
                                    disabled={isLoading}
                                    className="peer sr-only"
                                />
                                <div className="h-5 w-5 rounded border border-slate-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-colors"></div>
                                <Shield className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-slate-900 dark:text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            Require Password
                        </label>
                    </div>
                </div>
            </div>

            {isProtected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                        placeholder="Set an access password"
                        className="w-full md:w-1/2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 py-3 px-4 text-sm text-slate-900 dark:text-white placeholder-neutral-500 outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="group relative w-fit overflow-hidden rounded-xl bg-neutral-900 dark:bg-white px-8 py-3 text-sm font-semibold text-white dark:text-black transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
                <span className="flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Creating..." : "Shorten Link"}
                </span>
            </button>
        </form>
    );
}