import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { validateBioPageInput } from "@/lib/bio-schema";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { valid, errors, sanitized } = validateBioPageInput(body);

        if (!valid || !sanitized) {
            return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
        }

        const handle = sanitized.handle;
        const docRef = adminDb.collection("bio_pages").doc(handle);
        const existingDoc = await docRef.get();

        if (existingDoc.exists) {
            const currentData = existingDoc.data();
            const storedToken = currentData?.editToken;

            // Enforce editToken ownership for updates
            if (storedToken && sanitized.editToken !== storedToken) {
                return NextResponse.json(
                    { error: `The handle "${handle}" is already claimed. An invalid edit token was provided.` },
                    { status: 403 }
                );
            }

            // Update existing bio page
            await docRef.update({
                displayName: sanitized.displayName,
                bio: sanitized.bio,
                avatarUrl: sanitized.avatarUrl || null,
                theme: sanitized.theme || "midnight-dark",
                socials: sanitized.socials || [],
                links: sanitized.links || [],
                updatedAt: FieldValue.serverTimestamp(),
            });

            return NextResponse.json({
                success: true,
                handle,
                editToken: storedToken,
                url: `/b/${handle}`,
                message: "Bio page updated successfully!",
            });
        }

        // Create new bio page
        const newEditToken = sanitized.editToken || crypto.randomBytes(16).toString("hex");

        await docRef.set({
            handle,
            displayName: sanitized.displayName,
            bio: sanitized.bio,
            avatarUrl: sanitized.avatarUrl || null,
            theme: sanitized.theme || "midnight-dark",
            socials: sanitized.socials || [],
            links: sanitized.links || [],
            editToken: newEditToken,
            totalViews: 0,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            handle,
            editToken: newEditToken,
            url: `/b/${handle}`,
            message: "Bio page created successfully!",
        }, { status: 201 });
    } catch (err) {
        console.error("Error saving bio page:", err);
        return NextResponse.json({ error: "Failed to save bio page" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const handle = searchParams.get("handle")?.toLowerCase().trim();

        if (!handle) {
            return NextResponse.json({ error: "Handle is required" }, { status: 400 });
        }

        const snap = await adminDb.collection("bio_pages").doc(handle).get();
        if (!snap.exists) {
            return NextResponse.json({ exists: false }, { status: 404 });
        }

        const data = snap.data();
        return NextResponse.json({
            exists: true,
            page: {
                handle: data?.handle,
                displayName: data?.displayName,
                bio: data?.bio,
                avatarUrl: data?.avatarUrl,
                theme: data?.theme,
                socials: data?.socials,
                links: data?.links,
                totalViews: data?.totalViews || 0,
            },
        });
    } catch (err) {
        console.error("Error fetching bio page:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
