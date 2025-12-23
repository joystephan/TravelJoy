#!/bin/sh
set -e

echo "Starting TravelJoy Backend..."

# Extract database host and port from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -e 's/.*@\(.*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -e 's/.*:\([0-9]*\)\/.*/\1/')

# Extract Redis host and port from REDIS_URL
REDIS_HOST=$(echo $REDIS_URL | sed -e 's/redis:\/\/\(.*\):.*/\1/')
REDIS_PORT=$(echo $REDIS_URL | sed -e 's/.*:\([0-9]*\).*/\1/')

# Wait for Postgres to be ready using nc (netcat)
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
until nc -z $DB_HOST $DB_PORT 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is ready!"

# Wait for Redis to be ready using nc (netcat)
echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
until nc -z $REDIS_HOST $REDIS_PORT 2>/dev/null; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "Redis is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application on port ${PORT:-3000}..."
exec node dist/index.js

