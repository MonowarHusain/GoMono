import { NextResponse } from "next/server";

export interface LinkHealthResult {
    url: string;
    status: number;
    ok: boolean;
    statusText: string;
    latencyMs: number;
    error?: string;
}

const MAX_BATCH_URLS = 25;
const REQUEST_TIMEOUT_MS = 4000;

async function checkSingleUrl(rawUrl: string): Promise<LinkHealthResult> {
    const trimmed = rawUrl.trim();
    const formatted = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    const startTime = Date.now();

    try {
        // Try lightweight HTTP HEAD request first with follow redirects
        let response: Response;
        try {
            response = await fetch(formatted, {
                method: "HEAD",
                redirect: "follow",
                headers: {
                    "User-Agent": "GoMono-LinkHealth/1.0 (+https://to.mono.bro.bd)",
                },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
        } catch {
            // Some servers reject HEAD with 405 or network drop; fallback to Range GET
            response = await fetch(formatted, {
                method: "GET",
                redirect: "follow",
                headers: {
                    Range: "bytes=0-0",
                    "User-Agent": "GoMono-LinkHealth/1.0 (+https://to.mono.bro.bd)",
                },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
        }

        const latencyMs = Date.now() - startTime;
        const ok = response.status >= 200 && response.status < 400;

        return {
            url: trimmed,
            status: response.status,
            ok,
            statusText: response.statusText || (ok ? "OK" : "Error"),
            latencyMs,
        };
    } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : "Connection failed";
        const isTimeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("abort");

        return {
            url: trimmed,
            status: isTimeout ? 408 : 0,
            ok: false,
            statusText: isTimeout ? "Timeout" : "Unreachable",
            latencyMs,
            error: message,
        };
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const urls: unknown = body?.urls;

        if (!Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json(
                { error: "Payload must contain an array of 'urls'" },
                { status: 400 }
            );
        }

        // Cap batch size strictly at 25 URLs to protect free serverless execution limits
        const targetUrls = urls
            .slice(0, MAX_BATCH_URLS)
            .filter((u): u is string => typeof u === "string" && u.trim().length > 0);

        if (targetUrls.length === 0) {
            return NextResponse.json({ results: [] });
        }

        // Execute parallel health checks with concurrency isolation
        const checkPromises = targetUrls.map((url) => checkSingleUrl(url));
        const settled = await Promise.all(checkPromises);

        return NextResponse.json({
            count: settled.length,
            results: settled,
        });
    } catch (err) {
        console.error("Health check error:", err);
        return NextResponse.json(
            { error: "Failed to execute health check" },
            { status: 500 }
        );
    }
}
