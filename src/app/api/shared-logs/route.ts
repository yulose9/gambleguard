// Shared Logs API Route
// Uses a GLOBAL shared collection - all users see and contribute to the same data
// GET: Fetch all shared logs
// POST: Add a new shared log
// DELETE: Delete a specific log or all logs

import { NextRequest, NextResponse } from 'next/server';
import {
    getSharedLogs,
    addSharedLog,
    deleteSharedLog,
    deleteAllSharedLogs
} from '@/lib/shared-firestore';

// GET: Fetch all shared logs
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '100', 10);

        const logs = await getSharedLogs(limit);

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length,
            source: 'shared-global'
        });
    } catch (error) {
        console.error('Fetch shared logs error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}

// POST: Add a new shared log
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, category, note, type = 'saved' } = body;

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const logId = await addSharedLog({
            amount,
            timestamp: new Date().toISOString(),
            type,
            category: category || 'Gambling Prevention',
            note: note || 'Resisted urge to gamble',
        });

        return NextResponse.json({
            success: true,
            logId,
            message: 'Log added to shared database',
        });
    } catch (error) {
        console.error('Add shared log error:', error);
        return NextResponse.json(
            { error: 'Failed to add log' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a specific log or all logs
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const logId = searchParams.get('id');
        const deleteAll = searchParams.get('all') === 'true';

        if (deleteAll) {
            const deletedCount = await deleteAllSharedLogs();

            return NextResponse.json({
                success: true,
                deleted: deletedCount,
                message: `Deleted ${deletedCount} logs from shared database`,
            });
        }

        if (!logId) {
            return NextResponse.json(
                { error: 'Log ID required' },
                { status: 400 }
            );
        }

        await deleteSharedLog(logId);

        return NextResponse.json({
            success: true,
            message: 'Log deleted from shared database',
        });
    } catch (error) {
        console.error('Delete shared log error:', error);
        return NextResponse.json(
            { error: 'Failed to delete log' },
            { status: 500 }
        );
    }
}
