import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CompanyModule } from '../company/company.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CompanyModule, AiModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
