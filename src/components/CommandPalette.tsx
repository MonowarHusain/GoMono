"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Link2,
    FileSpreadsheet,
    QrCode,
    Sparkles,
    History,
    ExternalLink,
    ArrowRight,
    Command,
    X,
    Clipboard,
    Bookmark,
} from "lucide-react";
import { useLocalLinkVault } from "@/hooks/useLocalLinkVault";
import { toast } from "sonner";

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    category: "Navigation" | "Quick Actions" | "Device Vault";
    action: () => void;
    badge?: string;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const { links: vaultLinks } = useLocalLinkVault();

    const closePalette = () => {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(0);
    };

    // Listen for Cmd+K and Ctrl+K globally
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsOpen((prev) => {
                    if (!prev) {
                        setQuery("");
                        setSelectedIndex(0);
                    }
                    return !prev;
                });
            } else if (e.key === "Escape" && isOpen) {
                closePalette();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const navigateTo = (path: string) => {
        closePalette();
        router.push(path);
    };

    const handlePasteAndShorten = async () => {
        closePalette();
        try {
            if (typeof window !== "undefined" && navigator?.clipboard) {
                const text = await navigator.clipboard.readText();
                if (text && /^https?:\/\//i.test(text.trim())) {
                    router.push(`/${encodeURIComponent(text.trim())}`);
                } else if (text) {
                    router.push(`/${encodeURIComponent(`https://${text.trim()}`)}`);
                } else {
                    toast.info("Clipboard is empty");
                }
            }
        } catch {
            toast.error("Clipboard permission was denied");
        }
    };

    const handleCopyBookmarklet = async () => {
        closePalette();
        try {
            const code = `javascript:(function(){var u=location.href;window.open('https://to.mono.bro.bd/'+encodeURIComponent(u),'_blank');})();`;
            await navigator.clipboard.writeText(code);
            toast.success("Bookmarklet code copied to clipboard!");
        } catch {
            toast.error("Failed to copy bookmarklet");
        }
    };

    // Build items catalog
    const allItems: CommandItem[] = [
        // Navigation
        {
            id: "nav-shortener",
            title: "URL Shortener & Routing",
            subtitle: "Main link creation studio with device routing & UTM",
            icon: Link2,
            category: "Navigation",
            action: () => navigateTo("/"),
        },
        {
            id: "nav-bio",
            title: "Link-in-Bio Studio",
            subtitle: "Create mobile-first profiles at /b/[handle]",
            icon: Sparkles,
            category: "Navigation",
            badge: "New",
            action: () => navigateTo("/bio-builder"),
        },
        {
            id: "nav-csv",
            title: "Standalone CSV Studio",
            subtitle: "Client-side spreadsheet grid, cleaner & converter",
            icon: FileSpreadsheet,
            category: "Navigation",
            badge: "Pro",
            action: () => navigateTo("/csv-studio"),
        },
        {
            id: "nav-qr",
            title: "Custom QR Code Studio",
            subtitle: "Vector SVG & 4K PNG with zero server storage",
            icon: QrCode,
            category: "Navigation",
            action: () => navigateTo("/qr"),
        },

        // Quick Actions
        {
            id: "action-paste",
            title: "Paste & Shorten Clipboard URL",
            subtitle: "Instantly create short link from clipboard contents",
            icon: Clipboard,
            category: "Quick Actions",
            action: handlePasteAndShorten,
        },
        {
            id: "action-bookmarklet",
            title: "Copy 1-Click Browser Bookmarklet",
            subtitle: "Copy javascript: shortcut for your browser bar",
            icon: Bookmark,
            category: "Quick Actions",
            action: handleCopyBookmarklet,
        },

        // Vault items (top 5 recent)
        ...vaultLinks.slice(0, 5).map((v) => ({
            id: `vault-${v.alias}`,
            title: `/${v.alias}`,
            subtitle: v.originalUrl,
            icon: History,
            category: "Device Vault" as const,
            badge: "Vault",
            action: () => {
                closePalette();
                window.open(v.shortUrl, "_blank");
            },
        })),
    ];

    // Filter items based on user query
    const filteredItems = query.trim()
        ? allItems.filter(
              (item) =>
                  item.title.toLowerCase().includes(query.toLowerCase()) ||
                  item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
                  item.category.toLowerCase().includes(query.toLowerCase())
          )
        : allItems;

    // Keyboard navigation within the filtered list
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
            );
        } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
            e.preventDefault();
            filteredItems[selectedIndex].action();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 backdrop-blur-md bg-black/60 animate-in fade-in duration-150"
            onClick={closePalette}
        >
            <div
                className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-900/95 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
                    <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command, page, or search vault..."
                        className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-flex rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            ESC
                        </kbd>
                        <button
                            type="button"
                            onClick={closePalette}
                            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="max-h-[380px] overflow-y-auto p-2">
                    {filteredItems.length === 0 ? (
                        <div className="py-10 text-center text-xs text-zinc-400">
                            No matching commands found for &ldquo;{query}&rdquo;
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredItems.map((item, idx) => {
                                const isSelected = idx === selectedIndex;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={item.action}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-xs transition-colors ${
                                            isSelected
                                                ? "bg-indigo-600 text-white font-medium shadow-xs"
                                                : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${
                                                    isSelected
                                                        ? "border-white/30 bg-white/20 text-white"
                                                        : "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate font-semibold">
                                                        {item.title}
                                                    </span>
                                                    {item.badge && (
                                                        <span
                                                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                                                isSelected
                                                                    ? "bg-white/20 text-white"
                                                                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.subtitle && (
                                                    <p
                                                        className={`truncate text-[10px] ${
                                                            isSelected
                                                                ? "text-indigo-100 opacity-80"
                                                                : "text-zinc-400 dark:text-zinc-500"
                                                        }`}
                                                    >
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                            {item.category === "Device Vault" ? (
                                                <ExternalLink
                                                    className={`h-3.5 w-3.5 ${
                                                        isSelected ? "text-white" : "text-zinc-400"
                                                    }`}
                                                />
                                            ) : (
                                                <ArrowRight
                                                    className={`h-3.5 w-3.5 ${
                                                        isSelected ? "text-white" : "text-zinc-400"
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Keyboard Hints */}
                <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/80 px-4 py-2 text-[10px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border border-zinc-200 bg-white px-1 dark:border-zinc-700 dark:bg-zinc-800">
                                ↑↓
                            </kbd>{" "}
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border border-zinc-200 bg-white px-1 dark:border-zinc-700 dark:bg-zinc-800">
                                ↵
                            </kbd>{" "}
                            Select
                        </span>
                    </div>
                    <span className="flex items-center gap-1 font-mono">
                        <Command className="h-3 w-3" /> GoMono Global
                    </span>
                </div>
            </div>
        </div>
    );
}
