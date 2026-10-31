import JSZip from "jszip";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { BatchQrOptions, CsvRow } from "./types";

// Helper to sanitize filenames
function sanitizeFileName(name: string, fallback = "qr_code"): string {
    const clean = name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/^_+|_+$/g, "");
    return clean || fallback;
}

// Generate single vector SVG string
function generateVectorQrSvg(
    text: string,
    options: Pick<BatchQrOptions, "fgColor" | "bgColor" | "dotStyle" | "includeFrame" | "frameText">,
    targetSize = 1024
): string {
    const { fgColor, bgColor, dotStyle, includeFrame, frameText } = options;

    const qrElement = (
        <QRCodeSVG
            value={text}
            size={256}
            level="H"
            includeMargin={false}
        />
    );

    let matrixSize = 29;
    const grid: boolean[][] = Array.from({ length: 35 }, () => Array(35).fill(false));

    try {
        const markup = renderToStaticMarkup(qrElement);
        const vbMatch = markup.match(/viewBox="0 0 (\d+) (\d+)"/);
        matrixSize = vbMatch ? parseInt(vbMatch[1], 10) : 29;

        const pathMatch = markup.match(/<path[^>]*d="([^"]+)"/g);
        if (pathMatch) {
            const d = pathMatch[pathMatch.length - 1]?.match(/d="([^"]+)"/)?.[1] || "";
            const regex = /M(\d+)[, ](\d+)\s*h(\d+)v1H\d+z/gi;
            let match: RegExpExecArray | null;

            while ((match = regex.exec(d)) !== null) {
                const x0 = parseInt(match[1], 10);
                const y0 = parseInt(match[2], 10);
                const w = parseInt(match[3], 10);
                for (let dx = 0; dx < w; dx++) {
                    if (grid[y0]) {
                        grid[y0][x0 + dx] = true;
                    }
                }
            }
        }
    } catch (err) {
        console.error("QR matrix parse error", err);
    }

    const quietZone = 3;
    const totalGrid = matrixSize + quietZone * 2;
    const scale = targetSize / totalGrid;

    const hasLabel = includeFrame && (frameText?.trim().length ?? 0) > 0;
    const bannerHeight = hasLabel ? 100 : 0;
    const finalWidth = targetSize;
    const finalHeight = targetSize + bannerHeight;

    let contentSvg = `<rect width="${finalWidth}" height="${finalHeight}" fill="${bgColor}" />`;

    // Draw Data Modules
    for (let y = 0; y < matrixSize; y++) {
        for (let x = 0; x < matrixSize; x++) {
            if (grid[y]?.[x]) {
                // Check if eye cell
                const isEye = (x < 7 && y < 7) || (x >= matrixSize - 7 && y < 7) || (x < 7 && y >= matrixSize - 7);
                if (isEye) continue;

                const px = (x + quietZone) * scale;
                const py = (y + quietZone) * scale;
                const s = scale;

                if (dotStyle === "dots") {
                    contentSvg += `<circle cx="${px + s / 2}" cy="${py + s / 2}" r="${s * 0.42}" fill="${fgColor}" />`;
                } else if (dotStyle === "rounded") {
                    contentSvg += `<rect x="${px + s * 0.05}" y="${py + s * 0.05}" width="${s * 0.9}" height="${s * 0.9}" rx="${s * 0.28}" fill="${fgColor}" />`;
                } else if (dotStyle === "classy") {
                    contentSvg += `<rect x="${px + s * 0.08}" y="${py + s * 0.08}" width="${s * 0.84}" height="${s * 0.84}" rx="${s * 0.42}" fill="${fgColor}" />`;
                } else {
                    contentSvg += `<rect x="${px}" y="${py}" width="${s}" height="${s}" fill="${fgColor}" />`;
                }
            }
        }
    }

    // Helper to draw eye
    const appendEye = (ox: number, oy: number) => {
        const ex = (ox + quietZone) * scale;
        const ey = (oy + quietZone) * scale;
        let oRx = 0;
        let iRx = 0;
        let cRx = 0;

        if (dotStyle === "dots") {
            oRx = scale * 1.6;
            iRx = scale * 0.9;
            cRx = scale * 1.4;
        } else if (dotStyle === "rounded") {
            oRx = scale * 1.2;
            iRx = scale * 0.6;
            cRx = scale * 0.6;
        } else if (dotStyle === "classy") {
            oRx = scale * 2.0;
            iRx = scale * 1.2;
            cRx = scale * 0.9;
        }

        contentSvg += `<rect x="${ex}" y="${ey}" width="${scale * 7}" height="${scale * 7}" rx="${oRx}" fill="${fgColor}" />`;
        contentSvg += `<rect x="${ex + scale}" y="${ey + scale}" width="${scale * 5}" height="${scale * 5}" rx="${iRx}" fill="${bgColor}" />`;
        if (dotStyle === "dots") {
            contentSvg += `<circle cx="${ex + scale * 3.5}" cy="${ey + scale * 3.5}" r="${scale * 1.4}" fill="${fgColor}" />`;
        } else {
            contentSvg += `<rect x="${ex + scale * 2}" y="${ey + scale * 2}" width="${scale * 3}" height="${scale * 3}" rx="${cRx}" fill="${fgColor}" />`;
        }
    };

    appendEye(0, 0);
    appendEye(matrixSize - 7, 0);
    appendEye(0, matrixSize - 7);

    // Frame Pill
    if (hasLabel) {
        const badgeW = Math.min(finalWidth - 40, (frameText?.length ?? 7) * 26 + 80);
        const badgeX = (finalWidth - badgeW) / 2;
        contentSvg += `<rect x="${badgeX}" y="${targetSize + 18}" width="${badgeW}" height="64" rx="32" fill="${fgColor}" />`;
        contentSvg += `<text x="${finalWidth / 2}" y="${targetSize + 58}" fill="${bgColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="2">${(frameText || "SCAN ME").toUpperCase()}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${finalWidth} ${finalHeight}" width="${finalWidth}" height="${finalHeight}">${contentSvg}</svg>`;
}

