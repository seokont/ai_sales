import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { CurrentCompany } from '../auth/decorators/company.decorator';
import { ChatService } from '../chat/chat.service';
import { AiService } from '../ai/ai.service';
import { TelegramService } from '../telegram/telegram.service';
import { WidgetMessageDto } from '@ai-seller-widget/shared';

@Controller('widget')
@UseGuards(ApiKeyGuard)
export class WidgetController {
  constructor(
    private chatService: ChatService,
    private aiService: AiService,
    private telegramService: TelegramService,
  ) {}

  @Post('message')
  async message(
    @CurrentCompany() company: { id: string; name: string; telegramBotToken?: string | null; telegramChatId?: string | null },
    @Body() dto: WidgetMessageDto,
  ) {
    const chat = await this.chatService.getOrCreate(
      company.id,
      dto.chatId,
      undefined,
    );

    await this.chatService.addMessage(chat.id, 'user', dto.message);

    const messages = [
      ...chat.messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: dto.message },
    ];

    const assistantMessage = await this.aiService.chat(company.id, messages);
    await this.chatService.addMessage(chat.id, 'assistant', assistantMessage);

    if (company.telegramBotToken && company.telegramChatId && this.telegramService.hasContacts(dto.message)) {
      const contacts = this.telegramService.extractContacts(dto.message);
      this.telegramService
        .notifyContacts(
          company.telegramBotToken,
          company.telegramChatId,
          company.name,
          dto.message,
          assistantMessage,
          contacts,
        )
        .catch(() => {});
    }

    return {
      chatId: chat.id,
      assistantMessage,
    };
  }

  @Get('config')
  async getConfig(
    @CurrentCompany() company: { widgetGreeting?: string | null; widgetHeader?: string | null; websiteUrl?: string | null; avatarPath?: string | null },
  ) {
    return {
      greeting: company.widgetGreeting ?? null,
      header: company.widgetHeader ?? null,
      websiteUrl: company.websiteUrl ?? null,
      hasAvatar: !!company.avatarPath,
    };
  }

  @Get('avatar')
  async getAvatar(
    @CurrentCompany() company: { avatarPath?: string | null },
    @Res() res: Response,
  ) {
    if (!company.avatarPath) {
      return res.status(404).send('Avatar not found');
    }
    const dir = join(process.cwd(), 'uploads', 'avatars');
    const filepath = join(dir, company.avatarPath);
    if (!existsSync(filepath)) {
      return res.status(404).send('Avatar not found');
    }
    const ext = company.avatarPath.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return createReadStream(filepath).pipe(res);
  }

  @Get('chat/:chatId')
  async getChat(
    @CurrentCompany() company: { id: string },
    @Param('chatId') chatId: string,
  ) {
    const chat = await this.chatService.getChatWithMessages(chatId, company.id);
    if (!chat) return { messages: [] };
    return {
      chatId: chat.id,
      messages: chat.messages.map((m) => ({ role: m.role, content: m.content })),
    };
  }
}
