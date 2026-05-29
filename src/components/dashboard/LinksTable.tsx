"use client";

import { deleteLink } from "@/app/dashboard/actions";
import { useState } from "react";
import QRCodeModal from "./QRCodeModal";
import EditLinkModal from "./EditLinkModal";
import { toast } from "sonner";
import { Copy, QrCode, Trash2, ExternalLink, MousePointerClick, ShieldAlert, Pencil } from "lucide-react";

// Added 'domain' to the type definition
type Link = {
    alias: string;
    originalUrl: string;
    domain?: string;
    totalClicks: number;
    createdAt: string;
    isProtected?: boolean;
    maxClicks?: number | null;
    tags?: string[];
};

export default function LinksTable({ initialLinks }: { initialLinks: Link[] }) {
    const [activeQR, setActiveQR] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingLink, setEditingLink] = useState<Link | null>(null);

    // Updated to accept the specific link object being copied
    const handleCopy = async (linkToCopy: Link) => {
        const linkDomain = linkToCopy.domain || "go.mono.bro.bd";
        const cleanDomain = linkDomain.replace(/^(https?:\/\/)/, "");
        const fullLink = `https://${cleanDomain}/${linkToCopy.alias}`;

        await navigator.clipboard.writeText(fullLink);
        toast.success("Copied to clipboard!");
    };

    const handleDelete = async (alias: string) => {
        setIsDeleting(alias);
        const result = await deleteLink(alias);
        if (result?.error) toast.error(result.error);
        else toast.success(`Link /${alias} deleted successfully`);
        setIsDeleting(null);
    };

    if (initialLinks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl bg-white shadow-sm dark:bg-neutral-900/50">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800/50 flex items-center justify-center mb-4">
                    <ExternalLink className="h-6 w-6 text-slate-600 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-neutral-400 font-medium">No links created yet</p>
                <p className="text-sm text-slate-600 mt-1">Use the form above to shorten your first URL.</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-slate-200 dark:border-neutral-800 bg-white shadow-sm dark:bg-neutral-900/50 text-slate-500 dark:text-neutral-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Alias & Details</th>
                            <th className="px-6 py-4 font-medium">Destination</th>
                            <th className="px-6 py-4 font-medium">Analytics</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                        {initialLinks.map((link) => (
                            <tr key={link.alias} className="group transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/30">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">/{link.alias}</span>
                                        {link.isProtected && (
                                            <span title="Password Protected" className="flex items-center">
                                                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                            </span>
                                        )}
                                        {link.maxClicks && link.totalClicks >= link.maxClicks && (
                                            <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                                Burned
                                            </span>
                                        )}
                                    </div>

                                    {/* Tag Pills */}
                                    {link.tags && link.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {link.tags.map(tag => (
                                                <span key={tag} className="rounded-md border border-slate-300/50 dark:border-neutral-700/50 bg-slate-100 dark:bg-neutral-800/50 px-2 py-0.5 text-[10px] text-slate-500 dark:text-neutral-400">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="text-xs text-slate-600 dark:text-slate-500 mt-2">
                                        {new Date(link.createdAt).toLocaleDateString()}
                                        {link.maxClicks && ` • Limit: ${link.maxClicks} clicks`}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-[200px] md:max-w-[300px] truncate text-slate-700 dark:text-neutral-300">
                                        {link.originalUrl}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-neutral-800/50 px-3 py-1 w-fit border border-slate-300/50 dark:border-neutral-700/50">
                                        <MousePointerClick className="h-3.5 w-3.5 text-blue-400" />
                                        <span className="font-mono text-neutral-800 dark:text-neutral-200">{link.totalClicks}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => setEditingLink(link)}
                                            className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                            title="Edit Link"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            // Updated to pass the full link object
                                            onClick={() => handleCopy(link)}
                                            className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all"
                                            title="Copy URL"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            // Updated QR code to use the correct domain dynamically
                                            onClick={() => {
                                                const d = link.domain || "go.mono.bro.bd";
                                                const cleanD = d.replace(/^(https?:\/\/)/, "");
                                                setActiveQR(`https://${cleanD}/${link.alias}`);
                                            }}
                                            className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-green-400 hover:bg-green-400/10 transition-all"
                                            title="Generate QR Code"
                                        >
                                            <QrCode className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.alias)}
                                            disabled={isDeleting === link.alias}
                                            className="p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                                            title="Delete Link"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {activeQR && (
                <QRCodeModal url={activeQR} onClose={() => setActiveQR(null)} />
            )}

            {editingLink && (
                <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} />
            )}
        </div>
    );
}