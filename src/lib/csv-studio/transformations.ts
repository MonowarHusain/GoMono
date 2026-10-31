import { CsvColumn, CsvRow, CleaningOptions, FindReplaceOptions, UtmOptions } from "./types";

// Deduplicate rows
export function deduplicateRows(
    rows: CsvRow[],
    columns: CsvColumn[],
    keyColumnId?: string
): { rows: CsvRow[]; removedCount: number } {
    const seen = new Set<string>();
    const deduplicated: CsvRow[] = [];

    rows.forEach((row) => {
        let signature = "";
        if (keyColumnId) {
            signature = (row[keyColumnId] || "").trim().toLowerCase();
        } else {
            // Entire row signature
            signature = columns.map((col) => (row[col.id] || "").trim().toLowerCase()).join("::|::");
        }

        if (!seen.has(signature)) {
            seen.add(signature);
            deduplicated.push(row);
        }
    });

    return {
        rows: deduplicated,
        removedCount: rows.length - deduplicated.length,
    };
}

// Clean and trim whitespace
export function trimWhitespace(
    rows: CsvRow[],
    targetColumnIds?: string[]
): { rows: CsvRow[]; modifiedCells: number } {
    let modifiedCells = 0;

    const newRows = rows.map((row) => {
        const updatedRow: CsvRow = { ...row };
        Object.keys(updatedRow).forEach((colId) => {
            if (!targetColumnIds || targetColumnIds.includes(colId)) {
                const original = updatedRow[colId] || "";
                const trimmed = original.trim();
                if (original !== trimmed) {
                    updatedRow[colId] = trimmed;
                    modifiedCells++;
                }
            }
        });
        return updatedRow;
    });

    return { rows: newRows, modifiedCells };
}

// Find and Replace
export function findAndReplace(
    rows: CsvRow[],
    options: FindReplaceOptions
): { rows: CsvRow[]; replaceCount: number } {
    let replaceCount = 0;
    const { findText, replaceText, targetColumnId, matchCase, useRegex } = options;

    if (!findText) return { rows, replaceCount: 0 };

    let regex: RegExp;
    try {
        if (useRegex) {
            regex = new RegExp(findText, matchCase ? "g" : "gi");
        } else {
            // Escape literal characters
            const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            regex = new RegExp(escaped, matchCase ? "g" : "gi");
        }
    } catch {
        return { rows, replaceCount: 0 };
    }

    const newRows = rows.map((row) => {
        const updatedRow: CsvRow = { ...row };
        Object.keys(updatedRow).forEach((colId) => {
            if (!targetColumnId || targetColumnId === colId) {
                const val = updatedRow[colId] || "";
                if (regex.test(val)) {
                    const matches = val.match(regex)?.length || 0;
                    replaceCount += matches;
                    updatedRow[colId] = val.replace(regex, replaceText);
                }
            }
        });
        return updatedRow;
    });

    return { rows: newRows, replaceCount };
}

// Convert Case
export function convertColumnCase(
    rows: CsvRow[],
    columnId: string,
    casing: "uppercase" | "lowercase" | "titlecase" | "snakecase"
): CsvRow[] {
    return rows.map((row) => {
        const val = row[columnId];
        if (!val) return row;

        let converted = val;
        switch (casing) {
            case "uppercase":
                converted = val.toUpperCase();
                break;
            case "lowercase":
                converted = val.toLowerCase();
                break;
            case "titlecase":
                converted = val
                    .toLowerCase()
                    .replace(/(?:^|\s|-|_)\S/g, (char) => char.toUpperCase());
                break;
            case "snakecase":
                converted = val
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_]/g, "");
                break;
        }

        return {
            ...row,
            [columnId]: converted,
        };
    });
}

