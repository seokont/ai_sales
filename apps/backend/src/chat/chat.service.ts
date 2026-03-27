import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(companyId: string, chatId?: string, sessionId?: string) {
    if (chatId) {
      const chat = await this.prisma.chat.findFirst({
        where: { id: chatId, companyId },
        include: { messages: true },
      });
      if (chat) return chat;
    }

    return this.prisma.chat.create({
      data: { companyId, sessionId },
      include: { messages: true },
    });
  }

  async addMessage(chatId: string, role: 'user' | 'assistant', content: string) {
    return this.prisma.message.create({
      data: { chatId, role, content },
    });
  }

  async listByCompany(companyId: string) {
    return this.prisma.chat.findMany({
      where: { companyId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChatWithMessages(chatId: string, companyId: string) {
    return this.prisma.chat.findFirst({
      where: { id: chatId, companyId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
