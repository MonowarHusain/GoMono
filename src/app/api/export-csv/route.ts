import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// Force Next.js to not cache this route so you always get live data
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snapshot = await adminDb.collection("links").orderBy("createdAt", "desc").get();

        // Set up the CSV Headers
        let csvData = "Alias,Destination URL,Total Clicks,Created At,Has Password\n";

        // Map through the database and append rows
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            // We wrap the URL in quotes just in case it contains a comma naturally
            const safeUrl = `"${data.originalUrl}"`;
            const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : "Unknown";

            csvData += `${data.alias},${safeUrl},${data.totalClicks || 0},${createdAt},${!!data.isProtected}\n`;
        });

        // Send the raw CSV string back to the browser with standard file download headers
        return new NextResponse(csvData, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="GoMono-export.csv"',
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Failed to generate export", { status: 500 });
    }
}