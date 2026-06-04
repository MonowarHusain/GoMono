import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await getAuth().verifyIdToken(token);

        // Fixed the email to match your actual demo user
        const isDemoUser = decodedToken.email === "demo01@go.mono.bro.bd";

        const body = await req.json();
        const { originalUrl, customAlias, domain, tags, maxClicks, expiresAt, password } = body;

        if (!originalUrl) {
            return NextResponse.json({ error: "Original URL is required" }, { status: 400 });
        }

        let finalExpiresAt = expiresAt ? new Date(expiresAt) : null;
        let finalMaxClicks = maxClicks ? parseInt(maxClicks, 10) : null;

        if (isDemoUser) {
            const tomorrow = new Date();
            tomorrow.setHours(tomorrow.getHours() + 24);
            finalExpiresAt = tomorrow;
            finalMaxClicks = finalMaxClicks ? Math.min(finalMaxClicks, 50) : 50;
        }

        let alias = customAlias?.trim();
        if (!alias) {
            alias = crypto.randomBytes(3).toString("hex");
        }

        const linkRef = adminDb.collection("links").doc(alias);
        const doc = await linkRef.get();

        if (doc.exists) {
            return NextResponse.json({ error: "Alias already taken" }, { status: 409 });
        }

        const tagsArray = tags
            ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [];

        await linkRef.set({
            alias,
            originalUrl,
            domain: domain || "to.mono.bro.bd",
            totalClicks: 0,
            createdAt: FieldValue.serverTimestamp(),
            isProtected: !!password,
            password: password || null,
            maxClicks: finalMaxClicks,
            expiresAt: finalExpiresAt,
            tags: tagsArray,
            createdBy: decodedToken.uid,
            isDemo: isDemoUser
        });

        return NextResponse.json({ success: true, alias }, { status: 201 });

    } catch (error) {
        console.error("Error creating link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// NEW: Secure GET request to fetch isolated links
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

            return {
                alias: data.alias,
                originalUrl: data.originalUrl,
                domain: data.domain,
                isProtected: data.isProtected || false,
                totalClicks: data.totalClicks || 0,
                createdAt: safeCreatedAt,
                expiresAt: safeExpiresAt,
                maxClicks: data.maxClicks || null,
                tags: data.tags || [],
                isDemo: data.isDemo || false
            };
        });

        if (!isDemoUser) {
            links = links.filter(link => !link.isDemo);
        }

        // Safe sorting
        links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ links }, { status: 200 });

    } catch (error) {
        console.error("Error fetching links:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}