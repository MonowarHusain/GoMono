"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
    CsvColumn,
    CsvRow,
    CellCoord,
    CleaningOptions,
    FindReplaceOptions,
    UtmOptions,
} from "@/lib/csv-studio/types";
import {
    parseTabularData,
    createEmptyTable,
    SAMPLE_TEMPLATES,
    exportToCsvString,
    exportToJsonString,
    exportToClipboardTsv,
} from "@/lib/csv-studio/parser";
import {
    applyDataCleaning,
    findAndReplace,
    injectUtmParameters,
} from "@/lib/csv-studio/transformations";
import { HistoryManager } from "@/lib/csv-studio/history";
import CsvToolbar from "./CsvToolbar";
import CsvGrid from "./CsvGrid";
import CsvStatsBar from "./CsvStatsBar";
import CsvCleanerModal from "./CsvCleanerModal";
import CsvShortenModal from "./CsvShortenModal";
import CsvBatchQrModal from "./CsvBatchQrModal";
import CsvUtmModal from "./CsvUtmModal";

export default function CsvStudio() {
    // Master Table State initialized from default empty template
    const initialTable = useMemo(() => createEmptyTable("GoMono_Campaign_Data.csv"), []);
    const [columns, setColumns] = useState<CsvColumn[]>(initialTable.columns);
    const [rows, setRows] = useState<CsvRow[]>(initialTable.rows);
    const [fileName, setFileName] = useState<string>(initialTable.fileName);
    const [delimiter, setDelimiter] = useState<string>(initialTable.delimiter);

    // History Manager (Undo / Redo)
    const historyRef = useRef<HistoryManager>(new HistoryManager(initialTable.columns, initialTable.rows));
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Update history tracking states
    const updateHistoryFlags = useCallback(() => {
        setCanUndo(historyRef.current.canUndo);
        setCanRedo(historyRef.current.canRedo);
    }, []);

    // Push new snapshot to history
    const recordHistory = useCallback(
        (newCols: CsvColumn[], newRows: CsvRow[], actionDesc: string) => {
            historyRef.current.pushState(newCols, newRows, actionDesc);
            updateHistoryFlags();
        },
        [updateHistoryFlags]
    );

    // Selection States
    const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
    const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);

    // Filter / Search State
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isCleanerOpen, setIsCleanerOpen] = useState(false);
    const [isShortenerOpen, setIsShortenerOpen] = useState(false);
    const [isBatchQrOpen, setIsBatchQrOpen] = useState(false);
    const [isUtmOpen, setIsUtmOpen] = useState(false);

    // Filter rows based on search query
    const displayRows = useMemo(() => {
        if (!searchQuery.trim()) return rows;
        const q = searchQuery.toLowerCase().trim();
        return rows.filter((r) =>
            Object.values(r).some((val) => String(val).toLowerCase().includes(q))
        );
    }, [rows, searchQuery]);

    // Handle Cell Edit
    const handleCellChange = useCallback(
        (rowIndex: number, columnId: string, value: string) => {
            setRows((prev) => {
                const updated = [...prev];
                updated[rowIndex] = {
                    ...updated[rowIndex],
                    [columnId]: value,
                };
                recordHistory(columns, updated, `Edit cell (${rowIndex + 1}, ${columnId})`);
                return updated;
            });
        },
        [columns, recordHistory]
    );

    // Handle Column Header Rename
    const handleRenameColumn = useCallback(
        (columnId: string, newName: string) => {
            setColumns((prev) => {
                const updated = prev.map((col) =>
                    col.id === columnId ? { ...col, name: newName } : col
                );
                recordHistory(updated, rows, `Rename column to ${newName}`);
                return updated;
            });
            toast.success(`Renamed column to "${newName}"`);
        },
        [rows, recordHistory]
    );

    // Handle Delete Column
    const handleDeleteColumn = useCallback(
        (columnId: string) => {
            if (columns.length <= 1) {
                toast.error("Cannot delete the only column.");
                return;
            }

            const updatedCols = columns.filter((c) => c.id !== columnId);
            const updatedRows = rows.map((r) => {
                const newRow = { ...r };
                delete newRow[columnId];
                return newRow;
            });

            setColumns(updatedCols);
            setRows(updatedRows);
            recordHistory(updatedCols, updatedRows, `Delete column ${columnId}`);
            toast.success("Column deleted.");
        },
        [columns, rows, recordHistory]
    );

    // Handle Insert Column
    const handleInsertColumn = useCallback(
        (targetColumnId: string, position: "left" | "right") => {
            const targetIdx = columns.findIndex((c) => c.id === targetColumnId);
            if (targetIdx === -1) return;

            const newColId = `col_${Date.now()}`;
            const newCol: CsvColumn = {
                id: newColId,
                name: `New_Column_${columns.length + 1}`,
                type: "text",
                width: 180,
            };

            const updatedCols = [...columns];
            const insertIdx = position === "left" ? targetIdx : targetIdx + 1;
            updatedCols.splice(insertIdx, 0, newCol);

            const updatedRows = rows.map((r) => ({
                ...r,
                [newColId]: "",
            }));

            setColumns(updatedCols);
            setRows(updatedRows);
            recordHistory(updatedCols, updatedRows, `Insert column ${newCol.name}`);
            toast.success(`Inserted column "${newCol.name}"`);
        },
        [columns, rows, recordHistory]
    );

    // Handle Add Blank Row
    const handleAddRow = useCallback(() => {
        const newRow: CsvRow = {};
        columns.forEach((c) => {
            newRow[c.id] = "";
        });

        const updatedRows = [...rows, newRow];
        setRows(updatedRows);
        recordHistory(columns, updatedRows, "Add new row");
        toast.success("Added new row at bottom.");
    }, [columns, rows, recordHistory]);

    // Handle Add New Column (at far right)
    const handleAddColumn = useCallback(() => {
        const newColId = `col_${Date.now()}`;
        const newColName = `Column_${columns.length + 1}`;
        const newCol: CsvColumn = {
            id: newColId,
            name: newColName,
            type: "text",
            width: 180,
        };

        const updatedCols = [...columns, newCol];
        const updatedRows = rows.map((r) => ({
            ...r,
            [newColId]: "",
        }));

        setColumns(updatedCols);
        setRows(updatedRows);
        recordHistory(updatedCols, updatedRows, `Add column ${newColName}`);
        toast.success(`Added new column "${newColName}".`);
    }, [columns, rows, recordHistory]);

    // Handle Delete Selected Rows
    const handleDeleteSelectedRows = useCallback(() => {
        if (selectedRowIndices.size === 0) return;

        const updatedRows = rows.filter((_, idx) => !selectedRowIndices.has(idx));
        const count = selectedRowIndices.size;
        setSelectedRowIndices(new Set());
        setRows(updatedRows);
        recordHistory(columns, updatedRows, `Delete ${count} rows`);
        toast.success(`Deleted ${count} selected row(s).`);
    }, [columns, rows, selectedRowIndices, recordHistory]);

    // Undo Action
    const handleUndo = useCallback(() => {
        const snapshot = historyRef.current.undo();
        if (snapshot) {
            setColumns(snapshot.columns);
            setRows(snapshot.rows);
            updateHistoryFlags();
            toast.info(`Undid: ${snapshot.description}`);
        }
    }, [updateHistoryFlags]);

    // Redo Action
    const handleRedo = useCallback(() => {
        const snapshot = historyRef.current.redo();
        if (snapshot) {
            setColumns(snapshot.columns);
            setRows(snapshot.rows);
            updateHistoryFlags();
            toast.info(`Redid: ${snapshot.description}`);
        }
    }, [updateHistoryFlags]);

    // Toggle row selection
    const handleToggleRowSelection = useCallback((rowIndex: number) => {
        setSelectedRowIndices((prev) => {
            const next = new Set(prev);
            if (next.has(rowIndex)) next.delete(rowIndex);
            else next.add(rowIndex);
            return next;
        });
    }, []);

    // Toggle select all
    const handleToggleSelectAll = useCallback(() => {
        if (selectedRowIndices.size === rows.length) {
            setSelectedRowIndices(new Set());
        } else {
            setSelectedRowIndices(new Set(rows.map((_, i) => i)));
        }
    }, [rows, selectedRowIndices.size]);

    // Import from File (CSV, TSV, TXT)
    const handleFileUpload = useCallback(
        (file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                if (!text) return;

                const parsed = parseTabularData(text, file.name);
                setColumns(parsed.columns);
                setRows(parsed.rows);
                setFileName(parsed.fileName);
                setDelimiter(parsed.delimiter);
                setSelectedRowIndices(new Set());
                setSelectedCell(null);

                historyRef.current = new HistoryManager(parsed.columns, parsed.rows);
                updateHistoryFlags();

                toast.success(
                    `Imported ${file.name} (${parsed.rows.length} rows, ${parsed.columns.length} columns)!`
                );
            };
            reader.readAsText(file);
        },
        [updateHistoryFlags]
    );

    // Import from Clipboard
    const handlePasteClipboard = useCallback(
        (text: string) => {
            const parsed = parseTabularData(text, "pasted_data.tsv");
            setColumns(parsed.columns);
            setRows(parsed.rows);
            setFileName(parsed.fileName);
            setDelimiter(parsed.delimiter);
            setSelectedRowIndices(new Set());
            setSelectedCell(null);

            historyRef.current = new HistoryManager(parsed.columns, parsed.rows);
            updateHistoryFlags();

            toast.success(
                `Imported ${parsed.rows.length} rows from clipboard!`
            );
        },
        [updateHistoryFlags]
    );

    // Load Sample Template
    const handleLoadSample = useCallback(
        (key: string) => {
            const sample = SAMPLE_TEMPLATES[key];
            if (!sample) return;

            const parsed = parseTabularData(sample.raw, `${key}_sample.csv`);
            setColumns(parsed.columns);
            setRows(parsed.rows);
            setFileName(parsed.fileName);
            setDelimiter(parsed.delimiter);
            setSelectedRowIndices(new Set());
            setSelectedCell(null);

            historyRef.current = new HistoryManager(parsed.columns, parsed.rows);
            updateHistoryFlags();

            toast.success(`Loaded sample: ${sample.name}`);
        },
        [updateHistoryFlags]
    );

    // Apply Cleaning Rules
    const handleApplyCleaning = useCallback(
        (options: CleaningOptions) => {
            const { rows: cleanedRows, summary } = applyDataCleaning(rows, columns, options);
            setRows(cleanedRows);
            recordHistory(columns, cleanedRows, "Apply data cleaning");
            if (summary.length > 0) {
                toast.success(summary.join(" • "));
            } else {
                toast.info("No matching cells required modification.");
            }
        },
        [rows, columns, recordHistory]
    );

    // Apply Find & Replace
    const handleApplyFindReplace = useCallback(
        (options: FindReplaceOptions) => {
            const { rows: updatedRows, replaceCount } = findAndReplace(rows, options);
            setRows(updatedRows);
            recordHistory(columns, updatedRows, `Find and replace (${replaceCount} replaced)`);
            toast.success(`Replaced ${replaceCount} occurrence(s)!`);
        },
        [rows, columns, recordHistory]
    );

    // Apply UTM Parameter Injection
    const handleApplyUtm = useCallback(
        (options: UtmOptions) => {
            const { rows: updatedRows, successCount } = injectUtmParameters(rows, options);
            setRows(updatedRows);
            recordHistory(columns, updatedRows, `Inject UTMs (${successCount} URLs updated)`);
            toast.success(`Injected UTM tracking parameters into ${successCount} URLs!`);
        },
        [rows, columns, recordHistory]
    );

    // Append Shortened URLs Column
    const handleApplyShortenedColumn = useCallback(
        (newColumnName: string, updatedRows: CsvRow[]) => {
            const newColId = `col_${Date.now()}`;
            const newCol: CsvColumn = {
                id: newColId,
                name: newColumnName,
                type: "url",
                width: 220,
            };

            // Remap row property keys to the new column ID
            const mappedRows = updatedRows.map((r) => {
                const shortUrlVal = r[newColumnName] || "";
                const rowCopy = { ...r };
                delete rowCopy[newColumnName];
                rowCopy[newColId] = shortUrlVal;
                return rowCopy;
            });

            const updatedCols = [...columns, newCol];
            setColumns(updatedCols);
            setRows(mappedRows);
            recordHistory(updatedCols, mappedRows, `Shorten URLs & append ${newColumnName}`);
        },
        [columns, recordHistory]
    );

    // Export Handlers
    const handleExportCsv = useCallback(
        (del = ",") => {
            const csvStr = exportToCsvString(columns, rows, del);
            const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            const ext = del === "\t" ? "tsv" : "csv";
            anchor.download = `${fileName.replace(/\.[^.]+$/, "")}.${ext}`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
            toast.success(`Exported as .${ext.toUpperCase()}`);
        },
        [columns, rows, fileName]
    );

    const handleExportJson = useCallback(() => {
        const jsonStr = exportToJsonString(columns, rows);
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${fileName.replace(/\.[^.]+$/, "")}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        toast.success("Exported as JSON array");
    }, [columns, rows, fileName]);

    const handleCopyTsv = useCallback(() => {
        const tsvStr = exportToClipboardTsv(columns, rows);
        navigator.clipboard.writeText(tsvStr);
        toast.success("Copied tabular dataset to clipboard (ready to paste in Sheets / Excel)!");
    }, [columns, rows]);

    // Global drag-and-drop & paste event listeners
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };
        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
        };
        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer?.files?.[0];
            if (file && (file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.name.endsWith(".txt"))) {
                handleFileUpload(file);
            }
        };

        const handlePaste = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            // Ignore paste if currently inside an input/textarea
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

            const text = e.clipboardData?.getData("text");
            if (text && text.includes("\t") || text && text.includes(",")) {
                e.preventDefault();
                handlePasteClipboard(text);
            }
        };

        const handleKeyDownGlobal = (e: KeyboardEvent) => {
            // Undo: Ctrl+Z / Cmd+Z
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
                const target = e.target as HTMLElement;
                if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
                e.preventDefault();
                handleUndo();
            }
            // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
            if (
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
            ) {
                const target = e.target as HTMLElement;
                if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);
        window.addEventListener("paste", handlePaste);
        window.addEventListener("keydown", handleKeyDownGlobal);

        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
            window.removeEventListener("paste", handlePaste);
            window.removeEventListener("keydown", handleKeyDownGlobal);
        };
    }, [handleFileUpload, handlePasteClipboard, handleUndo, handleRedo]);

    const activeCellVal = selectedCell ? rows[selectedCell.rowIndex]?.[selectedCell.columnId] : null;

    return (
        <div className="relative flex flex-col h-[calc(100vh-140px)] min-h-[600px] w-full rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
            {/* Top Toolbar */}
            <CsvToolbar
                onFileUpload={handleFileUpload}
                onPasteClipboard={handlePasteClipboard}
                onLoadSample={handleLoadSample}
                onAddRow={handleAddRow}
                onAddColumn={handleAddColumn}
                onDeleteSelectedRows={handleDeleteSelectedRows}
                selectedRowCount={selectedRowIndices.size}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenCleaner={() => setIsCleanerOpen(true)}
                onOpenShortener={() => setIsShortenerOpen(true)}
                onOpenBatchQr={() => setIsBatchQrOpen(true)}
                onOpenUtm={() => setIsUtmOpen(true)}
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                onCopyTsv={handleCopyTsv}
            />

            {/* Virtualized Data Grid */}
            <CsvGrid
                columns={columns}
                rows={displayRows}
                onCellChange={handleCellChange}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
                onInsertColumn={handleInsertColumn}
                selectedRowIndices={selectedRowIndices}
                onToggleRowSelection={handleToggleRowSelection}
                onToggleSelectAll={handleToggleSelectAll}
                selectedCell={selectedCell}
                onSelectCell={setSelectedCell}
            />

            {/* Bottom Status & Stats Bar */}
            <CsvStatsBar
                totalRows={rows.length}
                totalColumns={columns.length}
                fileName={fileName}
                delimiter={delimiter}
                selectedCellText={activeCellVal}
            />

            {/* Drag & Drop Overlay */}
            {isDragging && (
                <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-indigo-500/20 backdrop-blur-sm border-4 border-dashed border-indigo-500 rounded-3xl animate-in fade-in">
                    <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 text-center">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            Drop CSV, TSV, or TXT file here
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Instant zero-storage in-memory import
                        </p>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CsvCleanerModal
                isOpen={isCleanerOpen}
                onClose={() => setIsCleanerOpen(false)}
                columns={columns}
                onApplyCleaning={handleApplyCleaning}
                onApplyFindReplace={handleApplyFindReplace}
            />

            <CsvShortenModal
                isOpen={isShortenerOpen}
                onClose={() => setIsShortenerOpen(false)}
                columns={columns}
                rows={rows}
                onApplyShortenedColumn={handleApplyShortenedColumn}
            />

            <CsvBatchQrModal
                isOpen={isBatchQrOpen}
                onClose={() => setIsBatchQrOpen(false)}
                columns={columns}
                rows={rows}
            />

            <CsvUtmModal
                isOpen={isUtmOpen}
                onClose={() => setIsUtmOpen(false)}
                columns={columns}
                onApplyUtm={handleApplyUtm}
            />
        </div>
    );
}
