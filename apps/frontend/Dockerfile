# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/

RUN npm install

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN npm run build


# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]