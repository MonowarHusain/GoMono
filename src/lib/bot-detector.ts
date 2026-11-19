/**
 * Zero-dependency Bot, Social Preview Crawler, and Script Detector.
 * Protects GoMono's free-tier Firestore writes by filtering automated traffic
 * from human click analytics while preserving fast redirects.
 */

export type TrafficCategory = "human" | "crawler" | "social" | "script";

export interface TrafficTypeResult {
    isBot: boolean;
    isSearchCrawler: boolean;
    isSocialPreview: boolean;
    isScript: boolean;
    botName: string | null;
    category: TrafficCategory;
}

// Search engine indexing crawlers
const SEARCH_CRAWLERS: Array<{ name: string; pattern: RegExp }> = [
    { name: "Googlebot", pattern: /googlebot|adsbot-google|google-inspectiontool|mediapartners-google/i },
    { name: "Bingbot", pattern: /bingbot|msnbot|bingpreview/i },
    { name: "YandexBot", pattern: /yandex(?:bot|images|video|media|blogs|favicons)/i },
    { name: "Baiduspider", pattern: /baiduspider/i },
    { name: "DuckDuckBot", pattern: /duckduck(?:bot|go)/i },
    { name: "Sogou", pattern: /sogou/i },
    { name: "Exabot", pattern: /exabot/i },
    { name: "Yahoo", pattern: /slurp/i },
    { name: "InternetArchive", pattern: /ia_archiver/i },
    { name: "AhrefsBot", pattern: /ahrefsbot/i },
    { name: "SemrushBot", pattern: /semrushbot/i },
    { name: "DotBot", pattern: /dotbot/i },
    { name: "Applebot", pattern: /applebot/i },
];

// Social media link preview scrapers (fetch OpenGraph / meta tags)
const SOCIAL_PREVIEW_BOTS: Array<{ name: string; pattern: RegExp }> = [
    { name: "WhatsApp", pattern: /whatsapp/i },
    { name: "Discordbot", pattern: /discordbot/i },
    { name: "Twitterbot", pattern: /twitterbot/i },
    { name: "Facebook", pattern: /facebookexternalhit|facebookcatalog/i },
    { name: "Slackbot", pattern: /slackbot/i },
    { name: "LinkedInBot", pattern: /linkedinbot/i },
    { name: "TelegramBot", pattern: /telegrambot/i },
    { name: "Pinterest", pattern: /pinterest(?:bot)?/i },
    { name: "SkypeUriPreview", pattern: /skypeuripreview/i },
    { name: "iMessage", pattern: /apple-pubsub|messages/i },
    { name: "Mastodon", pattern: /mastodon/i },
    { name: "RedditBot", pattern: /redditbot/i },
    { name: "Embedly", pattern: /embedly/i },
    { name: "QuoraLinkPreview", pattern: /quora link preview/i },
    { name: "Viber", pattern: /viber/i },
];

// Automated HTTP clients, scraping scripts, and headless testing harnesses
const AUTOMATED_SCRIPTS: Array<{ name: string; pattern: RegExp }> = [
    { name: "curl", pattern: /^curl\//i },
    { name: "Wget", pattern: /^wget\//i },
    { name: "Python-Requests", pattern: /python-requests|aiohttp|httpx|urllib/i },
    { name: "Go-HTTP-Client", pattern: /^go-http-client/i },
    { name: "Node-Fetch", pattern: /node-fetch|axios|got\/|needle\/|undici/i },
    { name: "Postman", pattern: /postmanruntime/i },
    { name: "HeadlessChrome", pattern: /headlesschrome|puppeteer|playwright/i },
    { name: "PhantomJS", pattern: /phantomjs/i },
    { name: "Selenium", pattern: /selenium|webdriver/i },
    { name: "ApacheBench", pattern: /apachebench/i },
    { name: "Jmeter", pattern: /jmeter/i },
];

/**
 * Analyzes the User-Agent header string and categorizes incoming traffic.
 */
export function detectTrafficType(userAgent: string | null | undefined): TrafficTypeResult {
    if (!userAgent || typeof userAgent !== "string" || !userAgent.trim()) {
        return {
            isBot: false,
            isSearchCrawler: false,
            isSocialPreview: false,
            isScript: false,
            botName: null,
            category: "human",
        };
    }

    const ua = userAgent.trim();

    // 1. Check Social Preview Scrapers (Highest priority for OG preview handling)
    for (const bot of SOCIAL_PREVIEW_BOTS) {
        if (bot.pattern.test(ua)) {
            return {
                isBot: true,
                isSearchCrawler: false,
                isSocialPreview: true,
                isScript: false,
                botName: bot.name,
                category: "social",
            };
        }
    }

    // 2. Check Search Engine Crawlers
    for (const bot of SEARCH_CRAWLERS) {
        if (bot.pattern.test(ua)) {
            return {
                isBot: true,
                isSearchCrawler: true,
                isSocialPreview: false,
                isScript: false,
                botName: bot.name,
                category: "crawler",
            };
        }
    }

    // 3. Check Automated HTTP Scripts & Headless Browsers
    for (const bot of AUTOMATED_SCRIPTS) {
        if (bot.pattern.test(ua)) {
            return {
                isBot: true,
                isSearchCrawler: false,
                isSocialPreview: false,
                isScript: true,
                botName: bot.name,
                category: "script",
            };
        }
    }

    // 4. Generic bot token heuristic fallback
    if (/bot|crawler|spider|scraper|preview|headless/i.test(ua) && !/mobile/i.test(ua)) {
        return {
            isBot: true,
            isSearchCrawler: false,
            isSocialPreview: false,
            isScript: true,
            botName: "GenericBot",
            category: "crawler",
        };
    }

    // 5. Normal human interactive session
    return {
        isBot: false,
        isSearchCrawler: false,
        isSocialPreview: false,
        isScript: false,
        botName: null,
        category: "human",
    };
}
