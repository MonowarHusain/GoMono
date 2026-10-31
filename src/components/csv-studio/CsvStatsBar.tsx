"use client";

import { ShieldCheck, Table } from "lucide-react";

interface CsvStatsBarProps {
    totalRows: number;
    totalColumns: number;
    fileName: string;
    delimiter: string;
    selectedCellText?: string | null;
}

export default function CsvStatsBar({
    totalRows,
    totalColumns,
    fileName,
    delimiter,
    selectedCellText,
}: CsvStatsBarProps) {
    const delimiterLabel =
        delimiter === ","
            ? "Comma (,)"
            : delimiter === "\t"
            ? "Tab (TSV)"
            : delimiter === ";"
            ? "Semicolon (;)"
            : delimiter === "|"
            ? "Pipe (|)"
            : `Custom ('${delimiter}')`;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-2 text-[11px] text-zinc-500 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-400">
            {/* Left Status metrics */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                    <Table className="h-3.5 w-3.5 text-indigo-500" />
                    <span>
                        <strong className="font-mono text-zinc-900 dark:text-white">{totalRows.toLocaleString()}</strong> rows
                        {" × "}
                        <strong className="font-mono text-zinc-900 dark:text-white">{totalColumns}</strong> cols
                    </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                    <span className="text-zinc-400">Format:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{delimiterLabel}</span>
                </div>

                <div className="hidden md:flex items-center gap-1.5 border-l border-zinc-200 pl-4 dark:border-zinc-800 truncate max-w-xs">
                    <span className="text-zinc-400">File:</span>
                    <span className="truncate font-mono text-zinc-700 dark:text-zinc-300" title={fileName}>
                        {fileName}
                    </span>
                </div>

                {selectedCellText && (
                    <div className="hidden lg:flex items-center gap-1.5 border-l border-zinc-200 pl-4 dark:border-zinc-800 truncate max-w-xs">
                        <span className="text-zinc-400">Cell Value:</span>
                        <span className="truncate font-mono text-indigo-600 dark:text-indigo-400">
                            {selectedCellText}
                        </span>
                    </div>
                )}
            </div>

            {/* Right Zero-Storage & Shortcuts */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-400">
                    <span>
                        <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">Enter</kbd> Edit
                    </span>
                    <span>
                        <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">Tab</kbd> Next
                    </span>
                    <span>
                        <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">Ctrl+Z</kbd> Undo
                    </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Zero Storage • 100% In-Browser</span>
                </div>
            </div>
        </div>
    );
}
