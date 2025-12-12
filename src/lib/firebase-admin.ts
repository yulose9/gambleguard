// Firebase Admin SDK Configuration
// This file initializes Firebase Admin for server-side operations
// NEVER import this file on the client side!

import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Get project ID from environment (set in Cloud Run)
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
        || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        || process.env.GCP_PROJECT_ID
        || process.env.GOOGLE_CLOUD_PROJECT; // Cloud Run sets this automatically

    // Check if we have full credentials (for local dev with service account)
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey && projectId) {
        // Use explicit service account credentials
        console.log('Using explicit Firebase Admin credentials');
        return initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    // In Cloud Run, use Application Default Credentials (automatic)
    // The Cloud Run service account has access to Firestore
    if (projectId) {
        console.log(`Using Application Default Credentials for project: ${projectId}`);
        return initializeApp({
            credential: applicationDefault(),
            projectId,
        });
    }

    // Fallback - try to use default credentials
    console.warn('No project ID configured. Firebase Admin may not work correctly.');
    return initializeApp({
        credential: applicationDefault(),
    });
}

const adminApp = getFirebaseAdmin();

// Admin Auth instance (for server-side token verification)
export const adminAuth = getAuth(adminApp);

// Admin Firestore instance (bypasses security rules)
export const adminDb = getFirestore(adminApp);

export default adminApp;

