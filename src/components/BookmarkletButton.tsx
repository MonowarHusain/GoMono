"use client";

import { useState } from "react";
import { Bookmark, Sparkles, Check, Copy, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function BookmarkletButton() {
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Dynamic origin or default fallback
    const bookmarkletCode = `javascript:(function(){var u=location.href;window.open('https://to.mono.bro.bd/'+encodeURIComponent(u),'_blank');})();`;

    const handleCopyCode = async (e: React.MouseEvent) => {
        // Prevent accidental navigation if regular clicked
        e.preventDefault();
        try {
            await navigator.clipboard.writeText(bookmarkletCode);
            setCopied(true);
            toast.success("Bookmarklet code copied! Drag to your Bookmarks Bar or paste into a new bookmark URL.");
            setTimeout(() => setCopied(false), 3000);
        } catch {
            toast.error("Failed to copy bookmarklet code");
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
                {/* Draggable Anchor Button */}
                <a
                    href={bookmarkletCode}
                    onClick={handleCopyCode}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", bookmarkletCode);
                        e.dataTransfer.setData("text/uri-list", bookmarkletCode);
                    }}
                    className="group inline-flex items-center gap-2 rounded-xl border border-zinc-300/80 bg-zinc-100/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs hover:border-indigo-400 hover:bg-white hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white transition-all cursor-grab active:cursor-grabbing select-none"
                    title="Drag this button to your browser's Bookmarks Bar to shorten any active tab in 1 click"
                >
                    <Bookmark className="h-3.5 w-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>⚡ Shorten with GoMono</span>
                    {copied ? (
                        <Check className="h-3 w-3 text-emerald-500 ml-0.5" />
                    ) : (
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                            (drag me)
                        </span>
                    )}
                </a>

                {/* Info / Toggle Helper Button */}
                <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                    title="How to use the 1-click bookmarklet"
                >
                    <HelpCircle className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Instruction caption */}
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-sm">
                Drag button to your Bookmarks Bar. Shorten any active page in 1 click.
            </p>

            {/* Collapsible Explainer Card */}
            {showHelp && (
                <div className="mt-2 w-full max-w-md rounded-2xl border border-zinc-200 bg-white/95 p-3.5 text-left text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-200 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        <span>How the 1-Click Bookmarklet Works</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        <li>Show your browser bookmarks bar (<kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Ctrl/Cmd + Shift + B</kbd>).</li>
                        <li>Drag the <strong>&ldquo;⚡ Shorten with GoMono&rdquo;</strong> button into your bookmarks bar.</li>
                        <li>Whenever you are on an article, video, or repository, click it to instantly generate a GoMono short link.</li>
                    </ol>
                </div>
            )}
        </div>
    );
}
