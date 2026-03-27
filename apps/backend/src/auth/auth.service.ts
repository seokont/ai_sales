import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from '@ai-seller-widget/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const apiKey = `sk_${uuidv4().replace(/-/g, '')}`;

    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(dto.email.trim().toLowerCase());

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: isAdmin ? 'admin' : 'user',
      },
    });

    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        apiKey,
        systemPrompt: 'You are an AI sales assistant. Sell products using knowledge. Answer politely.',
      },
    });

    await this.prisma.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'owner',
      },
    });

    return this.generateTokens(user.id);
  }

  async login(dto: LoginDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' },
      });
    }

    return this.generateTokens(user.id);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; password?: string },
  ) {
    const updateData: { name?: string; password?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.password?.trim()) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (Object.keys(updateData).length === 0) {
      return this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    return this.generateTokens(tokenRecord.userId);
  }

  private async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign({ sub: userId });
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
