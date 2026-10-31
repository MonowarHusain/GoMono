import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { alias, password } = body;

        if (!alias || typeof alias !== "string") {
            return NextResponse.json({ error: "Alias is required", authorized: false }, { status: 400 });
        }

        const linkDoc = await adminDb.collection("links").doc(alias).get();
        if (!linkDoc.exists) {
            return NextResponse.json({ error: "Link not found", authorized: false }, { status: 404 });
        }

        const data = linkDoc.data();
        if (!data) {
            return NextResponse.json({ error: "Link not found", authorized: false }, { status: 404 });
        }

        // Check if expired
        if (data.expiresAt) {
            const exp = typeof data.expiresAt.toDate === "function" ? data.expiresAt.toDate() : new Date(data.expiresAt);
            if (!isNaN(exp.getTime()) && exp < new Date()) {
                return NextResponse.json({ error: "This link has expired.", authorized: false, expired: true }, { status: 410 });
            }
        }

        // Check if burned
        if (typeof data.maxClicks === "number" && data.maxClicks > 0 && (data.totalClicks || 0) >= data.maxClicks) {
            return NextResponse.json({ error: "This link has reached its maximum click limit.", authorized: false, burned: true }, { status: 410 });
        }

        const expectedPassword = data.password;
        if (!data.isProtected && !expectedPassword) {
            return NextResponse.json({ success: true, authorized: true });
        }

        const isValid = expectedPassword === password;
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect passcode. Please try again.", authorized: false }, { status: 401 });
        }

        const res = NextResponse.json({ success: true, authorized: true });
        res.cookies.set(`gomono_pwd_${alias}`, expectedPassword, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 3600 * 24, // 24 hours
        });

        return res;
    } catch (err) {
        console.error("Password verification error:", err);
        return NextResponse.json({ error: "Failed to verify password.", authorized: false }, { status: 500 });
    }
}
