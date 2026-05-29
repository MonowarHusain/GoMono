import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";
import { Shield, AlertTriangle, Flame, Lock, ArrowRight, Clock } from "lucide-react";

// Force dynamic rendering so every click is checked against the DB in real-time
export const dynamic = "force-dynamic";

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ alias: string }>
}) {
    // 1. You MUST await the params object in Next.js 15
    const { alias } = await params;

    // 2. Now the string is ready for Firebase
    const linkRef = adminDb.collection("links").doc(alias);
    const doc = await linkRef.get();

    // ==========================================
    // 1. Check if the link exists
    // ==========================================
    if (!doc.exists) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-white">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <AlertTriangle className="h-8 w-8 text-neutral-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Link Not Found</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        The URL you are looking for does not exist or has been permanently removed.
                    </p>
                </div>
            </main>
        );
    }

    const data = doc.data()!;

    // ==========================================
    // 2. Check Expiration Date
    // ==========================================
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-white">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Link Expired</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        This link was configured to expire on {data.expiresAt.toDate().toLocaleDateString()} and is no longer accessible.
                    </p>
                </div>
            </main>
        );
    }

    // ==========================================
    // 3. Check "Burn After Reading" Limit
    // ==========================================
    if (data.maxClicks && data.totalClicks >= data.maxClicks) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-white">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                        <Flame className="h-8 w-8 text-red-600 dark:text-red-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-red-600 dark:text-red-500">Link Burned</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        This link was configured to self-destruct after {data.maxClicks} clicks. It has reached its limit.
                    </p>
                </div>
            </main>
        );
    }

    // ==========================================
    // 4. Check Password Protection
    // ==========================================
    if (data.isProtected) {
        const attemptedPassword = searchParams.pwd;

        // If no password is provided, or the password is wrong, render the unlock screen
        if (attemptedPassword !== data.password) {
            const isWrongAttempt = typeof attemptedPassword === "string";

            return (
                <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-white">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/10">
                                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                            </div>
                            <h1 className="text-2xl font-bold">Protected Link</h1>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                This destination is secured. Please enter the password to continue.
                            </p>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    name="pwd"
                                    required
                                    placeholder="Enter access password"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-blue-500/50"
                                />
                                {isWrongAttempt && (
                                    <p className="mt-2 text-sm text-red-500">Incorrect password. Please try again.</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                            >
                                Unlock Destination <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </main>
            );
        }
    }

    // ==========================================
    // 5. Fire Analytics
    // ==========================================
    // 5a. Increment the master counter
    await linkRef.update({
        totalClicks: FieldValue.increment(1),
    });

    // 5b. Log the exact timestamp into the subcollection for the Recharts graph
    await linkRef.collection("clicks").add({
        timestamp: FieldValue.serverTimestamp(),
    });
    // ==========================================
    // 6. Execute Redirect
    // ==========================================
    let destination = data.originalUrl;

    // Force absolute URL to prevent Next.js from treating it as a local route
    if (!destination.startsWith("http://") && !destination.startsWith("https://")) {
        destination = "https://" + destination;
    }

    redirect(destination);
}