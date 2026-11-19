import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import { hashPasswordSync } from "@/lib/link-password";
import type { CreateLinkInput } from "@/types/link";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        let decodedToken: DecodedIdToken | null = null;
        let isDemoUser = false;
        let isPublic = true;
        let createdBy = "public";
        let creatorType: "admin" | "public" = "public";
        let userId: string | null = null;
        let isAdminOnly = false;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split("Bearer ")[1]?.trim();
            if (token) {
                try {
                    decodedToken = await getAuth().verifyIdToken(token);
                    if (decodedToken && decodedToken.uid) {
                        isPublic = false;
                        createdBy = decodedToken.uid;
                        userId = decodedToken.uid;
                        creatorType = "admin";
                        isAdminOnly = true;
                        isDemoUser = decodedToken.email === "demo01@go.mono.bro.bd";
                    }
                } catch (authErr) {
                    // If token is invalid or expired, gracefully fallback to public creation
                    console.warn("Auth token verification failed; falling back to public link creation:", authErr);
                    isPublic = true;
                    createdBy = "public";
                    userId = null;
                    creatorType = "public";
                    isAdminOnly = false;
                    isDemoUser = false;
                }
            }
        }

        const body: CreateLinkInput = await req.json();
        const { originalUrl, customAlias, domain, tags, maxClicks, expiresAt, password, burnAfterRead, iosUrl, androidUrl, ogTitle, ogDescription, ogImage, abVariants, localeRules, schedule, creatorType: requestedCreatorType } = body;

        // If request explicitly signals public creation, enforce public separation
        if (requestedCreatorType === "public") {
            isPublic = true;
            createdBy = "public";
            userId = null;
            creatorType = "public";
            isAdminOnly = false;
            isDemoUser = false;
        }

        if (!originalUrl || typeof originalUrl !== "string" || !originalUrl.trim()) {
            return NextResponse.json({ error: "Original URL is required" }, { status: 400 });
        }

        let formattedUrl = originalUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
        }

        // Format and validate optional Device-Based Smart Routing URLs
        let formattedIosUrl: string | null = null;
        if (iosUrl && typeof iosUrl === "string" && iosUrl.trim()) {
            let cleanIos = iosUrl.trim();
            if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleanIos)) {
                cleanIos = `https://${cleanIos}`;
            }
            formattedIosUrl = cleanIos;
        }

        let formattedAndroidUrl: string | null = null;
        if (androidUrl && typeof androidUrl === "string" && androidUrl.trim()) {
            let cleanAndroid = androidUrl.trim();
            if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleanAndroid)) {
                cleanAndroid = `https://${cleanAndroid}`;
            }
            formattedAndroidUrl = cleanAndroid;
        }

        // Optional OpenGraph Cloaking Metadata for Social Scrapers
        const cleanOgTitle = typeof ogTitle === "string" && ogTitle.trim() ? ogTitle.trim().slice(0, 200) : null;
        const cleanOgDescription = typeof ogDescription === "string" && ogDescription.trim() ? ogDescription.trim().slice(0, 500) : null;
        let cleanOgImage: string | null = null;
        if (typeof ogImage === "string" && ogImage.trim()) {
            const rawImg = ogImage.trim();
            cleanOgImage = /^https?:\/\//i.test(rawImg) ? rawImg : `https://${rawImg}`;
        }

        // Optional A/B Split Testing Variants
        let cleanAbVariants: Array<{ url: string; weight: number; label?: string }> | null = null;
        if (Array.isArray(abVariants) && abVariants.length > 0) {
            cleanAbVariants = abVariants
                .filter((v) => v && typeof v.url === "string" && v.url.trim().length > 0)
                .map((v) => {
                    let u = v.url.trim();
                    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u)) {
                        u = `https://${u}`;
                    }
                    return {
                        url: u,
                        weight: Math.max(1, Math.min(100, Number(v.weight) || 50)),
                        label: typeof v.label === "string" && v.label.trim() ? v.label.trim().slice(0, 50) : undefined,
                    };
                });
            if (cleanAbVariants.length === 0) cleanAbVariants = null;
        }

        // Optional Accept-Language Locale Rules
        let cleanLocaleRules: Record<string, string> | null = null;
        if (localeRules && typeof localeRules === "object") {
            cleanLocaleRules = {};
            for (const [code, target] of Object.entries(localeRules)) {
                if (typeof target === "string" && target.trim()) {
                    const cleanCode = code.trim().toLowerCase().slice(0, 10);
                    let cleanTarget = target.trim();
                    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleanTarget)) {
                        cleanTarget = `https://${cleanTarget}`;
                    }
                    cleanLocaleRules[cleanCode] = cleanTarget;
                }
            }
            if (Object.keys(cleanLocaleRules).length === 0) cleanLocaleRules = null;
        }

        // Optional Scheduled Link Availability Window
        let cleanSchedule: Record<string, unknown> | null = null;
        if (schedule && typeof schedule === "object") {
            cleanSchedule = {};
            if (schedule.startAt) {
                const s = new Date(schedule.startAt);
                if (!isNaN(s.getTime())) cleanSchedule.startAt = s.toISOString();
            }
            if (schedule.endAt) {
                const e = new Date(schedule.endAt);
                if (!isNaN(e.getTime())) cleanSchedule.endAt = e.toISOString();
            }
            if (Array.isArray(schedule.activeDays) && schedule.activeDays.length > 0) {
                cleanSchedule.activeDays = schedule.activeDays.filter((d) => typeof d === "number" && d >= 0 && d <= 6);
            }
            if (typeof schedule.startHour === "number" && !isNaN(schedule.startHour)) {
                cleanSchedule.startHour = Math.max(0, Math.min(23, schedule.startHour));
            }
            if (typeof schedule.endHour === "number" && !isNaN(schedule.endHour)) {
                cleanSchedule.endHour = Math.max(0, Math.min(23, schedule.endHour));
            }
            if (Object.keys(cleanSchedule).length === 0) cleanSchedule = null;
        }

        // Process Security Options: Expiration Date, Max Clicks, Password
        let finalExpiresAt: Date | null = null;
        if (expiresAt) {
            const parsedDate = new Date(expiresAt);
            if (!isNaN(parsedDate.getTime())) {
                finalExpiresAt = parsedDate;
            }
        }

        let finalMaxClicks: number | null = null;
        if (burnAfterRead) {
            finalMaxClicks = 1;
        } else if (maxClicks !== undefined && maxClicks !== null && maxClicks !== "") {
            const parsedClicks = typeof maxClicks === "number" ? maxClicks : parseInt(String(maxClicks), 10);
            if (!isNaN(parsedClicks) && parsedClicks > 0) {
                finalMaxClicks = parsedClicks;
            }
        }

        const cleanPassword = typeof password === "string" && password.trim() ? password.trim() : null;
        const cleanPasswordHash = cleanPassword ? hashPasswordSync(cleanPassword) : null;

        if (isDemoUser) {
            const tomorrow = new Date();
            tomorrow.setHours(tomorrow.getHours() + 24);
            finalExpiresAt = tomorrow;
            finalMaxClicks = finalMaxClicks ? Math.min(finalMaxClicks, 50) : 50;
        }

        let alias = customAlias?.trim().toLowerCase();
        if (alias) {
            // Sanitize custom alias: allow alphanumeric, hyphens, and underscores
            alias = alias.replace(/[^a-z0-9-_]/g, "");
            if (!alias) {
                return NextResponse.json({ error: "Invalid custom alias provided" }, { status: 400 });
            }
        } else {
            alias = crypto.randomBytes(3).toString("hex");
        }

        const linkRef = adminDb.collection("links").doc(alias);
        const doc = await linkRef.get();

        if (doc.exists) {
            return NextResponse.json({ error: "Alias already taken" }, { status: 409 });
        }

        let tagsArray: string[] = [];
        if (Array.isArray(tags)) {
            tagsArray = tags.map((t: unknown) => String(t).trim()).filter(Boolean);
        } else if (typeof tags === "string") {
            tagsArray = tags.split(",").map((t: string) => t.trim()).filter(Boolean);
        }

        await linkRef.set({
            alias,
            originalUrl: formattedUrl,
            iosUrl: formattedIosUrl,
            androidUrl: formattedAndroidUrl,
            ogTitle: cleanOgTitle,
            ogDescription: cleanOgDescription,
            ogImage: cleanOgImage,
            abVariants: cleanAbVariants,
            localeRules: cleanLocaleRules,
            schedule: cleanSchedule,
            domain: domain || "to.mono.bro.bd",
            totalClicks: 0,
            createdAt: FieldValue.serverTimestamp(),
            isProtected: !!cleanPassword,
            password: cleanPassword,
            passwordHash: cleanPasswordHash,
            maxClicks: finalMaxClicks,
            burnAfterRead: Boolean(burnAfterRead),
            isBurned: false,
            expiresAt: finalExpiresAt,
            tags: tagsArray,
            createdBy,
            creatorType,
            userId,
            isAdminOnly,
            isPublic,
            isDemo: isDemoUser
        });

        return NextResponse.json({
            success: true,
            alias,
            isPublic,
            creatorType,
            userId,
            isAdminOnly,
            domain: domain || "to.mono.bro.bd",
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Secure GET request to fetch isolated links
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await getAuth().verifyIdToken(token);

        const isDemoUser = decodedToken.email === "demo01@go.mono.bro.bd";
        let linksSnapshot;

        if (isDemoUser) {
            linksSnapshot = await adminDb
                .collection("links")
                .where("createdBy", "==", decodedToken.uid)
                .get();
        } else {
            // Admin user sees ALL links (both admin-created and public-created)
            linksSnapshot = await adminDb
                .collection("links")
                .get();
        }

        let links = linksSnapshot.docs.map((doc) => {
            const data = doc.data();

            // SAFELY parse createdAt so old links don't crash the API
            let safeCreatedAt = new Date().toISOString();
            if (data.createdAt) {
                if (typeof data.createdAt.toDate === 'function') {
                    safeCreatedAt = data.createdAt.toDate().toISOString();
                } else {
                    // Fallback if it was saved as a string or number
                    safeCreatedAt = new Date(data.createdAt).toISOString();
                }
            }

            // SAFELY parse expiresAt
            let safeExpiresAt = null;
            if (data.expiresAt) {
                if (typeof data.expiresAt.toDate === 'function') {
                    safeExpiresAt = data.expiresAt.toDate().toISOString();
                } else {
                    safeExpiresAt = new Date(data.expiresAt).toISOString();
                }
            }

            const isPublicLink = data.isPublic === true || data.creatorType === "public" || data.createdBy === "public" || (data.isAdminOnly === false && !data.userId);
            const creatorType: "admin" | "public" = data.creatorType || (isPublicLink ? "public" : "admin");
            const userId = data.userId || (isPublicLink ? null : (data.createdBy !== "admin" && data.createdBy !== "public" ? data.createdBy : null));
            const isAdminOnly = data.isAdminOnly !== undefined ? data.isAdminOnly : !isPublicLink;

            return {
                alias: data.alias,
                originalUrl: data.originalUrl,
                iosUrl: data.iosUrl || null,
                androidUrl: data.androidUrl || null,
                ogTitle: data.ogTitle || null,
                ogDescription: data.ogDescription || null,
                ogImage: data.ogImage || null,
                domain: data.domain,
                isProtected: data.isProtected || false,
                password: data.password || null,
                totalClicks: data.totalClicks || 0,
                createdAt: safeCreatedAt,
                expiresAt: safeExpiresAt,
                maxClicks: data.maxClicks || null,
                tags: data.tags || [],
                isDemo: data.isDemo || false,
                isPublic: isPublicLink,
                createdBy: data.createdBy || (isPublicLink ? "public" : "admin"),
                creatorType,
                userId,
                isAdminOnly,
            };
        });

        if (!isDemoUser) {
            links = links.filter(link => !link.isDemo);
        }

        // Safe sorting by creation date descending
        links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ links }, { status: 200 });

    } catch (error) {
        console.error("Error fetching links:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}