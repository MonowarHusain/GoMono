import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { alias, password } = body;

        if (!alias || typeof alias !== "string") {
            return NextResponse.json({ error: "Alias is required" }, { status: 400 });
        }

        const linkDoc = await adminDb.collection("links").doc(alias).get();
        if (!linkDoc.exists) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        const data = linkDoc.data();
        if (!data?.isProtected || !data?.password) {
            return NextResponse.json({ success: true, authorized: true });
        }

        const isValid = data.password === password;
        return NextResponse.json({ success: true, authorized: isValid }, { status: isValid ? 200 : 401 });
    } catch {
        return NextResponse.json({ success: true, authorized: true });
    }
}
