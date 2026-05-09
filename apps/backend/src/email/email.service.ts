import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

export interface NotificationSettings {
  emailHost: string | null;
  emailPort: number | null;
  emailSecure: boolean;
  emailUser: string | null;
  emailPass: string | null;
  emailFrom: string | null;
  emailTo: string | null;
  telegramBotToken: string | null;
  telegramChatId: string | null;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private prisma: PrismaService, private telegramService: TelegramService) {}

  async getSettings(): Promise<NotificationSettings | null> {
    const s = await this.prisma.settings.findFirst();
    if (!s) return null;
    return {
      emailHost: s.emailHost,
      emailPort: s.emailPort,
      emailSecure: s.emailSecure,
      emailUser: s.emailUser,
      emailPass: s.emailPass,
      emailFrom: s.emailFrom,
      emailTo: s.emailTo,
      telegramBotToken: s.telegramBotToken,
      telegramChatId: s.telegramChatId,
    };
  }

  async updateSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const existing = await this.prisma.settings.findFirst();
    const payload: Record<string, unknown> = {};
    if (data.emailHost !== undefined) payload.emailHost = data.emailHost;
    if (data.emailPort !== undefined) payload.emailPort = data.emailPort;
    if (data.emailSecure !== undefined) payload.emailSecure = data.emailSecure;
    if (data.emailUser !== undefined) payload.emailUser = data.emailUser;
    if (data.emailPass !== undefined) payload.emailPass = data.emailPass;
    if (data.emailFrom !== undefined) payload.emailFrom = data.emailFrom;
    if (data.emailTo !== undefined) payload.emailTo = data.emailTo;
    if (data.telegramBotToken !== undefined) payload.telegramBotToken = data.telegramBotToken;
    if (data.telegramChatId !== undefined) payload.telegramChatId = data.telegramChatId;
    const s = existing
      ? await this.prisma.settings.update({ where: { id: existing.id }, data: payload as never })
      : await this.prisma.settings.create({ data: payload as never });
    return {
      emailHost: s.emailHost,
      emailPort: s.emailPort,
      emailSecure: s.emailSecure,
      emailUser: s.emailUser,
      emailPass: s.emailPass,
      emailFrom: s.emailFrom,
      emailTo: s.emailTo,
      telegramBotToken: s.telegramBotToken,
      telegramChatId: s.telegramChatId,
    };
  }

  async sendContactNotification(data: {
    name: string;
    email: string;
    message: string;
    plan?: string;
  }): Promise<{ sent: boolean; reason?: string }> {
    const settings = await this.getSettings();
    const botToken = settings?.telegramBotToken?.trim();
    const chatId = settings?.telegramChatId?.trim();
    if (!botToken || !chatId) {
      const missing: string[] = [];
      if (!botToken) missing.push('telegramBotToken');
      if (!chatId) missing.push('telegramChatId');
      this.logger.warn(
        `Contact notification skipped: Telegram not configured in Admin → Settings (missing: ${missing.join(', ')}).`,
      );
      return { sent: false, reason: 'telegram_not_configured' };
    }

    const planLabel = data.plan ? `\nPlan: ${data.plan}` : '';
    const message = `🔔 *New contact from widget*\n\n*Name:* ${data.name}\n*Email:* ${data.email}${planLabel}\n\n*Message:*\n${data.message}`;

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      if (res.ok) {
        return { sent: true };
      } else {
        const errorText = await res.text();
        this.logger.error(`Telegram sendMessage failed: ${res.status} ${errorText}`);
        return { sent: false, reason: 'telegram_send_failed' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Telegram sendMessage error: ${msg}`);
      return { sent: false, reason: 'telegram_error' };
    }
  }
}
