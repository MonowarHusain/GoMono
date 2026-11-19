/**
 * Pure, zero-dependency client-side analytics aggregation engine.
 * Computes peak hours, daily sparkline trends, percentage breakdowns,
 * and generates downloadable CSV reports with zero server overhead.
 */

import { type ClickLog, type LinkAnalyticsData } from "@/app/api/analytics/route";

export interface HourlyClickBucket {
    hour: number;          // 0 - 23
    label: string;         // "12 AM", "1 PM", etc.
    count: number;
    percentage: number;
}

export interface DailySparklinePoint {
    date: string;          // "YYYY-MM-DD"
    label: string;         // "Mon", "Tue", etc.
    count: number;
}

export interface PercentageItem {
    label: string;
    count: number;
    percentage: number;
}

export interface AnalyticsSummary {
    totalClicks: number;
    peakHour: {
        hour: number;
        label: string;
        count: number;
    };
    hourlyDistribution: HourlyClickBucket[];
    dailyTrend: DailySparklinePoint[];
    topDevices: PercentageItem[];
    topBrowsers: PercentageItem[];
    topOs: PercentageItem[];
}

const HOUR_LABELS = [
    "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM",
    "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
    "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
    "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",
];

/**
 * Computes a 24-hour click distribution from click timestamps.
 */
export function computeHourlyDistribution(clicks: ClickLog[] = []): {
    distribution: HourlyClickBucket[];
    peakHour: { hour: number; label: string; count: number };
} {
    const hourlyCounts = new Array(24).fill(0);

    for (const c of clicks) {
        if (!c.timestamp) continue;
        const date = new Date(c.timestamp);
        if (isNaN(date.getTime())) continue;
        const hour = date.getHours();
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    }

    const total = clicks.length;
    let peakHourIndex = 0;
    let maxClicks = 0;

    const distribution: HourlyClickBucket[] = hourlyCounts.map((count, hour) => {
        if (count > maxClicks) {
            maxClicks = count;
            peakHourIndex = hour;
        }
        return {
            hour,
            label: HOUR_LABELS[hour],
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
    });

    return {
        distribution,
        peakHour: {
            hour: peakHourIndex,
            label: HOUR_LABELS[peakHourIndex],
            count: maxClicks,
        },
    };
}

/**
 * Computes daily click counts for the trailing N days (default 7) for sparklines.
 */
export function computeDailySparkline(clicks: ClickLog[] = [], days: number = 7): DailySparklinePoint[] {
    const result: DailySparklinePoint[] = [];
    const dayMap = new Map<string, number>();

    // Initialize map for trailing N days up to today
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        dayMap.set(iso, 0);
    }

    // Accumulate click counts
    for (const c of clicks) {
        if (!c.timestamp) continue;
        const d = new Date(c.timestamp);
        if (isNaN(d.getTime())) continue;
        const iso = d.toISOString().slice(0, 10);
        if (dayMap.has(iso)) {
            dayMap.set(iso, (dayMap.get(iso) || 0) + 1);
        }
    }

    // Convert to ordered points
    dayMap.forEach((count, dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayName = dateObj.toLocaleDateString(undefined, { weekday: "short" });
        result.push({
            date: dateStr,
            label: dayName,
            count,
        });
    });

    return result;
}

/**
 * Converts Record<string, number> into a sorted percentage breakdown list.
 */
export function computePercentageBreakdown(
    data: Record<string, number> = {},
    fallbackTotal?: number
): PercentageItem[] {
    const sum = fallbackTotal ?? Object.values(data).reduce((acc, v) => acc + (Number(v) || 0), 0);
    if (sum <= 0) return [];

    return Object.entries(data)
        .filter(([, count]) => Number(count) > 0)
        .map(([label, count]) => {
            const num = Number(count) || 0;
            return {
                label: label.charAt(0).toUpperCase() + label.slice(1),
                count: num,
                percentage: Math.round((num / sum) * 100),
            };
        })
        .sort((a, b) => b.count - a.count);
}

