import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

export interface EmailSettings {
  emailHost: string | null;
  emailPort: number | null;
  emailSecure: boolean;
  emailUser: string | null;
  emailPass: string | null;
  emailFrom: string | null;
  emailTo: string | null;
}

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<EmailSettings | null> {
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
    };
  }

  async updateSettings(data: Partial<EmailSettings>): Promise<EmailSettings> {
    const existing = await this.prisma.settings.findFirst();
    const payload: Record<string, unknown> = {};
    if (data.emailHost !== undefined) payload.emailHost = data.emailHost;
    if (data.emailPort !== undefined) payload.emailPort = data.emailPort;
    if (data.emailSecure !== undefined) payload.emailSecure = data.emailSecure;
    if (data.emailUser !== undefined) payload.emailUser = data.emailUser;
    if (data.emailPass !== undefined) payload.emailPass = data.emailPass;
    if (data.emailFrom !== undefined) payload.emailFrom = data.emailFrom;
    if (data.emailTo !== undefined) payload.emailTo = data.emailTo;
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
    };
  }

  async sendContactNotification(data: {
    name: string;
    email: string;
    message: string;
    plan?: string;
  }): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings?.emailHost || !settings?.emailTo || !settings.emailFrom) {
      return false;
    }
    const transporter = nodemailer.createTransport({
      host: settings.emailHost,
      port: settings.emailPort ?? 587,
      secure: settings.emailSecure,
      auth: settings.emailUser && settings.emailPass
        ? { user: settings.emailUser, pass: settings.emailPass }
        : undefined,
    });
    const planLabel = data.plan ? `\nPlan: ${data.plan}` : '';
    await transporter.sendMail({
      from: settings.emailFrom,
      to: settings.emailTo,
      subject: `[AI Seller] New contact: ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}${planLabel}\n\nMessage:\n${data.message}`,
      html: `<p><b>Name:</b> ${data.name}</p><p><b>Email:</b> <a href="mailto:${data.email}">${data.email}</a></p>${data.plan ? `<p><b>Plan:</b> ${data.plan}</p>` : ''}<p><b>Message:</b></p><p>${data.message.replace(/\n/g, '<br>')}</p>`,
    });
    return true;
  }
}