// Handle Empty Values
export function handleEmptyValues(
    rows: CsvRow[],
    columns: CsvColumn[],
    action: "remove_rows" | "fill_default",
    defaultValue = "N/A",
    targetColumnIds?: string[]
): { rows: CsvRow[]; affectedCount: number } {
    if (action === "remove_rows") {
        const filtered = rows.filter((row) => {
            const keysToCheck = targetColumnIds && targetColumnIds.length > 0 ? targetColumnIds : columns.map((c) => c.id);
            return keysToCheck.every((colId) => Boolean(row[colId] && row[colId].trim()));
        });
        return {
            rows: filtered,
            affectedCount: rows.length - filtered.length,
        };
    } else {
        let filledCount = 0;
        const newRows = rows.map((row) => {
            const updated = { ...row };
            const keysToCheck = targetColumnIds && targetColumnIds.length > 0 ? targetColumnIds : columns.map((c) => c.id);
            keysToCheck.forEach((colId) => {
                if (!updated[colId] || !updated[colId].trim()) {
                    updated[colId] = defaultValue;
                    filledCount++;
                }
            });
            return updated;
        });
        return {
            rows: newRows,
            affectedCount: filledCount,
        };
    }
}

// Inject UTM Parameters into Target URL Column
export function injectUtmParameters(
    rows: CsvRow[],
    options: UtmOptions
): { rows: CsvRow[]; successCount: number } {
    let successCount = 0;
    const { targetColumnId, source, medium, campaign, term, content, overwriteExisting } = options;

    const newRows = rows.map((row) => {
        const rawUrl = (row[targetColumnId] || "").trim();
        if (!rawUrl) return row;

        try {
            let normalized = rawUrl;
            if (!/^https?:\/\//i.test(normalized)) {
                normalized = `https://${normalized}`;
            }

            const urlObj = new URL(normalized);

            const setOrKeep = (key: string, val?: string) => {
                if (!val) return;
                if (overwriteExisting || !urlObj.searchParams.has(key)) {
                    urlObj.searchParams.set(key, val.trim());
                }
            };

            setOrKeep("utm_source", source);
            setOrKeep("utm_medium", medium);
            setOrKeep("utm_campaign", campaign);
            setOrKeep("utm_term", term);
            setOrKeep("utm_content", content);

            successCount++;
            return {
                ...row,
                [targetColumnId]: urlObj.toString(),
            };
        } catch {
            return row;
        }
    });

    return { rows: newRows, successCount };
}

// Master cleaning batch pipeline
export function applyDataCleaning(
    rows: CsvRow[],
    columns: CsvColumn[],
    options: CleaningOptions
): { rows: CsvRow[]; summary: string[] } {
    let currentRows = [...rows];
    const summary: string[] = [];

    // 1. Whitespace Cleaner
    if (options.trimWhitespace) {
        const { rows: trimmed, modifiedCells } = trimWhitespace(currentRows, options.targetColumns);
        currentRows = trimmed;
        if (modifiedCells > 0) {
            summary.push(`Trimmed whitespace in ${modifiedCells} cell(s)`);
        }
    }

    // 2. Deduplication
    if (options.removeDuplicates) {
        const { rows: deduped, removedCount } = deduplicateRows(currentRows, columns, options.duplicateKeyColumn);
        currentRows = deduped;
        if (removedCount > 0) {
            summary.push(`Removed ${removedCount} duplicate row(s)`);
        }
    }

    // 3. Case conversion
    if (options.caseConversion && options.caseConversion !== "none" && options.targetColumns && options.targetColumns.length > 0) {
        const caseMode = options.caseConversion as "uppercase" | "lowercase" | "titlecase" | "snakecase";
        options.targetColumns.forEach((colId) => {
            currentRows = convertColumnCase(currentRows, colId, caseMode);
        });
        summary.push(`Converted case (${options.caseConversion}) across ${options.targetColumns.length} column(s)`);
    }

    // 4. Empty values
    if (options.emptyValuesAction && options.emptyValuesAction !== "none") {
        const { rows: handled, affectedCount } = handleEmptyValues(
            currentRows,
            columns,
            options.emptyValuesAction,
            options.emptyValuesDefault || "N/A",
            options.targetColumns
        );
        currentRows = handled;
        if (affectedCount > 0) {
            summary.push(
                options.emptyValuesAction === "remove_rows"
                    ? `Removed ${affectedCount} row(s) with empty values`
                    : `Filled ${affectedCount} empty cell(s) with default`
            );
        }
    }

    return { rows: currentRows, summary };
}
