# Базовий образ
FROM node:20-slim AS base
WORKDIR /app

# OpenSSL для Prisma (node:20-slim має OpenSSL 3; Prisma потребує libssl)
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Копіюємо конфіг workspace
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/widget/package.json ./packages/widget/

# Встановлюємо всі залежності
RUN npm install

# Копіюємо вихідний код
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY packages/widget ./packages/widget

# Збираємо пакети
RUN npm run build -w @ai-seller-widget/shared
RUN npm run build -w widget 2>/dev/null || true
RUN cd apps/backend && npx prisma generate
RUN npm run build -w backend

# Налаштовуємо середовище
ENV NODE_ENV=production
EXPOSE 3001

# Переходимо у папку бекенду
WORKDIR /app/apps/backend

# Запускаємо бекенд напряму
CMD ["node", "dist/src/main.js"]
