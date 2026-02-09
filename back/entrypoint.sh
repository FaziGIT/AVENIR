#!/bin/sh
set -e

echo "Initializing database..."
npx tsx init-db.ts

echo "Starting server..."
exec npx tsx infrastructure/adapters/fastify/server.ts
