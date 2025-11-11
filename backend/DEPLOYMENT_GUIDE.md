# TravelJoy Backend Deployment Guide

## Overview

This guide covers deploying the TravelJoy backend API to production. We'll cover multiple deployment options including Render, Fly.io, Railway, and AWS.

## Prerequisites

### Required Services

1. **PostgreSQL Database** (Production)

   - Managed PostgreSQL instance
   - Minimum: 1GB RAM, 10GB storage
   - SSL/TLS enabled
   - Automated backups configured

2. **Redis Cache** (Production)

   - Managed Redis instance
   - Minimum: 256MB RAM
   - TLS enabled
   - Persistence enabled

3. **Domain Name** (Optional but recommended)

   - Custom domain for API (e.g., api.traveljoy.com)
   - SSL certificate (usually provided by hosting platform)

4. **Stripe Account** (Production)
   - Production API keys
   - Webhook endpoint configured

### Development Tools

- Node.js 18+
- npm or yarn
- Git
- Docker (for local testing)

## Environment Configuration

### Production Environment Variables

Create `.env.production` based on `.env.production.example`:

```bash
cp .env.production.example .env.production
```

**Critical Variables to Update:**

1. **DATABASE_URL**: Your production PostgreSQL connection string
2. **JWT_SECRET**: Generate a strong random secret (min 32 characters)
3. **STRIPE_SECRET_KEY**: Your Stripe production secret key
4. **STRIPE_WEBHOOK_SECRET**: Your Stripe webhook signing secret
5. **REDIS_HOST**: Your production Redis host
6. **OPENWEATHER_API_KEY**: Your OpenWeather API key

**Generate Strong JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Create Production Database

Choose a managed PostgreSQL provider:

- **Render**: https://render.com/docs/databases
- **Railway**: https://railway.app/
- **Supabase**: https://supabase.com/
- **AWS RDS**: https://aws.amazon.com/rds/
- **DigitalOcean**: https://www.digitalocean.com/products/managed-databases

### 2. Run Migrations

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run prisma:migrate:prod

