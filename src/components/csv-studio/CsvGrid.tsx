"use client";
/* eslint-disable react-hooks/incompatible-library */

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Globe,
    Mail,
    Hash,
    Calendar,
    AlignLeft,
} from "lucide-react";
import { CsvColumn, CsvRow, ColumnType, CellCoord } from "@/lib/csv-studio/types";

interface CsvGridProps {
    columns: CsvColumn[];
    rows: CsvRow[];
    onCellChange: (rowIndex: number, columnId: string, value: string) => void;
    onRenameColumn: (columnId: string, newName: string) => void;
    onDeleteColumn: (columnId: string) => void;
    onInsertColumn: (targetColumnId: string, position: "left" | "right") => void;
    selectedRowIndices: Set<number>;
    onToggleRowSelection: (rowIndex: number) => void;
    onToggleSelectAll: () => void;
    selectedCell: CellCoord | null;
    onSelectCell: (cell: CellCoord | null) => void;
}

function getColumnTypeBadge(type: ColumnType) {
    switch (type) {
        case "url":
            return {
                icon: Globe,
                label: "URL",
                bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            };
        case "email":
            return {
                icon: Mail,
                label: "EMAIL",
                bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
            };
        case "number":
            return {
                icon: Hash,
                label: "NUM",
                bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            };
        case "date":
            return {
                icon: Calendar,
                label: "DATE",
                bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            };
        case "text":
        default:
            return {
                icon: AlignLeft,
                label: "TXT",
                bg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
            };
    }
}

