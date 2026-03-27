FROM node:20-slim AS base
WORKDIR /app

# OpenSSL for Prisma (node:20-slim has OpenSSL 3; Prisma needs libssl)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy workspace config
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/widget/package.json ./packages/widget/

# Install all deps
RUN npm install

# Copy source
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY packages/widget ./packages/widget

# Build shared, widget, then backend
RUN npm run build -w shared 2>/dev/null || true
RUN npm run build -w widget 2>/dev/null || true
RUN cd apps/backend && npx prisma generate
RUN npm run build -w backend

ENV NODE_ENV=production
EXPOSE 3001
WORKDIR /app/apps/backend
CMD ["node", "dist/src/main.js"]
