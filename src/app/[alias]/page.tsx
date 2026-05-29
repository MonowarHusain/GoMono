import { notFound, redirect } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin"; // Adjust this if your path is different
import { FieldValue } from "firebase-admin/firestore";
import { Lock, AlertCircle } from "lucide-react";

interface PageProps {
    // Next.js 15 requires dynamic route parameters to be Promises
    params: Promise<{ alias: string }>;
    searchParams: Promise<{ pwd?: string }>;
}

export default async function RedirectPage({ params, searchParams }: PageProps) {
    // 1. Await the Next.js 15 routing promises
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const alias = resolvedParams.alias;
    const attemptedPassword = resolvedSearchParams.pwd;

    // 2. Fetch the link document from Firestore
    const linkRef = adminDb.collection("links").doc(alias);
    const doc = await linkRef.get();

    // 3. Handle 404 if the alias doesn't exist in the database
    if (!doc.exists) {
        notFound();
    }

    const data = doc.data();
    if (!data) notFound();

    // 4. Security Check: Expiration Date
    if (data.expiresAt) {
        const expirationDate = new Date(data.expiresAt);
        if (expirationDate < new Date()) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-neutral-950">
                    <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-50/50 p-8 text-center dark:bg-red-500/10">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h1 className="text-xl font-bold text-red-700 dark:text-red-400">Link Expired</h1>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            This link has passed its expiration date and is no longer active.
                        </p>
                    </div>
                </div>
            );
        }
    }

    // 5. Security Check: Burn Limit (Max Clicks)
    if (data.maxClicks && data.totalClicks >= data.maxClicks) {
        // Redirect them immediately to the burned page
        redirect("/burned");
    }

    // (Optional) You can also do the same thing for expired links if you create an /expired page!
    if (data.expiresAt) {
        const expirationDate = new Date(data.expiresAt);
        if (expirationDate < new Date()) {
            redirect("/burned"); // Or point to a dedicated expired page
        }
    }

    // 6. Security Check: Password Protection
    if (data.isProtected) {
        if (attemptedPassword !== data.password) {
            // Render the Password Unlock UI
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 transition-colors duration-300 dark:bg-neutral-950">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <Lock className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Protected Link</h1>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                Enter the password to access this destination.
                            </p>
                        </div>

                        {/* A native HTML form that submits a GET request to the same URL, appending ?pwd=value */}
                        <form action={`/${alias}`} method="GET" className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    name="pwd"
                                    required
                                    placeholder="Enter password..."
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                                />
                            </div>

                            {attemptedPassword && (
                                <p className="text-center text-sm font-medium text-red-500">
                                    Incorrect password. Please try again.
                                </p>
                            )}

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                            >
                                Unlock Link
                            </button>
                        </form>
                    </div>
                </div>
            );
        }
    }

    // 7. If all checks pass, increment the click counter
    // We await this so the database write completes before Vercel terminates the function during redirect
    await linkRef.update({
        totalClicks: FieldValue.increment(1)
    });

    // 8. Execute the routing!
    redirect(data.originalUrl);
}