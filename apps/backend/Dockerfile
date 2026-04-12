# Базовий образ
FROM node:20-slim AS base
WORKDIR /app

# OpenSSL для Prisma + Chromium для Puppeteer (скрапер)
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    chromium \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

# Не качати вбудований Chrome з npm — використовуємо системний Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

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
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
