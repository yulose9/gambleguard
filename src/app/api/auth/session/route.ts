// Session Management API Route
// GET: Check current session
// DELETE: Logout (clear session)

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/firestore';

// Get current session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        const userName = cookieStore.get('user_name')?.value;

        if (!userId) {
            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }

        // Optionally verify user still exists in database
        const user = await getUser(userId);

        if (!user) {
            // User was deleted, clear cookies
            cookieStore.delete('user_id');
            cookieStore.delete('user_name');

            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: userId,
                name: userName || user.displayName,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json(
            {
                authenticated: false,
                user: null,
                error: 'Failed to check session'
            },
            { status: 500 }
        );
    }
}

// Logout
export async function DELETE() {
    try {
        const cookieStore = await cookies();

        // Clear all auth-related cookies
        cookieStore.delete('user_id');
        cookieStore.delete('user_name');
        cookieStore.delete('passkey_session');
        cookieStore.delete('auth_session');
        cookieStore.delete('pending_username');
        cookieStore.delete('pending_user_id');

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        );
    }
}
