"use client";

import { useState } from "react";
import { X, Download, RotateCw, Archive } from "lucide-react";
import { toast } from "sonner";
import { CsvColumn, CsvRow, BatchQrOptions } from "@/lib/csv-studio/types";
import { generateBatchQrZip } from "@/lib/csv-studio/qrZipExport";

interface CsvBatchQrModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: CsvColumn[];
    rows: CsvRow[];
}

export default function CsvBatchQrModal({
    isOpen,
    onClose,
    columns,
    rows,
}: CsvBatchQrModalProps) {
    const urlCols = columns.filter((c) => c.type === "url" || /url|link|qr|site/i.test(c.name));
    const defaultCol = urlCols[0]?.id || columns[0]?.id || "";

    const [targetColumnId, setTargetColumnId] = useState<string>(defaultCol);
    const [filenameColumnId, setFilenameColumnId] = useState<string>("auto");
    const [format, setFormat] = useState<"png" | "svg">("png");
    const [resolution, setResolution] = useState<1024 | 2048>(2048);
    const [dotStyle, setDotStyle] = useState<BatchQrOptions["dotStyle"]>("rounded");
    const [fgColor, setFgColor] = useState("#09090b");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [includeFrame, setIncludeFrame] = useState(true);
    const [frameText, setFrameText] = useState("SCAN ME");
    const [zipFileName, setZipFileName] = useState("GoMono_Batch_QRs");

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });

    if (!isOpen) return null;

    const handleExecuteExport = async () => {
        if (!targetColumnId) {
            toast.error("Please select a target column for QR generation.");
            return;
        }

        const validCount = rows.filter((r) => Boolean((r[targetColumnId] || "").trim())).length;
        if (validCount === 0) {
            toast.error("No content found in the selected column.");
            return;
        }

        setIsGenerating(true);
        setProgress({ current: 0, total: validCount, label: "Starting client-side generator..." });

        try {
            await generateBatchQrZip(
                rows,
                {
                    targetColumnId,
                    filenameColumnId: filenameColumnId === "auto" ? undefined : filenameColumnId,
                    format,
                    resolution,
                    fgColor,
                    bgColor,
                    dotStyle,
                    includeFrame,
                    frameText,
                    zipFileName,
                },
                (current, total, label) => {
                    setProgress({ current, total, label });
                }
            );

            toast.success("Batch QR ZIP archive generated & downloaded!");
            onClose();
        } catch (err: unknown) {
            console.error("Batch QR ZIP failed", err);
            const msg = err instanceof Error ? err.message : "Failed to generate batch QR codes";
            toast.error(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-150">
            <div
                className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
                            <Archive className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Batch QR Code & ZIP Export
                            </h3>
                            <p className="text-xs text-zinc-500">
                                100% Client-side vector & raster batch generation
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isGenerating}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    {/* Target and Filename Column Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                QR Data Column *
                            </label>
                            <select
                                value={targetColumnId}
                                onChange={(e) => setTargetColumnId(e.target.value)}
                                disabled={isGenerating}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                            >
                                {columns.map((col) => (
                                    <option key={col.id} value={col.id}>
                                        {col.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Filename Source Column
                            </label>
                            <select
                                value={filenameColumnId}
                                onChange={(e) => setFilenameColumnId(e.target.value)}
                                disabled={isGenerating}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                            >
                                <option value="auto">Auto / Slug</option>
                                {columns.map((col) => (
                                    <option key={col.id} value={col.id}>
                                        {col.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Output Format & Resolution */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Output File Format
                            </label>
                            <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
                                <button
                                    type="button"
                                    onClick={() => setFormat("png")}
                                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition ${
                                        format === "png"
                                            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                                    }`}
                                >
                                    Raster PNG
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormat("svg")}
                                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition ${
                                        format === "svg"
                                            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                                    }`}
                                >
                                    Vector SVG
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Resolution
                            </label>
                            <select
                                value={resolution}
                                disabled={format === "svg" || isGenerating}
                                onChange={(e) => setResolution(Number(e.target.value) as 1024 | 2048)}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 disabled:opacity-40"
                            >
                                <option value={1024}>1024px (Standard)</option>
                                <option value={2048}>2048px (High-Res Print)</option>
                            </select>
                        </div>
                    </div>

                    {/* Dot Pattern & Styling */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Dot Pattern Style
                            </label>
                            <select
                                value={dotStyle}
                                onChange={(e) => setDotStyle(e.target.value as BatchQrOptions["dotStyle"])}
                                disabled={isGenerating}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                            >
                                <option value="rounded">Modern Squircle</option>
                                <option value="squares">Classic Squares</option>
                                <option value="dots">Circular Dots</option>
                                <option value="classy">Organic Classy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                ZIP File Name
                            </label>
                            <input
                                type="text"
                                value={zipFileName}
                                onChange={(e) => setZipFileName(e.target.value)}
                                disabled={isGenerating}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* QR Colors */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Foreground Color
                            </label>
                            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                                <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                                />
                                <span className="font-mono text-xs">{fgColor}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Background Color
                            </label>
                            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                                />
                                <span className="font-mono text-xs">{bgColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Marketing Frame */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeFrame}
                                onChange={(e) => setIncludeFrame(e.target.checked)}
                                disabled={isGenerating}
                                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                Include Call To Action Frame
                            </span>
                        </label>

                        {includeFrame && (
                            <input
                                type="text"
                                value={frameText}
                                onChange={(e) => setFrameText(e.target.value)}
                                disabled={isGenerating}
                                placeholder="SCAN ME"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                            />
                        )}
                    </div>

                    {isGenerating && (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-50/50 p-4 dark:bg-purple-500/10 space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
                                <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                                    <RotateCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                                    <span className="truncate">{progress.label}</span>
                                </span>
                                <span className="font-mono">
                                    {Math.round((progress.current / Math.max(1, progress.total)) * 100)}%
                                </span>
                            </div>

                            <div className="h-2 w-full rounded-full bg-purple-200 dark:bg-purple-950 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-purple-600 transition-all duration-200"
                                    style={{
                                        width: `${(progress.current / Math.max(1, progress.total)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleExecuteExport}
                            disabled={isGenerating || !targetColumnId}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md"
                        >
                            {isGenerating ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    <span>Generating Archive...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 text-purple-400" />
                                    <span>Generate & Download ZIP</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
