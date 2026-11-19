/**
 * Zero-dependency bulk URL extractor for unstructured text blobs.
 * Pulls valid http/https URLs out of messy emails, articles, chats, CSVs, or server logs.
 */

import { cleanTrackingParams } from "./url-cleaner";

// Comprehensive URL matching regex that safely terminates at punctuation, brackets, quotes, or trailing dots
const URL_REGEX = /https?:\/\/[^\s<>"'{}|\\^`]+[^\s<>"'{}|\\^`.,;:!?)\]]/gi;

export interface ExtractUrlsOptions {
    /** Whether to remove duplicate URLs while preserving discovery order. Defaults to true. */
    deduplicate?: boolean;
    /** Whether to strip invasive tracking parameters (fbclid, gclid, etc.). Defaults to false. */
    stripTrackers?: boolean;
    /** Maximum number of URLs to extract. Defaults to 1000. */
    limit?: number;
}

export interface ExtractUrlsResult {
    urls: string[];
    totalMatched: number;
    duplicatesRemoved: number;
    trackersRemovedCount: number;
}

/**
 * Extracts all valid HTTP and HTTPS URLs from raw unstructured text.
 */
export function extractUrlsFromText(
    rawText: string,
    options: ExtractUrlsOptions = {}
): string[] {
    const { deduplicate = true, stripTrackers = false, limit = 1000 } = options;

    if (!rawText || typeof rawText !== "string") {
        return [];
    }

    const matches = rawText.match(URL_REGEX) || [];
    if (matches.length === 0) {
        return [];
    }

    const processed: string[] = [];
    const seen = new Set<string>();

    for (const match of matches) {
        let url = match.trim();

        // Optional tracking parameter stripping
        if (stripTrackers) {
            url = cleanTrackingParams(url).cleanedUrl;
        }

        if (deduplicate) {
            const normalizedKey = url.toLowerCase().replace(/\/$/, "");
            if (seen.has(normalizedKey)) {
                continue;
            }
            seen.add(normalizedKey);
        }

        processed.push(url);

        if (processed.length >= limit) {
            break;
        }
    }

    return processed;
}

/**
 * Advanced extraction returning detailed statistics alongside the URLs.
 */
export function extractUrlsDetailed(
    rawText: string,
    options: ExtractUrlsOptions = {}
): ExtractUrlsResult {
    const { deduplicate = true, stripTrackers = false, limit = 1000 } = options;

    if (!rawText || typeof rawText !== "string") {
        return { urls: [], totalMatched: 0, duplicatesRemoved: 0, trackersRemovedCount: 0 };
    }

    const matches = rawText.match(URL_REGEX) || [];
    const totalMatched = matches.length;

    const urls: string[] = [];
    const seen = new Set<string>();
    let duplicatesRemoved = 0;
    let trackersRemovedCount = 0;

    for (const match of matches) {
        let url = match.trim();

        if (stripTrackers) {
            const cleanRes = cleanTrackingParams(url);
            if (cleanRes.hasModifications) {
                trackersRemovedCount += cleanRes.removedParams.length;
                url = cleanRes.cleanedUrl;
            }
        }

        if (deduplicate) {
            const normalizedKey = url.toLowerCase().replace(/\/$/, "");
            if (seen.has(normalizedKey)) {
                duplicatesRemoved++;
                continue;
            }
            seen.add(normalizedKey);
        }

        urls.push(url);

        if (urls.length >= limit) {
            break;
        }
    }

    return {
        urls,
        totalMatched,
        duplicatesRemoved,
        trackersRemovedCount,
    };
}
