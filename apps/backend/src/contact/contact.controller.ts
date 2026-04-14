import { Body, Controller, Logger, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      email: string;
      message: string;
      plan?: string;
    },
  ) {
    const { name, email, message, plan } = body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return { ok: false, error: 'Name, email and message are required' };
    }
    await this.prisma.contactRequest.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        plan: plan?.trim() || null,
      },
    });
    const emailResult = await this.emailService.sendContactNotification({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      plan: plan?.trim(),
    });
    if (!emailResult.sent) {
      this.logger.warn(
        `Contact saved but email not sent (reason=${emailResult.reason ?? 'unknown'}). Check Admin → Email settings and backend logs.`,
      );
    }
    return { ok: true, emailSent: emailResult.sent };
  }
}
