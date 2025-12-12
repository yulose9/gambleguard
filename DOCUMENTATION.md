# GambleGuard - Complete Technical Documentation

> **Version:** 1.0.0  
> **Last Updated:** December 12, 2025  
> **Project ID:** gen-lang-client-0275933444  
> **Live URL:** https://gambleguard-1063745325454.asia-southeast1.run.app

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Google Cloud Infrastructure](#google-cloud-infrastructure)
6. [Authentication System (Passkeys/WebAuthn)](#authentication-system)
7. [Database (Firestore)](#database-firestore)
8. [AI Integration (Gemini)](#ai-integration-gemini)
9. [Security](#security)
10. [API Reference](#api-reference)
11. [File Structure](#file-structure)
12. [Environment Variables](#environment-variables)
13. [Deployment Guide](#deployment-guide)
14. [Local Development](#local-development)
15. [Troubleshooting](#troubleshooting)

---

## Executive Summary

**GambleGuard** is a Progressive Web App (PWA) designed to help users overcome gambling addiction by tracking money they choose NOT to gamble. The app uses AI (Google Gemini) to provide psychological insights and investment projections, encouraging users to build wealth instead of losing it to gambling.

### Key Features
- 🛡️ **Guard Tab:** Log amounts saved from gambling urges
- 📈 **Invest Tab:** AI-powered investment projections
- 💰 **Wallet Tab:** Transaction history and analytics
- 🔐 **Passkey Authentication:** Passwordless login with Face ID/Windows Hello
- 🤖 **AI Insights:** Gemini-powered financial psychology

### Live Deployment
- **URL:** https://gambleguard-1063745325454.asia-southeast1.run.app
- **Region:** asia-southeast1 (Singapore)
- **Platform:** Google Cloud Run (Serverless)

---

## Application Overview

### Purpose
GambleGuard acts as a digital guardian that:
1. Tracks money users resist gambling
2. Provides psychological manipulation (for their benefit) to reinforce saving behavior
3. Shows investment projections for saved amounts
4. Uses AI to generate personalized insights

### User Flow
```
1. User visits app → Redirected to /login
2. User registers passkey (Windows Hello / Face ID)
3. User logs in with passkey
4. User enters amount they resisted gambling
5. App saves to Firestore + generates AI insight
6. User views investment projections + wallet history
```

### Target Users
- Individuals recovering from gambling addiction
- Users in the Philippines (currency: PHP)
- iPhone and Windows device users

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INTERNET                                       │
│                                                                          │
│    ┌──────────────┐                    ┌──────────────┐                 │
│    │   iPhone     │                    │   Windows    │                 │
│    │  (Face ID)   │                    │ (Win Hello)  │                 │
│    └──────┬───────┘                    └──────┬───────┘                 │
│           │                                    │                         │
│           └─────────────┬──────────────────────┘                         │
│                         │                                                │
│                         ▼                                                │
│           ┌─────────────────────────┐                                   │
│           │      HTTPS Request      │                                   │
│           └─────────────┬───────────┘                                   │
└─────────────────────────┼───────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────────┐
│                         ▼          GOOGLE CLOUD PLATFORM                │
│           ┌─────────────────────────┐                                   │
│           │       Cloud Run         │                                   │
│           │   (Next.js 16 App)      │                                   │
│           │                         │                                   │
│           │  ┌───────────────────┐  │                                   │
│           │  │  Server Actions   │  │                                   │
│           │  │  + API Routes     │  │                                   │
│           │  └─────────┬─────────┘  │                                   │
│           └─────────────┼───────────┘                                   │
│                         │                                                │
│           ┌─────────────┼─────────────────────────────┐                 │
│           │             │                             │                 │
│           ▼             ▼                             ▼                 │
│  ┌─────────────┐  ┌───────────────┐  ┌────────────────────┐            │
│  │  Firestore  │  │Secret Manager │  │     Gemini API     │            │
│  │  (NoSQL DB) │  │ (API Keys)    │  │ (AI Text Generation)│            │
│  └─────────────┘  └───────────────┘  └────────────────────┘            │
│                                                                          │
│  Project: gen-lang-client-0275933444                                    │
│  Region: asia-southeast1                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│   Middleware    │ ─── Checks user_id cookie
│ (src/middleware)│     If no cookie → redirect to /login
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Route     │ ─── Handles /api/* requests
│  (Server-side)  │     Uses Firebase Admin SDK
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │ ─── Stores users, credentials, logs
│  (Admin SDK)    │     Bypasses security rules
└─────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.8 | React framework with App Router |
| React | 19.2.1 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Recharts | 2.x | Charts for wallet view |
| Lucide React | 0.559 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js Server Actions | - | Server-side logic |
| Firebase Admin SDK | Latest | Firestore access |
| SimpleWebAuthn | Latest | Passkey authentication |
| Google GenAI SDK | 1.33 | Gemini AI integration |

### Infrastructure
| Service | Purpose | Cost |
|---------|---------|------|
| Cloud Run | Serverless container hosting | ~$0-2/mo |
| Firestore | NoSQL database | FREE tier |
| Secret Manager | Secure API key storage | ~$0.03/mo |
| Artifact Registry | Container image storage | Minimal |
| Cloud Build | CI/CD builds | Minimal |

---

## Google Cloud Infrastructure

### Project Details
```yaml
Project ID: gen-lang-client-0275933444
Project Number: 1063745325454
Region: asia-southeast1 (Singapore)
Owner: [Your Email]
```

### Enabled APIs
```
- Cloud Run API (run.googleapis.com)
- Firestore API (firestore.googleapis.com)
- Secret Manager API (secretmanager.googleapis.com)
- Identity Toolkit API (identitytoolkit.googleapis.com)
- Cloud Build API (cloudbuild.googleapis.com)
- Artifact Registry API (artifactregistry.googleapis.com)
```

### Cloud Run Service
```yaml
Service Name: gambleguard
Region: asia-southeast1
URL: https://gambleguard-1063745325454.asia-southeast1.run.app
Container Port: 8080
Memory: 512 Mi (default)
CPU: 1 (default)
Min Instances: 0 (scales to zero)
Max Instances: 100 (default)
Authentication: Allow unauthenticated
```

### Service Account
```yaml
Email: 1063745325454-compute@developer.gserviceaccount.com
Roles:
  - roles/datastore.user (Firestore access)
  - roles/secretmanager.secretAccessor (Secret access)
  - roles/editor (default Cloud Run)
```

### Secret Manager Secrets
```yaml
GEMINI_API_KEY:
  Latest Version: 1
  Value: [STORED IN SECRET MANAGER - NEVER COMMIT]
  Access: Only Cloud Run service account
```

### Firestore Database
```yaml
Database ID: (default)
Location: asia-southeast1
Mode: Native
Free Tier Limits:
  - 1 GiB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
```

---

## Authentication System

### Overview
The app uses **WebAuthn/Passkeys** for passwordless authentication. This provides:
- **Phishing resistance:** Credentials bound to specific domain
- **No passwords:** Nothing to steal or forget
- **Biometric:** Uses device's Face ID or Windows Hello
- **Device-bound:** Keys stored securely on user's device

### Flow Diagram

```
REGISTRATION FLOW:
┌──────────┐     POST /api/auth/register     ┌──────────────┐
│  Client  │ ────────────────────────────────▶ │   Server    │
│          │     { username }                 │              │
│          │                                  │  Generates:  │
│          │ ◀──────────────────────────────── │  - userId    │
│          │     { options, sessionId }       │  - challenge │
│          │                                  │              │
│          │     Browser WebAuthn Prompt      │              │
│          │     (Face ID / Windows Hello)    │              │
│          │                                  │              │
│          │     PUT /api/auth/register       │              │
│          │ ────────────────────────────────▶ │  Verifies   │
│          │     { credential }               │  credential  │
│          │                                  │              │
│          │ ◀──────────────────────────────── │  Stores in  │
│          │     { success, cookie }          │  Firestore   │
└──────────┘                                  └──────────────┘

LOGIN FLOW:
┌──────────┐     POST /api/auth/login         ┌──────────────┐
│  Client  │ ────────────────────────────────▶ │   Server    │
│          │                                  │  Generates   │
│          │ ◀──────────────────────────────── │  challenge   │
│          │     { options }                  │              │
│          │                                  │              │
│          │     Browser WebAuthn Prompt      │              │
│          │                                  │              │
│          │     PUT /api/auth/login          │              │
│          │ ────────────────────────────────▶ │  Finds user  │
│          │     { assertion }                │  by credId   │
│          │                                  │              │
│          │ ◀──────────────────────────────── │  Verifies +  │
│          │     { success, cookie }          │  set cookie  │
└──────────┘                                  └──────────────┘
```

### WebAuthn Configuration
```typescript
// Production Configuration
RP_NAME: "GambleGuard"
RP_ID: "gambleguard-1063745325454.asia-southeast1.run.app"
ORIGIN: "https://gambleguard-1063745325454.asia-southeast1.run.app"

// Local Development
RP_ID: "localhost"
ORIGIN: "http://localhost:3000"
```

### Session Management
- Sessions stored in **HTTP-only cookies**
- Cookie name: `user_id`
- Duration: 30 days
- Flags: `httpOnly`, `secure` (production), `sameSite: strict`

---

## Database (Firestore)

### Data Model

```
Firestore Database
│
├── users/
│   └── {userId}/
│       ├── displayName: string
│       ├── createdAt: timestamp
│       ├── lastLogin: timestamp
│       ├── allowedDevices: string[]
│       │
│       ├── credentials/ (subcollection)
│       │   └── {credentialDocId}/
│       │       ├── credentialId: string (base64)
│       │       ├── publicKey: string (base64)
│       │       ├── counter: number
│       │       ├── deviceType: string
│       │       ├── transports: string[]
│       │       └── createdAt: timestamp
│       │
│       └── logs/ (subcollection)
│           └── {logId}/
│               ├── amount: number
│               ├── timestamp: timestamp
│               ├── type: "saved" | "withdraw"
│               ├── category: string
│               └── note: string
│
└── challenges/ (temporary, for WebAuthn)
    └── {sessionId}/
        ├── challenge: string
        ├── userId: string (optional)
        ├── createdAt: timestamp
        └── expiresAt: timestamp (5 minutes)
```

### Security Rules
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all client-side access
    // Admin SDK (server) bypasses these rules
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Access Pattern
- All Firestore access goes through **Firebase Admin SDK**
- Admin SDK **bypasses security rules**
- Client never directly accesses Firestore
- This is the most secure pattern for server-side apps

---

## AI Integration (Gemini)

### Configuration
```typescript
Model: "gemini-2.5-flash-preview-05-20"
API Key: Stored in Secret Manager
Fallback: Environment variable for local dev
```

### Functions

#### 1. getGeminiInsight(amount)
- **Purpose:** Generate psychological insight about saved money
- **Input:** Amount saved (PHP)
- **Output:** 2-3 sentence dark psychology insight
- **Fallback:** Pre-written fallback messages

#### 2. getGeminiInvestmentAnalysis(amount)
- **Purpose:** Generate 4 investment projection cards
- **Input:** Amount saved (PHP)
- **Output:** JSON with Bitcoin, Stocks, Safe, Goal projections
- **Fallback:** Pre-calculated fallback data

#### 3. getWalletAnalysis(logs)
- **Purpose:** Analyze saving patterns
- **Input:** Array of transaction logs
- **Output:** Pattern analysis text

### API Key Flow
```
Request → getGeminiApiKey() → Secret Manager → Cached → Gemini API
                                    ↓
                            (fallback to env var)
```

---

## Security

### Security Measures Implemented

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Authentication | Passkeys (WebAuthn) | No passwords, phishing-resistant |
| Session | HTTP-only cookies | Can't be stolen via XSS |
| API Keys | Secret Manager | Never in code or client |
| Database | Admin SDK only | No client-side access |
| Transport | HTTPS | Automatic with Cloud Run |
| Routes | Middleware protection | Unauthenticated → /login |

### Cookie Security
```typescript
{
  httpOnly: true,      // No JavaScript access
  secure: true,        // HTTPS only (production)
  sameSite: 'strict',  // No cross-site requests
  maxAge: 30 * 24 * 60 * 60  // 30 days
}
```

### Sensitive Files (Never Commit)
```
.env.local                   # Local environment variables
*-service-account.json       # GCP service account keys
*-credentials.json           # Any credential files
firebase-admin*.json         # Firebase admin keys
```

---

## API Reference

### Authentication APIs

#### POST /api/auth/register
Start passkey registration
```typescript
Request: { username: string }
Response: { options: PublicKeyCredentialCreationOptions }
```

#### PUT /api/auth/register
Complete passkey registration
```typescript
Request: { response: RegistrationResponseJSON }
Response: { success: boolean, userId: string, deviceType: string }
Sets Cookie: user_id, user_name
```

#### POST /api/auth/login
Start passkey authentication
```typescript
Request: (none)
Response: { options: PublicKeyCredentialRequestOptions }
```

#### PUT /api/auth/login
Complete passkey authentication
```typescript
Request: { response: AuthenticationResponseJSON }
Response: { success: boolean, userId: string, username: string }
Sets Cookie: user_id, user_name
```

#### GET /api/auth/session
Check current session
```typescript
Response: { authenticated: boolean, user: { id, name, lastLogin } | null }
```

#### DELETE /api/auth/session
Logout (clear cookies)
```typescript
Response: { success: boolean }
```

### Data APIs

#### GET /api/logs
Get user's transaction logs
```typescript
Query: ?limit=100
Response: { success: boolean, logs: TransactionLog[], count: number }
```

#### POST /api/logs
Add a new log
```typescript
Request: { amount: number, category?: string, note?: string }
Response: { success: boolean, logId: string }
```

#### PUT /api/logs
Sync/bulk update logs
```typescript
Request: { logs: TransactionLog[] }
Response: { success: boolean, synced: number }
```

#### DELETE /api/logs
Delete a single log or all logs
```typescript
// Delete single log
Query: ?id=logId
Response: { success: boolean }

// Delete all logs
Query: ?all=true
Response: { success: boolean, deleted: number, message: string }
```

---

## File Structure

```
GambleGuard/
├── .agent/                    # AI agent artifacts
│   └── artifacts/
│       ├── implementation-checklist.md
│       ├── gcp-architecture-plan.md
│       └── architecture-diagrams.md
│
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── manifest.json
│   └── ...
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Main app (Guard/Invest/Wallet tabs)
│   │   ├── layout.tsx         # Root layout with AuthProvider
│   │   ├── globals.css        # Global styles
│   │   ├── login/
│   │   │   └── page.tsx       # Login/Register page
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── session/route.ts
│   │       ├── logs/route.ts
│   │       └── backup/route.ts (legacy)
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── passkey-register.tsx
│   │   │   ├── passkey-login.tsx
│   │   │   └── auth-provider.tsx
│   │   ├── ui/                # Reusable UI components
│   │   ├── log-entry.tsx
│   │   ├── gemini-insight.tsx
│   │   ├── investment-insight.tsx
│   │   ├── wallet-view.tsx
│   │   └── versus-mode.tsx
│   │
│   ├── lib/
│   │   ├── firebase-admin.ts  # Firebase Admin SDK
│   │   ├── firebase-client.ts # Firebase Client (unused currently)
│   │   ├── firestore.ts       # Firestore CRUD operations
│   │   ├── gemini.ts          # Gemini AI functions
│   │   ├── secrets.ts         # Secret Manager integration
│   │   ├── webauthn.ts        # WebAuthn utilities
│   │   └── utils.ts           # Utility functions
│   │
│   └── middleware.ts          # Route protection
│
├── Dockerfile                 # Cloud Run deployment
├── .dockerignore
├── firebase.json              # Firebase config
├── .firebaserc                # Firebase project alias
├── firestore.rules            # Security rules
├── firestore.indexes.json     # Index definitions
├── next.config.ts             # Next.js configuration
├── package.json
├── tsconfig.json
├── DEPLOYMENT.md              # Deployment guide
├── .env.example               # Environment template
└── .env.local                 # Local environment (gitignored)
```

---

## Environment Variables

### Production (Cloud Run)
Set via `gcloud run deploy --set-env-vars` or console:

```bash
# Firebase/GCP
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gen-lang-client-0275933444
GCP_PROJECT_ID=gen-lang-client-0275933444

# WebAuthn
NEXT_PUBLIC_WEBAUTHN_RP_NAME=GambleGuard
NEXT_PUBLIC_WEBAUTHN_RP_ID=gambleguard-1063745325454.asia-southeast1.run.app
NEXT_PUBLIC_WEBAUTHN_ORIGIN=https://gambleguard-1063745325454.asia-southeast1.run.app

# Secrets (via --set-secrets)
GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Local Development (.env.local)
```bash
# Gemini API (direct, not via Secret Manager locally)
GEMINI_API_KEY=your_gemini_api_key_here

# GCP Project
GCP_PROJECT_ID=gen-lang-client-0275933444
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gen-lang-client-0275933444

# WebAuthn (localhost)
NEXT_PUBLIC_WEBAUTHN_RP_NAME=GambleGuard
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
NEXT_PUBLIC_WEBAUTHN_ORIGIN=http://localhost:3000
```

---

## Deployment Guide

### Prerequisites
- Google Cloud SDK installed
- Node.js 20+ installed
- Access to GCP project gen-lang-client-0275933444

### Deploy Command
```bash
gcloud run deploy gambleguard \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --project=gen-lang-client-0275933444 \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=gen-lang-client-0275933444,NEXT_PUBLIC_WEBAUTHN_RP_NAME=GambleGuard,GCP_PROJECT_ID=gen-lang-client-0275933444,NEXT_PUBLIC_WEBAUTHN_RP_ID=gambleguard-1063745325454.asia-southeast1.run.app,NEXT_PUBLIC_WEBAUTHN_ORIGIN=https://gambleguard-1063745325454.asia-southeast1.run.app" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

### Build Process
1. Cloud Build receives source code
2. Dockerfile builds Next.js in standalone mode
3. Image pushed to Artifact Registry
4. Cloud Run deploys new revision
5. Traffic routed to new revision

---

## Local Development

### Setup
```bash
# Clone repository
cd GambleGuard

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

### Access
- Local: http://localhost:3000
- Login redirects to: http://localhost:3000/login

### Testing Passkeys Locally
- Passkeys work on localhost with most browsers
- Chrome/Edge on Windows: Uses Windows Hello
- Safari on Mac: Uses Touch ID
- iPhone (via localhost tunnel): Uses Face ID

---

## Troubleshooting

### Common Issues

#### "Failed to generate registration options"
**Cause:** Firestore permission denied
**Fix:** Grant Cloud Run service account `roles/datastore.user`:
```bash
gcloud projects add-iam-policy-binding gen-lang-client-0275933444 \
  --member="serviceAccount:1063745325454-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

#### "Permission denied on secret"
**Cause:** Secret Manager access denied
**Fix:** Grant access to secret:
```bash
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:1063745325454-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=gen-lang-client-0275933444
```

#### "Authentication was cancelled"
**Cause:** User cancelled Windows Hello / Face ID prompt
**Fix:** User must complete biometric authentication

#### WebAuthn not working on mobile
**Cause:** Incorrect RP_ID or ORIGIN
**Fix:** Ensure environment variables match exact domain

### View Logs
```bash
gcloud run services logs read gambleguard \
  --region asia-southeast1 \
  --project=gen-lang-client-0275933444 \
  --limit=50
```

### Force Redeploy
```bash
gcloud run deploy gambleguard --source . \
  --region asia-southeast1 \
  --project=gen-lang-client-0275933444
```

---

## Cost Summary

| Service | Monthly Estimate |
|---------|------------------|
| Cloud Run | $0 - $2 (scales to zero) |
| Firestore | $0 (within free tier) |
| Secret Manager | ~$0.03 |
| Artifact Registry | ~$0.10 |
| Cloud Build | ~$0.10 |
| **Total** | **$0 - $5/month** |

---

## Quick Reference

### Key URLs
| Resource | URL |
|----------|-----|
| Live App | https://gambleguard-1063745325454.asia-southeast1.run.app |
| Cloud Run Console | https://console.cloud.google.com/run?project=gen-lang-client-0275933444 |
| Firestore Console | https://console.cloud.google.com/firestore?project=gen-lang-client-0275933444 |
| Secret Manager | https://console.cloud.google.com/security/secret-manager?project=gen-lang-client-0275933444 |
| Logs | https://console.cloud.google.com/logs?project=gen-lang-client-0275933444 |

### Key Commands
```bash
# Deploy
gcloud run deploy gambleguard --source . --region asia-southeast1 --project=gen-lang-client-0275933444

# View logs
gcloud run services logs read gambleguard --region asia-southeast1 --project=gen-lang-client-0275933444 --limit=30

# Check service status
gcloud run services describe gambleguard --region asia-southeast1 --project=gen-lang-client-0275933444
```

---

## Contact

**Developer:** [Your Name]  
**Email:** [Your Email]  
**GCP Owner:** Same as above

---

*This documentation provides complete context for AI assistants or developers to understand and work with the GambleGuard application.*
