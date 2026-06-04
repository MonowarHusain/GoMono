"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
            const userEmail = result.user.email || "";

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

    const handleDemoSignIn = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Authenticate
            const result = await signInWithEmailAndPassword(auth, "demo01@go.mono.bro.bd", "demo@123");
            const userEmail = result.user.email || "";

            // 2. Authorization check
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
            const isDemo = userEmail === "demo01@go.mono.bro.bd";
            const isAdmin = adminEmails.includes(userEmail);

            if (!isAdmin && !isDemo) {
                await auth.signOut();
                setError("Unauthorized access.");
                setIsLoading(false);
                return;
            }

            // 3. FORCE state sync before navigation
            // We wait for the auth state to settle to avoid middleware loops
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 4. Use replace instead of push to prevent back-button loops
            router.replace("/dashboard");

        } catch (err: any) {
            console.error("Auth Error:", err);
            setError("Demo account is currently unavailable.");
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-white">GoMono</h1>
                    <p className="text-sm text-neutral-400">Admin Login Portal</p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Original Google Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
                    >
                        {isLoading ? "Authenticating..." : "Sign in with Google"}
                    </button>

                    {/* Demo Login Button (Now 1-Click Auto Login) */}
                    <button
                        onClick={handleDemoSignIn}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-transparent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {isLoading ? "Authenticating..." : "Sign in as Demo User"}
                    </button>
                </div>

                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
            </div>
        </main>
    );
}