"use client";

import { useState, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import {
    Download,
    Copy,
    Check,
    X,
    ArrowLeftRight,
    QrCode,
} from "lucide-react";
import { toast } from "sonner";

export type DotStyle = "squares" | "rounded" | "dots" | "classy";
export type FrameStyle = "none" | "card" | "badge";

export interface PresetIcon {
    id: string;
    label: string;
    svgContent: string;
}

export const PRESET_ICONS: PresetIcon[] = [
    {
        id: "none",
        label: "None",
        svgContent: "",
    },
    {
        id: "gomono",
        label: "GoMono",
        svgContent: '<path d="M13 2L4 14h7v8l9-12h-7V2z" fill="currentColor"/>',
    },
    {
        id: "globe",
        label: "Globe",
        svgContent: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2a15 15 0 0 0 0 20M12 2a15 15 0 0 1 0 20M2 12h20" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
    {
        id: "github",
        label: "GitHub",
        svgContent: '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="currentColor"/>',
    },
    {
        id: "twitter",
        label: "X / Twitter",
        svgContent: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>',
    },
    {
        id: "linkedin",
        label: "LinkedIn",
        svgContent: '<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="currentColor"/>',
    },
    {
        id: "youtube",
        label: "YouTube",
        svgContent: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>',
    },
    {
        id: "instagram",
        label: "Instagram",
        svgContent: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>',
    },
    {
        id: "whatsapp",
        label: "WhatsApp",
        svgContent: '<path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h.02z" fill="currentColor"/>',
    },
    {
        id: "mail",
        label: "Email",
        svgContent: '<rect width="20" height="16" x="2" y="4" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
    {
        id: "shield",
        label: "Protected",
        svgContent: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
];

export const COLOR_PALETTES = [
    { label: "Midnight", fg: "#09090b", bg: "#ffffff" },
    { label: "Indigo", fg: "#4f46e5", bg: "#ffffff" },
    { label: "Emerald", fg: "#059669", bg: "#ffffff" },
    { label: "Violet", fg: "#7c3aed", bg: "#ffffff" },
    { label: "Electric", fg: "#0284c7", bg: "#ffffff" },
    { label: "Rose", fg: "#e11d48", bg: "#ffffff" },
    { label: "Amber", fg: "#d97706", bg: "#ffffff" },
    { label: "Inverted", fg: "#ffffff", bg: "#09090b" },
];

interface QrStudioProps {
    initialUrl?: string;
    onClose?: () => void;
    isModal?: boolean;
}

export function QrStudioView({ initialUrl = "https://to.mono.bro.bd" }: QrStudioProps) {
    // Core States
    const [url, setUrl] = useState(initialUrl);
    const [prevInitialUrl, setPrevInitialUrl] = useState(initialUrl);

    // Sync state when prop changes without an effect
    if (initialUrl !== prevInitialUrl) {
        setPrevInitialUrl(initialUrl);
        setUrl(initialUrl);
    }

    const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
    const [fgColor, setFgColor] = useState("#09090b");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [presetIcon, setPresetIcon] = useState<string>("gomono");
    const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
    const [frameText, setFrameText] = useState("SCAN ME");

    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState<"png" | "svg" | null>(null);

    // Synchronously parse QR matrix from static SVG markup with zero effect cascades
    const { matrixSize, matrixGrid } = useMemo(() => {
        const qrElement = (
            <QRCodeSVG
                value={url.trim() || "https://to.mono.bro.bd"}
                size={256}
                level="H"
                includeMargin={false}
            />
        );

        try {
            const markup = renderToStaticMarkup(qrElement);
            const vbMatch = markup.match(/viewBox="0 0 (\d+) (\d+)"/);
            const size = vbMatch ? parseInt(vbMatch[1], 10) : 29;
            const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

            const pathMatch = markup.match(/<path[^>]*d="([^"]+)"/g);
            if (pathMatch) {
                // Take the modules path
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

            return { matrixSize: size, matrixGrid: grid };
        } catch (err) {
            console.error("Failed to calculate QR matrix", err);
            return { matrixSize: 29, matrixGrid: [] };
        }
    }, [url]);

    // Check if cell belongs to one of the 3 finder eyes
    const isEyeCell = (x: number, y: number, n: number) => {
        if (x < 7 && y < 7) return true; // Top-left
        if (x >= n - 7 && y < 7) return true; // Top-right
        if (x < 7 && y >= n - 7) return true; // Bottom-left
        return false;
    };

    // Check if cell is in the center icon excavation cutout area
    const isCenterLogoCell = (x: number, y: number, n: number) => {
        if (presetIcon === "none") return false;
        const cx = (n - 1) / 2;
        const cy = (n - 1) / 2;
        const r = Math.max(3, Math.floor(n * 0.14));
        return Math.abs(x - cx) <= r && Math.abs(y - cy) <= r;
    };

    // Swap foreground and background
    const handleSwapColors = () => {
        setFgColor(bgColor);
        setBgColor(fgColor);
    };

    // Render individual module based on dotStyle
    const renderModule = (x: number, y: number) => {
        const key = `cell-${x}-${y}`;
        switch (dotStyle) {
            case "dots":
                return <circle key={key} cx={x + 0.5} cy={y + 0.5} r={0.42} fill={fgColor} />;
            case "rounded":
                return (
                    <rect
                        key={key}
                        x={x + 0.05}
                        y={y + 0.05}
                        width={0.9}
                        height={0.9}
                        rx={0.28}
                        ry={0.28}
                        fill={fgColor}
                    />
                );
            case "classy":
                return (
                    <rect
                        key={key}
                        x={x + 0.08}
                        y={y + 0.08}
                        width={0.84}
                        height={0.84}
                        rx={0.42}
                        ry={0.42}
                        fill={fgColor}
                    />
                );
            case "squares":
            default:
                return <rect key={key} x={x} y={y} width={1} height={1} fill={fgColor} />;
        }
    };

    // Render the 3 finder pattern eyes
    const renderEye = (ox: number, oy: number, id: string) => {
        let outerRx = 0;
        let innerRx = 0;
        let coreRx = 0;

        if (dotStyle === "dots") {
            outerRx = 1.6;
            innerRx = 0.9;
            coreRx = 1.4;
        } else if (dotStyle === "rounded") {
            outerRx = 1.2;
            innerRx = 0.6;
            coreRx = 0.6;
        } else if (dotStyle === "classy") {
            outerRx = 2.0;
            innerRx = 1.2;
            coreRx = 0.9;
        }

        return (
            <g key={id}>
                {/* Outer frame */}
                <rect x={ox} y={oy} width={7} height={7} rx={outerRx} ry={outerRx} fill={fgColor} />
                {/* Space cutout */}
                <rect x={ox + 1} y={oy + 1} width={5} height={5} rx={innerRx} ry={innerRx} fill={bgColor} />
                {/* Inner core */}
                {dotStyle === "dots" ? (
                    <circle cx={ox + 3.5} cy={oy + 3.5} r={1.4} fill={fgColor} />
                ) : (
                    <rect x={ox + 2} y={oy + 2} width={3} height={3} rx={coreRx} ry={coreRx} fill={fgColor} />
                )}
            </g>
        );
    };

    // Calculate center badge geometry
    const centerBadge = useMemo(() => {
        if (presetIcon === "none" || matrixSize === 0) return null;
        const cx = (matrixSize - 1) / 2;
        const cy = (matrixSize - 1) / 2;
        const r = Math.max(3, Math.floor(matrixSize * 0.14));
        const badgeSize = (r * 2 + 1) * 1.05;
        const badgeX = cx + 0.5 - badgeSize / 2;
        const badgeY = cy + 0.5 - badgeSize / 2;
        const iconSize = badgeSize * 0.65;
        const iconX = badgeX + (badgeSize - iconSize) / 2;
        const iconY = badgeY + (badgeSize - iconSize) / 2;

        return {
            badgeSize,
            badgeX,
            badgeY,
            iconSize,
            iconX,
            iconY,
        };
    }, [presetIcon, matrixSize]);

    const activeIcon = PRESET_ICONS.find((p) => p.id === presetIcon);

    // ==========================================
    // EXPORT: High-Res SVG Generation
    // ==========================================
    const generateSvgString = (targetSize = 1024): string => {
        const quietZone = 3;
        const totalGrid = matrixSize + quietZone * 2;
        const scale = targetSize / totalGrid;

        const hasLabel = frameStyle !== "none" && frameText.trim().length > 0;
        const labelHeight = hasLabel ? (frameStyle === "badge" ? 90 : 70) : 0;
        const finalWidth = targetSize;
        const finalHeight = targetSize + labelHeight;

        let contentSvg = "";

        // Background
        contentSvg += `<rect width="${finalWidth}" height="${finalHeight}" fill="${bgColor}" />`;

        // Card frame style border
        if (frameStyle === "card") {
            contentSvg += `<rect x="12" y="12" width="${finalWidth - 24}" height="${finalHeight - 24}" rx="32" fill="none" stroke="${fgColor}" stroke-opacity="0.15" stroke-width="4" />`;
        }

        // Draw data modules
        for (let y = 0; y < matrixSize; y++) {
            for (let x = 0; x < matrixSize; x++) {
                if (matrixGrid[y]?.[x]) {
                    if (isEyeCell(x, y, matrixSize) || isCenterLogoCell(x, y, matrixSize)) continue;

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

        // Helper to draw eye in SVG
        const appendEyeSvg = (ox: number, oy: number) => {
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

        // Append 3 eyes
        appendEyeSvg(0, 0);
        appendEyeSvg(matrixSize - 7, 0);
        appendEyeSvg(0, matrixSize - 7);

        // Center Logo Badge & SVG Vector
        if (centerBadge && activeIcon?.svgContent) {
            const bx = (centerBadge.badgeX + quietZone) * scale;
            const by = (centerBadge.badgeY + quietZone) * scale;
            const bSize = centerBadge.badgeSize * scale;
            const ix = (centerBadge.iconX + quietZone) * scale;
            const iy = (centerBadge.iconY + quietZone) * scale;
            const iSize = centerBadge.iconSize * scale;

            contentSvg += `<rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" rx="${bSize * 0.28}" fill="${bgColor}" stroke="${fgColor}" stroke-opacity="0.12" stroke-width="${Math.max(1, scale * 0.2)}" />`;
            contentSvg += `<g transform="translate(${ix}, ${iy}) scale(${iSize / 24})" color="${fgColor}">${activeIcon.svgContent}</g>`;
        }

        // Frame Label Text
        if (hasLabel) {
            const textY = targetSize + labelHeight / 2 + 10;
            if (frameStyle === "badge") {
                const badgeW = Math.min(finalWidth - 40, frameText.length * 28 + 60);
                contentSvg += `<rect x="${(finalWidth - badgeW) / 2}" y="${targetSize + 15}" width="${badgeW}" height="${labelHeight - 30}" rx="${(labelHeight - 30) / 2}" fill="${fgColor}" />`;
                contentSvg += `<text x="${finalWidth / 2}" y="${targetSize + 15 + (labelHeight - 30) / 2 + 7}" fill="${bgColor}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="24" text-anchor="middle" letter-spacing="2">${frameText.toUpperCase()}</text>`;
            } else {
                contentSvg += `<text x="${finalWidth / 2}" y="${textY}" fill="${fgColor}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="28" text-anchor="middle" letter-spacing="1.5">${frameText.toUpperCase()}</text>`;
            }
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${finalWidth} ${finalHeight}" width="${finalWidth}" height="${finalHeight}">${contentSvg}</svg>`;
    };

    // ==========================================
    // EXPORT: High-Res PNG Generation via Offscreen Canvas
    // ==========================================
    const generatePngDataUrl = async (targetSize = 2048): Promise<string> => {
        const svgStr = generateSvgString(targetSize);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas context");

        const hasLabel = frameStyle !== "none" && frameText.trim().length > 0;
        const labelHeight = hasLabel ? (frameStyle === "badge" ? 180 : 140) : 0;

        canvas.width = targetSize;
        canvas.height = targetSize + labelHeight;

        const img = new Image();
        img.crossOrigin = "anonymous";
        const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const urlObj = URL.createObjectURL(blob);

        return new Promise<string>((resolve, reject) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(urlObj);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(urlObj);
                reject(err);
            };
            img.src = urlObj;
        });
    };

    // Handle SVG Download
    const handleDownloadSvg = () => {
        setDownloading("svg");
        try {
            const svgStr = generateSvgString(1024);
            const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
            const downloadUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            const slug = url.split("/").pop() || "custom";
            a.download = `GoMono-${slug}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            toast.success("High-res vector SVG downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to export SVG");
        } finally {
            setDownloading(null);
        }
    };

    // Handle PNG Download
    const handleDownloadPng = async () => {
        setDownloading("png");
        try {
            const dataUrl = await generatePngDataUrl(2048);
            const a = document.createElement("a");
            a.href = dataUrl;
            const slug = url.split("/").pop() || "custom";
            a.download = `GoMono-${slug}-2048px.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast.success("Ultra-HD 2048px PNG downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to export PNG");
        } finally {
            setDownloading(null);
        }
    };

    // Handle Copy Image to Clipboard
    const handleCopyImage = async () => {
        try {
            const dataUrl = await generatePngDataUrl(1024);
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blob,
                }),
            ]);
            setCopied(true);
            toast.success("QR image copied to clipboard!");
            setTimeout(() => setCopied(false), 2200);
        } catch (err) {
            console.error(err);
            toast.error("Clipboard copy not supported on this browser");
        }
    };

    const quietZone = 3;
    const totalGrid = matrixSize + quietZone * 2;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl mx-auto">
            {/* ========================================================= */}
            {/* LEFT / TOP: LIVE INTERACTIVE PREVIEW & INSTANT ACTIONS    */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col items-center justify-between rounded-3xl border border-zinc-200/80 bg-zinc-50/70 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/40 backdrop-blur-md">
                <div className="w-full flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                            Studio Live Preview
                        </span>
                    </div>

                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[10px] font-mono font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        Level H • 30% ECC
                    </span>
                </div>

                {/* The QR Canvas Card */}
                <div
                    className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl"
                    style={{
                        backgroundColor: bgColor,
                        border: frameStyle === "card" ? `3px solid ${fgColor}25` : "1px solid rgba(128,128,128,0.15)",
                    }}
                >
                    {/* Frame Badge Header (if badge style) */}
                    {frameStyle === "badge" && frameText.trim() && (
                        <div
                            className="mb-4 rounded-full px-4 py-1 text-xs font-black tracking-widest uppercase shadow-sm"
                            style={{ backgroundColor: fgColor, color: bgColor }}
                        >
                            {frameText}
                        </div>
                    )}

                    {/* Vector QR Code SVG */}
                    <svg
                        viewBox={`0 0 ${totalGrid} ${totalGrid}`}
                        className="w-56 h-56 sm:w-64 sm:h-64 transition-all duration-300"
                        shapeRendering="geometricPrecision"
                    >
                        {/* Background */}
                        <rect width={totalGrid} height={totalGrid} fill={bgColor} />

                        {/* Modules */}
                        <g transform={`translate(${quietZone}, ${quietZone})`}>
                            {matrixGrid.map((row, y) =>
                                row.map((isDark, x) => {
                                    if (!isDark) return null;
                                    if (isEyeCell(x, y, matrixSize) || isCenterLogoCell(x, y, matrixSize)) return null;
                                    return renderModule(x, y);
                                })
                            )}

                            {/* Eyes */}
                            {renderEye(0, 0, "eye-tl")}
                            {renderEye(matrixSize - 7, 0, "eye-tr")}
                            {renderEye(0, matrixSize - 7, "eye-bl")}

                            {/* Center Logo Badge & SVG */}
                            {centerBadge && activeIcon?.svgContent && (
                                <g>
                                    <rect
                                        x={centerBadge.badgeX}
                                        y={centerBadge.badgeY}
                                        width={centerBadge.badgeSize}
                                        height={centerBadge.badgeSize}
                                        rx={centerBadge.badgeSize * 0.28}
                                        ry={centerBadge.badgeSize * 0.28}
                                        fill={bgColor}
                                        stroke={fgColor}
                                        strokeOpacity={0.12}
                                        strokeWidth={0.2}
                                    />
                                    <g
                                        transform={`translate(${centerBadge.iconX}, ${centerBadge.iconY}) scale(${
                                            centerBadge.iconSize / 24
                                        })`}
                                        style={{ color: fgColor }}
                                        dangerouslySetInnerHTML={{ __html: activeIcon.svgContent }}
                                    />
                                </g>
                            )}
                        </g>
                    </svg>

                    {/* Frame Card Bottom Text (if card style) */}
                    {frameStyle === "card" && frameText.trim() && (
                        <div
                            className="mt-4 text-center font-bold tracking-wider text-xs uppercase"
                            style={{ color: fgColor }}
                        >
                            {frameText}
                        </div>
                    )}
                </div>

                {/* Subtitle / Scannability Feedback */}
                <div className="mt-4 text-center">
                    <p className="text-xs font-mono text-zinc-500 max-w-[280px] sm:max-w-xs truncate" title={url}>
                        {url}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                        High error recovery preserves instant camera recognition
                    </p>
                </div>

                {/* Export Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 w-full">
                    {/* Copy Image Button */}
                    <button
                        type="button"
                        onClick={handleCopyImage}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? "Copied" : "Copy Image"}</span>
                    </button>

                    {/* Download SVG Button */}
                    <button
                        type="button"
                        onClick={handleDownloadSvg}
                        disabled={downloading !== null}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50"
                    >
                        <Download className="h-4 w-4 text-purple-500" />
                        <span>Vector SVG</span>
                    </button>

                    {/* Download PNG Button */}
                    <button
                        type="button"
                        onClick={handleDownloadPng}
                        disabled={downloading !== null}
                        className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        <span>Ultra-HD PNG</span>
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT / BOTTOM: STUDIO CUSTOMIZATION CONTROLS              */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                {/* 1. Destination URL / Text Input */}
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                        Target Destination / Text
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter URL or content to encode..."
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                        />
                    </div>
                </div>

                {/* 2. Dot Styles Selector */}
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                        Dot Pattern Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                            [
                                { id: "squares", label: "Classic", desc: "Sharp squares" },
                                { id: "rounded", label: "Rounded", desc: "Smooth squircle" },
                                { id: "dots", label: "Dots", desc: "Minimal circle" },
                                { id: "classy", label: "Classy", desc: "Organic pill" },
                            ] as const
                        ).map((s) => {
                            const isSelected = dotStyle === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setDotStyle(s.id)}
                                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700"
                                    }`}
                                >
                                    <span className="text-xs font-bold">{s.label}</span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{s.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Color Palettes & Custom Hex Pickers */}
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Color Palette
                        </label>
                        <button
                            type="button"
                            onClick={handleSwapColors}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            title="Invert Foreground and Background"
                        >
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>Invert</span>
                        </button>
                    </div>

                    {/* Quick Preset Swatches */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {COLOR_PALETTES.map((p) => {
                            const isSelected = fgColor.toLowerCase() === p.fg.toLowerCase() && bgColor.toLowerCase() === p.bg.toLowerCase();
                            return (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => {
                                        setFgColor(p.fg);
                                        setBgColor(p.bg);
                                    }}
                                    className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                                        isSelected
                                            ? "border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400"
                                    }`}
                                >
                                    <span
                                        className="h-3 w-3 rounded-full border border-black/10 dark:border-white/10 shrink-0"
                                        style={{ backgroundColor: p.fg }}
                                    />
                                    <span>{p.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Color Inputs Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Foreground (Dots)</span>
                            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                                <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="w-full bg-transparent font-mono text-xs uppercase outline-none text-zinc-800 dark:text-zinc-200"
                                />
                            </div>
                        </div>

                        <div>
                            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Background</span>
                            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                                <input
                                    type="color"
                                    value={bgColor === "transparent" ? "#ffffff" : bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-full bg-transparent font-mono text-xs uppercase outline-none text-zinc-800 dark:text-zinc-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Center Vector Logo Selector (Zero-Storage Preset Icons) */}
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Center Vector Icon (Zero-Storage)
                        </label>
                        <span className="text-[10px] text-zinc-400">Auto-excavated</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {PRESET_ICONS.map((p) => {
                            const isSelected = presetIcon === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPresetIcon(p.id)}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                            : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                                    }`}
                                    title={p.label}
                                >
                                    <div className="h-5 w-5 flex items-center justify-center">
                                        {p.id === "none" ? (
                                            <span className="text-[10px] font-bold text-zinc-400">OFF</span>
                                        ) : (
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5"
                                                dangerouslySetInnerHTML={{ __html: p.svgContent }}
                                            />
                                        )}
                                    </div>
                                    <span className="text-[10px] truncate max-w-full font-medium">{p.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Framing & Label */}
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                        Frame & Call to Action
                    </label>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {(
                            [
                                { id: "none", label: "Bare QR" },
                                { id: "card", label: "Card Border" },
                                { id: "badge", label: "Framed Pill" },
                            ] as const
                        ).map((f) => {
                            const isSelected = frameStyle === f.id;
                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFrameStyle(f.id)}
                                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300"
                                            : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>

                    {frameStyle !== "none" && (
                        <div className="relative animate-in fade-in duration-200">
                            <input
                                type="text"
                                value={frameText}
                                onChange={(e) => setFrameText(e.target.value)}
                                maxLength={24}
                                placeholder="e.g. SCAN ME, VISIT SITE"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-900 outline-none transition-all focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Modal dialog wrapper
export default function QrStudioModal({
    isOpen,
    onClose,
    url = "https://to.mono.bro.bd",
}: {
    isOpen: boolean;
    onClose: () => void;
    url?: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 my-auto">
                {/* Modal Header */}
                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                                QR Code Studio
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Vector styling, custom dot patterns, and zero-storage brand icons
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Studio View Component */}
                <QrStudioView initialUrl={url} onClose={onClose} isModal={true} />
            </div>
        </div>
    );
}
