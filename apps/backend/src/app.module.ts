import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { ChatModule } from './chat/chat.module';
import { WidgetModule } from './widget/widget.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ScraperModule } from './scraper/scraper.module';
import { AiModule } from './ai/ai.module';
import { TelegramModule } from './telegram/telegram.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AiModule,
    TelegramModule,
    AuthModule,
    CompanyModule,
    ChatModule,
    WidgetModule,
    KnowledgeModule,
    ScraperModule,
    AdminModule,
    ContactModule,
    EmailModule,
    HealthModule,
  ],
})
export class AppModule {}
