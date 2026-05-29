"use client";

import { useState, useEffect } from "react";
import { Link2, Copy, Zap, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLink } from "@/app/dashboard/actions";

export default function UtmBuilder() {
    const [baseUrl, setBaseUrl] = useState("");
    const [source, setSource] = useState("");
    const [medium, setMedium] = useState("");
    const [campaign, setCampaign] = useState("");
    const [alias, setAlias] = useState("");

    const [generatedUrl, setGeneratedUrl] = useState("");
    const [isShortening, setIsShortening] = useState(false);

    // Auto-generate the UTM URL whenever inputs change
    useEffect(() => {
        if (!baseUrl) {
            setGeneratedUrl("");
            return;
        }

        try {
            const urlObj = new URL(baseUrl.includes('http') ? baseUrl : `https://${baseUrl}`);
            if (source) urlObj.searchParams.set("utm_source", source);
            if (medium) urlObj.searchParams.set("utm_medium", medium);
            if (campaign) urlObj.searchParams.set("utm_campaign", campaign);

            setGeneratedUrl(urlObj.toString());
        } catch (e) {
            setGeneratedUrl("Waiting for a valid URL...");
        }
    }, [baseUrl, source, medium, campaign]);

    const applyPreset = (presetSource: string, presetMedium: string) => {
        setSource(presetSource);
        setMedium(presetMedium);
    };

    const handleCreateShortLink = async () => {
        if (!generatedUrl || generatedUrl.startsWith("Waiting")) {
            toast.error("Please enter a valid destination URL");
            return;
        }

        setIsShortening(true);
        const formData = new FormData();
        formData.append("originalUrl", generatedUrl);
        if (alias) formData.append("alias", alias);

        const result = await createLink(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`Success! /${result?.alias} created with UTM tags.`);
            setBaseUrl("");
            setSource("");
            setMedium("");
            setCampaign("");
            setAlias("");
        }
        setIsShortening(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-2 space-y-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6">

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-neutral-300">Destination URL *</label>
                    <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                        <input
                            type="url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://example.com/your-project"
                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 flex justify-between text-sm font-medium text-slate-700 dark:text-neutral-300">
                            Campaign Source <span className="text-slate-600 font-mono text-xs">utm_source</span>
                        </label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="e.g., github, linkedin, discord"
                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 px-4 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <div>
                        <label className="mb-2 flex justify-between text-sm font-medium text-slate-700 dark:text-neutral-300">
                            Campaign Medium <span className="text-slate-600 font-mono text-xs">utm_medium</span>
                        </label>
                        <input
                            type="text"
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                            placeholder="e.g., social, readme, bio"
                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 px-4 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 flex justify-between text-sm font-medium text-slate-700 dark:text-neutral-300">
                        Campaign Name <span className="text-slate-600 font-mono text-xs">utm_campaign</span>
                    </label>
                    <input
                        type="text"
                        value={campaign}
                        onChange={(e) => setCampaign(e.target.value)}
                        placeholder="e.g., workshop_2026, portfolio_launch"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 px-4 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>

            {/* Right Column: Presets & Preview */}
            <div className="space-y-6">
                {/* Presets */}
                <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Quick Presets</h3>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => applyPreset("linkedin", "social")} className="rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800/50 px-3 py-1.5 text-xs text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800">LinkedIn</button>
                        <button onClick={() => applyPreset("github", "readme")} className="rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800/50 px-3 py-1.5 text-xs text-slate-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">GitHub</button>
                        <button onClick={() => applyPreset("discord", "community")} className="rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800/50 px-3 py-1.5 text-xs text-indigo-400 hover:bg-neutral-200 dark:hover:bg-neutral-800">Discord</button>
                        <button onClick={() => applyPreset("email", "newsletter")} className="rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800/50 px-3 py-1.5 text-xs text-amber-400 hover:bg-neutral-200 dark:hover:bg-neutral-800">Newsletter</button>
                    </div>
                </div>

                {/* Live Preview Box */}
                <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-6 shadow-[0_0_30px_-15px_rgba(59,130,246,0.1)]">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Zap className="h-4 w-4 text-blue-400" /> Live Preview
                    </h3>

                    <div className="mb-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 font-mono text-xs text-slate-500 dark:text-neutral-400 break-all h-24 overflow-y-auto">
                        {generatedUrl || "Waiting for input..."}
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 flex justify-between text-xs font-medium text-slate-500 dark:text-neutral-400">
                            Custom Alias <span className="text-slate-600">(Optional)</span>
                        </label>
                        <div className="flex">
                            <span className="flex items-center rounded-l-xl border border-r-0 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm text-slate-600 dark:text-slate-500">
                                /
                            </span>
                            <input
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                placeholder="my-campaign"
                                className="w-full rounded-r-xl border border-slate-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-2.5 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCreateShortLink}
                        disabled={isShortening}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white transition-all hover:bg-blue-500 disabled:opacity-50"
                    >
                        {isShortening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        {isShortening ? "Creating..." : "Create Short Link"}
                    </button>
                </div>
            </div>
        </div>
    );
}