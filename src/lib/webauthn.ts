// WebAuthn Utilities
// Server-side helpers for passkey registration and authentication

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';

// Types for WebAuthn responses
type AuthenticatorTransportFuture = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

interface RegistrationResponseJSON {
    id: string;
    rawId: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
        transports?: AuthenticatorTransportFuture[];
    };
    type: 'public-key';
    clientExtensionResults: Record<string, unknown>;
}

interface AuthenticationResponseJSON {
    id: string;
    rawId: string;
    response: {
        clientDataJSON: string;
        authenticatorData: string;
        signature: string;
        userHandle?: string;
    };
    type: 'public-key';
    clientExtensionResults: Record<string, unknown>;
}

// Configuration - these should come from environment variables in production
const rpName = process.env.NEXT_PUBLIC_WEBAUTHN_RP_NAME || 'GambleGuard';
const rpID = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_WEBAUTHN_ORIGIN || 'http://localhost:3000';

// Allowed origins (for production, add your Cloud Run URL)
const expectedOrigins = [
    origin,
    'https://gambleguard.run.app', // Will be updated with actual Cloud Run URL
];

export interface StoredCredential {
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceType: string;
    transports?: AuthenticatorTransportFuture[];
}

// ============================================
// REGISTRATION (Creating a new passkey)
// ============================================

export async function generatePasskeyRegistrationOptions(
    userId: string,
    userName: string,
    existingCredentials: StoredCredential[] = []
): Promise<{ options: ReturnType<typeof generateRegistrationOptions> extends Promise<infer T> ? T : never; challenge: string }> {
    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new TextEncoder().encode(userId),
        userName,
        userDisplayName: userName,
        // Don't allow re-registering existing credentials
        excludeCredentials: existingCredentials.map(cred => ({
            id: cred.credentialId,
            transports: cred.transports,
        })),
        // Prefer platform authenticators (Face ID, Windows Hello)
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
        },
        // Support common algorithms
        supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    return {
        options,
        challenge: options.challenge,
    };
}

export async function verifyPasskeyRegistration(
    response: RegistrationResponseJSON,
    expectedChallenge: string
): Promise<{
    verified: boolean;
    credential?: StoredCredential;
    error?: string;
}> {
    try {
        const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: expectedOrigins,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential, credentialDeviceType } = verification.registrationInfo;

            // Determine device type from user agent (will be passed from client)
            const deviceType = credentialDeviceType === 'singleDevice' ? 'platform' : 'cross-platform';

            const storedCredential: StoredCredential = {
                credentialId: credential.id,
                publicKey: Buffer.from(credential.publicKey).toString('base64'),
                counter: credential.counter,
                deviceType,
                transports: response.response.transports as AuthenticatorTransportFuture[],
            };

            return {
                verified: true,
                credential: storedCredential,
            };
        }

        return {
            verified: false,
            error: 'Verification failed',
        };
    } catch (error) {
        console.error('Passkey registration verification error:', error);
        return {
            verified: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// AUTHENTICATION (Using an existing passkey)
// ============================================

export async function generatePasskeyAuthenticationOptions(
    allowedCredentials?: StoredCredential[]
): Promise<{ options: ReturnType<typeof generateAuthenticationOptions> extends Promise<infer T> ? T : never; challenge: string }> {
    const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'required',
        // If we know the user, only allow their credentials
        allowCredentials: allowedCredentials?.map(cred => ({
            id: cred.credentialId,
            transports: cred.transports,
        })),
    });

    return {
        options,
        challenge: options.challenge,
    };
}

export async function verifyPasskeyAuthentication(
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
    credential: StoredCredential
): Promise<{
    verified: boolean;
    newCounter?: number;
    error?: string;
}> {
    try {
        const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: expectedOrigins,
            expectedRPID: rpID,
            credential: {
                id: credential.credentialId,
                publicKey: Buffer.from(credential.publicKey, 'base64'),
                counter: credential.counter,
                transports: credential.transports,
            },
        });

        if (verification.verified) {
            return {
                verified: true,
                newCounter: verification.authenticationInfo.newCounter,
            };
        }

        return {
            verified: false,
            error: 'Authentication verification failed',
        };
    } catch (error) {
        console.error('Passkey authentication verification error:', error);
        return {
            verified: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// HELPERS
// ============================================

export function detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('iphone') || ua.includes('ipad')) {
        return 'iPhone';
    }
    if (ua.includes('windows')) {
        return 'Windows';
    }
    if (ua.includes('android')) {
        return 'Android';
    }
    if (ua.includes('mac')) {
        return 'Mac';
    }

    return 'Unknown';
}

export { rpID, rpName, origin };
