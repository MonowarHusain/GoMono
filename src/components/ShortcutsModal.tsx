"use client";

import { useEffect, useState } from "react";
import { X, Keyboard, Sparkles, Navigation, Zap } from "lucide-react";

interface ShortcutGroup {
    category: string;
    icon: React.ReactNode;
    shortcuts: Array<{
        keys: string[];
        description: string;
    }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
    {
        category: "Global & Navigation",
        icon: <Navigation className="h-4 w-4 text-indigo-500" />,
        shortcuts: [
            { keys: ["⌘", "K"], description: "Open Command Palette / Fast Search" },
            { keys: ["?"], description: "Toggle this Keyboard Shortcuts cheat-sheet" },
            { keys: ["Esc"], description: "Close any active modal, drawer, or dialog" },
        ],
    },
    {
        category: "Shortener & Power Tools",
        icon: <Zap className="h-4 w-4 text-amber-500" />,
        shortcuts: [
            { keys: ["Enter"], description: "Submit & Shorten URL immediately" },
            { keys: ["⌘", "V"], description: "Paste QR image directly from clipboard to decode" },
            { keys: ["/alias+"], description: "Append '+' to any short link to inspect safety & clicks" },
        ],
    },
    {
        category: "Standalone Client Studios",
        icon: <Sparkles className="h-4 w-4 text-purple-500" />,
        shortcuts: [
            { keys: ["/qr-studio"], description: "Full-page custom branded vector QR Designer" },
            { keys: ["/csv-studio"], description: "Zero-storage bulk data grid & CSV transformer" },
            { keys: ["/bio-builder"], description: "Free Link-in-Bio mobile landing page creator" },
        ],
    },
];

export default function ShortcutsModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing in form controls
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable)
            ) {
                return;
            }

            if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (e.key === "Escape" && isOpen) {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
            <div
                className="relative w-full max-w-lg rounded-3xl border border-zinc-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-zinc-800/90 dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <Keyboard className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                                Keyboard Shortcuts
                            </h3>
                            <p className="text-[11px] text-zinc-500 font-mono">
                                Power user cheat-sheet • Press <kbd className="rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 text-[10px]">?</kbd> anytime
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Shortcut Groups */}
                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {SHORTCUT_GROUPS.map((group) => (
                        <div key={group.category} className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                {group.icon}
                                <span>{group.category}</span>
                            </div>

                            <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/30 divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                                {group.shortcuts.map((sc) => (
                                    <div
                                        key={sc.description}
                                        className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                                    >
                                        <span className="text-zinc-600 dark:text-zinc-400">
                                            {sc.description}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {sc.keys.map((k) => (
                                                <kbd
                                                    key={k}
                                                    className="inline-flex min-w-[20px] items-center justify-center rounded-lg border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-700 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                                >
                                                    {k}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-5 border-t border-zinc-200/80 pt-3 text-center dark:border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 font-mono">
                        Tip: Open Command Palette with <kbd className="rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 text-[10px]">⌘</kbd> + <kbd className="rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 text-[10px]">K</kbd> to jump anywhere.
                    </span>
                </div>
            </div>
        </div>
    );
}
