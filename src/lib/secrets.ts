// Google Cloud Secret Manager Integration
// Securely fetch secrets at runtime without exposing them in code

"use server"

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Initialize the client (uses Application Default Credentials in Cloud Run)
let secretManagerClient: SecretManagerServiceClient | null = null;

function getClient(): SecretManagerServiceClient {
    if (!secretManagerClient) {
        secretManagerClient = new SecretManagerServiceClient();
    }
    return secretManagerClient;
}

// Cache for secrets (to avoid repeated API calls)
const secretCache: Map<string, { value: string; expiresAt: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch a secret from Google Cloud Secret Manager
 * Falls back to environment variables for local development
 */
export async function getSecret(secretName: string): Promise<string | null> {
    // Check cache first
    const cached = secretCache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    // For local development, fall back to environment variables
    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
        // Local development - use env vars directly
        const envValue = process.env[secretName];
        if (envValue) {
            return envValue;
        }
        console.warn(`Secret ${secretName} not found in environment variables`);
        return null;
    }

    try {
        const client = getClient();
        const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

        const [version] = await client.accessSecretVersion({ name });
        const payload = version.payload?.data;

        if (!payload) {
            console.warn(`Secret ${secretName} has no payload`);
            return null;
        }

        const secretValue = typeof payload === 'string'
            ? payload
            : new TextDecoder().decode(payload);

        // Cache the secret
        secretCache.set(secretName, {
            value: secretValue,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return secretValue;
    } catch (error) {
        console.error(`Error fetching secret ${secretName}:`, error);

        // Fall back to environment variable
        const envValue = process.env[secretName];
        if (envValue) {
            console.warn(`Using environment variable fallback for ${secretName}`);
            return envValue;
        }

        return null;
    }
}

/**
 * Get the Gemini API key securely
 */
export async function getGeminiApiKey(): Promise<string | null> {
    // Try secret manager first, then fall back to env vars
    const secretKey = await getSecret('GEMINI_API_KEY');
    if (secretKey) {
        return secretKey;
    }

    // Fallback for local development
    return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
}

/**
 * Clear the secret cache (useful for forced refresh)
 */
export async function clearSecretCache(): Promise<void> {
    secretCache.clear();
}
