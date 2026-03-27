# Развёртывание AI Seller Widget на Ubuntu

Инструкция по настройке сервера и запуску проекта на Ubuntu 20.04 / 22.04.

---

## 1. Подготовка сервера

### Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### Установка Node.js 18+ (через NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # должно быть v18+ или v20+
npm -v
```

Альтернатива — через nvm (для нескольких версий Node):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Установка PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Создание базы и пользователя:

```bash
sudo -u postgres psql -c "CREATE USER ai_seller WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE ai_seller OWNER ai_seller;"
```

### Установка Redis (опционально)

Redis нужен для очереди скрапера. Если не установлен, задайте `REDIS_ENABLED=false` в `.env`.

```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Установка Git

```bash
sudo apt install -y git
```

---

## 2. Клонирование и настройка проекта

### Клонирование репозитория

```bash
cd /var/www   # или другая директория
git clone <url-репозитория> sales_ai
cd sales_ai
```

### Установка зависимостей

```bash
npm install
```

### Переменные окружения Backend

```bash
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env
```

Заполните:

```env
DATABASE_URL="postgresql://ai_seller:your_secure_password@localhost:5432/ai_seller?schema=public"
REDIS_URL="redis://localhost:6379"
REDIS_ENABLED=true
# Если Redis не установлен: REDIS_ENABLED=false

JWT_SECRET="сгенерируйте-длинный-случайный-ключ-минимум-32-символа"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

GROQ_API_KEY="ваш-ключ-с-console.groq.com"
PORT=3001

# URL фронтенда (для CORS)
FRONTEND_URL="https://your-domain.com"

# CORS (домены, с которых разрешены запросы)
CORS_ORIGINS="https://your-domain.com,https://www.your-domain.com"

# Email адреса администраторов (через запятую)
ADMIN_EMAILS="admin@example.com"
```

### Переменные окружения Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
nano apps/frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
# или если API на том же домене: https://your-domain.com/api

NEXT_PUBLIC_DEMO_WIDGET_KEY=sk_demo_main_page_000000000000000000000000
```

---

## 3. База данных и сборка

### Инициализация БД

```bash
npm run db:generate
npm run db:push
```

### Опционально: сид (демо-данные)

```bash
npm run db:seed -w backend
```

### Сборка проекта

```bash
# Сборка shared и backend
npm run build

# Сборка frontend
npm run build:frontend

# Сборка виджета (для widget.js)
npm run build:widget
```

---

## 4. Запуск

### Режим разработки (для проверки)

```bash
# Терминал 1 — Backend
npm run dev:backend

# Терминал 2 — Frontend
npm run dev:frontend
```

Backend: http://localhost:3001  
Frontend: http://localhost:3000

### Режим production (PM2)

Установка PM2:

```bash
sudo npm install -g pm2
```

В проекте уже есть `ecosystem.config.cjs` в корне.

Запуск:

```bash
# Сначала соберите проект
npm run build
npm run build:frontend
npm run build:widget

# Запуск через PM2
pm2 start ecosystem.config.cjs

# Просмотр логов
pm2 logs

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

---

## 5. Nginx (рекомендуется для production)

### Установка Nginx

```bash
sudo apt install -y nginx
```

### Конфигурация

Создайте `/etc/nginx/sites-available/ai-seller`:

```nginx
# Frontend (Next.js)
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

# Backend API (опционально: поддомен api.your-domain.com)
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

Или всё на одном домене (API по пути `/api`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /api {
        rewrite ^/api(.*)$ $1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

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
```

Включение и перезагрузка:

```bash
sudo ln -s /etc/nginx/sites-available/ai-seller /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

После получения сертификата обновите `FRONTEND_URL` и `CORS_ORIGINS` в `.env` на `https://...`.

---

## 6. Виджет (widget.js)

Виджет раздаётся с backend. URL для встраивания:

```
https://api.your-domain.com/widget.js
```

Или, если API на том же домене:

```
https://your-domain.com/widget.js
```

Пример встраивания:

```html
<script src="https://your-domain.com/widget.js" data-key="YOUR_API_KEY"></script>
```

---

## 7. Полезные команды

| Действие | Команда |
|---------|---------|
| Логи backend | `pm2 logs ai-seller-backend` |
| Логи frontend | `pm2 logs ai-seller-frontend` |
| Перезапуск | `pm2 restart all` |
| Prisma Studio | `npm run db:studio -w backend` |
| Миграции | `npm run db:push -w backend` |

---

## 8. Требования к железу

- **RAM**: минимум 1 GB, рекомендуется 2 GB
- **CPU**: 1 vCPU достаточно для малой нагрузки
- **Диск**: ~2 GB (Node, зависимости, БД)

---

## 9. Troubleshooting

### Ошибка подключения к PostgreSQL

```bash
sudo -u postgres psql -c "\du"
# Проверьте, что пользователь ai_seller существует и имеет права на БД
```

### Puppeteer (скрапер) не запускается

Установите зависимости для headless Chrome:

```bash
sudo apt install -y chromium-browser
# или
sudo apt install -y libnss3 libatk1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libgbm1
```

### CORS ошибки

Убедитесь, что в `apps/backend/.env` указаны все домены в `CORS_ORIGINS` через запятую.
