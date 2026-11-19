/**
 * Zero-API Accept-Language Locale Router Utility
 * Parses incoming browser HTTP Accept-Language headers (RFC 7231)
 * and resolves localized destinations without paid GeoIP or IP lookup APIs.
 */

export interface LocalePreference {
    tag: string; // Exact tag, e.g. "fr-CH", "en-US", "es"
    lang: string; // Primary language code, e.g. "fr", "en", "es"
    quality: number; // q-factor [0, 1]
}

export interface LocaleResolutionResult {
    destinationUrl: string;
    matchedLocale: string | null;
    quality: number;
}

export interface PopularLocale {
    code: string;
    label: string;
    nativeName: string;
}

export const POPULAR_LOCALES: PopularLocale[] = [
    { code: "bn", label: "Bengali", nativeName: "বাংলা" },
    { code: "es", label: "Spanish", nativeName: "Español" },
    { code: "fr", label: "French", nativeName: "Français" },
    { code: "de", label: "German", nativeName: "Deutsch" },
    { code: "ar", label: "Arabic", nativeName: "العربية" },
    { code: "ja", label: "Japanese", nativeName: "日本語" },
    { code: "pt", label: "Portuguese", nativeName: "Português" },
    { code: "zh", label: "Chinese", nativeName: "中文" },
    { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
    { code: "ru", label: "Russian", nativeName: "Русский" },
];

/**
 * Parses standard Accept-Language header into a sorted array of preferences.
 * Example input: "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5"
 */
export function parseAcceptLanguage(header: string | null | undefined): LocalePreference[] {
    if (!header || typeof header !== "string") return [];

    const preferences: LocalePreference[] = [];
    const entries = header.split(",");

    for (const entry of entries) {
        const trimmed = entry.trim();
        if (!trimmed) continue;

        const parts = trimmed.split(";");
        const rawTag = parts[0].trim().toLowerCase();
        if (!rawTag || rawTag === "*") continue;

        let quality = 1.0;
        if (parts.length > 1) {
            for (let i = 1; i < parts.length; i++) {
                const sub = parts[i].trim();
                if (sub.startsWith("q=")) {
                    const parsedQ = parseFloat(sub.substring(2));
                    if (!isNaN(parsedQ) && parsedQ >= 0 && parsedQ <= 1) {
                        quality = parsedQ;
                    }
                }
            }
        }

        const primaryLang = rawTag.split("-")[0];
        preferences.push({
            tag: rawTag,
            lang: primaryLang,
            quality,
        });
    }

    // Sort in descending order of quality weight
    return preferences.sort((a, b) => b.quality - a.quality);
}

/**
 * Resolves destination URL based on incoming Accept-Language header and configured locale rules.
 * Checks for exact tag matches first (e.g. "pt-br"), then primary language matches (e.g. "pt").
 */
export function resolveLocaleDestination(
    acceptLanguageHeader: string | null | undefined,
    localeRules: Record<string, string> | null | undefined,
    fallbackUrl: string
): LocaleResolutionResult {
    const trimmedFallback = fallbackUrl.trim();

    if (!localeRules || typeof localeRules !== "object") {
        return { destinationUrl: trimmedFallback, matchedLocale: null, quality: 1.0 };
    }

    // Normalize rule keys to lowercase for case-insensitive matching
    const normalizedRules: Record<string, string> = {};
    for (const [k, v] of Object.entries(localeRules)) {
        if (typeof v === "string" && v.trim()) {
            normalizedRules[k.trim().toLowerCase()] = v.trim();
        }
    }

    if (Object.keys(normalizedRules).length === 0) {
        return { destinationUrl: trimmedFallback, matchedLocale: null, quality: 1.0 };
    }

    const preferences = parseAcceptLanguage(acceptLanguageHeader);

    for (const pref of preferences) {
        // 1. Try exact locale tag match (e.g., "es-mx")
        if (normalizedRules[pref.tag]) {
            return {
                destinationUrl: normalizedRules[pref.tag],
                matchedLocale: pref.tag,
                quality: pref.quality,
            };
        }

        // 2. Try primary language code match (e.g., "es")
        if (normalizedRules[pref.lang]) {
            return {
                destinationUrl: normalizedRules[pref.lang],
                matchedLocale: pref.lang,
                quality: pref.quality,
            };
        }
    }

    // Fallback if no matching locale rule configured
    return {
        destinationUrl: trimmedFallback,
        matchedLocale: null,
        quality: 1.0,
    };
}
