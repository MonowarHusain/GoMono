"use client";

import { useState } from "react";
import { updateLink } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { Link2, Shield, Clock, Loader2, Tags, Flame, X } from "lucide-react";

type LinkData = {
    alias: string;
    originalUrl: string;
    isProtected?: boolean;
    maxClicks?: number | null;
    tags?: string[];
    expiresAt?: string | null;
};

export default function EditLinkModal({ link, onClose }: { link: LinkData; onClose: () => void }) {
    const [isProtected, setIsProtected] = useState(link.isProtected || false);
    const [isLoading, setIsLoading] = useState(false);

    // Format the existing date for the datetime-local input
    const defaultDate = link.expiresAt
        ? new Date(link.expiresAt).toISOString().slice(0, 16)
        : "";

    async function handleAction(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateLink(link.alias, formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`Link /${link.alias} updated successfully!`);
            onClose();
        }

        setIsLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Link: /{link.alias}</h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleAction} className="flex flex-col gap-5">
                    {/* Destination URL */}
                    <div className="group relative">
                        <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600 dark:text-slate-500 transition-colors group-focus-within:text-blue-500" />
                        <input
                            name="originalUrl"
                            type="url"
                            required
                            defaultValue={link.originalUrl}
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>

                    {/* NEW: Alias Input */}
                    <div className="group relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500 font-medium">/</span>
                        <input
                            name="alias"
                            type="text"
                            required
                            defaultValue={link.alias}
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 pl-8 pr-4 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                        />
                        <p className="mt-1.5 text-xs text-amber-500/80 pl-2">
                            Warning: Changing this will break the existing link.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200/50 dark:border-neutral-800/50 bg-neutral-50 dark:bg-neutral-950 p-5">
                        {/* Tags */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400">
                            <Tags className="h-4 w-4 shrink-0" />
                            <input
                                name="tags"
                                type="text"
                                defaultValue={link.tags?.join(", ")}
                                disabled={isLoading}
                                placeholder="Tags (comma separated)"
                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-neutral-600 outline-none focus:text-blue-400"
                            />
                        </div>

                        {/* Max Clicks */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400">
                            <Flame className="h-4 w-4 shrink-0 text-orange-500" />
                            <input
                                name="maxClicks"
                                type="number"
                                min="1"
                                defaultValue={link.maxClicks || ""}
                                disabled={isLoading}
                                placeholder="Burn limit (leave empty for ∞)"
                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-neutral-600 outline-none focus:text-orange-400"
                            />
                        </div>

                        {/* Expiration */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400">
                            <Clock className="h-4 w-4 shrink-0" />
                            <input
                                name="expiresAt"
                                type="datetime-local"
                                defaultValue={defaultDate}
                                disabled={isLoading}
                                className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none focus:text-blue-400 [color-scheme:dark]"
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

                    {isProtected && (
                        <input
                            name="password"
                            type="password"
                            disabled={isLoading}
                            placeholder={link.isProtected ? "Enter new password (leave blank to keep current)" : "Set an access password"}
                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 px-4 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-blue-500/50"
                        />
                    )}

                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="rounded-xl px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-white px-8 py-2.5 text-sm font-semibold text-white dark:text-black transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}