# TravelJoy Quick Deployment Reference

Quick commands and URLs for deploying TravelJoy to production.

---

## Prerequisites Checklist

- [ ] Expo account created
- [ ] Apple Developer account ($99/year)
- [ ] Google Play Developer account ($25 one-time)
- [ ] Stripe production account
- [ ] Hosting platform account (Render/Fly.io/Railway)
- [ ] Domain name (optional)

---

## Backend Deployment

### Quick Deploy (Interactive)

```bash
cd backend
./deploy.sh
```

### Manual Deploy to Render

```bash
# 1. Push to GitHub
git push origin main

# 2. Create services on Render Dashboard
# - PostgreSQL database
# - Redis instance
# - Web service (auto-deploy from GitHub)

# 3. Set environment variables in Render dashboard
# 4. Deploy will happen automatically
```

### Manual Deploy to Fly.io

```bash
cd backend

# Login
fly auth login

# Launch (first time)
fly launch

# Create database
fly postgres create --name traveljoy-db
fly postgres attach traveljoy-db

# Create Redis
fly redis create --name traveljoy-redis

# Set secrets
fly secrets set JWT_SECRET="your-secret"
fly secrets set STRIPE_SECRET_KEY="sk_live_..."

# Deploy
fly deploy

# Run migrations
fly ssh console -C "npm run prisma:migrate:prod"
```

### Test Deployment

```bash
# Health check
curl https://your-api-url.com/health

# Should return: {"status":"ok","message":"TravelJoy API is running"}
```

---

## Mobile App Deployment

### Setup (One-time)

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project
eas init

# Update app.json with your project ID
```

### Build for Production

```bash
cd mobile

# Build both platforms
npm run build:prod:all

# Or build individually
npm run build:prod:ios
npm run build:prod:android
```

### Submit to App Stores

```bash
cd mobile

# Submit both
npm run submit:all

# Or submit individually
npm run submit:ios
npm run submit:android
```

---

## Environment Variables

### Backend (.env.production)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
REDIS_HOST="your-redis-host"
REDIS_PORT=6379
JWT_SECRET="generate-with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENWEATHER_API_KEY="your-key"
NODE_ENV="production"
```

### Mobile (.env.production)

```env
EXPO_PUBLIC_API_URL=https://api.traveljoy.com
```

---

## Post-Deployment Configuration

### 1. Configure Stripe Webhooks

```
URL: https://api.traveljoy.com/api/subscription/webhook
Events:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
```

### 2. Update Mobile App API URL

Update `mobile/.env.production`:

```env
EXPO_PUBLIC_API_URL=https://your-actual-api-url.com
```

### 3. Test End-to-End

```bash
# Run integration tests against production
cd backend
API_URL=https://your-api-url.com npm run test:integration
```

---

## Monitoring URLs

### Render

- Dashboard: https://dashboard.render.com
- Logs: Click on service → Logs tab

### Fly.io

- Dashboard: https://fly.io/dashboard
- Logs: `fly logs`

### Expo

- Dashboard: https://expo.dev
- Builds: https://expo.dev/accounts/[username]/projects/traveljoy/builds

### Stripe

- Dashboard: https://dashboard.stripe.com
- Webhooks: https://dashboard.stripe.com/webhooks

### App Store Connect

- Dashboard: https://appstoreconnect.apple.com

### Google Play Console

- Dashboard: https://play.google.com/console

---

## Common Commands

### Backend

```bash
# Start development
npm run dev

# Build
npm run build

# Start production
npm run start:prod

# Run migrations
npm run prisma:migrate:prod

# Integration tests
npm run test:integration
```

### Mobile

```bash
# Start development
npm start

# Build development
npm run build:dev:ios
npm run build:dev:android

# Build production
npm run build:prod:all

# Submit to stores
npm run submit:all

# OTA update
npm run update:prod
```

### Docker

```bash
# Build image
docker build -t traveljoy-backend ./backend

# Run production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

---

## Verification Commands

```bash
# Verify integration
./verify-integration.sh

# Test backend health
curl https://api.traveljoy.com/health

# Test authentication
curl -X POST https://api.traveljoy.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test subscription plans
curl https://api.traveljoy.com/api/subscription/plans
```

---

## Rollback Commands

### Backend (Render)

```bash
# Via dashboard: Deployments → Select previous → Rollback
```

### Backend (Fly.io)

```bash
fly releases
fly releases rollback v[previous-version]
```

### Mobile (OTA)

```bash
cd mobile
eas update --branch production --message "Rollback to stable"
```

---

## Support Contacts

- **Technical Issues**: dev@traveljoy.com
- **Deployment Help**: devops@traveljoy.com
- **Stripe Support**: https://support.stripe.com

---

## Documentation Links

- Full Integration Guide: `INTEGRATION_GUIDE.md`
- Backend Deployment: `backend/DEPLOYMENT_GUIDE.md`
- Mobile Deployment: `mobile/DEPLOYMENT_GUIDE.md`
- App Store Metadata: `mobile/APP_STORE_METADATA.md`
- Production Checklist: `PRODUCTION_READINESS_CHECKLIST.md`
- Deployment Summary: `DEPLOYMENT_SUMMARY.md`

---

## Emergency Contacts

**On-Call Schedule**: [Add your schedule]

**Escalation Path**:

1. On-call engineer
2. Engineering lead
3. CTO

**Incident Response**: [Add your process]

---

**Last Updated**: November 11, 2025
**Version**: 1.0.0
