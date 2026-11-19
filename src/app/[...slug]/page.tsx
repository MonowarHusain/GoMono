import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import PrefixShortenConfirmation from "@/components/PrefixShortenConfirmation";

interface CatchAllProps {
    params: Promise<{ slug: string[] }>;
}

const RESERVED_PREFIXES = new Set([
    "api",
    "admin",
    "dashboard",
    "csv-studio",
    "qr",
    "login",
    "burned",
    "_next",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
]);

/**
 * Reconstructs a full URL from catch-all slug segments.
 * Handles patterns such as:
 * - /https://github.com/facebook/react -> ["https:", "", "github.com", "facebook", "react"]
 * - /https:/github.com/facebook/react  -> ["https:", "github.com", "facebook", "react"]
 * - /http://example.com/test           -> ["http:", "", "example.com", "test"]
 * - /https%3A%2F%2Fexample.com         -> ["https://example.com"]
 */
function reconstructRawUrl(slug: string[]): string | null {
    if (!slug || slug.length === 0) return null;

    const first = slug[0].toLowerCase();

    // Reject reserved single-segment roots immediately
    if (RESERVED_PREFIXES.has(first)) {
        return null;
    }

    // Protocol segment match
    if (first === "http:" || first === "https:" || first === "http" || first === "https") {
        const protocol = first.startsWith("http:") ? "http:" : first.startsWith("https:") ? "https:" : `${first}:`;
        const rest = slug.slice(1).join("/");
        const cleanRest = rest.replace(/^\/+/, "");
        if (!cleanRest) return null;
        return `${protocol}//${cleanRest}`;
    }

    // URL-encoded or raw full string in first element
    const fullJoined = slug.join("/");
    try {
        const decoded = decodeURIComponent(fullJoined);
        if (/^https?:\/\//i.test(decoded)) {
            return decoded;
        }
    } catch {
        // ignore decoding errors
    }

    if (/^https?:\/\//i.test(fullJoined)) {
        return fullJoined;
    }

    return null;
}

export default async function CatchAllPrefixShortenerPage({ params }: CatchAllProps) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const rawTargetUrl = reconstructRawUrl(slug);
    if (!rawTargetUrl) {
        notFound();
    }

    // Clean destination URL
    let formattedUrl = rawTargetUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
    }

    // Check if link already exists for this URL
    let alias = "";
    const existingSnap = await adminDb
        .collection("links")
        .where("originalUrl", "==", formattedUrl)
        .where("isPublic", "==", true)
        .limit(1)
        .get();

    if (!existingSnap.empty) {
        alias = existingSnap.docs[0].id;
    } else {
        // Generate new 6-character random hex alias
        let attempts = 0;
        let isUnique = false;
        while (!isUnique && attempts < 5) {
            attempts++;
            alias = crypto.randomBytes(3).toString("hex");
            const doc = await adminDb.collection("links").doc(alias).get();
            if (!doc.exists) {
                isUnique = true;
            }
        }

        if (!isUnique) {
            alias = `p${Date.now().toString(36).slice(-5)}`;
        }

        // Save new public link to Firestore
        await adminDb.collection("links").doc(alias).set({
            alias,
            originalUrl: formattedUrl,
            domain: "to.mono.bro.bd",
            totalClicks: 0,
            createdAt: FieldValue.serverTimestamp(),
            isProtected: false,
            password: null,
            maxClicks: null,
            expiresAt: null,
            tags: ["prefix-shortened"],
            createdBy: "public",
            creatorType: "public",
            userId: null,
            isAdminOnly: false,
            isPublic: true,
            isDemo: false,
        });
    }

    const shortUrl = `https://to.mono.bro.bd/${alias}`;

    return (
        <PrefixShortenConfirmation
            alias={alias}
            shortUrl={shortUrl}
            originalUrl={formattedUrl}
        />
    );
}
