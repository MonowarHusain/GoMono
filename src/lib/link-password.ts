/**
 * Zero-Dependency SHA-256 Password Hashing & Verification Helper
 * Uses standard Web Crypto API (supported across modern browsers, Node 18+, Edge runtime, and Cloudflare)
 * to ensure link passwords are never persisted as plaintext in Firestore or client vaults.
 */

/**
 * Computes a standard SHA-256 hex digest for a plaintext password.
 * Works uniformly in both browser and server/Edge runtime.
 */
export async function hashPassword(plaintext: string): Promise<string> {
    const trimmed = plaintext.trim();
    if (!trimmed) return "";

    // Prefer Web Crypto API (universal standard)
    if (typeof crypto !== "undefined" && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(trimmed);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    // Node.js fallback if crypto.subtle is not available
    try {
        const nodeCrypto = await import("crypto");
        return nodeCrypto.createHash("sha256").update(trimmed).digest("hex");
    } catch {
        // Fallback for minimal environments
        return "";
    }
}

/**
 * Synchronous password hashing for server environments running Node.js.
 */
export function hashPasswordSync(plaintext: string): string {
    const trimmed = plaintext.trim();
    if (!trimmed) return "";

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const nodeCrypto = require("crypto");
        return nodeCrypto.createHash("sha256").update(trimmed).digest("hex");
    } catch {
        return "";
    }
}

/**
 * Constant-time comparison between plaintext and target hash.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    const candidateHash = await hashPassword(plaintext);
    if (!candidateHash || !hash) return false;

    // Constant-time length and byte comparison to prevent timing side-channels
    if (candidateHash.length !== hash.length) return false;

    let mismatch = 0;
    for (let i = 0; i < candidateHash.length; i++) {
        mismatch |= candidateHash.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    return mismatch === 0;
}