/**
 * Full summary aggregator combining all metric facets.
 */
export function summarizeAnalytics(analytics: LinkAnalyticsData): AnalyticsSummary {
    const clicks = analytics.recentClicks || [];
    const { distribution, peakHour } = computeHourlyDistribution(clicks);
    const dailyTrend = computeDailySparkline(clicks, 7);

    const totalClicks = analytics.totalClicks || clicks.length || 0;
    const topDevices = computePercentageBreakdown(analytics.devices || {}, totalClicks);
    const topBrowsers = computePercentageBreakdown(analytics.browsers || {}, totalClicks);
    const topOs = computePercentageBreakdown(analytics.os || {}, totalClicks);

    return {
        totalClicks,
        peakHour,
        hourlyDistribution: distribution,
        dailyTrend,
        topDevices,
        topBrowsers,
        topOs,
    };
}

/**
 * Generates an RFC-4180 compliant CSV export for complete analytics data.
 */
export function generateAnalyticsCsv(analytics: LinkAnalyticsData): string {
    const lines: string[] = [];
    const summary = summarizeAnalytics(analytics);

    const escapeCsv = (val: unknown): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    // Metadata Section
    lines.push("--- GOMONO ANALYTICS REPORT ---");
    lines.push(`Alias,${escapeCsv(analytics.alias)}`);
    lines.push(`Short URL,${escapeCsv(`https://${analytics.domain || "to.mono.bro.bd"}/${analytics.alias}`)}`);
    lines.push(`Destination URL,${escapeCsv(analytics.originalUrl)}`);
    lines.push(`Total Clicks,${analytics.totalClicks || 0}`);
    lines.push(`Peak Click Hour,${escapeCsv(summary.peakHour.label)} (${summary.peakHour.count} visits)`);
    lines.push(`Created At,${escapeCsv(analytics.createdAt || "N/A")}`);
    lines.push(`Last Clicked At,${escapeCsv(analytics.lastClickedAt || "N/A")}`);
    lines.push("");

    // Trailing 7-Day Trend
    lines.push("--- TRAILING 7-DAY DAILY CLICK TREND ---");
    lines.push("Date,Day,Clicks");
    for (const point of summary.dailyTrend) {
        lines.push(`${escapeCsv(point.date)},${escapeCsv(point.label)},${point.count}`);
    }
    lines.push("");

    // Hourly Distribution
    lines.push("--- 24-HOUR TRAFFIC DISTRIBUTION ---");
    lines.push("Hour,Time Window,Visits,Percentage");
    for (const bucket of summary.hourlyDistribution) {
        lines.push(`${bucket.hour},${escapeCsv(bucket.label)},${bucket.count},${bucket.percentage}%`);
    }
    lines.push("");

    // Device Breakdown
    lines.push("--- DEVICE BREAKDOWN ---");
    lines.push("Device,Visits,Share");
    for (const d of summary.topDevices) {
        lines.push(`${escapeCsv(d.label)},${d.count},${d.percentage}%`);
    }
    lines.push("");

    // Browser Breakdown
    lines.push("--- BROWSER BREAKDOWN ---");
    lines.push("Browser,Visits,Share");
    for (const b of summary.topBrowsers) {
        lines.push(`${escapeCsv(b.label)},${b.count},${b.percentage}%`);
    }
    lines.push("");

    // Detailed Audit Log (Recent Clicks)
    lines.push("--- AUDIT LOG (RECENT VISITS) ---");
    lines.push("Timestamp,Device,Browser,OS,Target URL,Referer");
    for (const c of analytics.recentClicks || []) {
        lines.push([
            escapeCsv(c.timestamp),
            escapeCsv(c.device),
            escapeCsv(c.browser),
            escapeCsv(c.os),
            escapeCsv(c.targetUrl),
            escapeCsv(c.referer || "Direct / Unknown"),
        ].join(","));
    }

    return lines.join("\r\n");
}
