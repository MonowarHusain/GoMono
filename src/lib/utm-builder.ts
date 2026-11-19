/**
 * UTM Parameter Builder & Parser Utility
 * Pure functions to safely build, append, sanitize, and parse UTM campaign tracking parameters
 * with 100% preservation of existing query parameters and URL hash fragments.
 */

export interface UtmParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

const UTM_KEYS: Array<keyof UtmParams> = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
];

/**
 * Builds a valid target URL with appended or updated UTM parameters.
 * Preserves existing non-UTM query parameters and hash fragments.
 */
export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
    const trimmedUrl = baseUrl.trim();
    if (!trimmedUrl) return "";

    try {
        // Ensure standard protocol for URL constructor if omitted
        const hasProtocol = /^https?:\/\//i.test(trimmedUrl);
        const parseableUrl = hasProtocol ? trimmedUrl : `https://${trimmedUrl}`;

        const parsed = new URL(parseableUrl);

        // Update or remove each UTM parameter
        for (const key of UTM_KEYS) {
            const rawValue = params[key];
            const value = typeof rawValue === "string" ? rawValue.trim() : "";

            if (value) {
                parsed.searchParams.set(key, value);
            } else {
                parsed.searchParams.delete(key);
            }
        }

        // Reconstruct URL while maintaining original scheme presence if user entered no scheme
        const finalUrl = parsed.toString();
        if (!hasProtocol && finalUrl.startsWith("https://")) {
            return finalUrl; // Return standard valid https URL
        }
        return finalUrl;
    } catch {
        // Fallback for malformed URLs
        return trimmedUrl;
    }
}

/**
 * Parses a URL into its clean base representation (without UTM parameters)
 * and extracts any existing UTM parameter values.
 */
export function parseUtmUrl(url: string): {
    baseUrlWithoutUtm: string;
    params: UtmParams;
} {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
        return { baseUrlWithoutUtm: "", params: {} };
    }

    try {
        const hasProtocol = /^https?:\/\//i.test(trimmedUrl);
        const parseableUrl = hasProtocol ? trimmedUrl : `https://${trimmedUrl}`;
        const parsed = new URL(parseableUrl);

        const params: UtmParams = {};

        for (const key of UTM_KEYS) {
            const val = parsed.searchParams.get(key);
            if (val) {
                params[key] = val;
                parsed.searchParams.delete(key);
            }
        }

        const baseUrlWithoutUtm = parsed.toString();
        return {
            baseUrlWithoutUtm,
            params,
        };
    } catch {
        return {
            baseUrlWithoutUtm: trimmedUrl,
            params: {},
        };
    }
}

/**
 * Popular channel presets for fast 1-click campaign tagging.
 */
export interface UtmPreset {
    id: string;
    label: string;
    icon?: string;
    source: string;
    medium: string;
}

export const POPULAR_UTM_PRESETS: UtmPreset[] = [
    { id: "x", label: "X / Twitter", source: "twitter", medium: "social" },
    { id: "linkedin", label: "LinkedIn", source: "linkedin", medium: "social" },
    { id: "whatsapp", label: "WhatsApp", source: "whatsapp", medium: "chat" },
    { id: "newsletter", label: "Newsletter", source: "newsletter", medium: "email" },
    { id: "qr_print", label: "QR Print Flyer", source: "qr_flyer", medium: "print" },
    { id: "google_cpc", label: "Google Ads", source: "google", medium: "cpc" },
];
