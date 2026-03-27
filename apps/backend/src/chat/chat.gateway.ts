import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { AiService } from '../ai/ai.service';
import { TelegramService } from '../telegram/telegram.service';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
    private aiService: AiService,
    private telegramService: TelegramService,
  ) {}

  async handleConnection(client: { handshake: { auth?: { apiKey?: string }; query?: { apiKey?: string } }; company?: { id: string }; emit: (event: string, data: unknown) => void }) {
    const apiKey =
      client.handshake?.auth?.apiKey || client.handshake?.query?.apiKey;

    if (!apiKey) {
      client.emit('error', { message: 'API key required' });
      return;
    }

    const company = await this.prisma.company.findUnique({
      where: { apiKey },
    });

    if (!company) {
      client.emit('error', { message: 'Invalid API key' });
      return;
    }

    (client as { company?: { id: string } }).company = company;
  }

  handleDisconnect() {
    // cleanup if needed
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: { company?: { id: string }; emit: (event: string, data: unknown) => void; id: string },
    payload: { message: string; chatId?: string },
  ) {
    if (!client.company) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { message, chatId } = payload;
    if (!message?.trim()) {
      client.emit('error', { message: 'Message required' });
      return;
    }

    try {
      client.emit('typing', { typing: true });

      const chat = await this.chatService.getOrCreate(
        client.company.id,
        chatId,
        undefined,
      );

      await this.chatService.addMessage(chat.id, 'user', message);

      const messages = [
        ...chat.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const assistantMessage = await this.aiService.chat(
        client.company.id,
        messages,
      );

      await this.chatService.addMessage(chat.id, 'assistant', assistantMessage);

      const company = client.company as { id: string; name: string; telegramBotToken?: string | null; telegramChatId?: string | null };
      if (company.telegramBotToken && company.telegramChatId && this.telegramService.hasContacts(message)) {
        const contacts = this.telegramService.extractContacts(message);
        this.telegramService
          .notifyContacts(company.telegramBotToken, company.telegramChatId, company.name, message, assistantMessage, contacts)
          .catch(() => {});
      }

      client.emit('typing', { typing: false });
      client.emit('assistant', {
        chatId: chat.id,
        message: assistantMessage,
      });
    } catch (err) {
      client.emit('typing', { typing: false });
      client.emit('error', {
        message: err instanceof Error ? err.message : 'AI error',
      });
    }
  }
}
