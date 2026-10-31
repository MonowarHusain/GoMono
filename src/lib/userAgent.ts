export type DeviceCategory = "Mobile" | "Tablet" | "Desktop";

export interface ParsedUserAgent {
    device: DeviceCategory;
    browser: string;
    os: string;
}

export function parseUserAgent(uaString: string | null | undefined): ParsedUserAgent {
    const ua = uaString || "";

    // 1. Device category detection
    let device: DeviceCategory = "Desktop";
    if (/(ipad|tablet|(android(?!.*mobile))|kindle|silk|playbook)/i.test(ua)) {
        device = "Tablet";
    } else if (/(mobi|iphone|ipod|android.*mobile|blackberry|phone|iemobile|opera mini)/i.test(ua)) {
        device = "Mobile";
    }

    // 2. Operating System detection
    let os = "Other";
    if (/iphone|ipad|ipod/i.test(ua)) {
        os = "iOS";
    } else if (/android/i.test(ua)) {
        os = "Android";
    } else if (/macintosh|mac os x/i.test(ua)) {
        os = "macOS";
    } else if (/windows nt|windows/i.test(ua)) {
        os = "Windows";
    } else if (/linux/i.test(ua)) {
        os = "Linux";
    } else if (/cros/i.test(ua)) {
        os = "ChromeOS";
    }

    // 3. Browser detection (order matters because many browsers include 'Safari' or 'Chrome' in UA)
    let browser = "Other";
    if (/edg/i.test(ua)) {
        browser = "Edge";
    } else if (/opr|opera/i.test(ua)) {
        browser = "Opera";
    } else if (/samsungbrowser/i.test(ua)) {
        browser = "Samsung Internet";
    } else if (/firefox|fxios/i.test(ua)) {
        browser = "Firefox";
    } else if (/chrome|crios/i.test(ua)) {
        browser = "Chrome";
    } else if (/safari/i.test(ua)) {
        browser = "Safari";
    }

    return { device, browser, os };
}

export function sanitizeFieldKey(key: string): string {
    return key
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/^_+|_+$/g, "") || "other";
}

