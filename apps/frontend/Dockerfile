FROM node:20-alpine AS base
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN npm install -w frontend 2>/dev/null || npm install

COPY apps/frontend ./apps/frontend
RUN npm run build -w frontend

ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /app/apps/frontend
CMD ["npm", "start"]
