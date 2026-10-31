export type ColumnType = "url" | "email" | "number" | "date" | "text";

export interface CsvColumn {
    id: string; // unique internal key, e.g. "col_0", "col_1"
    name: string; // display header name, e.g. "Destination URL"
    type: ColumnType;
    width?: number;
    hidden?: boolean;
}

export type CsvRow = Record<string, string>;

export interface CsvTableData {
    columns: CsvColumn[];
    rows: CsvRow[];
    fileName: string;
    delimiter: string;
}

export interface CellCoord {
    rowIndex: number;
    columnId: string;
}

export interface HistorySnapshot {
    columns: CsvColumn[];
    rows: CsvRow[];
    description: string;
}

export interface CleaningOptions {
    trimWhitespace: boolean;
    targetColumns?: string[]; // undefined = all columns
    removeDuplicates: boolean;
    duplicateKeyColumn?: string; // undefined = entire row
    caseConversion?: "none" | "uppercase" | "lowercase" | "titlecase" | "snakecase";
    emptyValuesAction?: "none" | "remove_rows" | "fill_default";
    emptyValuesDefault?: string;
}

export interface FindReplaceOptions {
    findText: string;
    replaceText: string;
    targetColumnId?: string; // undefined = all columns
    matchCase: boolean;
    useRegex: boolean;
}

export interface UtmOptions {
    targetColumnId: string;
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
    overwriteExisting: boolean;
}

export interface BatchQrOptions {
    targetColumnId: string;
    filenameColumnId?: string;
    format: "png" | "svg";
    resolution: 1024 | 2048;
    fgColor: string;
    bgColor: string;
    dotStyle: "squares" | "rounded" | "dots" | "classy";
    includeFrame: boolean;
    frameText?: string;
    zipFileName: string;
}

export interface BatchShortenOptions {
    targetColumnId: string;
    domain: string;
    tags: string[];
    maxClicks?: number;
    expiresAt?: string;
}

