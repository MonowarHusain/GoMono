"use client";

import { useRef, useState } from "react";
import {
    Upload,
    ClipboardPaste,
    RotateCcw,
    RotateCw,
    Plus,
    Sparkles,
    Link2,
    QrCode,
    Navigation,
    Download,
    Search,
    ChevronDown,
    FileSpreadsheet,
    Copy,
    Check,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_TEMPLATES } from "@/lib/csv-studio/parser";

interface CsvToolbarProps {
    onFileUpload: (file: File) => void;
    onPasteClipboard: (text: string) => void;
    onLoadSample: (key: string) => void;
    onAddRow: () => void;
    onAddColumn: () => void;
    onDeleteSelectedRows: () => void;
    selectedRowCount: number;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onOpenCleaner: () => void;
    onOpenShortener: () => void;
    onOpenBatchQr: () => void;
    onOpenUtm: () => void;
    onExportCsv: (delimiter: string) => void;
    onExportJson: () => void;
    onCopyTsv: () => void;
}

export default function CsvToolbar({
    onFileUpload,
    onPasteClipboard,
    onLoadSample,
    onAddRow,
    onAddColumn,
    onDeleteSelectedRows,
    selectedRowCount,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    searchQuery,
    onSearchChange,
    onOpenCleaner,
    onOpenShortener,
    onOpenBatchQr,
    onOpenUtm,
    onExportCsv,
    onExportJson,
    onCopyTsv,
}: CsvToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSampleOpen, setIsSampleOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClipboardPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text.trim()) {
                toast.error("Clipboard is empty.");
                return;
            }
            onPasteClipboard(text);
            toast.success("Pasted tabular data from clipboard!");
        } catch (err) {
            console.error("Clipboard read failed", err);
            toast.error("Could not read clipboard. Please check browser permissions.");
        }
    };

    const handleCopyClipboardAction = () => {
        onCopyTsv();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-2.5 border-b border-zinc-200 bg-white/90 p-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 text-xs text-zinc-700 dark:text-zinc-300">
            {/* Top Row: File, History, Clean, GoMono Integrations, Export */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Left group: Import, Templates, History, Row/Col */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv,.tsv,.txt"
                        className="hidden"
                    />

                    {/* Import Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-semibold text-zinc-900 shadow-xs hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 transition"
                        title="Upload CSV, TSV, or TXT file"
                    >
                        <Upload className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Import File</span>
                    </button>

                    {/* Paste Button */}
                    <button
                        type="button"
                        onClick={handleClipboardPaste}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-semibold text-zinc-900 shadow-xs hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 transition"
                        title="Paste tabular data directly from clipboard (Ctrl+V / Cmd+V)"
                    >
                        <ClipboardPaste className="h-3.5 w-3.5 text-blue-500" />
                        <span className="hidden sm:inline">Paste</span>
                    </button>

                    {/* Sample Templates Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsSampleOpen(!isSampleOpen)}
                            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="hidden md:inline">Templates</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>

                        {isSampleOpen && (
                            <div className="absolute left-0 top-full mt-1.5 z-30 w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in">
                                <span className="block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    Load Sample Datasets
                                </span>
                                {Object.entries(SAMPLE_TEMPLATES).map(([key, item]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            onLoadSample(key);
                                            setIsSampleOpen(false);
                                        }}
                                        className="w-full text-left rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* Undo / Redo */}
                    <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                        <button
                            type="button"
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="rounded-lg p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 transition"
                            title="Undo (Ctrl+Z)"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="rounded-lg p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 transition"
                            title="Redo (Ctrl+Y)"
                        >
                            <RotateCw className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* Add Row & Column Buttons */}
                    <button
                        type="button"
                        onClick={onAddRow}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                        title="Add blank row"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Row</span>
                    </button>

                    <button
                        type="button"
                        onClick={onAddColumn}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                        title="Add column"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Col</span>
                    </button>

                    {selectedRowCount > 0 && (
                        <button
                            type="button"
                            onClick={onDeleteSelectedRows}
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/70 px-2.5 py-1.5 font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 transition"
                            title="Delete selected rows"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete ({selectedRowCount})</span>
                        </button>
                    )}
                </div>

                {/* Right group: Native GoMono integrations, Clean, Export */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Clean Data */}
                    <button
                        type="button"
                        onClick={onOpenCleaner}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-1.5 font-semibold text-amber-800 shadow-xs hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300 transition"
                        title="Deduplication, whitespace trim, case conversion, missing values"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Clean Data</span>
                    </button>

                    {/* Shorten URLs Column */}
                    <button
                        type="button"
                        onClick={onOpenShortener}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 font-semibold text-blue-700 shadow-xs hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300 transition"
                        title="Shorten URLs in selected column and append results"
                    >
                        <Link2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="hidden sm:inline">Shorten Column</span>
                    </button>

                    {/* Batch QR ZIP */}
                    <button
                        type="button"
                        onClick={onOpenBatchQr}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/70 px-3 py-1.5 font-semibold text-purple-700 shadow-xs hover:bg-purple-100 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-300 transition"
                        title="Generate vector SVG or high-res PNG QRs for all rows & bundle in ZIP"
                    >
                        <QrCode className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="hidden sm:inline">Batch QRs (ZIP)</span>
                    </button>

                    {/* Inject UTMs */}
                    <button
                        type="button"
                        onClick={onOpenUtm}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 font-semibold text-emerald-700 shadow-xs hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300 transition"
                        title="Inject campaign UTM parameters into URL column"
                    >
                        <Navigation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden md:inline">UTMs</span>
                    </button>

                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Export</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>

                        {isExportOpen && (
                            <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onExportCsv(",");
                                        setIsExportOpen(false);
                                    }}
                                    className="w-full text-left rounded-xl px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                >
                                    Download CSV (Comma ,)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onExportCsv("\t");
                                        setIsExportOpen(false);
                                    }}
                                    className="w-full text-left rounded-xl px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                >
                                    Download TSV (Tab \t)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onExportJson();
                                        setIsExportOpen(false);
                                    }}
                                    className="w-full text-left rounded-xl px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                >
                                    Download JSON Array
                                </button>
                                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleCopyClipboardAction();
                                        setIsExportOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                >
                                    <span>Copy for Excel / Sheets</span>
                                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Search & Real-Time Filter */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Filter records across any cell..."
                    className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 pl-8 pr-3 py-1.5 text-xs text-zinc-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-white dark:focus:border-zinc-700"
                />
            </div>
        </div>
    );
}

