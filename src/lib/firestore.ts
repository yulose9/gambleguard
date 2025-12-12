// Firestore Operations
// This file contains all Firestore CRUD operations for the app

"use server"

import { adminDb } from './firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// Types
export interface UserProfile {
    id: string;
    displayName: string;
    email?: string;
    createdAt: Date;
    lastLogin: Date;
    allowedDevices: string[];
}

export interface TransactionLog {
    id: string;
    amount: number;
    timestamp: string;
    type: 'saved' | 'withdraw';
    category: string;
    note?: string;
}

export interface PasskeyCredential {
    id: string;
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceType: string;
    transports?: string[];
    createdAt: Date;
}

// ============================================
// USER OPERATIONS
// ============================================

export async function createUser(userId: string, displayName: string): Promise<UserProfile> {
    const now = new Date();
    const userData = {
        displayName,
        createdAt: Timestamp.fromDate(now),
        lastLogin: Timestamp.fromDate(now),
        allowedDevices: [],
    };

    await adminDb.collection('users').doc(userId).set(userData);

    return {
        id: userId,
        ...userData,
        createdAt: now,
        lastLogin: now,
    };
}

export async function getUser(userId: string): Promise<UserProfile | null> {
    const doc = await adminDb.collection('users').doc(userId).get();

    if (!doc.exists) {
        return null;
    }

    const data = doc.data()!;
    return {
        id: doc.id,
        displayName: data.displayName,
        email: data.email,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
        allowedDevices: data.allowedDevices || [],
    };
}

export async function updateUserLastLogin(userId: string): Promise<void> {
    await adminDb.collection('users').doc(userId).update({
        lastLogin: Timestamp.now(),
    });
}

// ============================================
// PASSKEY CREDENTIAL OPERATIONS
// ============================================

export async function savePasskeyCredential(
    userId: string,
    credential: Omit<PasskeyCredential, 'id' | 'createdAt'>
): Promise<string> {
    const docRef = await adminDb
        .collection('users')
        .doc(userId)
        .collection('credentials')
        .add({
            ...credential,
            createdAt: Timestamp.now(),
        });

    return docRef.id;
}

export async function getPasskeyCredentials(userId: string): Promise<PasskeyCredential[]> {
    const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('credentials')
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            credentialId: data.credentialId,
            publicKey: data.publicKey,
            counter: data.counter,
            deviceType: data.deviceType,
            transports: data.transports,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    });
}

export async function getPasskeyByCredentialId(
    userId: string,
    credentialId: string
): Promise<PasskeyCredential | null> {
    const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('credentials')
        .where('credentialId', '==', credentialId)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        credentialId: data.credentialId,
        publicKey: data.publicKey,
        counter: data.counter,
        deviceType: data.deviceType,
        transports: data.transports,
        createdAt: data.createdAt?.toDate() || new Date(),
    };
}

export async function updatePasskeyCounter(
    userId: string,
    credentialDocId: string,
    newCounter: number
): Promise<void> {
    await adminDb
        .collection('users')
        .doc(userId)
        .collection('credentials')
        .doc(credentialDocId)
        .update({ counter: newCounter });
}

// ============================================
// TRANSACTION LOG OPERATIONS
// ============================================

export async function saveLogs(userId: string, logs: TransactionLog[]): Promise<void> {
    const batch = adminDb.batch();
    const logsRef = adminDb.collection('users').doc(userId).collection('logs');

    for (const log of logs) {
        const docRef = logsRef.doc(log.id);
        batch.set(docRef, {
            amount: log.amount,
            timestamp: Timestamp.fromDate(new Date(log.timestamp)),
            type: log.type,
            category: log.category,
            note: log.note || null,
        }, { merge: true });
    }

    await batch.commit();
}

export async function getLogs(userId: string, limit: number = 100): Promise<TransactionLog[]> {
    const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('logs')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            amount: data.amount,
            timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString(),
            type: data.type,
            category: data.category,
            note: data.note,
        };
    });
}

export async function addLog(userId: string, log: Omit<TransactionLog, 'id'>): Promise<string> {
    const docRef = await adminDb
        .collection('users')
        .doc(userId)
        .collection('logs')
        .add({
            amount: log.amount,
            timestamp: Timestamp.fromDate(new Date(log.timestamp)),
            type: log.type,
            category: log.category,
            note: log.note || null,
        });

    return docRef.id;
}

export async function deleteLog(userId: string, logId: string): Promise<void> {
    await adminDb
        .collection('users')
        .doc(userId)
        .collection('logs')
        .doc(logId)
        .delete();
}

export async function deleteAllLogs(userId: string): Promise<number> {
    const logsRef = adminDb.collection('users').doc(userId).collection('logs');
    const snapshot = await logsRef.get();

    if (snapshot.empty) {
        return 0;
    }

    // Delete in batches (Firestore has a limit of 500 per batch)
    const batchSize = 500;
    let deleted = 0;

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let currentBatch = adminDb.batch();
    let operationCount = 0;

    snapshot.docs.forEach((doc) => {
        currentBatch.delete(doc.ref);
        operationCount++;
        deleted++;

        if (operationCount >= batchSize) {
            batches.push(currentBatch);
            currentBatch = adminDb.batch();
            operationCount = 0;
        }
    });

    if (operationCount > 0) {
        batches.push(currentBatch);
    }

    // Execute all batches
    await Promise.all(batches.map(batch => batch.commit()));

    return deleted;
}

// ============================================
// CHALLENGE STORAGE (for WebAuthn)
// ============================================

export async function storeChallenge(
    sessionId: string,
    challenge: string,
    userId?: string
): Promise<void> {
    await adminDb.collection('challenges').doc(sessionId).set({
        challenge,
        userId: userId || null,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)), // 5 minutes
    });
}

export async function getChallenge(sessionId: string): Promise<{ challenge: string; userId?: string } | null> {
    const doc = await adminDb.collection('challenges').doc(sessionId).get();

    if (!doc.exists) {
        return null;
    }

    const data = doc.data()!;

    // Check if challenge has expired
    if (data.expiresAt.toDate() < new Date()) {
        await doc.ref.delete();
        return null;
    }

    return {
        challenge: data.challenge,
        userId: data.userId,
    };
}

export async function deleteChallenge(sessionId: string): Promise<void> {
    await adminDb.collection('challenges').doc(sessionId).delete();
}

// ============================================
// USER LOOKUP BY CREDENTIAL
// ============================================

export async function findUserByCredentialId(credentialId: string): Promise<string | null> {
    // Query all users' credentials (in production, you'd want an index for this)
    const usersSnapshot = await adminDb.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
        const credSnapshot = await userDoc.ref
            .collection('credentials')
            .where('credentialId', '==', credentialId)
            .limit(1)
            .get();

        if (!credSnapshot.empty) {
            return userDoc.id;
        }
    }

    return null;
}
