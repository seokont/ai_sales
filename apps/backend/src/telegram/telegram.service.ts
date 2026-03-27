import { Injectable } from '@nestjs/common';

const PHONE_REGEX = /(\+?3?8?\s?)?\(?\d{2,3}\)?[\s.-]?\d{2,3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{0,2}|(\+?\d{10,14})/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const TELEGRAM_REGEX = /@[a-zA-Z0-9_]{5,32}|t\.me\/[a-zA-Z0-9_]+/gi;

@Injectable()
export class TelegramService {
  hasContacts(text: string): boolean {
    const contacts = this.extractContacts(text);
    return (
      contacts.phones.length > 0 ||
      contacts.emails.length > 0 ||
      contacts.telegrams.length > 0
    );
  }

  extractContacts(text: string): { phones: string[]; emails: string[]; telegrams: string[] } {
    const normalized = text.replace(/\s+/g, ' ');
    const phones = [...new Set((normalized.match(PHONE_REGEX) || []).map((p) => p.trim()))];
    const emails = [...new Set((normalized.match(EMAIL_REGEX) || []).map((e) => e.trim()))];
    const telegrams = [...new Set((normalized.match(TELEGRAM_REGEX) || []).map((t) => t.trim()))];
    return { phones, emails, telegrams };
  }

  async notifyContacts(
    botToken: string,
    chatId: string,
    companyName: string,
    userMessage: string,
    assistantMessage: string,
    contacts: { phones: string[]; emails: string[]; telegrams: string[] },
  ): Promise<boolean> {
    const lines: string[] = [
      `🔔 *Новий лид з віджета*`,
      `*Компанія:* ${companyName}`,
      ``,
      `*Клієнт:*`,
      userMessage,
      ``,
      `*Асистент:*`,
      assistantMessage,
      ``,
      `*Контакти:*`,
    ];
    if (contacts.phones.length) lines.push(`📞 Телефон: ${contacts.phones.join(', ')}`);
    if (contacts.emails.length) lines.push(`📧 Email: ${contacts.emails.join(', ')}`);
    if (contacts.telegrams.length) lines.push(`✈️ Telegram: ${contacts.telegrams.join(', ')}`);

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join('\n'),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
