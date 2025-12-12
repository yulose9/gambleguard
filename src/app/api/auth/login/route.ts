// Passkey Login API Route
// POST: Start authentication, returns options
// PUT: Complete authentication, verifies and creates session

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    generatePasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
} from '@/lib/webauthn';
import {
    getPasskeyCredentials,
    getPasskeyByCredentialId,
    updatePasskeyCounter,
    updateUserLastLogin,
    storeChallenge,
    getChallenge,
    deleteChallenge,
    findUserByCredentialId,
    getUser,
} from '@/lib/firestore';

// Generate authentication options
export async function POST(request: NextRequest) {
    try {
        // For discoverable credentials (passkeys can identify the user)
        // We don't need to know the user beforehand
        const sessionId = crypto.randomUUID();

        // Generate authentication options without specifying allowed credentials
        // This enables "usernameless" login
        const { options, challenge } = await generatePasskeyAuthenticationOptions();

        // Store challenge
        await storeChallenge(sessionId, challenge);

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60, // 5 minutes
            path: '/',
        });

        return NextResponse.json({ options });
    } catch (error) {
        console.error('Authentication options error:', error);
        return NextResponse.json(
            { error: 'Failed to generate authentication options' },
            { status: 500 }
        );
    }
}

// Verify authentication response
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { response: authResponse } = body;

        if (!authResponse) {
            return NextResponse.json(
                { error: 'Missing authentication response' },
                { status: 400 }
            );
        }

        // Get session from cookie
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('auth_session')?.value;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session expired. Please try again.' },
                { status: 400 }
            );
        }

        // Get stored challenge
        const challengeData = await getChallenge(sessionId);
        if (!challengeData) {
            return NextResponse.json(
                { error: 'Challenge expired. Please try again.' },
                { status: 400 }
            );
        }

        // Find the user by credential ID
        const credentialId = authResponse.id;
        const userId = await findUserByCredentialId(credentialId);

        if (!userId) {
            return NextResponse.json(
                { error: 'Passkey not recognized. Please register first.' },
                { status: 401 }
            );
        }

        // Get the stored credential
        const credential = await getPasskeyByCredentialId(userId, credentialId);
        if (!credential) {
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 401 }
            );
        }

        // Verify the authentication
        const verification = await verifyPasskeyAuthentication(
            authResponse,
            challengeData.challenge,
            {
                credentialId: credential.credentialId,
                publicKey: credential.publicKey,
                counter: credential.counter,
                deviceType: credential.deviceType,
                transports: credential.transports as any,
            }
        );

        if (!verification.verified) {
            return NextResponse.json(
                { error: verification.error || 'Authentication failed' },
                { status: 401 }
            );
        }

        // Update the credential counter (prevents replay attacks)
        if (verification.newCounter !== undefined) {
            await updatePasskeyCounter(userId, credential.id, verification.newCounter);
        }

        // Update last login time
        await updateUserLastLogin(userId);

        // Get user info
        const user = await getUser(userId);

        // Clean up
        await deleteChallenge(sessionId);
        cookieStore.delete('auth_session');

        // Set authenticated session
        cookieStore.set('user_id', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        if (user?.displayName) {
            cookieStore.set('user_name', user.displayName, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });
        }

        return NextResponse.json({
            success: true,
            userId,
            username: user?.displayName,
            message: 'Authentication successful!',
        });
    } catch (error) {
        console.error('Authentication verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify authentication' },
            { status: 500 }
        );
    }
}
