/**
 * Zero-dependency URL tracking parameter stripper and cleaner.
 * Strips invasive marketing click IDs, social share trackers, and tracking parameters
 * while preserving essential query parameters (e.g., search queries, video timestamps, pagination).
 */

export const INVASIVE_TRACKING_PARAMS = new Set([
    // Facebook / Instagram / Meta
    "fbclid",
    "igshid",
    "fb_action_ids",
    "fb_action_types",
    "fb_source",

    // Google / DoubleClick / YouTube
    "gclid",
    "gclsrc",
    "dclid",
    "wbraid",
    "gbraid",
    "_ga",
    "_gl",

    // Microsoft / Bing
    "msclkid",

    // TikTok
    "ttclid",

    // Twitter / X
    "twclid",

    // Mailchimp / HubSpot / Marketing automation
    "mc_cid",
    "mc_eid",
    "_hsenc",
    "_hsmi",
    "mkt_tok",

    // Yandex
    "yclid",

    // Spotify / YouTube share trackings
    "si",
    "sp_attack",

    // Miscellaneous ad networks
    "zanpid",
    "ref_src",
    "ref_url",
]);

export interface CleanTrackingOptions {
    /** Whether to strip utm_* query parameters. Defaults to false. */
    stripUtm?: boolean;
    /** Custom list of additional parameter keys to strip */
    additionalParams?: string[];
}

export interface CleanUrlResult {
    cleanedUrl: string;
    removedParams: string[];
    hasModifications: boolean;
}

/**
 * Strips tracking parameters from a raw URL.
 * Handles missing protocol gracefully by defaulting to https:// if necessary.
 */
export function cleanTrackingParams(
    rawUrl: string,
    options: CleanTrackingOptions = {}
): CleanUrlResult {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
        return { cleanedUrl: "", removedParams: [], hasModifications: false };
    }

    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
    const parseableUrl = hasProtocol ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(parseableUrl);
        const searchParams = parsed.searchParams;
        const removedParams: string[] = [];

        const additionalSet = new Set(options.additionalParams?.map((p) => p.toLowerCase()) || []);

        // Collect all keys to evaluate
        const keys = Array.from(searchParams.keys());

        for (const key of keys) {
            const lowerKey = key.toLowerCase();
            const isUtm = options.stripUtm && lowerKey.startsWith("utm_");
            const isInvasive = INVASIVE_TRACKING_PARAMS.has(lowerKey);
            const isAdditional = additionalSet.has(lowerKey);

            if (isUtm || isInvasive || isAdditional) {
                removedParams.push(key);
                searchParams.delete(key);
            }
        }

        let cleaned = parsed.toString();
        // If the original input didn't have a protocol, restore that structure
        if (!hasProtocol) {
            cleaned = cleaned.replace(/^https?:\/\//, "");
        }

        // Clean up trailing '?' if query string is empty
        if (cleaned.endsWith("?")) {
            cleaned = cleaned.slice(0, -1);
        }

        return {
            cleanedUrl: cleaned,
            removedParams,
            hasModifications: removedParams.length > 0,
        };
    } catch {
        // If URL parsing fails, return raw input unchanged
        return {
            cleanedUrl: rawUrl,
            removedParams: [],
            hasModifications: false,
        };
    }
}