export default function CsvGrid({
    columns,
    rows,
    onCellChange,
    onRenameColumn,
    onDeleteColumn,
    onInsertColumn,
    selectedRowIndices,
    onToggleRowSelection,
    onToggleSelectAll,
    selectedCell,
    onSelectCell,
}: CsvGridProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    // Editing Cell State
    const [editingCell, setEditingCell] = useState<CellCoord | null>(null);
    const [editValue, setEditValue] = useState("");
    const editInputRef = useRef<HTMLInputElement>(null);

    // Renaming Column Header State
    const [renamingColId, setRenamingColId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Active Column Action Menu State
    const [menuColId, setMenuColId] = useState<string | null>(null);

    // Auto-close column action menu on outside click
    useEffect(() => {
        if (!menuColId) return;
        const handleDocClick = () => {
            setMenuColId(null);
        };
        document.addEventListener("click", handleDocClick);
        return () => document.removeEventListener("click", handleDocClick);
    }, [menuColId]);

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ columnId: string; direction: "asc" | "desc" } | null>(null);

    const handleSort = (columnId: string) => {
        setSortConfig((prev) => {
            if (prev?.columnId === columnId) {
                if (prev.direction === "asc") return { columnId, direction: "desc" };
                return null;
            }
            return { columnId, direction: "asc" };
        });
    };

    const sortedRows = useMemo(() => {
        if (!sortConfig) return rows;
        const sorted = [...rows];
        sorted.sort((a, b) => {
            const valA = a[sortConfig.columnId] || "";
            const valB = b[sortConfig.columnId] || "";
            const numA = Number(valA.replace(/,/g, ""));
            const numB = Number(valB.replace(/,/g, ""));
            if (!isNaN(numA) && !isNaN(numB) && valA.trim() !== "" && valB.trim() !== "") {
                return sortConfig.direction === "asc" ? numA - numB : numB - numA;
            }
            return sortConfig.direction === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });
        return sorted;
    }, [rows, sortConfig]);

    // Virtualizer instance
    const rowVirtualizer = useVirtualizer({
        count: sortedRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36, // row height
        overscan: 12,
    });

    // Auto-focus inline edit input
    useEffect(() => {
        if (editingCell) {
            editInputRef.current?.focus();
            editInputRef.current?.select();
        }
    }, [editingCell]);

    // Auto-focus header rename input
    useEffect(() => {
        if (renamingColId) {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        }
    }, [renamingColId]);

    // Save cell edit
    const commitCellEdit = useCallback(() => {
        if (editingCell) {
            onCellChange(editingCell.rowIndex, editingCell.columnId, editValue);
            setEditingCell(null);
        }
    }, [editingCell, editValue, onCellChange]);

    // Cancel cell edit
    const cancelCellEdit = () => {
        setEditingCell(null);
    };

    // Save column rename
    const commitRename = (colId: string) => {
        if (renameValue.trim()) {
            onRenameColumn(colId, renameValue.trim());
        }
        setRenamingColId(null);
    };

    // Handle Keyboard Navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (editingCell) {
            if (e.key === "Enter") {
                commitCellEdit();
                // Move down
                if (editingCell.rowIndex + 1 < rows.length) {
                    onSelectCell({ rowIndex: editingCell.rowIndex + 1, columnId: editingCell.columnId });
                }
            } else if (e.key === "Tab") {
                e.preventDefault();
                commitCellEdit();
                const colIdx = columns.findIndex((c) => c.id === editingCell.columnId);
                if (e.shiftKey) {
                    // Previous cell
                    if (colIdx > 0) {
                        onSelectCell({ rowIndex: editingCell.rowIndex, columnId: columns[colIdx - 1].id });
                    }
                } else {
                    // Next cell
                    if (colIdx + 1 < columns.length) {
                        onSelectCell({ rowIndex: editingCell.rowIndex, columnId: columns[colIdx + 1].id });
                    } else if (editingCell.rowIndex + 1 < rows.length) {
                        onSelectCell({ rowIndex: editingCell.rowIndex + 1, columnId: columns[0].id });
                    }
                }
            } else if (e.key === "Escape") {
                cancelCellEdit();
            }
            return;
        }

        // Navigate with Arrow keys when cell is selected but not editing
        if (selectedCell) {
            const colIdx = columns.findIndex((c) => c.id === selectedCell.columnId);
            if (e.key === "ArrowDown" && selectedCell.rowIndex + 1 < rows.length) {
                e.preventDefault();
                onSelectCell({ rowIndex: selectedCell.rowIndex + 1, columnId: selectedCell.columnId });
            } else if (e.key === "ArrowUp" && selectedCell.rowIndex > 0) {
                e.preventDefault();
                onSelectCell({ rowIndex: selectedCell.rowIndex - 1, columnId: selectedCell.columnId });
            } else if (e.key === "ArrowRight" && colIdx + 1 < columns.length) {
                e.preventDefault();
                onSelectCell({ rowIndex: selectedCell.rowIndex, columnId: columns[colIdx + 1].id });
            } else if (e.key === "ArrowLeft" && colIdx > 0) {
                e.preventDefault();
                onSelectCell({ rowIndex: selectedCell.rowIndex, columnId: columns[colIdx - 1].id });
            } else if (e.key === "Enter") {
                e.preventDefault();
                const currentVal = rows[selectedCell.rowIndex]?.[selectedCell.columnId] || "";
                setEditValue(currentVal);
                setEditingCell(selectedCell);
            }
        }
    };

    // Visible columns
    const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns]);

    const isAllSelected = rows.length > 0 && selectedRowIndices.size === rows.length;

    return (
        <div
            ref={parentRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="flex-1 w-full overflow-auto outline-none select-none relative bg-white dark:bg-zinc-950 font-sans text-xs"
        >
            <div style={{ minWidth: "max-content", width: "100%" }}>
                {/* STICKY HEADER ROW */}
                <div className="sticky top-0 z-20 flex border-b border-zinc-200 bg-zinc-100/95 dark:border-zinc-800 dark:bg-zinc-900/95 backdrop-blur-md shadow-xs">
                    {/* Select All Checkbox & Row Index Header */}
                    <div className="sticky left-0 z-30 flex items-center justify-center w-12 h-9 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={onToggleSelectAll}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            title="Select / Deselect all rows"
                        />
                    </div>

                    {/* Column Headers */}
                    {visibleColumns.map((col) => {
                        const badge = getColumnTypeBadge(col.type);
                        const BadgeIcon = badge.icon;
                        const isRenaming = renamingColId === col.id;
                        const isMenuOpen = menuColId === col.id;

                        return (
                            <div
                                key={col.id}
                                style={{ width: col.width || 180 }}
                                className={`flex items-center justify-between h-9 px-3 border-r border-zinc-200 dark:border-zinc-800 shrink-0 group/col hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors ${
                                    isMenuOpen ? "relative z-50" : "relative z-10"
                                }`}
                            >
                                {isRenaming ? (
                                    <div className="flex items-center gap-1 w-full">
                                        <input
                                            ref={renameInputRef}
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") commitRename(col.id);
                                                if (e.key === "Escape") setRenamingColId(null);
                                            }}
                                            onBlur={() => commitRename(col.id)}
                                            className="w-full rounded bg-white px-1.5 py-0.5 text-xs font-bold text-zinc-900 outline-none ring-2 ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-2 truncate cursor-pointer flex-1"
                                        onDoubleClick={() => {
                                            setRenameValue(col.name);
                                            setRenamingColId(col.id);
                                        }}
                                        title={`Double click to rename: ${col.name}`}
                                    >
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                            {col.name}
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-mono font-bold border ${badge.bg}`}
                                        >
                                            <BadgeIcon className="h-2.5 w-2.5" />
                                            <span>{badge.label}</span>
                                        </span>
                                    </div>
                                )}

                                {/* Column Action & Sort Buttons */}
                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => handleSort(col.id)}
                                        className={`p-1 rounded transition ${
                                            sortConfig?.columnId === col.id
                                                ? "opacity-100 text-indigo-600 dark:text-indigo-400"
                                                : "opacity-0 group-hover/col:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                        }`}
                                        title="Sort column"
                                    >
                                        {sortConfig?.columnId === col.id ? (
                                            sortConfig.direction === "asc" ? (
                                                <ArrowUp className="h-3 w-3" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuColId(isMenuOpen ? null : col.id);
                                        }}
                                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition opacity-0 group-hover/col:opacity-100"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Context Menu */}
                                {isMenuOpen && (
                                    <div
                                        className="absolute right-1 top-full mt-1.5 z-50 w-48 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 ring-1 ring-black/10 dark:ring-white/10 animate-in fade-in slide-in-from-top-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRenameValue(col.name);
                                                setRenamingColId(col.id);
                                                setMenuColId(null);
                                            }}
                                            className="w-full text-left rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                        >
                                            Rename Header
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onInsertColumn(col.id, "left");
                                                setMenuColId(null);
                                            }}
                                            className="w-full text-left rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                        >
                                            Insert Column Left
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onInsertColumn(col.id, "right");
                                                setMenuColId(null);
                                            }}
                                            className="w-full text-left rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                                        >
                                            Insert Column Right
                                        </button>
                                        <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onDeleteColumn(col.id);
                                                setMenuColId(null);
                                            }}
                                            className="w-full text-left rounded-xl px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition"
                                        >
                                            Delete Column
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* VIRTUALIZED ROWS CONTAINER */}
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        position: "relative",
                        width: "100%",
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const rowIndex = virtualRow.index;
                        const row = sortedRows[rowIndex];
                        const isRowSelected = selectedRowIndices.has(rowIndex);

                        return (
                            <div
                                key={virtualRow.key}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                className={`flex border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors ${
                                    isRowSelected
                                        ? "bg-indigo-50/70 dark:bg-indigo-950/30"
                                        : rowIndex % 2 === 0
                                        ? "bg-white dark:bg-zinc-950"
                                        : "bg-zinc-50/40 dark:bg-zinc-900/20"
                                } hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30`}
                            >
                                {/* Sticky Row Index & Checkbox */}
                                <div
                                    className={`sticky left-0 z-10 flex items-center justify-between w-12 h-full px-2 border-r border-zinc-200/80 dark:border-zinc-800/80 shrink-0 font-mono text-[10px] text-zinc-400 ${
                                        isRowSelected ? "bg-indigo-100/60 dark:bg-indigo-950/60" : "bg-zinc-100/90 dark:bg-zinc-900/90"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isRowSelected}
                                        onChange={() => onToggleRowSelection(rowIndex)}
                                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span>{rowIndex + 1}</span>
                                </div>

                                {/* Row Data Cells */}
                                {visibleColumns.map((col) => {
                                    const cellVal = row?.[col.id] ?? "";
                                    const isSelected = selectedCell?.rowIndex === rowIndex && selectedCell?.columnId === col.id;
                                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === col.id;

                                    return (
                                        <div
                                            key={col.id}
                                            style={{ width: col.width || 180 }}
                                            onClick={() => onSelectCell({ rowIndex, columnId: col.id })}
                                            onDoubleClick={() => {
                                                setEditValue(cellVal);
                                                setEditingCell({ rowIndex, columnId: col.id });
                                            }}
                                            className={`relative flex items-center px-3 h-full border-r border-zinc-200/50 dark:border-zinc-800/50 truncate cursor-text transition-all ${
                                                isSelected && !isEditing
                                                    ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-500/10"
                                                    : ""
                                            }`}
                                        >
                                            {isEditing ? (
                                                <input
                                                    ref={editInputRef}
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={commitCellEdit}
                                                    className="w-full h-full bg-white px-1.5 py-0.5 text-xs text-zinc-900 outline-none ring-2 ring-indigo-500 rounded dark:bg-zinc-900 dark:text-white"
                                                />
                                            ) : (
                                                <span
                                                    className={`truncate font-mono ${
                                                        col.type === "url"
                                                            ? "text-blue-600 dark:text-blue-400 hover:underline"
                                                            : !cellVal
                                                            ? "text-zinc-300 dark:text-zinc-700 italic"
                                                            : "text-zinc-800 dark:text-zinc-200"
                                                    }`}
                                                >
                                                    {cellVal || "—"}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
