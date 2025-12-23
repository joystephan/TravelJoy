# Multi-stage build for TravelJoy Backend

# Stage 1: Builder
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean

# Generate Prisma Client
RUN yarn prisma:generate

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Stage 2: Production
FROM node:18-alpine

# Install dumb-init and netcat for proper signal handling and health checks
RUN apk add --no-cache dumb-init netcat-openbsd

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy entrypoint script
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application using entrypoint script
CMD ["./docker-entrypoint.sh"]
