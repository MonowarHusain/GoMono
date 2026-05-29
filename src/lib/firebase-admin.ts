import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent hot-reload errors
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // The replace() function ensures the raw \n strings from the .env file 
                // are converted back into actual line breaks required by the crypto library.
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully.');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

// Export the admin database and auth instances for use in Server Actions and API routes
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();