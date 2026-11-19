/**
 * Zero-cost, fire-and-forget Webhook Notification Dispatcher.
 * Formats rich notification payloads for Discord, Slack, and generic HTTP endpoints
 * on link clicks with a strict 3-second timeout to protect redirect latency.
 */

export interface WebhookClickEvent {
    alias: string;
    targetUrl: string;
    domain?: string;
    device?: string;
    browser?: string;
    os?: string;
    referer?: string | null;
    timestamp?: string;
    totalClicks?: number;
}

export type WebhookProvider = "discord" | "slack" | "generic";

/**
 * Detects whether a webhook URL is Discord, Slack, or generic HTTP.
 */
export function detectWebhookProvider(url: string): WebhookProvider {
    const lower = url.toLowerCase();
    if (lower.includes("discord.com/api/webhooks") || lower.includes("discordapp.com/api/webhooks")) {
        return "discord";
    }
    if (lower.includes("hooks.slack.com/services")) {
        return "slack";
    }
    return "generic";
}

/**
 * Builds a provider-specific payload body.
 */
export function formatWebhookPayload(provider: WebhookProvider, event: WebhookClickEvent): Record<string, unknown> {
    const shortUrl = `https://${event.domain || "to.mono.bro.bd"}/${event.alias}`;
    const timeStr = event.timestamp || new Date().toISOString();
    const deviceStr = `${event.device || "Unknown"} • ${event.browser || "Unknown"} (${event.os || "Unknown"})`;
    const refererStr = event.referer || "Direct / Internal";

    if (provider === "discord") {
        return {
            username: "GoMono Intelligence",
            avatar_url: "https://gomono.bro.bd/icon-192.png",
            embeds: [
                {
                    title: `🔗 Link Clicked: /${event.alias}`,
                    url: shortUrl,
                    color: 0x4f46e5, // Indigo hex
                    description: `A visitor just opened your short link.`,
                    fields: [
                        { name: "Short Link", value: shortUrl, inline: true },
                        { name: "Total Visits", value: String(event.totalClicks || 1), inline: true },
                        { name: "Client Info", value: deviceStr, inline: false },
                        { name: "Destination", value: event.targetUrl.slice(0, 300), inline: false },
                        { name: "Referrer", value: refererStr.slice(0, 150), inline: true },
                    ],
                    footer: { text: "GoMono Enterprise Alerts • $0 Infrastructure" },
                    timestamp: timeStr,
                },
            ],
        };
    }

    if (provider === "slack") {
        return {
            text: `🔗 *GoMono Alert:* Link </${event.alias}> was just clicked!`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*🔗 Link Click Alert: <${shortUrl}|/${event.alias}>*\n*Destination:* \`${event.targetUrl.slice(0, 100)}\``,
                    },
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Device:*\n${deviceStr}` },
                        { type: "mrkdwn", text: `*Referrer:*\n${refererStr}` },
                    ],
                },
            ],
        };
    }

    // Generic Webhook Payload
    return {
        event: "link.clicked",
        alias: event.alias,
        shortUrl,
        destinationUrl: event.targetUrl,
        device: event.device,
        browser: event.browser,
        os: event.os,
        referer: event.referer,
        totalClicks: event.totalClicks,
        timestamp: timeStr,
    };
}

/**
 * Fires a fire-and-forget HTTP POST to the webhook endpoint.
 * Non-blocking, fails gracefully with zero impact on visitor redirect.
 */
export async function dispatchClickWebhook(
    webhookUrl: string,
    event: WebhookClickEvent
): Promise<boolean> {
    if (!webhookUrl || typeof webhookUrl !== "string" || !/^https?:\/\//i.test(webhookUrl.trim())) {
        return false;
    }

    const cleanUrl = webhookUrl.trim();
    const provider = detectWebhookProvider(cleanUrl);
    const body = formatWebhookPayload(provider, event);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const res = await fetch(cleanUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return res.ok;
    } catch (err) {
        // Fire-and-forget: log warning but never throw
        console.warn("Failed to dispatch click webhook alert:", err);
        return false;
    }
}
