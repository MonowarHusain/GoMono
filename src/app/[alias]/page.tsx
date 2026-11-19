import { notFound, redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin"; // Adjust this if your path is different
import { FieldValue } from "firebase-admin/firestore";
import { parseUserAgent, sanitizeFieldKey } from "@/lib/userAgent";
import { detectTrafficType } from "@/lib/bot-detector";
import PasswordGate from "@/components/public/PasswordGate";
import LinkExpiredView from "@/components/public/LinkExpiredView";
import LinkInspectorCard, { type LinkInspectorData } from "@/components/LinkInspectorCard";

interface PageProps {
    // Next.js 15 requires dynamic route parameters to be Promises
    params: Promise<{ alias: string }>;
    searchParams: Promise<{ pwd?: string }>;
}

export default async function RedirectPage({ params, searchParams }: PageProps) {
    // 1. Await the Next.js 15 routing promises
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const rawAlias = resolvedParams.alias;
    const attemptedPassword = resolvedSearchParams.pwd;

    // Ignore browser/crawler static asset probes
    if (rawAlias === "favicon.ico" || rawAlias === "robots.txt" || rawAlias === "sitemap.xml") {
        notFound();
    }

    // Check for Bitly-style '+' or '%2B' inspection suffix
    const isInspectionMode = rawAlias.endsWith("+") || rawAlias.endsWith("%2B") || rawAlias.endsWith("%2b");
    const alias = isInspectionMode
        ? rawAlias.replace(/(\+|\%2b|\%2B)$/, "")
        : rawAlias;

    if (!alias) {
        notFound();
    }

    // 2. Fetch the link document from Firestore
    const linkRef = adminDb.collection("links").doc(alias);
    const doc = await linkRef.get();

    // 3. Handle 404 if the alias doesn't exist in the database
    if (!doc.exists) {
        notFound();
    }

    const data = doc.data();
    if (!data) notFound();

    // 4. Automated Link Expiration & Click Limit Checks
    let isExpired = false;
    let expirationDate: Date | null = null;

    if (data.expiresAt) {
        if (typeof data.expiresAt.toDate === "function") {
            expirationDate = data.expiresAt.toDate();
        } else if (data.expiresAt instanceof Date) {
            expirationDate = data.expiresAt;
        } else if (typeof data.expiresAt === "string" || typeof data.expiresAt === "number") {
            const parsed = new Date(data.expiresAt);
            if (!isNaN(parsed.getTime())) {
                expirationDate = parsed;
            }
        }

        if (expirationDate && !isNaN(expirationDate.getTime()) && expirationDate < new Date()) {
            isExpired = true;
        }
    }

    const totalClicks = typeof data.totalClicks === "number" ? data.totalClicks : 0;
    const maxClicks = typeof data.maxClicks === "number" ? data.maxClicks : (data.maxClicks ? parseInt(String(data.maxClicks), 10) : null);
    const isLimitReached = Boolean(maxClicks && maxClicks > 0 && totalClicks >= maxClicks);

    // 5. If inspection mode was requested (e.g., /alias+), render safety inspector immediately without tracking click
    if (isInspectionMode) {
        const inspectorData: LinkInspectorData = {
            alias,
            originalUrl: data.originalUrl,
            domain: data.domain || "to.mono.bro.bd",
            totalClicks,
            createdAt: data.createdAt ? (typeof data.createdAt.toDate === "function" ? data.createdAt.toDate() : new Date(data.createdAt)) : null,
            expiresAt: expirationDate,
            isProtected: Boolean(data.isProtected || data.password),
            iosUrl: data.iosUrl || null,
            androidUrl: data.androidUrl || null,
            tags: Array.isArray(data.tags) ? data.tags : [],
        };

        return <LinkInspectorCard link={inspectorData} />;
    }

    // If expired or limit is reached, render clean, professional error view
    if (isExpired || isLimitReached) {
        return (
            <LinkExpiredView
                alias={alias}
                domain={data.domain || "to.mono.bro.bd"}
                isExpired={isExpired}
                isLimitReached={isLimitReached}
                expirationDate={expirationDate}
                maxClicks={maxClicks}
                totalClicks={totalClicks}
            />
        );
    }

    // 6. Security Check: Password Protection Interception
    const linkPassword = (data.password && typeof data.password === "string" && data.password.trim()) || null;
    const isProtected = Boolean(data.isProtected || linkPassword);

    if (isProtected && linkPassword) {
        const cookieStore = await cookies();
        const cookieAuth = cookieStore.get(`gomono_pwd_${alias}`)?.value;

        const isAuthByQuery = Boolean(attemptedPassword && attemptedPassword === linkPassword);
        const isAuthByCookie = Boolean(cookieAuth && cookieAuth === linkPassword);

        if (!isAuthByQuery && !isAuthByCookie) {
            // Render the gorgeous, minimalist password-entry screen matching GoMono's aesthetic
            return (
                <PasswordGate
                    alias={alias}
                    domain={data.domain || "to.mono.bro.bd"}
                    initialError={Boolean(attemptedPassword && attemptedPassword !== linkPassword)}
                />
            );
        }
    }

    // 7. Device-Based Smart Routing (Inspect User-Agent)
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || "";
    const referer = headerList.get("referer") || null;

    const parsedUa = parseUserAgent(userAgent);
    const isIos = parsedUa.os === "iOS" || /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = parsedUa.os === "Android" || /android/i.test(userAgent);

    let destinationUrl = data.originalUrl;
    if (isIos && data.iosUrl && typeof data.iosUrl === "string" && data.iosUrl.trim()) {
        destinationUrl = data.iosUrl.trim();
    } else if (isAndroid && data.androidUrl && typeof data.androidUrl === "string" && data.androidUrl.trim()) {
        destinationUrl = data.androidUrl.trim();
    }

    // 8. Atomic Click Analytics Recording & Metadata Event Logging (Human Visitors Only)
    const trafficInfo = detectTrafficType(userAgent);

    // Bot Shield: Skip Firestore writes for search crawlers, social scrapers, and automated scripts
    // This preserves free-tier quotas while still smoothly redirecting the visitor/bot
    if (!trafficInfo.isBot) {
        try {
            const deviceKey = sanitizeFieldKey(parsedUa.device);
            const browserKey = sanitizeFieldKey(parsedUa.browser);
            const osKey = sanitizeFieldKey(parsedUa.os);

            await Promise.all([
                // 8a. Atomic aggregated counters on link doc for O(1) instantaneous analytics reads
                linkRef.update({
                    totalClicks: FieldValue.increment(1),
                    [`devices.${deviceKey}`]: FieldValue.increment(1),
                    [`browsers.${browserKey}`]: FieldValue.increment(1),
                    [`os.${osKey}`]: FieldValue.increment(1),
                    lastClickedAt: FieldValue.serverTimestamp(),
                }),
                // 8b. Fine-grained historical click audit log in subcollection
                linkRef.collection("clicks").add({
                    timestamp: FieldValue.serverTimestamp(),
                    userAgent: userAgent.slice(0, 500),
                    device: parsedUa.device,
                    browser: parsedUa.browser,
                    os: parsedUa.os,
                    targetUrl: destinationUrl,
                    referer: referer ? referer.slice(0, 500) : null,
                }),
            ]);
        } catch (trackingErr) {
            // High-availability: Do not block visitor redirect if metrics write encounters an error
            console.error("Error recording link click analytics:", trackingErr);
            try {
                // Fallback: at least increment basic totalClicks counter
                await linkRef.update({
                    totalClicks: FieldValue.increment(1),
                });
            } catch {
                // Ignore secondary fallback error
            }
        }
    }

    // 9. Execute the device-smart routing redirect!
    redirect(destinationUrl);
}