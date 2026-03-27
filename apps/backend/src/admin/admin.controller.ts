import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Get('check')
  @UseGuards(AdminGuard)
  check() {
    return { admin: true };
  }

  @Get('companies')
  @UseGuards(AdminGuard)
  async listCompanies() {
    const companies = await this.prisma.company.findMany({
      include: {
        users: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      plan: c.plan,
      apiKey: c.apiKey,
      apiKeyShort: c.apiKey.substring(0, 12) + '...',
      websiteUrl: c.websiteUrl ?? null,
      widgetGreeting: c.widgetGreeting ?? null,
      widgetHeader: c.widgetHeader ?? null,
      language: c.language ?? null,
      createdAt: c.createdAt,
      users: c.users.map((u) => ({ id: u.user.id, email: u.user.email, name: u.user.name, role: u.role })),
    }));
  }

  @Get('companies/:id')
  @UseGuards(AdminGuard)
  async getCompany(@Param('id') id: string) {
    return this.prisma.company.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        domain: true,
        apiKey: true,
        groqKey: true,
        systemPrompt: true,
        plan: true,
        telegramBotToken: true,
        telegramChatId: true,
        language: true,
        widgetGreeting: true,
        widgetHeader: true,
        websiteUrl: true,
        createdAt: true,
      },
    });
  }

  @Patch('companies/:id')
  @UseGuards(AdminGuard)
  async updateCompany(
    @Param('id') id: string,
    @Body()
    body: {
      plan?: string;
      name?: string;
      domain?: string | null;
      groqKey?: string | null;
      systemPrompt?: string | null;
      telegramBotToken?: string | null;
      telegramChatId?: string | null;
      language?: string;
      widgetGreeting?: string | null;
      widgetHeader?: string | null;
      websiteUrl?: string | null;
    },
  ) {
    const validPlans = ['free', 'pro', 'enterprise'];
    if (body.plan && !validPlans.includes(body.plan)) {
      throw new BadRequestException('Invalid plan');
    }
    const data: Record<string, unknown> = {};
    if (body.plan !== undefined) data.plan = body.plan;
    if (body.name !== undefined) data.name = body.name;
    if (body.domain !== undefined) data.domain = body.domain?.trim() || null;
    if (body.groqKey !== undefined) data.groqKey = body.groqKey?.trim() || null;
    if (body.systemPrompt !== undefined) data.systemPrompt = body.systemPrompt?.trim() || null;
    if (body.telegramBotToken !== undefined) data.telegramBotToken = body.telegramBotToken?.trim() || null;
    if (body.telegramChatId !== undefined) data.telegramChatId = body.telegramChatId?.trim() || null;
    if (body.language !== undefined) data.language = body.language;
    if (body.widgetGreeting !== undefined) data.widgetGreeting = body.widgetGreeting?.trim() || null;
    if (body.widgetHeader !== undefined) data.widgetHeader = body.widgetHeader?.trim() || null;
    if (body.websiteUrl !== undefined) data.websiteUrl = body.websiteUrl?.trim() || null;
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  @Delete('companies/:id')
  @UseGuards(AdminGuard)
  async deleteCompany(@Param('id') id: string) {
    await this.prisma.company.delete({ where: { id } });
    return { deleted: true };
  }

  @Get('users')
  @UseGuards(AdminGuard)
  async listUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        companies: {
          include: { company: { select: { id: true, name: true, plan: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'user',
      createdAt: u.createdAt,
      companies: u.companies.map((uc) => ({
        id: uc.company.id,
        name: uc.company.name,
        plan: uc.company.plan,
        role: uc.role,
      })),
    }));
  }

  @Get('users/:id')
  @UseGuards(AdminGuard)
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return user;
  }

  @Patch('users/:id')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: { role?: string; name?: string | null; email?: string; password?: string },
  ) {
    const validRoles = ['user', 'admin'];
    if (body.role && !validRoles.includes(body.role)) {
      throw new BadRequestException('Invalid role');
    }
    const data: Record<string, unknown> = {};
    if (body.role !== undefined) data.role = body.role;
    if (body.name !== undefined) data.name = body.name?.trim() || null;
    if (body.email !== undefined) {
      const email = body.email?.trim();
      if (!email) throw new BadRequestException('Email required');
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Email already in use');
      }
      data.email = email;
    }
    if (body.password !== undefined && body.password.trim()) {
      const bcrypt = await import('bcrypt');
      data.password = await bcrypt.hash(body.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  @Delete('users/:id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id') id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  @Get('settings')
  @UseGuards(AdminGuard)
  async getSettings() {
    const s = await this.emailService.getSettings();
    if (!s) return {};
    return {
      ...s,
      emailPass: s.emailPass ? '••••••••' : '',
    };
  }

  @Patch('settings')
  @UseGuards(AdminGuard)
  async updateSettings(
    @Body()
    body: {
      emailHost?: string | null;
      emailPort?: number | null;
      emailSecure?: boolean;
      emailUser?: string | null;
      emailPass?: string | null;
      emailFrom?: string | null;
      emailTo?: string | null;
    },
  ) {
    const data: Parameters<EmailService['updateSettings']>[0] = {};
    if (body.emailHost !== undefined) data.emailHost = body.emailHost?.trim() || null;
    if (body.emailPort !== undefined) data.emailPort = body.emailPort ?? null;
    if (body.emailSecure !== undefined) data.emailSecure = body.emailSecure;
    if (body.emailUser !== undefined) data.emailUser = body.emailUser?.trim() || null;
    if (body.emailPass !== undefined && body.emailPass !== '••••••••') {
      data.emailPass = body.emailPass?.trim() || null;
    }
    if (body.emailFrom !== undefined) data.emailFrom = body.emailFrom?.trim() || null;
    if (body.emailTo !== undefined) data.emailTo = body.emailTo?.trim() || null;
    const s = await this.emailService.updateSettings(data);
    return {
      ...s,
      emailPass: s.emailPass ? '••••••••' : '',
    };
  }
}
