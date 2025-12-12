// Shared Firestore Operations
// This file contains all Firestore CRUD operations using a SHARED global collection
// All users see and contribute to the same data

"use server"

import { adminDb } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Types
export interface SharedLog {
    id: string;
    amount: number;
    timestamp: string;
    type: 'saved' | 'withdraw';
    category: string;
    note?: string;
    createdBy?: string; // Optional: track who created it
    createdAt: Date;
}

// ============================================
// SHARED LOGS COLLECTION (GLOBAL - ALL USERS)
// ============================================

const SHARED_LOGS_COLLECTION = 'shared-logs';

/**
 * Get all shared logs (global - all users see the same data)
 */
export async function getSharedLogs(limit: number = 100): Promise<SharedLog[]> {
    const snapshot = await adminDb
        .collection(SHARED_LOGS_COLLECTION)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            amount: data.amount,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp || new Date().toISOString(),
            type: data.type || 'saved',
            category: data.category || 'Gambling Prevention',
            note: data.note,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate?.() || new Date(),
        };
    });
}

/**
 * Add a log to the shared collection
 */
export async function addSharedLog(log: Omit<SharedLog, 'id' | 'createdAt'>, userId?: string): Promise<string> {
    const docRef = await adminDb
        .collection(SHARED_LOGS_COLLECTION)
        .add({
            amount: log.amount,
            timestamp: Timestamp.fromDate(new Date(log.timestamp)),
            type: log.type || 'saved',
            category: log.category || 'Gambling Prevention',
            note: log.note || null,
            createdBy: userId || 'anonymous',
            createdAt: Timestamp.now(),
        });

    return docRef.id;
}

/**
 * Delete a shared log
 */
export async function deleteSharedLog(logId: string): Promise<void> {
    await adminDb
        .collection(SHARED_LOGS_COLLECTION)
        .doc(logId)
        .delete();
}

/**
 * Delete all shared logs
 */
export async function deleteAllSharedLogs(): Promise<number> {
    const logsRef = adminDb.collection(SHARED_LOGS_COLLECTION);
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

/**
 * Get total saved amount from shared logs
 */
export async function getSharedTotal(): Promise<number> {
    const logs = await getSharedLogs(1000);
    return logs.reduce((sum, log) => sum + log.amount, 0);
}