// Convert SVG to PNG Blob
async function svgToPngBlob(svgStr: string, targetSize = 2048): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas");

    const img = new Image();
    img.crossOrigin = "anonymous";
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const urlObj = URL.createObjectURL(blob);

    return new Promise<Blob>((resolve, reject) => {
        img.onload = () => {
            canvas.width = targetSize;
            canvas.height = Math.round((img.height / img.width) * targetSize);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(urlObj);
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error("Canvas toBlob failed"));
            }, "image/png");
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(urlObj);
            reject(err);
        };
        img.src = urlObj;
    });
}

// Master batch generator that zips all QR codes
export async function generateBatchQrZip(
    rows: CsvRow[],
    options: BatchQrOptions,
    onProgress?: (current: number, total: number, label: string) => void
): Promise<void> {
    const zip = new JSZip();
    const folder = zip.folder("GoMono_QR_Batch") || zip;

    const total = rows.length;
    let generated = 0;

    for (let i = 0; i < total; i++) {
        const row = rows[i];
        const rawContent = (row[options.targetColumnId] || "").trim();
        if (!rawContent) continue;

        let baseName = `qr_${i + 1}`;
        if (options.filenameColumnId && row[options.filenameColumnId]) {
            baseName = sanitizeFileName(row[options.filenameColumnId], baseName);
        } else {
            // Try extracting domain/path
            const cleanUrl = rawContent.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9_-]/g, "_");
            if (cleanUrl) baseName = `${i + 1}_${cleanUrl.slice(0, 30)}`;
        }

        onProgress?.(i + 1, total, `Generating ${baseName}...`);

        const svgStr = generateVectorQrSvg(rawContent, options, 1024);

        if (options.format === "svg") {
            folder.file(`${baseName}.svg`, svgStr);
        } else {
            const pngBlob = await svgToPngBlob(svgStr, options.resolution);
            folder.file(`${baseName}.png`, pngBlob);
        }

        generated++;
    }

    if (generated === 0) {
        throw new Error("No non-empty data found in the selected column.");
    }

    onProgress?.(total, total, "Compressing ZIP archive...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Trigger instant client download
    const downloadUrl = URL.createObjectURL(zipBlob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${options.zipFileName || "GoMono_QR_Batch"}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);
}
