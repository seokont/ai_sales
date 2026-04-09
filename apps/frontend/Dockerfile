# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

# передаём правильный адрес backend
ARG NEXT_PUBLIC_API_URL=http://backend:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DEMO_WIDGET_KEY=sk_demo_main_page_000000000000000000000000
ENV NEXT_PUBLIC_DEMO_WIDGET_KEY=$NEXT_PUBLIC_DEMO_WIDGET_KEY

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm install

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN npm run build

# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://backend:3001

COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]