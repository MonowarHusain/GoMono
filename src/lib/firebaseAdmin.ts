import admin from "firebase-admin";

// 1. Check if the app is already initialized to prevent Next.js from 
// crashing during hot-reloads or serverless function boots on Vercel
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            // 2. Fallback check: Look for the server-side variable first, then the public one
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // 3. Regex fix: Safely parse Vercel's literal "\n" strings into actual line breaks
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

// 4. Export the initialized database connection so your routes can use it
const adminDb = admin.firestore();

export { adminDb };