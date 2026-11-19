"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Sparkles,
    Smartphone,
    Plus,
    Trash2,
    ExternalLink,
    Copy,
    Check,
    ArrowLeft,
    Save,
    Loader2,
    Eye,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcons";
import {
    BIO_THEMES,
    type BioCardLink,
    type BioSocialLink,
    type BioTheme,
    type SocialPlatform,
} from "@/lib/bio-schema";
import { toast } from "sonner";

const BIO_TOKENS_STORAGE_KEY = "gomono_bio_edit_tokens";

export default function BioBuilderPage() {
    const [handle, setHandle] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<BioTheme>("midnight-dark");

    const [socials, setSocials] = useState<BioSocialLink[]>([
        { platform: "github", url: "" },
        { platform: "twitter", url: "" },
        { platform: "linkedin", url: "" },
    ]);

    const [links, setLinks] = useState<BioCardLink[]>([
        {
            id: "link_1",
            title: "My Portfolio / Projects",
            url: "https://github.com",
            active: true,
            highlight: true,
        },
        {
            id: "link_2",
            title: "Follow on Twitter / X",
            url: "https://twitter.com",
            active: true,
            highlight: false,
        },
    ]);

    const [saving, setSaving] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const theme = BIO_THEMES[selectedTheme] || BIO_THEMES["midnight-dark"];

    // Link Management Actions
    const addLink = () => {
        if (links.length >= 15) {
            toast.error("Maximum 15 links allowed per Bio Page");
            return;
        }
        const newId = `link_${links.length + 1}_${Math.random().toString(36).substring(2, 7)}`;
        setLinks([
            ...links,
            { id: newId, title: "New Resource", url: "https://", active: true, highlight: false },
        ]);
    };

    const updateLink = (index: number, field: keyof BioCardLink, value: unknown) => {
        setLinks((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeLink = (index: number) => {
        setLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const moveLink = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === links.length - 1) return;
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        setLinks((prev) => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const updateSocial = (platform: SocialPlatform, url: string) => {
        setSocials((prev) => {
            const filtered = prev.filter((s) => s.platform !== platform);
            if (!url.trim()) return filtered;
            return [...filtered, { platform, url: url.trim() }];
        });
    };

    const getSocialUrl = (platform: SocialPlatform) => {
        return socials.find((s) => s.platform === platform)?.url || "";
    };

    // Save or update bio page
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanHandle = handle.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");
        if (!cleanHandle) {
            toast.error("Please enter a valid username/handle");
            return;
        }
        if (!displayName.trim()) {
            toast.error("Please enter a display name");
            return;
        }

        // Retrieve existing editToken for this handle if previously generated in this browser
        let storedToken: string | undefined = undefined;
        try {
            const tokensRaw = localStorage.getItem(BIO_TOKENS_STORAGE_KEY);
            if (tokensRaw) {
                const parsed = JSON.parse(tokensRaw);
                storedToken = parsed[cleanHandle];
            }
        } catch {
            // Ignore storage parse error
        }

        setSaving(true);
        const toastId = toast.loading("Publishing your Link-in-Bio page...");

        try {
            const validLinks = links.filter((l) => l.title.trim() && l.url.trim());
            const validSocials = socials.filter((s) => s.url.trim());

            const payload = {
                handle: cleanHandle,
                displayName: displayName.trim(),
                bio: bio.trim(),
                avatarUrl: avatarUrl.trim() || undefined,
                theme: selectedTheme,
                socials: validSocials,
                links: validLinks,
                editToken: storedToken,
            };

            const res = await fetch("/api/bio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to save bio page");
            }

            // Save returned editToken to localStorage
            if (data.editToken) {
                try {
                    const tokensRaw = localStorage.getItem(BIO_TOKENS_STORAGE_KEY) || "{}";
                    const parsed = JSON.parse(tokensRaw);
                    parsed[cleanHandle] = data.editToken;
                    localStorage.setItem(BIO_TOKENS_STORAGE_KEY, JSON.stringify(parsed));
                } catch {
                    // Ignore storage error
                }
            }

            const origin = typeof window !== "undefined" ? window.location.origin : "https://to.mono.bro.bd";
            const fullUrl = `${origin}/b/${cleanHandle}`;
            setPublishedUrl(fullUrl);
            toast.success("Link-in-Bio published live!", { id: toastId });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to publish bio page";
            toast.error(message, { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        if (!publishedUrl) return;
        try {
            await navigator.clipboard.writeText(publishedUrl);
            setCopied(true);
            toast.success("Bio page link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
            {/* Header Navigation */}
            <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Shortener</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                                B
                            </span>
                            <h1 className="text-sm font-bold tracking-tight sm:text-base">
                                Link-in-Bio Studio
                            </h1>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 uppercase tracking-wider">
                                $0 Free
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {publishedUrl && (
                            <Link
                                href={publishedUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Live</span>
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    <span>Publish Page</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Split Screen Container */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Form Editor (7 Columns) */}
                    <div className="space-y-6 lg:col-span-7">
                        {/* Published Banner if available */}
                        {publishedUrl && (
                            <div className="flex items-center justify-between rounded-2xl border border-emerald-300/80 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 truncate">
                                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span className="truncate font-mono font-medium">
                                        {publishedUrl}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-xs hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200"
                                    >
                                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                        <span>{copied ? "Copied" : "Copy"}</span>
                                    </button>
                                    <Link
                                        href={publishedUrl}
                                        target="_blank"
                                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-500"
                                    >
                                        Visit
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Section 1: Handle & Profile Identity */}
                        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
                                1. Profile Identity
                            </h2>
                            <div className="space-y-3.5">
                                {/* Slug / Handle */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Profile Handle / Slug
                                    </label>
                                    <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden focus-within:border-indigo-500">
                                        <span className="flex items-center px-3 text-xs font-mono text-zinc-400 select-none border-r border-zinc-200 dark:border-zinc-800">
                                            to.mono.bro.bd/b/
                                        </span>
                                        <input
                                            type="text"
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                                            placeholder="yourname"
                                            className="w-full bg-transparent px-3 py-2 text-xs font-mono outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                            maxLength={30}
                                        />
                                    </div>
                                    <p className="mt-1 text-[11px] text-zinc-400">
                                        Letters, numbers, underscores, and hyphens only (2-30 characters).
                                    </p>
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="e.g. Alex Morgan"
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400"
                                        maxLength={60}
                                    />
                                </div>

                                {/* Bio Text */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Bio Summary
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Creator, builder & open source advocate."
                                        rows={2}
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 resize-none"
                                        maxLength={250}
                                    />
                                    <div className="text-right text-[10px] text-zinc-400">
                                        {bio.length}/250
                                    </div>
                                </div>

                                {/* External Avatar URL */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Avatar Image URL (Zero Server Storage)
                                    </label>
                                    <input
                                        type="url"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="https://github.com/yourname.png or external photo link"
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400"
                                    />
                                    <p className="mt-1 text-[11px] text-zinc-400">
                                        Link any public image (GitHub, Gravatar, Unsplash). Saves database bloat!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Theme Selector */}
                        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
                                2. Visual Theme
                            </h2>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                                {(Object.keys(BIO_THEMES) as BioTheme[]).map((themeKey) => {
                                    const t = BIO_THEMES[themeKey];
                                    const isSelected = selectedTheme === themeKey;
                                    return (
                                        <button
                                            key={themeKey}
                                            type="button"
                                            onClick={() => setSelectedTheme(themeKey)}
                                            className={`flex flex-col items-center gap-2 rounded-2xl border p-2.5 text-center transition-all ${
                                                isSelected
                                                    ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/40"
                                                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                                            }`}
                                        >
                                            <div
                                                className="h-10 w-full rounded-xl shadow-xs border border-white/20"
                                                style={{ backgroundColor: t.previewBg }}
                                            />
                                            <span className="text-[11px] font-semibold truncate max-w-full">
                                                {t.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section 3: Social Row */}
                        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
                                3. Social Media Links
                            </h2>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                {(["github", "twitter", "linkedin", "youtube", "instagram", "email"] as SocialPlatform[]).map((p) => (
                                    <div key={p} className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                                            <SocialIcon platform={p} className="h-4 w-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={getSocialUrl(p)}
                                            onChange={(e) => updateSocial(p, e.target.value)}
                                            placeholder={`${p} URL / handle`}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 4: Card Links Manager */}
                        <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                                        4. Destination Links
                                    </h2>
                                    <p className="text-[11px] text-zinc-400">
                                        Add up to 15 highlighted or standard links
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add Link</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <div
                                        key={link.id}
                                        className="relative rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/60 space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                                                <span>#{idx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => moveLink(idx, "up")}
                                                    disabled={idx === 0}
                                                    className="p-0.5 hover:text-zinc-700 disabled:opacity-20 dark:hover:text-zinc-200"
                                                    title="Move up"
                                                >
                                                    <ChevronUp className="h-3 w-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveLink(idx, "down")}
                                                    disabled={idx === links.length - 1}
                                                    className="p-0.5 hover:text-zinc-700 disabled:opacity-20 dark:hover:text-zinc-200"
                                                    title="Move down"
                                                >
                                                    <ChevronDown className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={link.highlight || false}
                                                        onChange={(e) => updateLink(idx, "highlight", e.target.checked)}
                                                        className="rounded accent-indigo-600"
                                                    />
                                                    <span>Featured Glow</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLink(idx)}
                                                    className="rounded-lg p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                                                    title="Delete link"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <input
                                                type="text"
                                                value={link.title}
                                                onChange={(e) => updateLink(idx, "title", e.target.value)}
                                                placeholder="Button Title (e.g. My Newsletter)"
                                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                            />
                                            <input
                                                type="url"
                                                value={link.url}
                                                onChange={(e) => updateLink(idx, "url", e.target.value)}
                                                placeholder="https://..."
                                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Mobile Mockup Preview (5 Columns) */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="sticky top-20 w-full max-w-[340px]">
                            <div className="flex items-center justify-between px-2 mb-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                    <Smartphone className="h-4 w-4" />
                                    <span>Real-Time Mobile Preview</span>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400">
                                    /{handle || "handle"}
                                </span>
                            </div>

                            {/* Phone Mockup Frame */}
                            <div className="relative mx-auto h-[620px] w-full overflow-hidden rounded-[40px] border-[8px] border-zinc-800 bg-black shadow-2xl dark:border-zinc-700">
                                {/* Speaker Notch */}
                                <div className="absolute left-1/2 top-2 z-20 h-4 w-24 -translate-x-1/2 rounded-full bg-zinc-800 dark:bg-zinc-700" />

                                {/* Mockup Viewport */}
                                <div className={`h-full w-full overflow-y-auto px-5 pt-12 pb-8 transition-colors ${theme.wrapperClass}`}>
                                    {/* Mockup Profile Header */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-3">
                                            {avatarUrl.trim() ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={avatarUrl.trim()}
                                                    alt={displayName}
                                                    className="h-16 w-16 rounded-full object-cover shadow-md border-2 border-white/20"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/30 border border-indigo-400/40 text-lg font-bold uppercase shadow-md">
                                                    {(displayName.slice(0, 2) || "GM")}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className={`text-base font-bold tracking-tight ${theme.textClass}`}>
                                            {displayName || "Your Name"}
                                        </h3>
                                        <p className="text-[10px] font-mono opacity-60">
                                            @{handle || "yourhandle"}
                                        </p>

                                        {bio.trim() && (
                                            <p className={`mt-2 text-[11px] leading-relaxed max-w-[240px] ${theme.subtextClass}`}>
                                                {bio}
                                            </p>
                                        )}

                                        {/* Mockup Social Row */}
                                        {socials.filter((s) => s.url.trim()).length > 0 && (
                                            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                                                {socials.filter((s) => s.url.trim()).map((s, idx) => (
                                                    <div
                                                        key={`${s.platform}_${idx}`}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 opacity-80"
                                                    >
                                                        <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Mockup Links */}
                                        <div className="mt-5 w-full space-y-2">
                                            {links.filter((l) => l.active).map((l) => (
                                                <div
                                                    key={l.id}
                                                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold shadow-xs ${
                                                        l.highlight ? theme.highlightClass : theme.cardClass
                                                    }`}
                                                >
                                                    <span className="truncate flex-1 text-center">
                                                        {l.title || "Untitled Link"}
                                                    </span>
                                                    <ExternalLink className="h-3 w-3 shrink-0 opacity-40 ml-1" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mockup Footer */}
                                        <div className="mt-6 text-[9px] opacity-40">
                                            ⚡ GoMono Bio
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
