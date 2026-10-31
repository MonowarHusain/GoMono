import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import type { CreateLinkInput } from "@/types/link";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        let decodedToken: DecodedIdToken | null = null;
        let isDemoUser = false;
        let isPublic = true;
        let createdBy = "public";

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split("Bearer ")[1]?.trim();
            if (token) {
                try {
                    decodedToken = await getAuth().verifyIdToken(token);
                    if (decodedToken && decodedToken.uid) {
                        isPublic = false;
                        createdBy = decodedToken.uid;
                        isDemoUser = decodedToken.email === "demo01@go.mono.bro.bd";
                    }
                } catch (authErr) {
                    // If token is invalid or expired, gracefully fallback to public creation
                    console.warn("Auth token verification failed; falling back to public link creation:", authErr);
                    isPublic = true;
                    createdBy = "public";
                    isDemoUser = false;
                }
            }
        }

        const body: CreateLinkInput = await req.json();
        const { originalUrl, customAlias, domain, tags, maxClicks, expiresAt, password, iosUrl, androidUrl } = body;

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

        // Process Security Options: Expiration Date, Max Clicks, Password
        let finalExpiresAt: Date | null = null;
        if (expiresAt) {
            const parsedDate = new Date(expiresAt);
            if (!isNaN(parsedDate.getTime())) {
                finalExpiresAt = parsedDate;
            }
        }

        let finalMaxClicks: number | null = null;
        if (maxClicks !== undefined && maxClicks !== null && maxClicks !== "") {
            const parsedClicks = typeof maxClicks === "number" ? maxClicks : parseInt(String(maxClicks), 10);
            if (!isNaN(parsedClicks) && parsedClicks > 0) {
                finalMaxClicks = parsedClicks;
            }
        }

        const cleanPassword = typeof password === "string" && password.trim() ? password.trim() : null;

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
            domain: domain || "to.mono.bro.bd",
            totalClicks: 0,
            createdAt: FieldValue.serverTimestamp(),
            isProtected: !!cleanPassword,
            password: cleanPassword,
            maxClicks: finalMaxClicks,
            expiresAt: finalExpiresAt,
            tags: tagsArray,
            createdBy,
            isPublic,
            isDemo: isDemoUser
        });

        return NextResponse.json({ success: true, alias, isPublic }, { status: 201 });

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

            const isPublicLink = data.isPublic === true || data.createdBy === "public";

            return {
                alias: data.alias,
                originalUrl: data.originalUrl,
                iosUrl: data.iosUrl || null,
                androidUrl: data.androidUrl || null,
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