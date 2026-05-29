import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snapshot = await adminDb.collection("links").orderBy("createdAt", "desc").get();

        // 1. Define the CSV Header
        let csv = "Alias,Original URL,Total Clicks,Created At,Expires At,Protected,Max Clicks,Tags\n";

        // 2. Loop through the database and format each row
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const alias = data.alias || "";
            // Wrap URLs in quotes in case they contain commas
            const url = `"${data.originalUrl || ""}"`;
            const clicks = data.totalClicks || 0;
            const created = data.createdAt ? data.createdAt.toDate().toISOString() : "";
            const expires = data.expiresAt ? data.expiresAt.toDate().toISOString() : "Never";
            const protectedStatus = data.isProtected ? "Yes" : "No";
            const maxClicks = data.maxClicks || "Unlimited";
            const tags = data.tags ? `"${data.tags.join("; ")}"` : "";

            csv += `${alias},${url},${clicks},${created},${expires},${protectedStatus},${maxClicks},${tags}\n`;
        });

        // 3. Return the CSV file to the browser
        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="mononode-export-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Failed to export data", { status: 500 });
    }
}