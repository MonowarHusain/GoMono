import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export interface ClickLog {
    id: string;
    timestamp: string;
    device: "Mobile" | "Tablet" | "Desktop" | string;
    browser: string;
    os: string;
    targetUrl: string;
    referer?: string | null;
    userAgent?: string;
}

export interface LinkAnalyticsData {
    alias: string;
    domain: string;
    originalUrl: string;
    iosUrl?: string | null;
    androidUrl?: string | null;
    totalClicks: number;
    lastClickedAt?: string | null;
    createdAt?: string;
    devices: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
    browsers: Record<string, number>;
    os: Record<string, number>;
    recentClicks: ClickLog[];
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const alias = searchParams.get("alias")?.trim().toLowerCase();

        if (!alias) {
            return NextResponse.json({ error: "Alias query parameter is required" }, { status: 400 });
        }

        // Optional token verification for ownership / demo isolation
        const authHeader = req.headers.get("Authorization");
        let decodedToken: DecodedIdToken | null = null;
        let isDemoUser = false;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split("Bearer ")[1]?.trim();
            if (token) {
                try {
                    decodedToken = await getAuth().verifyIdToken(token);
                    if (decodedToken) {
                        isDemoUser = decodedToken.email === "demo01@go.mono.bro.bd";
                    }
                } catch {
                    // Public/graceful read
                }
            }
        }

        const linkRef = adminDb.collection("links").doc(alias);
        const linkDoc = await linkRef.get();

        if (!linkDoc.exists) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        const data = linkDoc.data();
        if (!data) {
            return NextResponse.json({ error: "Link data is empty" }, { status: 404 });
        }

        // Demo user isolation: demo user cannot inspect other accounts' links
        if (isDemoUser && decodedToken && data.createdBy && data.createdBy !== decodedToken.uid && !data.isDemo) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Fetch recent clicks subcollection
        let recentClicks: ClickLog[] = [];
        try {
            const clicksSnapshot = await linkRef
                .collection("clicks")
                .orderBy("timestamp", "desc")
                .limit(100)
                .get();

            recentClicks = clicksSnapshot.docs.map((doc) => {
                const clickData = doc.data();

                let safeTimestamp = new Date().toISOString();
                if (clickData.timestamp) {
                    if (typeof clickData.timestamp.toDate === "function") {
                        safeTimestamp = clickData.timestamp.toDate().toISOString();
                    } else {
                        safeTimestamp = new Date(clickData.timestamp).toISOString();
                    }
                }

                return {
                    id: doc.id,
                    timestamp: safeTimestamp,
                    device: clickData.device || "Desktop",
                    browser: clickData.browser || "Other",
                    os: clickData.os || "Other",
                    targetUrl: clickData.targetUrl || data.originalUrl || "",
                    referer: clickData.referer || null,
                    userAgent: clickData.userAgent || "",
                };
            });
        } catch (clicksErr) {
            console.warn("Could not query subcollection clicks:", clicksErr);
        }

        // 2. Format Dates
        let safeCreatedAt = new Date().toISOString();
        if (data.createdAt) {
            if (typeof data.createdAt.toDate === "function") {
                safeCreatedAt = data.createdAt.toDate().toISOString();
            } else {
                safeCreatedAt = new Date(data.createdAt).toISOString();
            }
        }

        let safeLastClickedAt: string | null = null;
        if (data.lastClickedAt) {
            if (typeof data.lastClickedAt.toDate === "function") {
                safeLastClickedAt = data.lastClickedAt.toDate().toISOString();
            } else {
                safeLastClickedAt = new Date(data.lastClickedAt).toISOString();
            }
        } else if (recentClicks.length > 0) {
            safeLastClickedAt = recentClicks[0].timestamp;
        }

        // 3. Device aggregations (fallback to aggregating recentClicks if doc aggregations empty)
        const rawDevices = (data.devices as Record<string, number>) || {};
        const devices = {
            desktop: typeof rawDevices.desktop === "number" ? rawDevices.desktop : 0,
            mobile: typeof rawDevices.mobile === "number" ? rawDevices.mobile : 0,
            tablet: typeof rawDevices.tablet === "number" ? rawDevices.tablet : 0,
        };

        const rawBrowsers = (data.browsers as Record<string, number>) || {};
        const browsers: Record<string, number> = { ...rawBrowsers };

        const rawOs = (data.os as Record<string, number>) || {};
        const os: Record<string, number> = { ...rawOs };

        // If atomic aggregations were empty (legacy link with existing clicks), tally from recentClicks
        if (devices.desktop === 0 && devices.mobile === 0 && devices.tablet === 0 && recentClicks.length > 0) {
            recentClicks.forEach((c) => {
                const dev = c.device.toLowerCase();
                if (dev === "mobile") devices.mobile++;
                else if (dev === "tablet") devices.tablet++;
                else devices.desktop++;

                const brw = c.browser.toLowerCase().replace(/[^a-z0-9]/g, "_");
                browsers[brw] = (browsers[brw] || 0) + 1;

                const operatingSys = c.os.toLowerCase().replace(/[^a-z0-9]/g, "_");
                os[operatingSys] = (os[operatingSys] || 0) + 1;
            });
        }

        const totalClicks = typeof data.totalClicks === "number" 
            ? data.totalClicks 
            : Math.max(recentClicks.length, devices.desktop + devices.mobile + devices.tablet);

        const analyticsData: LinkAnalyticsData = {
            alias: data.alias || alias,
            domain: data.domain || "go.mono.bro.bd",
            originalUrl: data.originalUrl,
            iosUrl: data.iosUrl || null,
            androidUrl: data.androidUrl || null,
            totalClicks,
            lastClickedAt: safeLastClickedAt,
            createdAt: safeCreatedAt,
            devices,
            browsers,
            os,
            recentClicks,
        };

        return NextResponse.json(analyticsData, { status: 200 });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