# Verify migration
npx prisma db pull
```

### 3. Seed Initial Data (Optional)

Create subscription plans:

```bash
npx prisma db seed
```

## Deployment Options

### Option 1: Render (Recommended for Beginners)

**Pros:** Easy setup, free tier available, automatic deployments
**Cons:** Cold starts on free tier, limited customization

#### Steps:

1. **Create Render Account**

   - Sign up at https://render.com

2. **Create PostgreSQL Database**

   - Dashboard → New → PostgreSQL
   - Choose plan (Free or Starter)
   - Note the Internal/External Database URL

3. **Create Redis Instance**

   - Dashboard → New → Redis
   - Choose plan (Free or Starter)
   - Note the Redis URL

4. **Create Web Service**

   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - Name: `traveljoy-api`
     - Environment: `Node`
     - Build Command: `npm install && npm run build && npm run prisma:generate`
     - Start Command: `npm run start:prod`
     - Plan: Choose appropriate plan

5. **Set Environment Variables**

   - Add all variables from `.env.production.example`
   - Use Render's database and Redis URLs

6. **Deploy**

   - Click "Create Web Service"
   - Render will automatically deploy on every push to main branch

7. **Configure Custom Domain** (Optional)
   - Settings → Custom Domain
   - Add `api.traveljoy.com`
   - Update DNS records as instructed

### Option 2: Fly.io (Recommended for Production)

**Pros:** Global edge deployment, excellent performance, Docker-based
**Cons:** Requires Docker knowledge, more complex setup

#### Steps:

1. **Install Fly CLI**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**

   ```bash
   fly auth login
   ```

3. **Create Dockerfile**

   Create `backend/Dockerfile`:

   ```dockerfile
   FROM node:18-alpine AS builder

   WORKDIR /app

   COPY package*.json ./
   COPY prisma ./prisma/

   RUN npm ci
   RUN npx prisma generate

   COPY . .
   RUN npm run build

   FROM node:18-alpine

   WORKDIR /app

   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/prisma ./prisma
   COPY --from=builder kage*.json ./

   EXPOSE 3000

   CMD ["npm", "run", "start:prod"]
   ```

4. **Create fly.toml**

   ```bash
   fly launch
   ```

   This creates `fly.toml`. Update it:

   ```toml
   app = "traveljoy-api"
   primary_region = "iad"

   [build]

   [env]
     PORT = "3000"
     NODE_ENV = "production"

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 1

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 1024
   ```

5. **Create PostgreSQL Database**

   ```bash
   fly postgres create --name traveljoy-db
   fly postgres attach traveljoy-db
   ```

6. **Create Redis Instance**

   ```bash
   fly redis create --name traveljoy-redis
   ```

7. **Set Secrets**

   ```bash
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set STRIPE_SECRET_KEY="sk_live_..."
   fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
   fly secrets set OPENWEATHER_API_KEY="your-key"
   ```

8. **Deploy**

   ```bash
   fly deploy
   ```

9. **Run Migrations**
   ```bash
   fly ssh console
   npm run prisma:migrate:prod
   exit
   ```

### Option 3: Railway

**Pros:** Simple setup, good free tier, automatic deployments
**Cons:** Can be expensive at scale

#### Steps:

1. **Create Railway Account**

   - Sign up at https://railway.app

2. **Create New Project**

   - Dashboard → New Project
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Add PostgreSQL**

   - Add → Database → PostgreSQL
   - Railway automatically sets DATABASE_URL

4. **Add Redis**

   - Add → Database → Redis
   - Railway automatically sets REDIS_URL

5. **Configure Service**

   - Settings → Build Command: `npm install && npm run build && npm run prisma:generate`
   - Settings → Start Command: `npm run start:prod`
   - Settings → Root Directory: `backend`

6. **Set Environment Variables**

   - Variables tab → Add all required variables

7. **Deploy**
   - Railway automatically deploys on push

### Option 4: AWS (Advanced)

**Pros:** Maximum control, scalability, enterprise features
**Cons:** Complex setup, higher cost, requires AWS knowledge

#### Architecture:

- **Compute**: AWS Elastic Beanstalk or ECS
- **Database**: AWS RDS PostgreSQL
- **Cache**: AWS ElastiCache Redis
- **Load Balancer**: AWS Application Load Balancer
- **Storage**: AWS S3 (for assets)
- **CDN**: AWS CloudFront

#### Quick Setup with Elastic Beanstalk:

1. **Install EB CLI**

   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**

   ```bash
   cd backend
   eb init -p node.js-18 traveljoy-api
   ```

3. **Create Environment**

   ```bash
   eb create traveljoy-prod
   ```

4. **Set Environment Variables**

   ```bash
   eb setenv JWT_SECRET="your-secret" \
     STRIPE_SECRET_KEY="sk_live_..." \
     DATABASE_URL="postgresql://..."
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

## Post-Deployment Configuration

### 1. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.traveljoy.com/api/subscription/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in environment variables

### 2. Configure CORS

Update CORS_ORIGIN to include your production frontend URL:

```env
CORS_ORIGIN="https://traveljoy.com,https://www.traveljoy.com"
```

Or update in code (`backend/src/index.ts`):

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
```

### 3. Set Up Monitoring

#### Option A: Sentry (Recommended)

```bash
npm install @sentry/node
```

Add to `backend/src/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Option B: LogRocket

```bash
npm install logrocket
```

#### Option C: Platform-specific monitoring

- Render: Built-in metrics
- Fly.io: `fly logs`
- Railway: Built-in logs
- AWS: CloudWatch

### 4. Set Up Health Checks

Most platforms automatically use the `/health` endpoint. Verify it's working:

```bash
curl https://api.traveljoy.com/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "TravelJoy API is running"
}
```

### 5. Configure Backups

#### Database Backups

- **Render**: Automatic daily backups (paid plans)
- **Railway**: Automatic backups
- **Fly.io**: Configure with `fly postgres backup`
- **AWS RDS**: Enable automated backups

#### Redis Backups

- **Render**: Automatic backups (paid plans)
- **Railway**: Automatic backups
- **Fly.io**: Configure persistence
- **AWS ElastiCache**: Enable automatic backups

## SSL/TLS Configuration

Most platforms provide automatic SSL certificates:

