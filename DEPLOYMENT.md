# 🚀 GambleGuard - Deployment Guide

This guide walks you through deploying GambleGuard to Google Cloud Run with all security features enabled.

---

## Prerequisites

- [ ] Google Cloud SDK installed ([Download](https://cloud.google.com/sdk/docs/install))
- [ ] Node.js 20+ installed
- [ ] A Google Cloud account with billing enabled
- [ ] Your Gemini API key

---

## Step 1: Create GCP Project

```bash
# Login to Google Cloud
gcloud auth login

# Create new project (choose a unique ID)
gcloud projects create gambleguard-app --name="GambleGuard"

# Set as active project
gcloud config set project gambleguard-app

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
# Link your project to a billing account
```

---

## Step 2: Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  identitytoolkit.googleapis.com \
  cloudbuild.googleapis.com
```

---

## Step 3: Set Up Firestore

```bash
# Create Firestore database in Native mode
gcloud firestore databases create --location=asia-southeast1

# Deploy security rules
# (If you have Firebase CLI installed)
firebase deploy --only firestore:rules
```

Or via Console:
1. Go to [Firestore Console](https://console.cloud.google.com/firestore)
2. Click "Create Database"
3. Select "Native mode"
4. Choose `asia-southeast1` region
5. Copy rules from `firestore.rules` file

---

## Step 4: Store Secrets in Secret Manager

```bash
# Store Gemini API Key
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

# Grant Cloud Run access to the secret
PROJECT_NUMBER=$(gcloud projects describe gambleguard-app --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Step 5: Set Up Firebase/Identity Platform

### Option A: Using Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and select your GCP project
3. Enable Authentication
4. Go to Settings > General, copy the config
5. Go to Settings > Service Accounts, generate new private key

### Option B: Using gcloud
```bash
# Enable Identity Platform
gcloud identity-platform config update --enable-blocking-functions
```

---

## Step 6: Configure Environment Variables

Create a `.env.local` file locally for testing:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

For Cloud Run, set these during deployment (Step 7).

---

## Step 7: Deploy to Cloud Run

### Option A: Source-based deployment (Recommended)
```bash
gcloud run deploy gambleguard \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=gambleguard-app" \
  --set-env-vars="NEXT_PUBLIC_WEBAUTHN_RP_NAME=GambleGuard" \
  --set-env-vars="GCP_PROJECT_ID=gambleguard-app" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

### Option B: Docker-based deployment
```bash
# Build the image
docker build -t gcr.io/gambleguard-app/gambleguard:latest .

# Push to Container Registry
docker push gcr.io/gambleguard-app/gambleguard:latest

# Deploy
gcloud run deploy gambleguard \
  --image gcr.io/gambleguard-app/gambleguard:latest \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## Step 8: Configure Custom Domain (Optional)

```bash
# Map a custom domain
gcloud run domain-mappings create \
  --service gambleguard \
  --domain gambleguard.yourdomain.com \
  --region asia-southeast1
```

---

## Step 9: Update WebAuthn Configuration

After deployment, update your environment variables with the Cloud Run URL:

```bash
# Get your Cloud Run URL
gcloud run services describe gambleguard --region asia-southeast1 --format='value(status.url)'

# Update the service with correct WebAuthn config
gcloud run services update gambleguard \
  --region asia-southeast1 \
  --set-env-vars="NEXT_PUBLIC_WEBAUTHN_RP_ID=YOUR_CLOUDRUN_DOMAIN" \
  --set-env-vars="NEXT_PUBLIC_WEBAUTHN_ORIGIN=https://YOUR_CLOUDRUN_URL"
```

---

## Step 10: Register Your Devices

1. Open your Cloud Run URL on your **iPhone**
2. Tap "Register" and use Face ID to create a passkey
3. Open the URL on your **Windows PC**
4. Click "Register" and use Windows Hello to create a passkey
5. Both devices are now authorized!

---

## Troubleshooting

### Deployment Fails
```bash
# Check build logs
gcloud builds list --limit=5

# Check specific build
gcloud builds log BUILD_ID
```

### App Errors
```bash
# View logs
gcloud run logs read --service gambleguard --region asia-southeast1 --limit=50
```

### Passkey Issues
- Ensure `NEXT_PUBLIC_WEBAUTHN_RP_ID` matches your domain exactly
- Ensure `NEXT_PUBLIC_WEBAUTHN_ORIGIN` includes `https://`
- Check that your domain has a valid SSL certificate

---

## Cost Monitoring

Set up a budget alert to avoid surprises:

```bash
# Create a budget (example: $10/month)
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="GambleGuard Budget" \
  --budget-amount=10 \
  --threshold-rules=percent=50 \
  --threshold-rules=percent=90 \
  --threshold-rules=percent=100
```

---

## Security Checklist

- [ ] Gemini API key stored in Secret Manager (not in code)
- [ ] Firebase Admin credentials never committed to git
- [ ] Firestore security rules deployed
- [ ] Only passkey authentication enabled (no passwords)
- [ ] HTTPS enforced (automatic with Cloud Run)
- [ ] Environment variables properly configured

---

## Quick Reference

| Resource | Console URL |
|----------|-------------|
| Cloud Run | https://console.cloud.google.com/run |
| Firestore | https://console.cloud.google.com/firestore |
| Secret Manager | https://console.cloud.google.com/security/secret-manager |
| Identity Platform | https://console.cloud.google.com/customer-identity |
| Logs | https://console.cloud.google.com/logs |
| Billing | https://console.cloud.google.com/billing |
