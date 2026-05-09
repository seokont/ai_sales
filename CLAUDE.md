# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development (run each in a separate terminal)
```bash
npm run dev:backend   # NestJS on :3001
npm run dev:frontend  # Next.js on :3000
npm run dev:widget    # Vite watch for widget bundle
```

### Build
```bash
npm run build           # shared → backend (CI order)
npm run build:frontend
npm run build:widget
```

### Database
```bash
npm run db:push       # Apply schema to DB (no migration file)
npm run db:migrate    # Create and apply migration
npm run db:generate   # Regenerate Prisma client
npm run db:seed       # Seed demo user/company
npm run db:studio     # Prisma Studio UI
```

### Tests (backend only)
```bash
npm test -w backend
npm run test:watch -w backend
npm run test:e2e -w backend
```

### Docker
```bash
docker-compose up -d
```

## Architecture

### Monorepo layout
```
apps/backend/    # NestJS API
apps/frontend/   # Next.js 14 dashboard (App Router)
packages/shared/ # Shared DTOs + types (class-validator)
packages/widget/ # Embeddable vanilla-TS IIFE bundle (Vite)
nginx/           # Reverse proxy config
```

Root uses **npm workspaces**. `@ai-seller-widget/shared` must be built before backend.

### Backend (NestJS + Prisma + Socket.io)

- **Entry**: `apps/backend/src/main.ts` — sets up Helmet, CORS, global `ValidationPipe`, Swagger at `/api/docs`, and custom `WidgetEmbedCorsMiddleware`.
- **Auth**: JWT access tokens (15m) + refresh tokens (7d) stored in `RefreshToken` table. Guards: `JwtAuthGuard`, `ApiKeyGuard` (widget API key), `AdminGuard`.
- **Multi-tenancy**: Every resource belongs to a `Company`. Users join companies via `UserCompany` junction. API keys are per-company.
- **AI**: `AiService` calls the GROQ API (OpenAI-compatible) using the company's system prompt. Knowledge items are formatted into the prompt. Companies can override the GROQ key per-company.
- **Realtime**: `ChatGateway` handles Socket.io events (`message` in, `assistant`/`typing`/`error` out). HTTP fallback at `POST /widget/message`.
- **Scraper**: Puppeteer jobs queued via BullMQ (`REDIS_ENABLED=true`). If Redis is disabled, jobs run synchronously.
- **Email**: `EmailService` uses Nodemailer with SMTP settings stored in the `Settings` table (configurable from admin panel).
- **Path alias**: `@/*` → `src/*`.

### Key Prisma models
`User` → `UserCompany` ← `Company` → `Chat` → `Message`  
`Company` → `KnowledgeItem`, `ScraperJob`  
`Settings` (singleton), `RefreshToken`, `ContactRequest`

Demo seed: `demo@ai-seller-widget.com` / `demo-widget-2024`, API key `sk_demo_main_page_000000000000000000000000`.

### Frontend (Next.js 14 App Router)

- **Auth flow**: JWTs stored in `localStorage`. `apps/frontend/lib/api.ts` wraps `fetch` with auto-refresh on 401.
- **i18n**: `apps/frontend/lib/i18n.ts` + `LanguageContext` — supports EN, UK, RU, HE. All UI text goes through `t('key')`.
- **Dashboard** (`app/dashboard/`): Chats, Knowledge, Scraper, Widget embed code, Settings, Admin (SMTP/Telegram/admin list).
- **Path alias**: `@/*` → project root (e.g. `@/lib/api`).

### Widget (`packages/widget/`)

Single IIFE bundle served by the backend at `GET /widget.js`. Embed: `<script src=".../widget.js" data-key="API_KEY"></script>`.

- Reads company config from `GET /widget/config?apiKey=...` on init.
- Uses Socket.io (falls back to HTTP polling).
- Chat history persisted in `localStorage` by `sessionId`.
- Language auto-detected from `navigator.languages` or `data-lang` attribute.
- Voice recognition code present but disabled (`VOICE_UI_ENABLED = false` in `src/widget.ts`).

### Shared package (`packages/shared/`)

DTOs with `class-validator` decorators shared between backend (validation) and frontend (types). Build output: `dist/` (CJS + `.d.ts`). Always build this before backend.

## Environment variables

**Backend** (`apps/backend/.env`):
```
DATABASE_URL, REDIS_URL, REDIS_ENABLED
JWT_SECRET (≥32 chars), JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN
GROQ_API_KEY, PORT, FRONTEND_URL, CORS_ORIGINS, ADMIN_EMAILS
```

**Frontend** (`apps/frontend/.env.local`):
```
NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_DEMO_WIDGET_KEY
```
