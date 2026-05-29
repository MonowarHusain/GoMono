"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Inside src/app/(auth)/login/page.tsx

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // 1. Get the allowed emails, split them, and trim any accidental whitespace
            const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
            const userEmail = result.user.email || "";

            // 2. Check if the logged-in email is in the allowed array
            if (!allowedEmails.includes(userEmail)) {
                await auth.signOut();
                setError("Unauthorized access. Your account is not whitelisted.");
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign in.");
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-white">link-monowar</h1>
                    <p className="text-sm text-neutral-400">Admin Login Portal</p>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
                >
                    {isLoading ? "Authenticating..." : "Sign in with Google"}
                </button>

                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
            </div>
        </main>
    );
}