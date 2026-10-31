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
    Wifi,
    Contact,
    Smartphone,
    Globe,
    Layers,
    Palette,
    Eye,
    Type,
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// TYPES & SCHEMAS
// ==========================================
export type QrContentType = "url" | "wifi" | "vcard" | "appstore";
export type DotStyle = "squares" | "rounded" | "dots" | "classy";
export type FrameStyle = "none" | "badge" | "top-banner" | "card" | "minimal-border";
export type ExportResolution = 1024 | 2048 | 4096;

export interface WifiData {
    ssid: string;
    password: string;
    encryption: "WPA" | "WEP" | "nopass";
    hidden: boolean;
}

export interface VCardData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    organization: string;
    jobTitle: string;
    website: string;
    note: string;
}

export interface AppStoreData {
    fallbackUrl: string;
    iosUrl: string;
    androidUrl: string;
}

export interface PresetIcon {
    id: string;
    label: string;
    category: "General" | "Social" | "Utility";
    svgContent: string;
}

// ==========================================
// CURATED ZERO-STORAGE VECTOR ICONS
// ==========================================
export const PRESET_ICONS: PresetIcon[] = [
    {
        id: "none",
        label: "None",
        category: "General",
        svgContent: "",
    },
    {
        id: "gomono",
        label: "GoMono",
        category: "General",
        svgContent: '<path d="M13 2L4 14h7v8l9-12h-7V2z" fill="currentColor"/>',
    },
    {
        id: "globe",
        label: "Website",
        category: "General",
        svgContent: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2a15 15 0 0 0 0 20M12 2a15 15 0 0 1 0 20M2 12h20" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
    {
        id: "wifi",
        label: "Wi-Fi",
        category: "Utility",
        svgContent: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    },
    {
        id: "contact",
        label: "Contact",
        category: "Utility",
        svgContent: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
    {
        id: "phone",
        label: "Phone",
        category: "Utility",
        svgContent: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
    {
        id: "mail",
        label: "Email",
        category: "Utility",
        svgContent: '<rect width="20" height="16" x="2" y="4" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" stroke-width="2" fill="none"/>',
    },
    {
        id: "appstore",
        label: "Apple App",
        category: "Utility",
        svgContent: '<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.64-.99 1.7-.87 2.73 1 .08 2.01-.51 2.57-1.23z" fill="currentColor"/>',
    },
    {
        id: "playstore",
        label: "Google Play",
        category: "Utility",
        svgContent: '<path d="M3.609 1.814L13.793 12 3.61 22.186A2.21 2.21 0 0 1 3 20.627V3.373c0-.6.22-1.168.609-1.559zM15.207 13.414l2.586 2.586-13.086 7.478 10.5-10.064zm0-2.828L4.707.522 17.793 8l-2.586 2.586zm1.414 1.414l3.779 2.16c1.198.684 1.198 1.801 0 2.486l-3.779 2.16-2.121-2.121 2.121-2.121z" fill="currentColor"/>',
    },
    {
        id: "whatsapp",
        label: "WhatsApp",
        category: "Social",
        svgContent: '<path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h.02z" fill="currentColor"/>',
    },
    {
        id: "instagram",
        label: "Instagram",
        category: "Social",
        svgContent: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>',
    },
    {
        id: "twitter",
        label: "X / Twitter",
        category: "Social",
        svgContent: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>',
    },
    {
        id: "github",
        label: "GitHub",
        category: "Social",
        svgContent: '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="currentColor"/>',
    },
    {
        id: "linkedin",
        label: "LinkedIn",
        category: "Social",
        svgContent: '<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="currentColor"/>',
    },
    {
        id: "youtube",
        label: "YouTube",
        category: "Social",
        svgContent: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>',
    },
    {
        id: "shield",
        label: "Protected",
        category: "General",
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
    { label: "Obsidian", fg: "#ffffff", bg: "#09090b" },
    { label: "Forest", fg: "#15803d", bg: "#f0fdf4" },
    { label: "Cyber Cyan", fg: "#06b6d4", bg: "#0f172a" },
];

// ==========================================
// STRING ENCODING HELPERS
// ==========================================
function escapeWifi(str: string): string {
    return str.replace(/([\\;,:"])/g, "\\$1");
}

function generateWifiString(data: WifiData): string {
    if (!data.ssid.trim()) return "";
    return `WIFI:S:${escapeWifi(data.ssid)};T:${data.encryption};P:${escapeWifi(data.password)};H:${data.hidden ? "true" : "false"};;`;
}

function generateVCardString(data: VCardData): string {
    const fullName = [data.firstName.trim(), data.lastName.trim()].filter(Boolean).join(" ");
    if (!fullName && !data.phone.trim() && !data.email.trim()) return "";

    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${data.lastName.trim()};${data.firstName.trim()};;;`,
        `FN:${fullName || "Contact"}`,
    ];
    if (data.organization.trim()) lines.push(`ORG:${data.organization.trim()}`);
    if (data.jobTitle.trim()) lines.push(`TITLE:${data.jobTitle.trim()}`);
    if (data.phone.trim()) lines.push(`TEL;TYPE=CELL:${data.phone.trim()}`);
    if (data.email.trim()) lines.push(`EMAIL:${data.email.trim()}`);
    if (data.website.trim()) lines.push(`URL:${data.website.trim()}`);
    if (data.note.trim()) lines.push(`NOTE:${data.note.trim()}`);
    lines.push("END:VCARD");
    return lines.join("\n");
}

interface QrStudioProps {
    initialUrl?: string;
    onClose?: () => void;
    isModal?: boolean;
}

export function QrStudioView({ initialUrl = "https://go.mono.bro.bd" }: QrStudioProps) {
    // 1. Content Type State
    const [contentType, setContentType] = useState<QrContentType>("url");
    const [urlInput, setUrlInput] = useState(initialUrl);
    const [prevInitialUrl, setPrevInitialUrl] = useState(initialUrl);

    // Sync state when initialUrl changes without effect cascade
    if (initialUrl !== prevInitialUrl) {
        setPrevInitialUrl(initialUrl);
        setUrlInput(initialUrl);
    }

    const [wifiData, setWifiData] = useState<WifiData>({
        ssid: "",
        password: "",
        encryption: "WPA",
        hidden: false,
    });

    const [vcardData, setVcardData] = useState<VCardData>({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        organization: "",
        jobTitle: "",
        website: "",
        note: "",
    });

    const [appStoreData, setAppStoreData] = useState<AppStoreData>({
        fallbackUrl: initialUrl || "https://go.mono.bro.bd",
        iosUrl: "",
        androidUrl: "",
    });

    // 2. Pro Styling States
    const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
    const [fgColor, setFgColor] = useState("#09090b");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [isTransparent, setIsTransparent] = useState(false);
    const [presetIcon, setPresetIcon] = useState<string>("gomono");

    // 3. Scan Frame & CTA Banner States
    const [frameStyle, setFrameStyle] = useState<FrameStyle>("badge");
    const [frameText, setFrameText] = useState("SCAN ME");

    // 4. Export & Utility States
    const [exportResolution, setExportResolution] = useState<ExportResolution>(2048);
    const [downloading, setDownloading] = useState<"png" | "svg" | null>(null);
    const [copiedPayload, setCopiedPayload] = useState(false);
    const [copiedSvg, setCopiedSvg] = useState(false);
    const [activeTab, setActiveTab] = useState<"content" | "style" | "branding" | "frame">("content");

    // Calculate computed encoded QR raw text
    const encodedPayload = useMemo(() => {
        switch (contentType) {
            case "wifi":
                return generateWifiString(wifiData) || "WIFI:S:GoMono_Hotspot;T:WPA;P:GoMonoSecret;;";
            case "vcard":
                return generateVCardString(vcardData) || "BEGIN:VCARD\nVERSION:3.0\nFN:GoMono Contact\nEND:VCARD";
            case "appstore":
                return appStoreData.fallbackUrl.trim() || initialUrl || "https://go.mono.bro.bd";
            case "url":
            default:
                return urlInput.trim() || "https://go.mono.bro.bd";
        }
    }, [contentType, urlInput, wifiData, vcardData, appStoreData, initialUrl]);

    // Handle Content Type Switch & Context-Aware Defaults
    const handleSwitchContentType = (type: QrContentType) => {
        setContentType(type);
        if (type === "wifi") {
            setPresetIcon("wifi");
            setFrameText("CONNECT TO WI-FI");
        } else if (type === "vcard") {
            setPresetIcon("contact");
            setFrameText("SAVE CONTACT");
        } else if (type === "appstore") {
            setPresetIcon("appstore");
            setFrameText("GET THE APP");
        } else {
            setPresetIcon("gomono");
            setFrameText("SCAN ME");
        }
    };

    // Swap foreground and background colors
    const handleSwapColors = () => {
        if (isTransparent) {
            setIsTransparent(false);
        }
        setFgColor(bgColor);
        setBgColor(fgColor);
    };

    // Compute matrix grid from rendered QR code
    const { matrixSize, matrixGrid } = useMemo(() => {
        const qrElement = (
            <QRCodeSVG
                value={encodedPayload}
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
    }, [encodedPayload]);

    const isEyeCell = (x: number, y: number, n: number) => {
        if (x < 7 && y < 7) return true; // Top-left
        if (x >= n - 7 && y < 7) return true; // Top-right
        if (x < 7 && y >= n - 7) return true; // Bottom-left
        return false;
    };

    const isCenterLogoCell = (x: number, y: number, n: number) => {
        if (presetIcon === "none") return false;
        const cx = (n - 1) / 2;
        const cy = (n - 1) / 2;
        const r = Math.max(3, Math.floor(n * 0.14));
        return Math.abs(x - cx) <= r && Math.abs(y - cy) <= r;
    };

    // Render individual module
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

    // Render finder eyes
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

        const eyeBg = isTransparent ? "transparent" : bgColor;

        return (
            <g key={id}>
                <rect x={ox} y={oy} width={7} height={7} rx={outerRx} ry={outerRx} fill={fgColor} />
                <rect x={ox + 1} y={oy + 1} width={5} height={5} rx={innerRx} ry={innerRx} fill={eyeBg} />
                {dotStyle === "dots" ? (
                    <circle cx={ox + 3.5} cy={oy + 3.5} r={1.4} fill={fgColor} />
                ) : (
                    <rect x={ox + 2} y={oy + 2} width={3} height={3} rx={coreRx} ry={coreRx} fill={fgColor} />
                )}
            </g>
        );
    };

    // Center badge geometry
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

        return { badgeSize, badgeX, badgeY, iconSize, iconX, iconY };
    }, [presetIcon, matrixSize]);

    const activeIcon = PRESET_ICONS.find((p) => p.id === presetIcon);

    // ==========================================
    // EXPORT: High-Res SVG Generator
    // ==========================================
    const generateSvgString = (targetSize = 1024): string => {
        const quietZone = 3;
        const totalGrid = matrixSize + quietZone * 2;
        const scale = targetSize / totalGrid;

        const hasLabel = frameStyle !== "none" && frameText.trim().length > 0;
        const isTopBanner = frameStyle === "top-banner";
        const isBottomBadge = frameStyle === "badge";
        const isCard = frameStyle === "card";
        const isMinimalBorder = frameStyle === "minimal-border";

        let bannerHeight = 0;
        if (hasLabel) {
            bannerHeight = isTopBanner || isBottomBadge ? 110 : 80;
        }

        const finalWidth = targetSize;
        const finalHeight = targetSize + (hasLabel ? bannerHeight : 0);
        const effectiveBgColor = isTransparent ? "transparent" : bgColor;

        let contentSvg = "";

        // Background
        if (!isTransparent) {
            contentSvg += `<rect width="${finalWidth}" height="${finalHeight}" fill="${effectiveBgColor}" />`;
        }

        // Card Frame Style Border
        if (isCard) {
            contentSvg += `<rect x="12" y="12" width="${finalWidth - 24}" height="${finalHeight - 24}" rx="32" fill="none" stroke="${fgColor}" stroke-opacity="0.18" stroke-width="4" />`;
        } else if (isMinimalBorder) {
            contentSvg += `<rect x="8" y="8" width="${finalWidth - 16}" height="${finalHeight - 16}" rx="16" fill="none" stroke="${fgColor}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="8 6" />`;
        }

        // Offset Y if Top Banner is active
        const qrOffsetY = isTopBanner && hasLabel ? bannerHeight : 0;

        // Top Banner Layout
        if (isTopBanner && hasLabel) {
            const bannerW = Math.min(finalWidth - 40, frameText.length * 28 + 80);
            const bannerX = (finalWidth - bannerW) / 2;
            contentSvg += `<rect x="${bannerX}" y="20" width="${bannerW}" height="64" rx="32" fill="${fgColor}" />`;
            contentSvg += `<text x="${finalWidth / 2}" y="60" fill="${bgColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">${frameText.toUpperCase()}</text>`;
        }

        // Draw Data Modules
        for (let y = 0; y < matrixSize; y++) {
            for (let x = 0; x < matrixSize; x++) {
                if (matrixGrid[y]?.[x]) {
                    if (isEyeCell(x, y, matrixSize) || isCenterLogoCell(x, y, matrixSize)) continue;

                    const px = (x + quietZone) * scale;
                    const py = (y + quietZone) * scale + qrOffsetY;
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

        // Helper to append eye
        const appendEyeSvg = (ox: number, oy: number) => {
            const ex = (ox + quietZone) * scale;
            const ey = (oy + quietZone) * scale + qrOffsetY;
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
            contentSvg += `<rect x="${ex + scale}" y="${ey + scale}" width="${scale * 5}" height="${scale * 5}" rx="${iRx}" fill="${effectiveBgColor}" />`;

            if (dotStyle === "dots") {
                contentSvg += `<circle cx="${ex + scale * 3.5}" cy="${ey + scale * 3.5}" r="${scale * 1.4}" fill="${fgColor}" />`;
            } else {
                contentSvg += `<rect x="${ex + scale * 2}" y="${ey + scale * 2}" width="${scale * 3}" height="${scale * 3}" rx="${cRx}" fill="${fgColor}" />`;
            }
        };

        appendEyeSvg(0, 0);
        appendEyeSvg(matrixSize - 7, 0);
        appendEyeSvg(0, matrixSize - 7);

        // Center Logo Badge & SVG Vector
        if (centerBadge && activeIcon?.svgContent) {
            const bx = (centerBadge.badgeX + quietZone) * scale;
            const by = (centerBadge.badgeY + quietZone) * scale + qrOffsetY;
            const bSize = centerBadge.badgeSize * scale;
            const ix = (centerBadge.iconX + quietZone) * scale;
            const iy = (centerBadge.iconY + quietZone) * scale + qrOffsetY;
            const iSize = centerBadge.iconSize * scale;

            contentSvg += `<rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" rx="${bSize * 0.28}" fill="${effectiveBgColor}" stroke="${fgColor}" stroke-opacity="0.16" stroke-width="${Math.max(1, scale * 0.25)}" />`;
            contentSvg += `<g transform="translate(${ix}, ${iy}) scale(${iSize / 24})" color="${fgColor}">${activeIcon.svgContent}</g>`;
        }

        // Bottom Frame Labels (badge / card / minimal)
        if (!isTopBanner && hasLabel) {
            const labelAreaY = targetSize;
            if (isBottomBadge) {
                const badgeW = Math.min(finalWidth - 40, frameText.length * 28 + 80);
                const badgeX = (finalWidth - badgeW) / 2;
                contentSvg += `<rect x="${badgeX}" y="${labelAreaY + 20}" width="${badgeW}" height="64" rx="32" fill="${fgColor}" />`;
                contentSvg += `<text x="${finalWidth / 2}" y="${labelAreaY + 60}" fill="${bgColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="2">${frameText.toUpperCase()}</text>`;
            } else {
                contentSvg += `<text x="${finalWidth / 2}" y="${labelAreaY + bannerHeight / 2 + 8}" fill="${fgColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="26" text-anchor="middle" letter-spacing="1.5">${frameText.toUpperCase()}</text>`;
            }
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${finalWidth} ${finalHeight}" width="${finalWidth}" height="${finalHeight}">${contentSvg}</svg>`;
    };

    // ==========================================
    // EXPORT: High-Res PNG Generator via Offscreen Canvas
    // ==========================================
    const generatePngDataUrl = async (targetSize: number): Promise<string> => {
        const svgStr = generateSvgString(targetSize);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas context");

        const hasLabel = frameStyle !== "none" && frameText.trim().length > 0;
        let bannerHeight = 0;
        if (hasLabel) {
            bannerHeight = frameStyle === "top-banner" || frameStyle === "badge" ? Math.round(targetSize * 0.12) : Math.round(targetSize * 0.09);
        }

        canvas.width = targetSize;
        canvas.height = targetSize + (hasLabel ? bannerHeight : 0);

        const img = new Image();
        img.crossOrigin = "anonymous";
        const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const urlObj = URL.createObjectURL(blob);

        return new Promise<string>((resolve, reject) => {
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            a.download = `GoMono-${contentType}-qr.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            toast.success("High-definition vector SVG downloaded!");
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
            const dataUrl = await generatePngDataUrl(exportResolution);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `GoMono-${contentType}-${exportResolution}px.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast.success(`Ultra-HD ${exportResolution}px PNG downloaded!`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to export PNG");
        } finally {
            setDownloading(null);
        }
    };

    // Handle Copy SVG Code
    const handleCopySvgCode = () => {
        try {
            const svgStr = generateSvgString(1024);
            navigator.clipboard.writeText(svgStr);
            setCopiedSvg(true);
            toast.success("SVG vector code copied to clipboard!");
            setTimeout(() => setCopiedSvg(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy SVG code");
        }
    };

    // Handle Copy Raw Encoded String
    const handleCopyPayload = () => {
        try {
            navigator.clipboard.writeText(encodedPayload);
            setCopiedPayload(true);
            toast.success("Raw QR payload copied to clipboard!");
            setTimeout(() => setCopiedPayload(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy payload");
        }
    };

    const quietZone = 3;
    const totalGrid = matrixSize + quietZone * 2;
    const isTopBanner = frameStyle === "top-banner";
    const hasFrameLabel = frameStyle !== "none" && frameText.trim().length > 0;

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto">
            {/* ========================================================= */}
            {/* LEFT / TOP: LIVE INTERACTIVE PREVIEW & INSTANT ACTIONS    */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col items-center justify-between rounded-3xl border border-zinc-200/80 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/40 backdrop-blur-md shadow-xs">
                {/* Header status bar */}
                <div className="w-full flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Studio Live Preview
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-indigo-200 bg-indigo-50/70 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 uppercase tracking-wider">
                            {contentType}
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                            ECC Level H
                        </span>
                    </div>
                </div>

                {/* The QR Canvas Card Preview */}
                <div
                    className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-2xl"
                    style={{
                        backgroundColor: isTransparent ? "transparent" : bgColor,
                        border: frameStyle === "card" ? `3px solid ${fgColor}25` : frameStyle === "minimal-border" ? `2px dashed ${fgColor}35` : "1px solid rgba(128,128,128,0.15)",
                    }}
                >
                    {/* Top Banner (if selected) */}
                    {isTopBanner && hasFrameLabel && (
                        <div
                            className="mb-4 rounded-full px-5 py-1.5 text-xs font-black tracking-widest uppercase shadow-md transition-all"
                            style={{ backgroundColor: fgColor, color: bgColor }}
                        >
                            {frameText}
                        </div>
                    )}

                    {/* Vector QR Code Render */}
                    <svg
                        viewBox={`0 0 ${totalGrid} ${totalGrid}`}
                        className="w-56 h-56 sm:w-64 sm:h-64 transition-all duration-300"
                        shapeRendering="geometricPrecision"
                    >
                        {!isTransparent && (
                            <rect width={totalGrid} height={totalGrid} fill={bgColor} />
                        )}

                        <g transform={`translate(${quietZone}, ${quietZone})`}>
                            {matrixGrid.map((row, y) =>
                                row.map((isDark, x) => {
                                    if (!isDark) return null;
                                    if (isEyeCell(x, y, matrixSize) || isCenterLogoCell(x, y, matrixSize)) return null;
                                    return renderModule(x, y);
                                })
                            )}

                            {renderEye(0, 0, "eye-tl")}
                            {renderEye(matrixSize - 7, 0, "eye-tr")}
                            {renderEye(0, matrixSize - 7, "eye-bl")}

                            {/* Center Logo Badge */}
                            {centerBadge && activeIcon?.svgContent && (
                                <g>
                                    <rect
                                        x={centerBadge.badgeX}
                                        y={centerBadge.badgeY}
                                        width={centerBadge.badgeSize}
                                        height={centerBadge.badgeSize}
                                        rx={centerBadge.badgeSize * 0.28}
                                        ry={centerBadge.badgeSize * 0.28}
                                        fill={isTransparent ? "#ffffff" : bgColor}
                                        stroke={fgColor}
                                        strokeOpacity={0.16}
                                        strokeWidth={0.25}
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

                    {/* Bottom Badge or Card Label */}
                    {!isTopBanner && hasFrameLabel && (
                        <div
                            className={`mt-4 text-center font-black tracking-widest text-xs uppercase ${
                                frameStyle === "badge"
                                    ? "rounded-full px-5 py-1.5 shadow-md"
                                    : "tracking-wider"
                            }`}
                            style={{
                                backgroundColor: frameStyle === "badge" ? fgColor : "transparent",
                                color: frameStyle === "badge" ? bgColor : fgColor,
                            }}
                        >
                            {frameText}
                        </div>
                    )}
                </div>

                {/* Subtitle / Scannability Feedback */}
                <div className="mt-5 text-center w-full max-w-sm">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        <span className="truncate max-w-[240px]" title={encodedPayload}>
                            {contentType === "wifi" ? `Wi-Fi: ${wifiData.ssid || "Network"}` : contentType === "vcard" ? `Contact: ${vcardData.firstName || "Name"}` : encodedPayload}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyPayload}
                            className="text-zinc-400 hover:text-indigo-500 transition-colors p-1"
                            title="Copy encoded payload text"
                        >
                            {copiedPayload ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                        Zero server storage • 30% error correction preserves readability
                    </p>
                </div>

                {/* Export Options & Actions Bar */}
                <div className="mt-6 flex flex-col gap-3 w-full">
                    {/* Resolution selector */}
                    <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950 text-xs">
                        <span className="font-medium text-zinc-500">Raster Output Scale:</span>
                        <div className="flex items-center gap-1">
                            {([1024, 2048, 4096] as ExportResolution[]).map((res) => (
                                <button
                                    key={res}
                                    type="button"
                                    onClick={() => setExportResolution(res)}
                                    className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-all ${
                                        exportResolution === res
                                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                    }`}
                                >
                                    {res === 4096 ? "4K (4096px)" : `${res}px`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Download SVG */}
                        <button
                            type="button"
                            onClick={handleDownloadSvg}
                            disabled={downloading !== null}
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <Download className="h-4 w-4 text-indigo-500" />
                            <span>Vector SVG</span>
                        </button>

                        {/* Download PNG */}
                        <button
                            type="button"
                            onClick={handleDownloadPng}
                            disabled={downloading !== null}
                            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            <span>Download PNG</span>
                        </button>

                        {/* Copy SVG code */}
                        <button
                            type="button"
                            onClick={handleCopySvgCode}
                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-xs hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                            title="Copy raw SVG markup"
                        >
                            {copiedSvg ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT / BOTTOM: STUDIO CUSTOMIZATION WORKBENCH             */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                {/* Navigation Pills across Studio Sections */}
                <div className="flex items-center rounded-2xl border border-zinc-200/90 bg-zinc-100/70 p-1.5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    {(
                        [
                            { id: "content", label: "Content", icon: Layers },
                            { id: "style", label: "Patterns", icon: Eye },
                            { id: "branding", label: "Colors & Logo", icon: Palette },
                            { id: "frame", label: "Frame & CTA", icon: Type },
                        ] as const
                    ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                                    isActive
                                        ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: ADVANCED QR CONTENT TYPES */}
                {activeTab === "content" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Content Type Selector */}
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                                Select Content Type
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(
                                    [
                                        { id: "url", label: "Website URL", icon: Globe, desc: "Standard link" },
                                        { id: "wifi", label: "Wi-Fi Access", icon: Wifi, desc: "Auto connect" },
                                        { id: "vcard", label: "vCard Business", icon: Contact, desc: "Digital contact" },
                                        { id: "appstore", label: "Smart Redirect", icon: Smartphone, desc: "iOS / Android" },
                                    ] as const
                                ).map((t) => {
                                    const Icon = t.icon;
                                    const isSelected = contentType === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => handleSwitchContentType(t.id)}
                                            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                                                isSelected
                                                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                                            }`}
                                        >
                                            <Icon className={`h-4 w-4 mb-2 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                                            <span className="text-xs font-bold">{t.label}</span>
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{t.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content Fields according to selected type */}
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                            {contentType === "url" && (
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Destination Website URL
                                    </label>
                                    <input
                                        type="url"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                    />
                                    <p className="text-[11px] text-zinc-500">
                                        Generates a standard HTTP/HTTPS redirection QR scannable by all smartphones and barcode readers.
                                    </p>
                                </div>
                            )}

                            {contentType === "wifi" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                            Wi-Fi Network Credentials
                                        </h4>
                                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5">
                                            Instant Join
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Network Name (SSID) *</label>
                                        <input
                                            type="text"
                                            value={wifiData.ssid}
                                            onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                            placeholder="e.g. Office_Guest_5G"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Wi-Fi Password</label>
                                            <input
                                                type="text"
                                                value={wifiData.password}
                                                onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                                placeholder="Leave empty for open networks"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Security Encryption</label>
                                            <select
                                                value={wifiData.encryption}
                                                onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value as "WPA" | "WEP" | "nopass" })}
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            >
                                                <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                                                <option value="WEP">WEP (Legacy)</option>
                                                <option value="nopass">None (Open Network)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
                                        <input
                                            type="checkbox"
                                            checked={wifiData.hidden}
                                            onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Hidden SSID Network</span>
                                    </label>
                                </div>
                            )}

                            {contentType === "vcard" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                            vCard Digital Business Card
                                        </h4>
                                        <span className="text-[10px] text-zinc-400">vCard 3.0 Standard</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">First Name *</label>
                                            <input
                                                type="text"
                                                value={vcardData.firstName}
                                                onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })}
                                                placeholder="Alex"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                value={vcardData.lastName}
                                                onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
                                                placeholder="Rivera"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Mobile Phone *</label>
                                            <input
                                                type="tel"
                                                value={vcardData.phone}
                                                onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                                                placeholder="+1 (555) 019-2834"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={vcardData.email}
                                                onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                                                placeholder="alex@company.com"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Organization / Brand</label>
                                            <input
                                                type="text"
                                                value={vcardData.organization}
                                                onChange={(e) => setVcardData({ ...vcardData, organization: e.target.value })}
                                                placeholder="GoMono Technologies"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={vcardData.jobTitle}
                                                onChange={(e) => setVcardData({ ...vcardData, jobTitle: e.target.value })}
                                                placeholder="Lead Architect"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {contentType === "appstore" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                            Device Smart Redirect Link
                                        </h4>
                                        <span className="text-[10px] text-blue-500 font-semibold">Hardware-Aware</span>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-zinc-500 mb-1">Smart Routing Link / Primary Target *</label>
                                        <input
                                            type="url"
                                            value={appStoreData.fallbackUrl}
                                            onChange={(e) => setAppStoreData({ ...appStoreData, fallbackUrl: e.target.value })}
                                            placeholder="https://go.mono.bro.bd/my-app"
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">iOS App Store URL (Optional)</label>
                                            <input
                                                type="url"
                                                value={appStoreData.iosUrl}
                                                onChange={(e) => setAppStoreData({ ...appStoreData, iosUrl: e.target.value })}
                                                placeholder="https://apps.apple.com/app/id..."
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">Google Play Store URL (Optional)</label>
                                            <input
                                                type="url"
                                                value={appStoreData.androidUrl}
                                                onChange={(e) => setAppStoreData({ ...appStoreData, androidUrl: e.target.value })}
                                                placeholder="https://play.google.com/store/apps/..."
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-zinc-500">
                                        Pairs with GoMono&apos;s device smart routing engine: iPhone scans redirect to Apple App Store, Android to Google Play, and desktop to the website.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: PRO DOT PATTERNS */}
                {activeTab === "style" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                                Dot Pattern Style
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {(
                                    [
                                        { id: "squares", label: "Classic Crisp", desc: "Industrial square modules" },
                                        { id: "rounded", label: "Modern Squircle", desc: "Smooth rounded rectangles" },
                                        { id: "dots", label: "Circular Dots", desc: "Sleek circular matrix" },
                                        { id: "classy", label: "Organic Classy", desc: "Refined aesthetic diamond pills" },
                                    ] as const
                                ).map((s) => {
                                    const isSelected = dotStyle === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setDotStyle(s.id)}
                                            className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                                                isSelected
                                                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                                            }`}
                                        >
                                            <span className="text-xs font-bold">{s.label}</span>
                                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{s.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: PRO COLOR PALETTES & ZERO-STORAGE LOGOS */}
                {activeTab === "branding" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Color Customization */}
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Palette Swatches & Transparency
                                </label>
                                <button
                                    type="button"
                                    onClick={handleSwapColors}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                    title="Invert Colors"
                                >
                                    <ArrowLeftRight className="h-3 w-3" />
                                    <span>Invert</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {COLOR_PALETTES.map((p) => {
                                    const isSelected = !isTransparent && fgColor.toLowerCase() === p.fg.toLowerCase() && bgColor.toLowerCase() === p.bg.toLowerCase();
                                    return (
                                        <button
                                            key={p.label}
                                            type="button"
                                            onClick={() => {
                                                setIsTransparent(false);
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

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Foreground (Modules)</span>
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
                                            disabled={isTransparent}
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent disabled:opacity-30"
                                        />
                                        <input
                                            type="text"
                                            disabled={isTransparent}
                                            value={isTransparent ? "TRANSPARENT" : bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-full bg-transparent font-mono text-xs uppercase outline-none text-zinc-800 dark:text-zinc-200 disabled:opacity-40"
                                        />
                                    </div>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400">
                                <input
                                    type="checkbox"
                                    checked={isTransparent}
                                    onChange={(e) => setIsTransparent(e.target.checked)}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Transparent Background (Ideal for overlays & dark mode print)</span>
                            </label>
                        </div>

                        {/* Zero-Storage Center Icons */}
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                        Center Brand Icon
                                    </h4>
                                    <p className="text-[11px] text-zinc-400">
                                        Zero-storage vector presets auto-excavated at center
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    0 KB Server Load
                                </span>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                                {PRESET_ICONS.map((p) => {
                                    const isSelected = presetIcon === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPresetIcon(p.id)}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${
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
                    </div>
                )}

                {/* TAB 4: SCAN FRAMES & CTA BANNERS */}
                {activeTab === "frame" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                                Marketing Frame Style
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                                {(
                                    [
                                        { id: "none", label: "Bare QR", desc: "No frame" },
                                        { id: "badge", label: "Bottom Pill", desc: "High-contrast CTA" },
                                        { id: "top-banner", label: "Top Header", desc: "Prominent title" },
                                        { id: "card", label: "Card Frame", desc: "Border + text" },
                                        { id: "minimal-border", label: "Dashed Outline", desc: "Subtle perimeter" },
                                    ] as const
                                ).map((f) => {
                                    const isSelected = frameStyle === f.id;
                                    return (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setFrameStyle(f.id)}
                                            className={`p-3 rounded-2xl border text-left transition-all ${
                                                isSelected
                                                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                                            }`}
                                        >
                                            <span className="block text-xs font-bold">{f.label}</span>
                                            <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{f.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {frameStyle !== "none" && (
                                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        Custom Call To Action Text
                                    </label>
                                    <input
                                        type="text"
                                        value={frameText}
                                        onChange={(e) => setFrameText(e.target.value)}
                                        maxLength={24}
                                        placeholder="e.g. SCAN ME, CONNECT TO WIFI"
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-900 outline-none transition focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                    />

                                    {/* Quick suggestion pills */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {(
                                            contentType === "wifi"
                                                ? ["CONNECT TO WI-FI", "FREE WI-FI", "SCAN FOR PASSWORD"]
                                                : contentType === "vcard"
                                                ? ["SAVE CONTACT", "ADD TO CONTACTS", "DIGITAL CARD"]
                                                : contentType === "appstore"
                                                ? ["GET THE APP", "DOWNLOAD APP", "SCAN TO INSTALL"]
                                                : ["SCAN ME", "VISIT WEBSITE", "LEARN MORE"]
                                        ).map((sugg) => (
                                            <button
                                                key={sugg}
                                                type="button"
                                                onClick={() => setFrameText(sugg)}
                                                className="rounded-lg border border-zinc-200 bg-zinc-100/60 px-2 py-1 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                                            >
                                                {sugg}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Modal dialog wrapper
export default function QrStudioModal({
    isOpen,
    onClose,
    url = "https://go.mono.bro.bd",
}: {
    isOpen: boolean;
    onClose: () => void;
    url?: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-6xl rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 my-auto">
                {/* Modal Header */}
                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Enterprise QR Code Studio
                                </h2>
                                <span className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                    Dual-Mode
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Vector styling, zero-storage brand logos, Wi-Fi, vCard, and device smart redirect
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
