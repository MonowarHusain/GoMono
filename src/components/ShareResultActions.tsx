"use client";

import { useState } from "react";
import { Check, Mail, Code2, FileCode, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareResultActionsProps {
    shortUrl: string;
    originalUrl?: string;
    title?: string;
}

export default function ShareResultActions({
    shortUrl,
    originalUrl,
    title,
}: ShareResultActionsProps) {
    const [copiedSnippet, setCopiedSnippet] = useState<"markdown" | "html" | null>(null);

    const linkTitle = title || "GoMono Link";
    const shareText = `Check out this link: ${shortUrl}`;

    const handleCopySnippet = async (format: "markdown" | "html") => {
        try {
            const snippet =
                format === "markdown"
                    ? `[${linkTitle}](${shortUrl})`
                    : `<a href="${shortUrl}" target="_blank" rel="noopener noreferrer">${linkTitle}</a>`;

            await navigator.clipboard.writeText(snippet);
            setCopiedSnippet(format);
            toast.success(`Copied ${format === "markdown" ? "Markdown" : "HTML"} embed snippet!`);
            setTimeout(() => setCopiedSnippet(null), 2000);
        } catch {
            toast.error("Failed to copy embed snippet");
        }
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            bgColor: "hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400",
            icon: (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.13.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z" />
                </svg>
            ),
        },
        {
            name: "X (Twitter)",
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent("Check out this link via GoMono:")}`,
            bgColor: "hover:bg-neutral-500/10 hover:border-neutral-500/30 hover:text-neutral-900 dark:hover:text-white",
            icon: (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            name: "LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
            bgColor: "hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400",
            icon: (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
            ),
        },
        {
            name: "Telegram",
            href: `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent("Check out this link:")}`,
            bgColor: "hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-400",
            icon: (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z" />
                </svg>
            ),
        },
        {
            name: "Email",
            href: `mailto:?subject=${encodeURIComponent(`GoMono Link: ${linkTitle}`)}&body=${encodeURIComponent(
                `Here is the short link:\n${shortUrl}\n\nOriginal target:\n${originalUrl || shortUrl}`
            )}`,
            bgColor: "hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400",
            icon: <Mail className="h-3.5 w-3.5" />,
        },
    ];

    return (
        <div className="mt-3.5 flex flex-col gap-2.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/40">
            {/* Header / Label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <Share2 className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Quick Share & Embed</span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">1-click triggers</span>
            </div>

            {/* Social Share Matrix */}
            <div className="flex flex-wrap items-center gap-1.5">
                {shareLinks.map((platform) => (
                    <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 shadow-2xs transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 ${platform.bgColor}`}
                        title={`Share on ${platform.name}`}
                    >
                        {platform.icon}
                        <span>{platform.name}</span>
                    </a>
                ))}
            </div>

            {/* Embed Snippets Copy Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Copy Embed:</span>

                {/* Markdown snippet */}
                <button
                    type="button"
                    onClick={() => handleCopySnippet("markdown")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-mono text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition"
                    title={`Copy Markdown: [${linkTitle}](${shortUrl})`}
                >
                    {copiedSnippet === "markdown" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                        <FileCode className="h-3 w-3 text-indigo-500" />
                    )}
                    <span>Markdown [Link](url)</span>
                </button>

                {/* HTML anchor snippet */}
                <button
                    type="button"
                    onClick={() => handleCopySnippet("html")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-mono text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition"
                    title={`Copy HTML: <a href="${shortUrl}">${linkTitle}</a>`}
                >
                    {copiedSnippet === "html" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                        <Code2 className="h-3 w-3 text-blue-500" />
                    )}
                    <span>HTML &lt;a&gt; tag</span>
                </button>
            </div>
        </div>
    );
}
