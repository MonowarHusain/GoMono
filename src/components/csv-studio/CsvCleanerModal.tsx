"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { CsvColumn, CleaningOptions, FindReplaceOptions } from "@/lib/csv-studio/types";

interface CsvCleanerModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: CsvColumn[];
    onApplyCleaning: (options: CleaningOptions) => void;
    onApplyFindReplace: (options: FindReplaceOptions) => void;
}

export default function CsvCleanerModal({
    isOpen,
    onClose,
    columns,
    onApplyCleaning,
    onApplyFindReplace,
}: CsvCleanerModalProps) {
    const [activeTab, setActiveTab] = useState<"clean" | "findReplace">("clean");

    // Cleaning State
    const [trimWhitespace, setTrimWhitespace] = useState(true);
    const [removeDuplicates, setRemoveDuplicates] = useState(false);
    const [duplicateKeyColumn, setDuplicateKeyColumn] = useState<string>("all");
    const [caseConversion, setCaseConversion] = useState<CleaningOptions["caseConversion"]>("none");
    const [targetCaseColumn, setTargetCaseColumn] = useState<string>(columns[0]?.id || "");
    const [emptyValuesAction, setEmptyValuesAction] = useState<CleaningOptions["emptyValuesAction"]>("none");
    const [emptyValuesDefault, setEmptyValuesDefault] = useState("N/A");

    // Find and Replace State
    const [findText, setFindText] = useState("");
    const [replaceText, setReplaceText] = useState("");
    const [targetColumnId, setTargetColumnId] = useState<string>("all");
    const [matchCase, setMatchCase] = useState(false);
    const [useRegex, setUseRegex] = useState(false);

    if (!isOpen) return null;

    const handleExecuteCleaning = () => {
        onApplyCleaning({
            trimWhitespace,
            removeDuplicates,
            duplicateKeyColumn: duplicateKeyColumn === "all" ? undefined : duplicateKeyColumn,
            caseConversion,
            targetColumns: caseConversion !== "none" && targetCaseColumn ? [targetCaseColumn] : undefined,
            emptyValuesAction,
            emptyValuesDefault,
        });
        onClose();
    };

    const handleExecuteFindReplace = () => {
        if (!findText) return;
        onApplyFindReplace({
            findText,
            replaceText,
            targetColumnId: targetColumnId === "all" ? undefined : targetColumnId,
            matchCase,
            useRegex,
        });
        onClose();
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Data Sanitization & Cleaning Engine
                            </h3>
                            <p className="text-xs text-zinc-500">
                                100% In-memory tabular transformations
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Sub-tabs */}
                <div className="my-4 flex items-center rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
                    <button
                        type="button"
                        onClick={() => setActiveTab("clean")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                            activeTab === "clean"
                                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                        }`}
                    >
                        Sanitization Rules
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("findReplace")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                            activeTab === "findReplace"
                                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                        }`}
                    >
                        Find & Replace
                    </button>
                </div>

                {/* TAB 1: SANITIZATION RULES */}
                {activeTab === "clean" && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {/* Trim Whitespace */}
                        <label className="flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 cursor-pointer hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 transition">
                            <input
                                type="checkbox"
                                checked={trimWhitespace}
                                onChange={(e) => setTrimWhitespace(e.target.checked)}
                                className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                    Trim Whitespace
                                </span>
                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                    Strip leading and trailing spaces across all cells in the sheet.
                                </p>
                            </div>
                        </label>

                        {/* Deduplication */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={removeDuplicates}
                                    onChange={(e) => setRemoveDuplicates(e.target.checked)}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                    Remove Duplicate Rows
                                </span>
                            </label>

                            {removeDuplicates && (
                                <div className="mt-3 pl-6 space-y-1">
                                    <span className="text-[11px] font-medium text-zinc-500">Match duplicates based on:</span>
                                    <select
                                        value={duplicateKeyColumn}
                                        onChange={(e) => setDuplicateKeyColumn(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                    >
                                        <option value="all">Entire Row (All columns must match)</option>
                                        {columns.map((col) => (
                                            <option key={col.id} value={col.id}>
                                                Specific column: {col.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Case Conversion */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                Case Conversion
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={caseConversion}
                                    onChange={(e) => setCaseConversion(e.target.value as CleaningOptions["caseConversion"])}
                                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                >
                                    <option value="none">No case change</option>
                                    <option value="uppercase">UPPERCASE</option>
                                    <option value="lowercase">lowercase</option>
                                    <option value="titlecase">Title Case</option>
                                    <option value="snakecase">snake_case</option>
                                </select>

                                <select
                                    value={targetCaseColumn}
                                    disabled={caseConversion === "none"}
                                    onChange={(e) => setTargetCaseColumn(e.target.value)}
                                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 disabled:opacity-40"
                                >
                                    {columns.map((col) => (
                                        <option key={col.id} value={col.id}>
                                            Column: {col.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Empty Values Handler */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                Missing / Empty Cells
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <select
                                    value={emptyValuesAction}
                                    onChange={(e) => setEmptyValuesAction(e.target.value as CleaningOptions["emptyValuesAction"])}
                                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                >
                                    <option value="none">Leave empty cells as-is</option>
                                    <option value="fill_default">Fill with placeholder text</option>
                                    <option value="remove_rows">Delete rows with empty cells</option>
                                </select>

                                {emptyValuesAction === "fill_default" && (
                                    <input
                                        type="text"
                                        value={emptyValuesDefault}
                                        onChange={(e) => setEmptyValuesDefault(e.target.value)}
                                        placeholder="Placeholder (e.g. N/A)"
                                        className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleExecuteCleaning}
                                className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md"
                            >
                                Apply Cleaning Rules
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: FIND AND REPLACE */}
                {activeTab === "findReplace" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Target Column</label>
                            <select
                                value={targetColumnId}
                                onChange={(e) => setTargetColumnId(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                            >
                                <option value="all">Entire Sheet (All Columns)</option>
                                {columns.map((col) => (
                                    <option key={col.id} value={col.id}>
                                        Column: {col.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Find Text or Pattern *</label>
                            <input
                                type="text"
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                placeholder="Text to search for..."
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Replace With</label>
                            <input
                                type="text"
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                placeholder="Replacement text..."
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={matchCase}
                                    onChange={(e) => setMatchCase(e.target.checked)}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Match Case</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useRegex}
                                    onChange={(e) => setUseRegex(e.target.checked)}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Regex Expression</span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleExecuteFindReplace}
                                disabled={!findText.trim()}
                                className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md"
                            >
                                Replace All Occurrences
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
