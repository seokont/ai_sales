# AI Seller Widget

Multi-tenant SaaS platform for embedding AI sales assistant widgets on websites.

## Stack

- **Backend**: NestJS
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT + Refresh tokens
- **AI**: GROQ (OpenAI-compatible)
- **Scraper**: Puppeteer
- **Queue**: BullMQ + Redis
- **Realtime**: Socket.io
- **Widget**: Vanilla JS embeddable script

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- GROQ API key (https://console.groq.com)

### Setup

1. Copy env files:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

2. Edit `apps/backend/.env` and set:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_URL` - Redis connection (e.g. redis://localhost:6379)
   - `JWT_SECRET` - Random secret for JWT
   - `GROQ_API_KEY` - Your GROQ API key

3. Install and setup:
   ```bash
   npm install
   npm run db:generate
   npm run db:push
   ```

4. Build widget (required for widget.js):
   ```bash
   npm run build -w widget
   ```

5. Run:
   ```bash
   npm run dev:backend   # Terminal 1 - API on :3001
   npm run dev:frontend  # Terminal 2 - Dashboard on :3000
   ```

### Docker

```bash
docker-compose up -d
```

Set `GROQ_API_KEY` in `.env` or export before running.

## Project Structure

```
/apps/backend     - NestJS API
/apps/frontend    - Next.js dashboard
/packages/widget  - Embeddable widget script
/packages/shared  - Shared DTOs and types
```

## Widget Embed

```html
<script src="http://localhost:3001/widget.js" data-key="YOUR_API_KEY"></script>
```

## API Endpoints

- `POST /auth/register` - Register + create company
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /companies` - List user companies (JWT)
- `PATCH /companies/:id` - Update company (JWT)
- `POST /widget/message` - Send message (API key)
- `GET /chats/company/:id` - List chats (JWT)
- `GET /knowledge/company/:id` - List knowledge (JWT)
- `POST /scraper/company/:id/run` - Run scraper (JWT)
