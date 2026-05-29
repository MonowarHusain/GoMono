import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ alias: string }>;
}) {
    // STRICT RULE: Always force the incoming alias to lowercase
    const resolvedParams = await params;
    const alias = resolvedParams.alias.toLowerCase();

    // 1. Fetch the destination from Firestore
    const linkRef = adminDb.collection("links").doc(alias);
    const doc = await linkRef.get();

    if (!doc.exists) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-neutral-400 mt-2">This link does not exist.</p>
                </div>
            </main>
        );
    }

    const data = doc.data();

    // 2. Check Expiration
    if (data?.expiresAt) {
        const isExpired = data.expiresAt.toDate() < new Date();
        if (isExpired) {
            return (
                <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-red-500">Link Expired</h1>
                        <p className="text-neutral-400 mt-2">This URL is no longer active.</p>
                    </div>
                </main>
            );
        }
    }
    // Inside src/app/[alias]/page.tsx

    // 3. Check "Burn After Reading" Limit
    if (data?.maxClicks && data.totalClicks >= data.maxClicks) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
                        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-red-500">Link Burned</h1>
                    <p className="text-neutral-400">
                        This link was configured to self-destruct after {data.maxClicks} clicks. It is no longer accessible.
                    </p>
                </div>
            </main>
        );
    }
    // 3. Check Password Protection
    if (data?.isProtected) {
        // Note: For a complete system, you would render a Client Component here 
        // containing a form that POSTs to /api/verify-password. 
        // To keep this blueprint concise, we will render a placeholder for the protected route.
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center backdrop-blur-xl">
                    <h1 className="text-2xl font-bold mb-4">Protected Link</h1>
                    <p className="text-neutral-400 mb-6">A password is required to access this URL.</p>
                    {/* You will build out the password input form here later */}
                    <input type="password" placeholder="Enter password" className="w-full rounded-md bg-neutral-800 p-3 text-white outline-none" disabled />
                </div>
            </main>
        );
    }

    // 4. Log the Analytics (Fire and Forget)
    // We don't await this so it doesn't slow down the user's redirect!
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Unknown";
    const referer = headersList.get("referer") || "Direct";

    try {
        // Add to the subcollection
        linkRef.collection("clicks").add({
            timestamp: new Date(),
            userAgent,
            referer,
        });
        // Increment the total clicks counter on the main document
        linkRef.update({
            totalClicks: FieldValue.increment(1)
        });
    } catch (error) {
        console.error("Failed to log click:", error);
    }

    // 5. The fast server-side redirect
    redirect(data?.originalUrl);
}