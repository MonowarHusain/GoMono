import admin from "firebase-admin";

// We check if the app is already initialized to prevent Next.js from 
// crashing during hot-reloads or serverless function boots
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // This line safely parses the Vercel string format into actual line breaks
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

// Export the initialized database connection so page.tsx can use it
const adminDb = admin.firestore();
export { adminDb };