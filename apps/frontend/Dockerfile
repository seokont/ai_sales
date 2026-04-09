# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# копируем package.json всего workspace
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/

# ставим ВСЕ зависимости
RUN npm install

# копируем код
COPY apps/frontend ./apps/frontend

# билд
WORKDIR /app/apps/frontend
RUN npm run build


# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# копируем только нужное
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]