/**
 * Zero-dependency Mobile App Deep-Link URI Scheme Mapper.
 * Converts standard web URLs (YouTube, Twitter/X, Instagram, Spotify, LinkedIn, GitHub, Reddit)
 * into native mobile app URI schemes (vnd.youtube://, twitter://, instagram://, spotify://)
 * so visitors on mobile devices jump directly into native apps rather than trapped in web views.
 */

export type DeepLinkPlatform =
    | "youtube"
    | "twitter"
    | "instagram"
    | "spotify"
    | "linkedin"
    | "github"
    | "reddit"
    | "other";

export interface DeepLinkResult {
    isSupported: boolean;
    platform: DeepLinkPlatform;
    deepLinkUri: string | null;
    iosUri: string | null;
    androidUri: string | null;
    webFallbackUrl: string;
}

/**
 * Resolves a web URL into native mobile URI schemes for iOS and Android.
 */
export function resolveDeepLink(rawUrl: string): DeepLinkResult {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
        return {
            isSupported: false,
            platform: "other",
            deepLinkUri: null,
            iosUri: null,
            androidUri: null,
            webFallbackUrl: "",
        };
    }

    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
    const parseableUrl = hasProtocol ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(parseableUrl);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
        const path = parsed.pathname;

        // 1. YouTube
        if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
            let videoId: string | null = null;

            if (host === "youtu.be") {
                videoId = path.slice(1).split("/")[0] || null;
            } else if (path === "/watch") {
                videoId = parsed.searchParams.get("v");
            } else if (path.startsWith("/embed/") || path.startsWith("/shorts/") || path.startsWith("/v/")) {
                videoId = path.split("/")[2] || null;
            }

            if (videoId) {
                return {
                    isSupported: true,
                    platform: "youtube",
                    deepLinkUri: `vnd.youtube://${videoId}`,
                    iosUri: `youtube://watch?v=${videoId}`,
                    androidUri: `vnd.youtube://${videoId}`,
                    webFallbackUrl: parseableUrl,
                };
            }

            return {
                isSupported: true,
                platform: "youtube",
                deepLinkUri: `vnd.youtube://${host}${path}`,
                iosUri: `youtube://${host}${path}`,
                androidUri: `vnd.youtube://${host}${path}`,
                webFallbackUrl: parseableUrl,
            };
        }

        // 2. Twitter / X
        if (host === "twitter.com" || host === "x.com" || host === "mobile.twitter.com") {
            const parts = path.split("/").filter(Boolean);
            if (parts.length >= 3 && parts[1] === "status") {
                const tweetId = parts[2];
                return {
                    isSupported: true,
                    platform: "twitter",
                    deepLinkUri: `twitter://status?id=${tweetId}`,
                    iosUri: `twitter://status?id=${tweetId}`,
                    androidUri: `twitter://status?id=${tweetId}`,
                    webFallbackUrl: parseableUrl,
                };
            }

            if (parts.length >= 1) {
                const username = parts[0];
                return {
                    isSupported: true,
                    platform: "twitter",
                    deepLinkUri: `twitter://user?screen_name=${username}`,
                    iosUri: `twitter://user?screen_name=${username}`,
                    androidUri: `twitter://user?screen_name=${username}`,
                    webFallbackUrl: parseableUrl,
                };
            }
        }

        // 3. Instagram
        if (host === "instagram.com") {
            const parts = path.split("/").filter(Boolean);
            if (parts.length >= 2 && (parts[0] === "p" || parts[0] === "reel" || parts[0] === "tv")) {
                const mediaId = parts[1];
                return {
                    isSupported: true,
                    platform: "instagram",
                    deepLinkUri: `instagram://media?id=${mediaId}`,
                    iosUri: `instagram://media?id=${mediaId}`,
                    androidUri: `instagram://media?id=${mediaId}`,
                    webFallbackUrl: parseableUrl,
                };
            }

            if (parts.length >= 1 && !["explore", "reels", "stories", "accounts", "direct"].includes(parts[0])) {
                const username = parts[0];
                return {
                    isSupported: true,
                    platform: "instagram",
                    deepLinkUri: `instagram://user?username=${username}`,
                    iosUri: `instagram://user?username=${username}`,
                    androidUri: `instagram://user?username=${username}`,
                    webFallbackUrl: parseableUrl,
                };
            }
        }

        // 4. Spotify
        if (host === "open.spotify.com") {
            const parts = path.split("/").filter(Boolean);
            if (parts.length >= 2) {
                const [type, id] = parts;
                if (["track", "album", "artist", "playlist", "episode", "show"].includes(type)) {
                    return {
                        isSupported: true,
                        platform: "spotify",
                        deepLinkUri: `spotify:${type}:${id}`,
                        iosUri: `spotify:${type}:${id}`,
                        androidUri: `spotify:${type}:${id}`,
                        webFallbackUrl: parseableUrl,
                    };
                }
            }
        }

        // 5. LinkedIn
        if (host === "linkedin.com") {
            const parts = path.split("/").filter(Boolean);
            if (parts.length >= 2 && parts[0] === "in") {
                const profileId = parts[1];
                return {
                    isSupported: true,
                    platform: "linkedin",
                    deepLinkUri: `linkedin://profile/${profileId}`,
                    iosUri: `linkedin://profile/${profileId}`,
                    androidUri: `linkedin://profile/${profileId}`,
                    webFallbackUrl: parseableUrl,
                };
            }
            if (parts.length >= 2 && parts[0] === "company") {
                const companyId = parts[1];
                return {
                    isSupported: true,
                    platform: "linkedin",
                    deepLinkUri: `linkedin://company/${companyId}`,
                    iosUri: `linkedin://company/${companyId}`,
                    androidUri: `linkedin://company/${companyId}`,
                    webFallbackUrl: parseableUrl,
                };
            }
        }

        // 6. GitHub
        if (host === "github.com") {
            const parts = path.split("/").filter(Boolean);
            if (parts.length >= 1) {
                return {
                    isSupported: true,
                    platform: "github",
                    deepLinkUri: `github://${path.replace(/^\//, "")}`,
                    iosUri: `github://${path.replace(/^\//, "")}`,
                    androidUri: `github://${path.replace(/^\//, "")}`,
                    webFallbackUrl: parseableUrl,
                };
            }
        }

        // 7. Reddit
        if (host === "reddit.com" || host === "old.reddit.com") {
            return {
                isSupported: true,
                platform: "reddit",
                deepLinkUri: `reddit://${path.replace(/^\//, "")}`,
                iosUri: `reddit://${path.replace(/^\//, "")}`,
                androidUri: `reddit://${path.replace(/^\//, "")}`,
                webFallbackUrl: parseableUrl,
            };
        }

        // Generic fallback for other URLs
        return {
            isSupported: false,
            platform: "other",
            deepLinkUri: null,
            iosUri: null,
            androidUri: null,
            webFallbackUrl: parseableUrl,
        };
    } catch {
        return {
            isSupported: false,
            platform: "other",
            deepLinkUri: null,
            iosUri: null,
            androidUri: null,
            webFallbackUrl: rawUrl,
        };
    }
}
