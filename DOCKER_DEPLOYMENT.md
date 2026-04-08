# Развёртывание AI Seller Widget через Docker

Инструкция по запуску проекта в Docker на сервере (Ubuntu и другие Linux).

---

## 1. Требования

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**

### Установка Docker на Ubuntu

```bash
# Удаление старых версий (если есть)
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null

# Установка зависимостей
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Добавление ключа Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker (чтобы не использовать sudo)
sudo usermod -aG docker $USER
# Выйдите и войдите снова, чтобы применить группу
```

Проверка:

```bash
docker --version
docker compose version
```

---

## 2. Клонирование и настройка

### Клонирование

```bash
cd /var/www   # или другая директория
git clone <url-репозитория> sales_ai
cd sales_ai
```

### Файл переменных окружения

В корне проекта есть `.env.example`. Создайте `.env`:

```bash
cp .env.example .env
nano .env
```

Минимальный набор для production:

```env
# Обязательные
JWT_SECRET="сгенерируйте-длинный-случайный-ключ-минимум-32-символа"
GROQ_API_KEY="ваш-ключ-с-console.groq.com"

# Для production (если доступ с внешнего домена)
FRONTEND_URL="https://your-domain.com"
CORS_ORIGINS="https://your-domain.com,https://www.your-domain.com"
ADMIN_EMAILS="admin@example.com"
```

Файл `.env.example` в корне содержит шаблон. Обязательно задайте `JWT_SECRET` и `GROQ_API_KEY`.

---

## 3. Запуск

### Первый запуск

**Важно:** создайте `.env` из `.env.example` и задайте `JWT_SECRET` и `GROQ_API_KEY`. Иначе backend не запустится.

```bash
# Сборка и запуск всех сервисов
docker compose up -d --build

# Просмотр логов
docker compose logs -f
```

Сервисы:

| Сервис   | Порт | Описание                    |
|----------|------|-----------------------------|
| nginx    | 80   | Reverse proxy (frontend + backend) |
| postgres | 5432 | База данных PostgreSQL      |
| redis    | 6379 | Redis (очередь скрапера)    |
| backend  | 3001 | API (NestJS)                |
| frontend | 3000 | Dashboard (Next.js)         |
| pgadmin  | 5051 | Веб-интерфейс для PostgreSQL (см. `PGADMIN_PORT` в `.env`) |

**Доступ через nginx (порт 80):** http://localhost — frontend и API на одном хосте.

**pgAdmin:** по умолчанию http://localhost:5051 — логин: `admin@admin.com` / `admin` (или из `.env`: `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`). Порт задаётся переменной `PGADMIN_PORT` (если `5050` или `5051` заняты — укажите свободный, например `5052`). Добавьте сервер: host=`postgres`, port=`5432`, user=`postgres`, password=`postgres`.

### Инициализация базы данных

При **старте контейнера `backend`** автоматически выполняются `prisma db push` и `prisma db seed` (демо-пользователь `demo@ai-seller-widget.com`, пароль в [seed.ts](apps/backend/prisma/seed.ts)). После обновления образа пересоберите backend: `docker compose build backend && docker compose up -d backend`.

Вручную при необходимости:

```bash
docker compose exec backend npx prisma db push
docker compose exec backend npm run prisma:seed
```

---

## 4. Production: переменные окружения

Для production создайте `.env` с полным набором переменных:

```env
# JWT
JWT_SECRET="очень-длинный-случайный-секрет-минимум-32-символа"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# GROQ API
GROQ_API_KEY="gsk_..."

# URLs (ваши домены)
FRONTEND_URL="https://your-domain.com"
CORS_ORIGINS="https://your-domain.com,https://www.your-domain.com"

# Админы (через запятую)
ADMIN_EMAILS="admin@example.com"

# Опционально: отключить Redis (скрапер будет работать синхронно)
# REDIS_ENABLED=false
```

Обновите `docker-compose.yml`, чтобы передать эти переменные в backend и frontend (см. раздел 6).

---

## 5. Nginx как reverse proxy

Для доступа по домену и HTTPS настройте Nginx перед Docker.

### Установка Nginx

```bash
sudo apt install -y nginx
```

### Конфигурация

Создайте `/etc/nginx/sites-available/ai-seller`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включение:

```bash
sudo ln -s /etc/nginx/sites-available/ai-seller /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

После получения сертификатов обновите `FRONTEND_URL` и `CORS_ORIGINS` в `.env` на `https://...`.

---

## 6. Production: переменные в .env

`docker-compose.yml` уже настроен на чтение `.env`. Переменные `FRONTEND_URL`, `CORS_ORIGINS`, `ADMIN_EMAILS` и `NEXT_PUBLIC_API_URL` подхватываются из `.env`.

Для production frontend пересоберите с нужным API URL:

```bash
# В .env задайте:
# NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Пересборка frontend с новым URL (NEXT_PUBLIC_* вшивается при сборке)
docker compose build --no-cache frontend
docker compose up -d
```

---

## 7. Полезные команды

| Действие              | Команда                                      |
|-----------------------|----------------------------------------------|
| Запуск                | `docker compose up -d`                       |
| Остановка             | `docker compose down`                        |
| Пересборка            | `docker compose up -d --build`               |
| Логи всех сервисов    | `docker compose logs -f`                     |
| Логи backend          | `docker compose logs -f backend`             |
| Выполнить в backend   | `docker compose exec backend <команда>`       |
| Prisma Studio         | `docker compose exec backend npx prisma studio` |
| Сид БД                | `docker compose exec backend npm run prisma:seed` |

---

## 8. Volumes и данные

Docker Compose создаёт volume `pgdata` для PostgreSQL. Данные сохраняются между перезапусками.

Бэкап БД:

```bash
docker compose exec postgres pg_dump -U postgres ai_seller > backup.sql
```

Восстановление:

```bash
cat backup.sql | docker compose exec -T postgres psql -U postgres ai_seller
```

---

## 9. Виджет (widget.js)

Виджет раздаётся backend. При доступе через Nginx:

- Frontend: `https://your-domain.com`
- API: `https://api.your-domain.com`

URL виджета: `https://api.your-domain.com/widget.js`

Пример встраивания:

```html
<script src="https://api.your-domain.com/widget.js" data-key="YOUR_API_KEY"></script>
```

Убедитесь, что `api.your-domain.com` добавлен в `CORS_ORIGINS` для доменов, где будет встроен виджет.

---

## 10. Troubleshooting

### Backend не подключается к PostgreSQL

Дождитесь готовности postgres (healthcheck). При необходимости:

```bash
docker compose up -d postgres redis
sleep 10
docker compose up -d backend frontend
```

### Ошибка при сборке frontend

Убедитесь, что в корне есть `package-lock.json`:

```bash
npm install
git add package-lock.json
```

### Puppeteer в backend (скрапер)

Backend использует Puppeteer. Образ `node:20-slim` может не содержать библиотеки для headless Chrome. При ошибках скрапера рассмотрите использование образа с Chromium или установку зависимостей в Dockerfile.

### Порт занят

Измените маппинг портов в `docker-compose.yml`:

```yaml
ports:
  - "13000:3000"   # frontend на 13000
  - "13001:3001"   # backend на 13001
```