- **Render**: Automatic Let's Encrypt
- **Fly.io**: Automatic certificates
- **Railway**: Automatic certificates
- **AWS**: Use AWS Certificate Manager

## Performance Optimization

### 1. Enable Compression

Already configured in `backend/src/index.ts` with gzip.

### 2. Database Connection Pooling

Prisma handles this automatically. Adjust if needed:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### 3. Redis Caching

Verify Redis is working:

```bash
curl https://api.traveljoy.com/api/trips
```

Check response headers for cache hits.

### 4. Rate Limiting

Already configured. Adjust limits in environment variables:

```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Scaling Considerations

### Horizontal Scaling

- **Render**: Increase instance count in settings
- **Fly.io**: `fly scale count 3`
- **Railway**: Add replicas in settings
- **AWS**: Configure auto-scaling group

### Vertical Scaling

- **Render**: Upgrade instance type
- **Fly.io**: `fly scale vm shared-cpu-2x`
- **Railway**: Upgrade plan
- **AWS**: Change instance type

### Database Scaling

- Increase connection pool size
- Add read replicas for read-heavy workloads
- Consider database sharding for very large scale

## Monitoring and Maintenance

### Key Metrics to Monitor

1. **Response Time**: < 500ms for 95th percentile
2. **Error Rate**: < 1%
3. **CPU Usage**: < 70% average
4. **Memory Usage**: < 80% average
5. **Database Connections**: < 80% of pool
6. **Cache Hit Rate**: > 80%

### Log Management

```bash
# Render
render logs

# Fly.io
fly logs

# Railway
railway logs

# AWS
aws logs tail /aws/elasticbeanstalk/traveljoy-prod
```

### Alerts

Set up alerts for:

- High error rate (> 5%)
- Slow response times (> 2s)
- High CPU/memory usage (> 90%)
- Database connection errors
- External API failures

## Rollback Strategy

### Quick Rollback

**Render:**

```bash
# Rollback to previous deployment
render rollback
```

**Fly.io:**

```bash
# List releases
fly releases

# Rollback to specific version
fly releases rollback v2
```

**Railway:**

- Use Railway dashboard to rollback to previous deployment

**AWS:**

```bash
eb deploy --version previous-version
```

### Database Rollback

If migration causes issues:

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back migration_name
```

## Security Checklist

- [ ] Strong JWT secret (min 32 characters)
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma ORM)
- [ ] Environment variables secured (not in code)
- [ ] Database SSL/TLS enabled
- [ ] Redis TLS enabled (production)
- [ ] Stripe webhook signature verification
- [ ] Regular security updates (`npm audit`)
- [ ] Secrets rotation policy
- [ ] Access logs enabled
- [ ] Error messages don't leak sensitive info

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Verify DATABASE_URL is correct
   - Check SSL mode: `?sslmode=require`
   - Verify database is accessible from deployment platform
   - Check connection pool limits

2. **Redis Connection Errors**

   - Verify REDIS_HOST and REDIS_PORT
   - Check if TLS is required
   - Verify Redis password if set

3. **Stripe Webhook Failures**

   - Verify webhook secret is correct
   - Check endpoint is publicly accessible
   - Verify raw body parsing for webhook route
   - Check Stripe dashboard for webhook logs

4. **High Memory Usage**

   - Check for memory leaks
   - Optimize database queries
   - Implement pagination
   - Clear unused cache entries

5. **Slow Response Times**
   - Enable Redis caching
   - Optimize database queries
   - Add database indexes
   - Implement query result caching

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Stripe production keys configured
- [ ] External API keys verified
- [ ] CORS origins updated
- [ ] SSL certificate configured
- [ ] Monitoring set up
- [ ] Backup strategy configured
- [ ] Rollback plan documented

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Verify health endpoint
- [ ] Test critical API endpoints
- [ ] Verify database connectivity
- [ ] Verify Redis connectivity
- [ ] Test Stripe webhook
- [ ] Check logs for errors

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify all integrations working
- [ ] Test mobile app connectivity
- [ ] Monitor resource usage
- [ ] Set up alerts
- [ ] Document deployment
- [ ] Update team on deployment status

## Support

For deployment assistance:

- Email: devops@traveljoy.com
- Documentation: https://docs.traveljoy.com
- Slack: #deployment channel
