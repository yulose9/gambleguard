// Passkey Registration API Route
// POST: Start registration, returns options
// PUT: Complete registration, verifies and stores credential

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    generatePasskeyRegistrationOptions,
    verifyPasskeyRegistration,
    detectDeviceType
} from '@/lib/webauthn';
import {
    createUser,
    savePasskeyCredential,
    storeChallenge,
    getChallenge,
    deleteChallenge
} from '@/lib/firestore';

// Generate registration options
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string' || username.length < 3) {
            return NextResponse.json(
                { error: 'Username must be at least 3 characters' },
                { status: 400 }
            );
        }

        // Generate a temporary user ID for registration
        const sessionId = crypto.randomUUID();
        const userId = crypto.randomUUID();

        // Get existing credentials (empty for new user)
        const existingCredentials: any[] = [];

        // Generate registration options
        const { options, challenge } = await generatePasskeyRegistrationOptions(
            userId,
            username,
            existingCredentials
        );

        // Store challenge and user info in Firestore temporarily
        await storeChallenge(sessionId, challenge, userId);

        // Store session ID in cookie
        const cookieStore = await cookies();
        cookieStore.set('passkey_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60, // 5 minutes
            path: '/',
        });

        // Also store username temporarily
        cookieStore.set('pending_username', username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60,
            path: '/',
        });

        cookieStore.set('pending_user_id', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60,
            path: '/',
        });

        return NextResponse.json({ options });
    } catch (error) {
        console.error('Registration options error:', error);
        return NextResponse.json(
            { error: 'Failed to generate registration options' },
            { status: 500 }
        );
    }
}

// Verify registration response
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { response: registrationResponse } = body;

        if (!registrationResponse) {
            return NextResponse.json(
                { error: 'Missing registration response' },
                { status: 400 }
            );
        }

        // Get session info from cookies
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('passkey_session')?.value;
        const username = cookieStore.get('pending_username')?.value;
        const userId = cookieStore.get('pending_user_id')?.value;

        if (!sessionId || !username || !userId) {
            return NextResponse.json(
                { error: 'Session expired. Please try again.' },
                { status: 400 }
            );
        }

        // Get the stored challenge
        const challengeData = await getChallenge(sessionId);
        if (!challengeData) {
            return NextResponse.json(
                { error: 'Challenge expired. Please try again.' },
                { status: 400 }
            );
        }

        // Verify the registration
        const verification = await verifyPasskeyRegistration(
            registrationResponse,
            challengeData.challenge
        );

        if (!verification.verified || !verification.credential) {
            return NextResponse.json(
                { error: verification.error || 'Verification failed' },
                { status: 400 }
            );
        }

        // Detect device type
        const userAgent = request.headers.get('user-agent') || '';
        const deviceType = detectDeviceType(userAgent);

        // Create the user in Firestore
        await createUser(userId, username);

        // Store the credential
        await savePasskeyCredential(userId, {
            credentialId: verification.credential.credentialId,
            publicKey: verification.credential.publicKey,
            counter: verification.credential.counter,
            deviceType,
            transports: verification.credential.transports,
        });

        // Clean up temporary data
        await deleteChallenge(sessionId);
        cookieStore.delete('passkey_session');
        cookieStore.delete('pending_username');
        cookieStore.delete('pending_user_id');

        // Set the authenticated session cookie
        cookieStore.set('user_id', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        cookieStore.set('user_name', username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return NextResponse.json({
            success: true,
            userId,
            username,
            deviceType,
            message: `Passkey registered for ${deviceType}!`,
        });
    } catch (error) {
        console.error('Registration verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify registration' },
            { status: 500 }
        );
    }
}
