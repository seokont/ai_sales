#!/bin/sh
set -e
cd /app/apps/backend
# Apply schema (no migration files in repo — db push is used)
npx prisma db push
# Idempotent: demo user + company + link (see prisma/seed.ts)
npx prisma db seed
exec node dist/src/main.js
