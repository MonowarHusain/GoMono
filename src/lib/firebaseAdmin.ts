import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gomono-default";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// 1. Check if the app is already initialized to prevent Next.js from 
// crashing during hot-reloads or serverless function boots on Vercel
if (!admin.apps.length) {
    if (clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        admin.initializeApp({
            projectId,
        });
    }
}

// 4. Export the initialized database connection so your routes can use it
const adminDb = admin.firestore();

export { adminDb };