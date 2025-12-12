// Logs API Route
// GET: Fetch user's logs from Firestore
// POST: Add a new log
// PUT: Sync/bulk update logs
// DELETE: Delete a specific log

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLogs, addLog, saveLogs, deleteLog, TransactionLog } from '@/lib/firestore';

// Helper to get authenticated user
async function getAuthenticatedUser(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('user_id')?.value || null;
}

// GET: Fetch logs
export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '100', 10);

        const logs = await getLogs(userId, limit);

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length,
        });
    } catch (error) {
        console.error('Fetch logs error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}

// POST: Add a single log
export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { amount, category, note, type = 'saved' } = body;

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const logId = await addLog(userId, {
            amount,
            timestamp: new Date().toISOString(),
            type,
            category: category || 'Gambling Prevention',
            note: note || 'Resisted urge to gamble',
        });

        return NextResponse.json({
            success: true,
            logId,
            message: 'Log added successfully',
        });
    } catch (error) {
        console.error('Add log error:', error);
        return NextResponse.json(
            { error: 'Failed to add log' },
            { status: 500 }
        );
    }
}

// PUT: Sync/bulk update logs
export async function PUT(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { logs } = body;

        if (!Array.isArray(logs)) {
            return NextResponse.json(
                { error: 'Logs must be an array' },
                { status: 400 }
            );
        }

        // Validate logs
        const validLogs: TransactionLog[] = logs.filter(log =>
            log.id &&
            typeof log.amount === 'number' &&
            log.timestamp
        );

        if (validLogs.length === 0) {
            return NextResponse.json(
                { error: 'No valid logs to sync' },
                { status: 400 }
            );
        }

        await saveLogs(userId, validLogs);

        return NextResponse.json({
            success: true,
            synced: validLogs.length,
            message: `Synced ${validLogs.length} logs`,
        });
    } catch (error) {
        console.error('Sync logs error:', error);
        return NextResponse.json(
            { error: 'Failed to sync logs' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a specific log or all logs
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const logId = searchParams.get('id');
        const deleteAll = searchParams.get('all') === 'true';

        if (deleteAll) {
            // Import and use deleteAllLogs
            const { deleteAllLogs } = await import('@/lib/firestore');
            const deletedCount = await deleteAllLogs(userId);

            return NextResponse.json({
                success: true,
                deleted: deletedCount,
                message: `Deleted ${deletedCount} logs`,
            });
        }

        if (!logId) {
            return NextResponse.json(
                { error: 'Log ID required' },
                { status: 400 }
            );
        }

        await deleteLog(userId, logId);

        return NextResponse.json({
            success: true,
            message: 'Log deleted',
        });
    } catch (error) {
        console.error('Delete log error:', error);
        return NextResponse.json(
            { error: 'Failed to delete log' },
            { status: 500 }
        );
    }
}
