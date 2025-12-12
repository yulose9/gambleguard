# GambleGuard - AI Context Document

> **Use this document to provide context to AI assistants when working with GambleGuard.**

---

## Quick Context Block (Copy This First)

```
PROJECT: GambleGuard
TYPE: Next.js 16 PWA with Passkey Authentication
STACK: Next.js 16, React 19, TypeScript, Tailwind CSS, Firestore, Gemini AI
HOSTING: Google Cloud Run (asia-southeast1)
PROJECT_ID: gen-lang-client-0275933444
URL: https://gambleguard-1063745325454.asia-southeast1.run.app

AUTHENTICATION: WebAuthn Passkeys (Face ID / Windows Hello)
DATABASE: Firestore (NoSQL, server-side via Admin SDK)
AI: Gemini API (gemini-2.5-flash-preview-05-20)
SECRETS: Google Cloud Secret Manager (GEMINI_API_KEY)

KEY DIRECTORIES:
- src/app/ - Next.js App Router pages + API routes
- src/lib/ - Core utilities (firebase-admin, firestore, gemini, webauthn, secrets)
- src/components/ - React components (auth/, ui/, etc.)
- src/middleware.ts - Route protection

KEY FILES TO UNDERSTAND:
- src/lib/firebase-admin.ts - Firestore connection
- src/lib/firestore.ts - All database operations
- src/lib/webauthn.ts - Passkey auth logic
- src/app/api/auth/register/route.ts - Registration flow
- src/app/api/auth/login/route.ts - Login flow
```

---

## What This App Does

GambleGuard helps users overcome gambling addiction by:
1. Tracking money they resist gambling
2. Showing AI-powered investment projections
3. Providing psychological insights via Gemini AI
4. Using passwordless authentication (passkeys)

---

## Architecture Summary

```
User Device (iPhone/Windows)
    │
    ▼ HTTPS
Cloud Run (Next.js 16)
    │
    ├──▶ Firestore (user data, credentials, logs)
    ├──▶ Secret Manager (API keys)
    └──▶ Gemini API (AI insights)
```

---

## Authentication System

**Technology:** WebAuthn / Passkeys
**Authenticators:** Face ID (iPhone), Windows Hello (PC)

### Registration Flow:
1. POST /api/auth/register → Get challenge + options
2. Browser prompts for Face ID / Windows Hello
3. PUT /api/auth/register → Verify + store credential
4. Set authentication cookie (30 days)

### Login Flow:
1. POST /api/auth/login → Get challenge
2. Browser prompts for biometric
3. PUT /api/auth/login → Find user by credential, verify
4. Set authentication cookie

### Key Environment Variables:
```
NEXT_PUBLIC_WEBAUTHN_RP_NAME=GambleGuard
NEXT_PUBLIC_WEBAUTHN_RP_ID=gambleguard-1063745325454.asia-southeast1.run.app
NEXT_PUBLIC_WEBAUTHN_ORIGIN=https://gambleguard-1063745325454.asia-southeast1.run.app
```

---

## Database Schema (Firestore)

```
users/{userId}
├── displayName: string
├── createdAt: timestamp
├── lastLogin: timestamp
├── credentials/{credentialId}
│   ├── credentialId: string
│   ├── publicKey: string
│   ├── counter: number
│   └── deviceType: string
└── logs/{logId}
    ├── amount: number
    ├── timestamp: timestamp
    └── category: string
```

---

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/register | Start passkey registration |
| PUT | /api/auth/register | Complete passkey registration |
| POST | /api/auth/login | Start passkey login |
| PUT | /api/auth/login | Complete passkey login |
| GET | /api/auth/session | Check login status |
| DELETE | /api/auth/session | Logout |
| GET | /api/logs | Get user's logs |
| POST | /api/logs | Add new log |

---

## Key Files Reference

### Authentication
- `src/lib/webauthn.ts` - WebAuthn helper functions
- `src/app/api/auth/register/route.ts` - Registration API
- `src/app/api/auth/login/route.ts` - Login API
- `src/components/auth/passkey-register.tsx` - Registration UI
- `src/components/auth/passkey-login.tsx` - Login UI

### Database
- `src/lib/firebase-admin.ts` - Firebase Admin initialization
- `src/lib/firestore.ts` - All CRUD operations

### AI
- `src/lib/gemini.ts` - Gemini API integration
- `src/lib/secrets.ts` - Secret Manager client

### Main App
- `src/app/page.tsx` - Main app with Guard/Invest/Wallet tabs
- `src/app/login/page.tsx` - Login page
- `src/middleware.ts` - Route protection

---

## Deployment

```bash
# Full deploy command
gcloud run deploy gambleguard \
  --source . \
  --region asia-southeast1 \
  --project=gen-lang-client-0275933444 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=gen-lang-client-0275933444,NEXT_PUBLIC_WEBAUTHN_RP_NAME=GambleGuard,GCP_PROJECT_ID=gen-lang-client-0275933444,NEXT_PUBLIC_WEBAUTHN_RP_ID=gambleguard-1063745325454.asia-southeast1.run.app,NEXT_PUBLIC_WEBAUTHN_ORIGIN=https://gambleguard-1063745325454.asia-southeast1.run.app" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## Common Tasks

### Add a new API route
1. Create file in `src/app/api/[route]/route.ts`
2. Export async functions: GET, POST, PUT, DELETE
3. Use `adminDb` from `firebase-admin.ts` for Firestore

### Modify authentication
1. WebAuthn logic in `src/lib/webauthn.ts`
2. API handlers in `src/app/api/auth/`
3. UI components in `src/components/auth/`

### Add new Gemini function
1. Add function to `src/lib/gemini.ts`
2. Use `getAIClient()` to get authenticated client
3. Always include fallback response

### Change database schema
1. Modify types in `src/lib/firestore.ts`
2. Add CRUD functions in same file
3. Update API routes to use new functions

---

## GCP Resources

| Resource | Identifier |
|----------|------------|
| Project | gen-lang-client-0275933444 |
| Cloud Run | gambleguard |
| Region | asia-southeast1 |
| Firestore | (default) database |
| Secret | GEMINI_API_KEY |
| Service Account | 1063745325454-compute@developer.gserviceaccount.com |

---

## Troubleshooting Reference

| Error | Cause | Fix |
|-------|-------|-----|
| Permission denied on Firestore | Missing IAM role | Grant `roles/datastore.user` |
| Permission denied on secret | Missing secret access | Grant `roles/secretmanager.secretAccessor` |
| WebAuthn fails | Wrong RP_ID/ORIGIN | Match domain exactly |
| 401 on API | No auth cookie | User needs to login |

---

## Dependencies

```json
{
  "next": "16.0.8",
  "react": "19.2.1",
  "firebase-admin": "latest",
  "@simplewebauthn/browser": "latest",
  "@simplewebauthn/server": "latest",
  "@google-cloud/secret-manager": "latest",
  "@google/genai": "1.33.0",
  "framer-motion": "12.x"
}
```

---

*Last Updated: December 12, 2025*
