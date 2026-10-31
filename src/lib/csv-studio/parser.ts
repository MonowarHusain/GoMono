import Papa from "papaparse";
import { CsvColumn, CsvRow, CsvTableData, ColumnType } from "./types";

// Auto-classify column data type from sample values
export function detectColumnType(values: string[]): ColumnType {
    const nonEmpties = values.map((v) => v.trim()).filter(Boolean);
    if (nonEmpties.length === 0) return "text";

    const samples = nonEmpties.slice(0, 50);

    // 1. Check URL
    const urlMatches = samples.filter((v) => /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i.test(v) || /^[a-z0-9-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(v));
    if (urlMatches.length / samples.length >= 0.7) return "url";

    // 2. Check Email
    const emailMatches = samples.filter((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    if (emailMatches.length / samples.length >= 0.7) return "email";

    // 3. Check Number
    const numberMatches = samples.filter((v) => !isNaN(Number(v.replace(/,/g, ""))));
    if (numberMatches.length / samples.length >= 0.7) return "number";

    // 4. Check Date
    const dateMatches = samples.filter((v) => {
        if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(v)) return true;
        const d = Date.parse(v);
        return !isNaN(d) && !/^\d+$/.test(v);
    });
    if (dateMatches.length / samples.length >= 0.7) return "date";

    return "text";
}

// Universal parser for raw CSV, TSV, or pasted spreadsheet text
export function parseTabularData(
    rawText: string,
    fileName = "untitled.csv"
): CsvTableData {
    const trimmed = rawText.trim();
    if (!trimmed) {
        return createEmptyTable(fileName);
    }

    // PapaParse auto-detects comma, semicolon, tab, pipe
    const result = Papa.parse<string[]>(trimmed, {
        header: false,
        skipEmptyLines: true,
        delimiter: "", // Auto-detect delimiter
    });

    const data = result.data;
    if (!data || data.length === 0) {
        return createEmptyTable(fileName);
    }

    const firstRow = data[0] || [];
    const delimiter = result.meta?.delimiter || ",";

    // Assume row 0 is headers if it has text; if all values look numeric, synthesize headers
    const hasHeaderRow = firstRow.some((col) => isNaN(Number(col.trim())));
    const headerLabels = hasHeaderRow
        ? firstRow.map((h, i) => (h.trim() ? h.trim() : `Column_${i + 1}`))
        : firstRow.map((_, i) => `Column_${i + 1}`);

    const dataRows = hasHeaderRow ? data.slice(1) : data;

    // Create column definitions
    const columns: CsvColumn[] = headerLabels.map((name, index) => {
        const id = `col_${index}`;
        const columnValues = dataRows.map((r) => r[index] || "");
        return {
            id,
            name,
            type: detectColumnType(columnValues),
            width: 180,
        };
    });

    // Create structured rows
    const rows: CsvRow[] = dataRows.map((row) => {
        const rowObj: CsvRow = {};
        columns.forEach((col, colIdx) => {
            rowObj[col.id] = row[colIdx] !== undefined ? String(row[colIdx]) : "";
        });
        return rowObj;
    });

    return {
        columns,
        rows,
        fileName,
        delimiter,
    };
}

// Create blank empty table with default columns
export function createEmptyTable(fileName = "untitled.csv"): CsvTableData {
    const columns: CsvColumn[] = [
        { id: "col_0", name: "Target URL", type: "url", width: 220 },
        { id: "col_1", name: "Campaign", type: "text", width: 160 },
        { id: "col_2", name: "Owner", type: "text", width: 140 },
        { id: "col_3", name: "Notes", type: "text", width: 180 },
    ];

    const rows: CsvRow[] = Array.from({ length: 5 }, (_, i) => ({
        col_0: i === 0 ? "https://example.com/summer-sale" : i === 1 ? "https://example.com/pricing" : "",
        col_1: i === 0 ? "Summer Promo" : i === 1 ? "Product Hunt" : "",
        col_2: i === 0 ? "Marketing" : i === 1 ? "Growth" : "",
        col_3: "",
    }));

    return {
        columns,
        rows,
        fileName,
        delimiter: ",",
    };
}

// Sample Templates for 1-click loading
export const SAMPLE_TEMPLATES: Record<string, { name: string; raw: string }> = {
    marketing: {
        name: "Marketing Campaigns (URLs & UTMs)",
        raw: `Destination_URL,Campaign_Name,Channel,Expected_Clicks,Target_Region
https://gomono.dev/features,Q4 Product Launch,Twitter / X,1500,North America
https://gomono.dev/pricing,Black Friday Flash Sale,Email Newsletter,4200,Global
https://gomono.dev/docs,Developer API Showcase,Reddit Developers,950,Europe
https://gomono.dev/qr,Enterprise QR Studio,LinkedIn Tech,2100,Asia Pacific
https://gomono.dev/demo,Live Virtual Demo,YouTube Influencer,3800,North America`,
    },
    ecommerce: {
        name: "E-Commerce Product Links",
        raw: `Product_ID,Product_Name,Store_URL,Category,Stock_Status
SKU-9021,Minimalist Mechanical Keyboard,https://shop.mono.bro.bd/products/keyboard,Electronics,In Stock
SKU-8412,Ergonomic Wireless Mouse,https://shop.mono.bro.bd/products/mouse,Electronics,Low Stock
SKU-5190,Matte Black Desk Mat,https://shop.mono.bro.bd/products/desk-mat,Accessories,In Stock
SKU-2341,Aluminum Monitor Arm,https://shop.mono.bro.bd/products/monitor-arm,Furniture,Backorder
SKU-7734,USB-C Braided Cable 2M,https://shop.mono.bro.bd/products/cable,Cables,In Stock`,
    },
    outreach: {
        name: "Creator Outreach & Partners",
        raw: `Creator_Name,Portfolio_URL,Platform,Followers,Contact_Email
Sarah Jenkins,https://sarahcodes.dev,YouTube,125000,sarah@creatorflow.io
David Chen,https://davidchen.design,Twitter / X,48000,dchen@designhub.com
Elena Rostova,https://elenatech.blog,Substack,19500,elena@techpulse.org
Marcus Brody,https://brodybuilds.io,TikTok,310000,marcus@brodyagency.co`,
    },
};

// Export table to CSV formatted string
export function exportToCsvString(
    columns: CsvColumn[],
    rows: CsvRow[],
    delimiter = ","
): string {
    const activeCols = columns.filter((c) => !c.hidden);
    const headers = activeCols.map((c) => c.name);

    const dataMatrix = rows.map((row) =>
        activeCols.map((col) => row[col.id] ?? "")
    );

    return Papa.unparse(
        {
            fields: headers,
            data: dataMatrix,
        },
        {
            delimiter,
        }
    );
}

// Export table to JSON string
export function exportToJsonString(
    columns: CsvColumn[],
    rows: CsvRow[]
): string {
    const activeCols = columns.filter((c) => !c.hidden);
    const jsonObjects = rows.map((row) => {
        const obj: Record<string, string> = {};
        activeCols.forEach((col) => {
            obj[col.name] = row[col.id] ?? "";
        });
        return obj;
    });

    return JSON.stringify(jsonObjects, null, 2);
}

// Export to TSV string for instant clipboard copy (Excel/Sheets compatible)
export function exportToClipboardTsv(
    columns: CsvColumn[],
    rows: CsvRow[]
): string {
    return exportToCsvString(columns, rows, "\t");
}

