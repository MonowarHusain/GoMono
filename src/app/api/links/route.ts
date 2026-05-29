import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { originalUrl, customAlias, tags, maxClicks, expiresAt, password } = body;

        if (!originalUrl) {
            return NextResponse.json({ error: "Original URL is required" }, { status: 400 });
        }

        // 1. Determine the Alias (Use custom or generate a random 6-character string)
        let alias = customAlias?.trim();
        if (!alias) {
            alias = crypto.randomBytes(3).toString("hex");
        }

        // 2. Check if the Alias already exists in the database
        const linkRef = adminDb.collection("links").doc(alias);
        const doc = await linkRef.get();

        if (doc.exists) {
            return NextResponse.json({ error: "Alias already taken" }, { status: 409 });
        }

        // 3. Format the Tags (Convert "mlsa, github, personal" into an array)
        const tagsArray = tags
            ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [];

        // 4. Save to Firestore
        await linkRef.set({
            alias,
            originalUrl,
            totalClicks: 0,
            createdAt: FieldValue.serverTimestamp(),
            isProtected: !!password,
            password: password || null,
            maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            tags: tagsArray,
        });

        // 5. Return success to the frontend
        return NextResponse.json({ success: true, alias }, { status: 201 });

    } catch (error) {
        console.error("Error creating link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}