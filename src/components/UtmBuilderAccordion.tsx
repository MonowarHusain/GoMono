"use client";

import { useState } from "react";
import {
    Sparkles,
    Trash2,
    Plus,
    RotateCcw,
    Bookmark,
    ExternalLink,
} from "lucide-react";
import {
    buildUtmUrl,
    parseUtmUrl,
    POPULAR_UTM_PRESETS,
    type UtmParams,
    type UtmPreset,
} from "@/lib/utm-builder";
import { toast } from "sonner";

interface UtmBuilderAccordionProps {
    originalUrl: string;
    onUrlChange: (newUrl: string) => void;
    onClose?: () => void;
}

const CUSTOM_PRESETS_KEY = "gomono_utm_presets";

export default function UtmBuilderAccordion({
    originalUrl,
    onUrlChange,
    onClose,
}: UtmBuilderAccordionProps) {
    // Single source of truth: extract UTM parameters directly from the URL
    const { baseUrlWithoutUtm, params } = parseUtmUrl(originalUrl);

    // Lazy initialization for localStorage custom presets (zero effect cascading renders)
    const [customPresets, setCustomPresets] = useState<UtmPreset[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch {
            // Ignore parse errors
        }
        return [];
    });

    const [newPresetName, setNewPresetName] = useState("");
    const [isSavingPreset, setIsSavingPreset] = useState(false);

    const updateParam = (key: keyof UtmParams, value: string) => {
        const nextParams: UtmParams = { ...params, [key]: value };
        // Base URL fallback if user starts typing UTM params before entering base URL
        const base = baseUrlWithoutUtm.trim() || "";
        const nextUrl = buildUtmUrl(base, nextParams);
        onUrlChange(nextUrl);
    };

    const applyPreset = (preset: { source: string; medium: string }) => {
        const nextParams: UtmParams = {
            ...params,
            utm_source: preset.source,
            utm_medium: preset.medium,
        };

        if (!baseUrlWithoutUtm.trim()) {
            const nextUrl = buildUtmUrl("https://example.com", nextParams);
            onUrlChange(nextUrl);
            toast.info(`Preset set: replace 'https://example.com' with your destination`);
            return;
        }

        const nextUrl = buildUtmUrl(baseUrlWithoutUtm, nextParams);
        onUrlChange(nextUrl);
        toast.success(`Preset applied: ${preset.source} / ${preset.medium}`);
    };

    const handleClearUtm = () => {
        onUrlChange(baseUrlWithoutUtm);
        toast.info("Cleared UTM campaign parameters");
    };

    const handleSaveCustomPreset = () => {
        const name = newPresetName.trim();
        if (!name) {
            toast.error("Please enter a preset name");
            return;
        }
        if (!params.utm_source) {
            toast.error("Campaign Source (utm_source) is required to save a preset");
            return;
        }

        const newPreset: UtmPreset = {
            id: `custom_${customPresets.length + 1}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            label: name,
            source: params.utm_source,
            medium: params.utm_medium || "referral",
        };

        const updated = [...customPresets, newPreset];
        setCustomPresets(updated);
        try {
            localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
            toast.success(`Preset "${name}" saved to browser vault`);
            setNewPresetName("");
            setIsSavingPreset(false);
        } catch {
            toast.error("Failed to save preset to storage");
        }
    };

    const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = customPresets.filter((p) => p.id !== id);
        setCustomPresets(updated);
        try {
            localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
            toast.info("Custom preset removed");
        } catch {
            // Ignore storage errors
        }
    };

    const hasUtmParams = Boolean(
        params.utm_source ||
        params.utm_medium ||
        params.utm_campaign ||
        params.utm_term ||
        params.utm_content
    );

    return (
        <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-3.5 sm:p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header line with summary and reset */}
            <div className="mb-3 flex items-center justify-between border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            Campaign UTM Studio
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            Append query-safe marketing attributes without breaking target URLs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasUtmParams && (
                        <button
                            type="button"
                            onClick={handleClearUtm}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset UTM</span>
                        </button>
                    )}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Channel Presets Pill Bar */}
            <div className="mb-3 space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Quick Channel Presets
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                    {POPULAR_UTM_PRESETS.map((preset) => {
                        const isActive =
                            params.utm_source === preset.source &&
                            params.utm_medium === preset.medium;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:border-zinc-700/60 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                }`}
                            >
                                {preset.label}
                            </button>
                        );
                    })}

                    {/* User Custom Saved Presets */}
                    {customPresets.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="group relative inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-all"
                        >
                            <Bookmark className="h-2.5 w-2.5 text-indigo-500" />
                            <span>{preset.label}</span>
                            <span
                                onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity ml-0.5"
                                title="Delete preset"
                            >
                                <Trash2 className="h-2.5 w-2.5" />
                            </span>
                        </button>
                    ))}

                    {/* Save Custom Preset Button */}
                    {!isSavingPreset ? (
                        <button
                            type="button"
                            onClick={() => setIsSavingPreset(true)}
                            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2 py-1 text-[11px] text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all"
                            title="Save current source & medium as reusable preset"
                        >
                            <Plus className="h-2.5 w-2.5" />
                            <span>Save Preset</span>
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-white p-0.5 dark:border-indigo-800 dark:bg-zinc-950">
                            <input
                                type="text"
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="Preset name..."
                                className="w-24 px-1.5 py-0.5 text-[11px] outline-none bg-transparent text-zinc-800 dark:text-zinc-200"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveCustomPreset();
                                    if (e.key === "Escape") setIsSavingPreset(false);
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSaveCustomPreset}
                                className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-500"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSavingPreset(false)}
                                className="px-1 text-[10px] text-zinc-400 hover:text-zinc-600"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid of UTM Parameters */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {/* Source */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>Source</span>
                        <span className="font-mono text-[9px] text-zinc-400">utm_source</span>
                    </label>
                    <input
                        type="text"
                        value={params.utm_source || ""}
                        onChange={(e) => updateParam("utm_source", e.target.value)}
                        placeholder="e.g. google, twitter, newsletter"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                    />
                </div>

                {/* Medium */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>Medium</span>
                        <span className="font-mono text-[9px] text-zinc-400">utm_medium</span>
                    </label>
                    <input
                        type="text"
                        value={params.utm_medium || ""}
                        onChange={(e) => updateParam("utm_medium", e.target.value)}
                        placeholder="e.g. cpc, social, email"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                    />
                </div>

                {/* Campaign */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>Campaign</span>
                        <span className="font-mono text-[9px] text-zinc-400">utm_campaign</span>
                    </label>
                    <input
                        type="text"
                        value={params.utm_campaign || ""}
                        onChange={(e) => updateParam("utm_campaign", e.target.value)}
                        placeholder="e.g. summer_launch"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                    />
                </div>

                {/* Term (Optional) */}
                <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>Term (Optional)</span>
                        <span className="font-mono text-[9px] text-zinc-400">utm_term</span>
                    </label>
                    <input
                        type="text"
                        value={params.utm_term || ""}
                        onChange={(e) => updateParam("utm_term", e.target.value)}
                        placeholder="Keyword targeting"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                    />
                </div>

                {/* Content (Optional) */}
                <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>Content (Optional)</span>
                        <span className="font-mono text-[9px] text-zinc-400">utm_content</span>
                    </label>
                    <input
                        type="text"
                        value={params.utm_content || ""}
                        onChange={(e) => updateParam("utm_content", e.target.value)}
                        placeholder="e.g. top_banner, textlink_footer"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                    />
                </div>
            </div>

            {/* Target URL Preview */}
            {originalUrl && hasUtmParams && (
                <div className="mt-3 rounded-xl border border-zinc-200/60 bg-white/70 p-2 text-left font-mono text-[10px] text-zinc-600 dark:border-zinc-800/60 dark:bg-zinc-950/40 dark:text-zinc-400 break-all flex items-start gap-1.5">
                    <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-indigo-500" />
                    <span className="line-clamp-2">{originalUrl}</span>
                </div>
            )}
        </div>
    );
}
